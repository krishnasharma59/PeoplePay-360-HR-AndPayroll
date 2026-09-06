import AttendanceRecord from "../models/AttendanceRecord.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import PayrollRun from "../models/PayrollRun.js";
import Payslip from "../models/Payslip.js";
import User from "../models/User.js";
import { logAudit } from "../utils/audit.js";
import { sendMail } from "../utils/mailer.js";
import { createPayslipPdf } from "../utils/payslipPdf.js";

async function emailPayslip(payslip, run) {
  const employee = await Employee.findById(payslip.employee);
  if (!employee) throw new Error("Payslip employee was not found.");
  const pdf = await createPayslipPdf(payslip, run, employee);
  await sendMail({
    to: employee.email,
    subject: `PeoplePay360 payslip - ${run.periodName}`,
    text: `Hello ${employee.firstName}, your payslip for ${run.periodName} has been approved. Net pay: INR ${payslip.netPay}. Your printable payslip is attached.`,
    html: `<p>Hello ${employee.firstName},</p><p>Your payslip for <strong>${run.periodName}</strong> has been approved. Your net pay is <strong>INR ${payslip.netPay}</strong>.</p><p>Your printable payslip PDF is attached.</p>`,
    attachments: [{ filename: `Payslip-${employee.employeeCode}-${String(run.periodName).replace(/[^a-z0-9]+/gi, "-")}.pdf`, content: pdf, contentType: "application/pdf" }],
  });
}

function queuePayslipEmails(payslips, run, actorId) {
  // Do not hold the approval request open while SMTP delivers multiple attachments.
  setImmediate(async () => {
    try {
      const deliveryFailures = [];
      for (const payslip of payslips) {
        try { await emailPayslip(payslip, run); }
        catch (error) { deliveryFailures.push({ payslipId: String(payslip._id), message: error.message }); }
      }
      await logAudit(actorId, "Completed payroll payslip email delivery", "PayrollRun", run._id, {
        periodName: run.periodName,
        emailedCount: payslips.length - deliveryFailures.length,
        deliveryFailures,
      });
    } catch (error) { console.error("Payroll payslip email queue failed:", error.message); }
  });
}

async function currentEmployeeId(req) {
  const account = await User.findById(req.user.id).select("employee email");
  if (!account) return null;
  // Repair older accounts that were created before their Employee record was linked.
  if (!account.employee) {
    const employee = await Employee.findOne({ email: account.email });
    if (employee) { account.employee = employee._id; await account.save(); }
  }
  return account.employee;
}

export async function createPayrollRun(req, res, next) {
  try {
    const { periodName, startDate, endDate, payDate } = req.body;
    if (!periodName || !startDate || !endDate || !payDate) return res.status(400).json({ message: "periodName, startDate, endDate and payDate are required." });
    const start = new Date(startDate);
    const end = new Date(endDate);
    const payment = new Date(payDate);
    if ([start, end, payment].some((date) => Number.isNaN(date.getTime()))) return res.status(400).json({ message: "Enter valid dates for the payroll period and pay date." });
    if (start > end) return res.status(400).json({ message: "The period start date must be before the end date." });
    if (await PayrollRun.exists({ startDate: start, endDate: end })) return res.status(409).json({ message: "A payroll run already exists for this exact period." });
    const run = await PayrollRun.create({ periodName, startDate, endDate, payDate, createdBy: req.user.id });
    await logAudit(req.user.id, "Created payroll run", "PayrollRun", run._id, { periodName });
    res.status(201).json({ data: run });
  } catch (error) { next(error); }
}

