import LeaveRequest from "../models/LeaveRequest.js";
import { logAudit } from "../utils/audit.js";
import { sendMail } from "../utils/mailer.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

async function currentEmployeeId(req) {
  const account = await User.findById(req.user.id).select("employee email");
  if (!account) return null;
  if (!account.employee) {
    const employee = await Employee.findOne({ email: account.email });
    if (employee) { account.employee = employee._id; await account.save(); }
  }
  return account.employee;
}

export async function createLeaveRequest(req, res, next) {
  try {
    const employee = req.user.role === "employee" ? await currentEmployeeId(req) : req.body.employee;
    if (!employee) return res.status(400).json({ message: "An employee is required." });
    const leave = await LeaveRequest.create({ ...req.body, employee });
    await logAudit(req.user.id, "Submitted leave request", "LeaveRequest", leave._id);
    res.status(201).json({ data: leave });
  } catch (error) { next(error); }
}

export async function getLeaveRequests(req, res, next) {
  try {
    const employeeId = req.user.role === "employee" ? await currentEmployeeId(req) : null;
    if (req.user.role === "employee" && !employeeId) return res.json({ data: [] });
    const filter = req.user.role === "employee" ? { employee: employeeId } : {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await LeaveRequest.find(filter).populate("employee", "firstName lastName employeeCode department email").populate("approvedBy", "name").sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error) { next(error); }
}

export async function decideLeaveRequest(req, res, next) {
  try {
    const { status, approverNotes } = req.body;
    if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ message: "status must be Approved or Rejected." });
    const leave = await LeaveRequest.findOneAndUpdate({ _id: req.params.id, status: "Pending" }, { status, approverNotes: approverNotes?.trim() || "", approvedBy: req.user.id, decidedAt: new Date() }, { new: true }).populate("employee", "firstName lastName email").populate("approvedBy", "name");
    if (!leave) return res.status(404).json({ message: "Pending leave request not found." });
    await logAudit(req.user.id, `${status} leave request`, "LeaveRequest", leave._id, { employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`, approverNotes: leave.approverNotes });
    sendMail({
      to: leave.employee.email,
      subject: `PeoplePay360 leave request ${status.toLowerCase()}`,
      text: `Hello ${leave.employee.firstName}, your ${leave.leaveType} leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was ${status.toLowerCase()} by ${leave.approvedBy?.name || "your approver"}.${leave.approverNotes ? ` Note: ${leave.approverNotes}` : ""}`,
      html: `<p>Hello ${leave.employee.firstName},</p><p>Your <strong>${leave.leaveType}</strong> leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was <strong>${status.toLowerCase()}</strong> by ${leave.approvedBy?.name || "your approver"}.</p>${leave.approverNotes ? `<p><strong>Note:</strong> ${leave.approverNotes}</p>` : ""}`,
    }).catch((error) => console.error("Leave-decision email could not be sent:", error.message));
    res.json({ data: leave });
  } catch (error) { next(error); }
}