// Calculation is deliberately simple/configurable for the hackathon: 10% tax and unpaid leave at daily salary.
export async function calculatePayroll(req, res, next) {
  try {
    const run = await PayrollRun.findById(req.params.id);
    console.log(run);
    if (!run) return res.status(404).json({ message: "Payroll run not found." });
    if (run.status !== "Draft") return res.status(409).json({ message: "Only draft payroll runs can be calculated." });

    const [employees, attendance, unpaidLeaves] = await Promise.all([
      Employee.find({ status: "Active" }),
      AttendanceRecord.find({ date: { $gte: run.startDate, $lte: run.endDate } }),
      LeaveRequest.find({ status: "Approved", leaveType: "Unpaid", startDate: { $lte: run.endDate }, endDate: { $gte: run.startDate } }),
    ]);
    const attendanceByEmployee = new Map();
    attendance.forEach((item) => attendanceByEmployee.set(String(item.employee), (attendanceByEmployee.get(String(item.employee)) || 0) + item.overtimeHours));
    const leaveByEmployee = new Map();
    unpaidLeaves.forEach((item) => leaveByEmployee.set(String(item.employee), (leaveByEmployee.get(String(item.employee)) || 0) + item.totalDays));

    const slips = employees.map((employee) => {
      const overtimeHours = attendanceByEmployee.get(String(employee._id)) || 0;
      const unpaidDays = leaveByEmployee.get(String(employee._id)) || 0;
      const overtimePay = overtimeHours * (employee.baseSalary / 160) * 1.5;
      const unpaidLeave = unpaidDays * (employee.baseSalary / 22);
      const gross = employee.baseSalary + employee.fixedAllowances + overtimePay;
      const tax = Math.round((gross - unpaidLeave) * 0.1 * 100) / 100;
      const netPay = Math.max(0, gross - tax - unpaidLeave);
      const flags = [overtimeHours > 20 ? "High overtime: review before approval" : null, unpaidDays > 5 ? "High unpaid leave: review deduction" : null].filter(Boolean);
      // x = return{y:true};
      return { payrollRun: run._id, employee: employee._id, earnings: { basicSalary: employee.baseSalary, allowances: employee.fixedAllowances, overtimePay, bonus: 0, gross }, deductions: { tax, unpaidLeave, total: tax + unpaidLeave }, netPay, flags };
    });

    await Payslip.deleteMany({ payrollRun: run._id });
    if (slips.length) await Payslip.insertMany(slips);
    run.totals = slips.reduce((totals, slip) => ({ gross: totals.gross + slip.earnings.gross, deductions: totals.deductions + slip.deductions.total, net: totals.net + slip.netPay }), { gross: 0, deductions: 0, net: 0 });
    run.status = "In Review";
    await run.save();
    await logAudit(req.user.id, "Calculated payroll", "PayrollRun", run._id, { employeeCount: slips.length });
    res.json({ data: run, employeeCount: slips.length });
  } catch (error) { next(error); }
}

export async function approvePayroll(req, res, next) {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, status: "In Review" });
    if (!run) return res.status(404).json({ message: "Payroll run in review not found." });
    const payslips = await Payslip.find({ payrollRun: run._id, status: "Draft" });
    run.status = "Approved"; run.approvedBy = req.user.id; await run.save();
    await Payslip.updateMany({ payrollRun: run._id, status: "Draft" }, { status: "Published", decisionBy: req.user.id, decisionAt: new Date(), rejectionReason: undefined });
    await logAudit(req.user.id, "Approved payroll", "PayrollRun", run._id, { periodName: run.periodName, payslipCount: payslips.length, emailDelivery: "scheduled" });
    res.json({ data: run, emailedCount: 0, deliveryFailures: [], emailDelivery: "scheduled" });
    queuePayslipEmails(payslips, run, req.user.id);
  } catch (error) { next(error); }
}

export async function approvePayslip(req, res, next) {
  try {
    const payslip = await Payslip.findOne({ _id: req.params.id, status: "Draft" }).populate("payrollRun");
    if (!payslip) return res.status(404).json({ message: "Draft payslip not found." });
    if (payslip.payrollRun.status !== "In Review") return res.status(409).json({ message: "The payroll run must be in review before a payslip can be approved." });
    payslip.status = "Published"; payslip.decisionBy = req.user.id; payslip.decisionAt = new Date(); payslip.rejectionReason = undefined; await payslip.save();
    await logAudit(req.user.id, "Approved payslip", "Payslip", payslip._id, { periodName: payslip.payrollRun.periodName, emailDelivery: "scheduled" });
    res.json({ data: payslip, emailDelivery: "scheduled" });
    setImmediate(async () => {
      try { await emailPayslip(payslip, payslip.payrollRun); await logAudit(req.user.id, "Delivered payslip email", "Payslip", payslip._id); }
      catch (error) { await logAudit(req.user.id, "Payslip email delivery failed", "Payslip", payslip._id, { message: error.message }); }
    });
  } catch (error) { next(error); }
}

export async function rejectPayslip(req, res, next) {
  try {
    const payslip = await Payslip.findOne({ _id: req.params.id, status: "Draft" }).populate("payrollRun");
    if (!payslip) return res.status(404).json({ message: "Draft payslip not found." });
    if (payslip.payrollRun.status !== "In Review") return res.status(409).json({ message: "The payroll run must be in review before a payslip can be rejected." });
    payslip.status = "Rejected"; payslip.decisionBy = req.user.id; payslip.decisionAt = new Date(); payslip.rejectionReason = req.body.reason?.trim() || "Requires payroll review."; await payslip.save();
    await logAudit(req.user.id, "Rejected payslip", "Payslip", payslip._id, { periodName: payslip.payrollRun.periodName, reason: payslip.rejectionReason });
    res.json({ data: payslip });
  } catch (error) { next(error); }
}

export async function getAllPayslips(req, res, next) {
  try {
    const employeeId = req.user.role === "employee" ? await currentEmployeeId(req) : null;
    if (req.user.role === "employee" && !employeeId) return res.json({ data: [] });
    const filter = req.user.role === "employee" ? { employee: employeeId } : {};
    const payslips = await Payslip.find(filter).populate("employee", "firstName lastName employeeCode department email").populate("payrollRun", "periodName payDate status").populate("decisionBy", "name").sort({ createdAt: -1 });
    res.json({ data: payslips });
  } catch (error) { next(error); }
}

export async function getPayslipPdf(req, res, next) {
  try {
    const payslip = await Payslip.findById(req.params.id).populate("payrollRun").populate("employee");
    if (!payslip) return res.status(404).json({ message: "Payslip not found." });
    const employeeId = req.user.role === "employee" ? await currentEmployeeId(req) : null;
    if (req.user.role === "employee" && String(payslip.employee._id) !== String(employeeId)) return res.status(403).json({ message: "You can only view your own payslips." });
    if (req.user.role === "employee" && !["Published", "Paid"].includes(payslip.status)) return res.status(403).json({ message: "This payslip has not been approved yet." });
    const pdf = await createPayslipPdf(payslip, payslip.payrollRun, payslip.employee);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Payslip-${payslip.employee.employeeCode}-${String(payslip.payrollRun.periodName).replace(/[^a-z0-9]+/gi, "-")}.pdf"`);
    res.send(pdf);
  } catch (error) { next(error); }
}

export async function cancelPayrollReview(req, res, next) {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, status: "In Review" });
    if (!run) return res.status(404).json({ message: "Only payroll runs in review can be cancelled." });
    const payslipResult = await Payslip.deleteMany({ payrollRun: run._id });
    await PayrollRun.deleteOne({ _id: run._id });
    await logAudit(req.user.id, "Deleted payroll run", "PayrollRun", run._id, { periodName: run.periodName, deletedPayslipCount: payslipResult.deletedCount });
    res.json({ message: "Payroll run and its generated payslips were deleted." });
  } catch (error) { next(error); }
}

export async function unapprovePayroll(req, res, next) {
  try {
    const run = await PayrollRun.findOneAndUpdate({ _id: req.params.id, status: "Approved" }, { status: "In Review", approvedBy: null }, { new: true });
    if (!run) return res.status(404).json({ message: "Only approved payroll runs can be unapproved." });
    await Payslip.updateMany({ payrollRun: run._id }, { status: "Draft" });
    await logAudit(req.user.id, "Unapproved payroll run", "PayrollRun", run._id, { periodName: run.periodName });
    res.json({ data: run });
  } catch (error) { next(error); }
}

export async function getPayslips(req, res, next) {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run) return res.status(404).json({ message: "Payroll run not found." });
    const filter = { payrollRun: run._id };
    if (req.user.role === "employee") {
      const employeeId = await currentEmployeeId(req);
      if (!employeeId) return res.json({ data: [] });
      filter.employee = employeeId;
    }
    const payslips = await Payslip.find(filter).populate("employee", "firstName lastName employeeCode department email");
    res.json({ data: payslips });
  } catch (error) { next(error); }
}
