import { Router } from "express";
import { changePassword, login, requestPasswordReset, resetPassword, updateProfile } from "../controllers/authController.js";
import { createEmployee, getEmployeeAccounts, getEmployees, updateEmployee, updateEmployeeAccountRole } from "../controllers/employeeController.js";
import { createLeaveRequest, decideLeaveRequest, getLeaveRequests } from "../controllers/leaveController.js";
import { getAttendance, upsertAttendance } from "../controllers/attendanceController.js";
import { approvePayroll, approvePayslip, calculatePayroll, cancelPayrollReview, createPayrollRun, getAllPayslips, getPayslipPdf, getPayslips, rejectPayslip, unapprovePayroll } from "../controllers/payrollController.js";
import { createContract, getContracts } from "../controllers/contractController.js";
import { createSalaryRule, createSalaryStructure, getSalaryRules, getSalaryStructures, updateSalaryRule } from "../controllers/compensationController.js";
import AuditLog from "../models/AuditLog.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import PayrollRun from "../models/PayrollRun.js";
import Payslip from "../models/Payslip.js";
import User from "../models/User.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";
import { HR_ROLES, PAYROLL_MANAGER_ROLES, PAYROLL_ROLES } from "../middleware/permissions.js";

const router = Router();
const hrRoles = ["admin", "hr_manager", "hr_payroll_manager", "hr_payroll_user"];

router.post("/auth/login", login);
router.post("/auth/forgot-password", requestPasswordReset);
router.post("/auth/reset-password", resetPassword);

router.use(verifyToken);
router.patch("/auth/profile", updateProfile);
router.patch("/auth/password", changePassword);
router.get("/employees", getEmployees);
// Employee creation is restricted to HR Managers and Administrators.
router.post("/employees", allowRoles("admin", "hr_manager"), createEmployee);
router.patch("/employees/:id", allowRoles("admin", "hr_manager"), updateEmployee);
router.get("/contracts", allowRoles(...HR_ROLES), getContracts);
router.post("/contracts", allowRoles(...HR_ROLES), createContract);
router.get("/salary-structures", allowRoles(...PAYROLL_ROLES), getSalaryStructures);
router.post("/salary-structures", allowRoles(...PAYROLL_ROLES), createSalaryStructure);
router.get("/salary-rules", allowRoles(...PAYROLL_ROLES), getSalaryRules);
router.post("/salary-rules", allowRoles(...PAYROLL_ROLES), createSalaryRule);
router.patch("/salary-rules/:id", allowRoles(...PAYROLL_ROLES), updateSalaryRule);
router.get("/employee-accounts", allowRoles("admin"), getEmployeeAccounts);
router.patch("/employee-accounts/:id/role", allowRoles("admin"), updateEmployeeAccountRole);

router.get("/leave-requests", getLeaveRequests);
router.post("/leave-requests", createLeaveRequest);
router.patch("/leave-requests/:id/decision", allowRoles(...HR_ROLES), decideLeaveRequest);

router.get("/attendance", getAttendance);
router.put("/attendance", allowRoles("employee", ...HR_ROLES), upsertAttendance);

router.post("/payroll-runs", allowRoles(...PAYROLL_ROLES), createPayrollRun);
router.post("/payroll-runs/:id/calculate", allowRoles(...PAYROLL_ROLES), calculatePayroll);
router.post("/payroll-runs/:id/approve", allowRoles(...PAYROLL_MANAGER_ROLES), approvePayroll);
router.post("/payroll-runs/:id/cancel", allowRoles(...PAYROLL_MANAGER_ROLES), cancelPayrollReview);
router.post("/payroll-runs/:id/unapprove", allowRoles(...PAYROLL_MANAGER_ROLES), unapprovePayroll);
router.get("/payroll-runs/:id/payslips", allowRoles(...PAYROLL_ROLES, "employee"), getPayslips);
router.get("/payslips", allowRoles(...PAYROLL_ROLES, "employee"), getAllPayslips);
router.post("/payslips/:id/approve", allowRoles(...PAYROLL_MANAGER_ROLES), approvePayslip);
router.post("/payslips/:id/reject", allowRoles(...PAYROLL_MANAGER_ROLES), rejectPayslip);
router.get("/payslips/:id/pdf", allowRoles(...PAYROLL_ROLES, "employee"), getPayslipPdf);
router.get("/payroll-runs", allowRoles(...PAYROLL_ROLES, "employee"), async (req, res, next) => {
  try { res.json({ data: await PayrollRun.find().sort({ createdAt: -1 }) }); } catch (error) { next(error); }
});

router.get("/dashboard/summary", async (req, res, next) => {
  try {
    if (!hrRoles.includes(req.user.role)) {
      const account = await User.findById(req.user.id).select("employee email");
      const employee = account?.employee
        ? await Employee.findById(account.employee)
        : await Employee.findOne({ email: account?.email });
      const dateParts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const part = (type) => Number(dateParts.find((item) => item.type === type)?.value);
      const today = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
      const tomorrow = new Date(today); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const employeeId = employee?._id;
      const [recentActivity, pendingLeave, leaveRequests, publishedPayslips, attendanceRecord] = await Promise.all([
        AuditLog.find({ actor: req.user.id }).populate("actor", "name role").sort({ createdAt: -1 }).limit(8),
        employeeId ? LeaveRequest.countDocuments({ employee: employeeId, status: "Pending" }) : 0,
        employeeId ? LeaveRequest.countDocuments({ employee: employeeId }) : 0,
        employeeId ? Payslip.countDocuments({ employee: employeeId, status: { $in: ["Published", "Paid"] } }) : 0,
        employeeId ? AttendanceRecord.findOne({ employee: employeeId, date: { $gte: today, $lt: tomorrow } }) : null,
      ]);
      const attendanceStatus = attendanceRecord?.status;
      return res.json({ data: {
        totalEmployees: 1,
        pendingLeave,
        payrollRunCount: publishedPayslips,
        currentPayroll: null,
        recentActivity,
        personal: { leaveRequests, publishedPayslips, attendanceStatus: attendanceStatus || "Not recorded" },
        attendance: {
          totalEligible: 1,
          presentTotal: ["Present", "Remote"].includes(attendanceStatus) ? 1 : 0,
          inOffice: attendanceStatus === "Present" ? 1 : 0,
          remote: attendanceStatus === "Remote" ? 1 : 0,
          onLeave: attendanceStatus === "On Leave" ? 1 : 0,
        },
      } });
    }
    const dateParts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const part = (type) => Number(dateParts.find((item) => item.type === type)?.value);
    const year = part("year"); const month = part("month"); const day = part("day");
    const today = new Date(Date.UTC(year, month - 1, day));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const [totalEmployees, pendingLeave, payrollRunCount, currentPayroll, recentActivity, attendance] = await Promise.all([
      Employee.countDocuments({ status: "Active" }),
      LeaveRequest.countDocuments({ status: "Pending" }),
      PayrollRun.countDocuments(),
      PayrollRun.findOne().sort({ createdAt: -1 }),
      AuditLog.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(8),
      AttendanceRecord.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    const targetUserIds = recentActivity.filter((item) => item.resource === "User" && item.resourceId).map((item) => item.resourceId);
    const targetUsers = targetUserIds.length ? await User.find({ _id: { $in: targetUserIds } }).select("name") : [];
    const userNames = new Map(targetUsers.map((item) => [String(item._id), item.name]));
    const activityWithTargets = recentActivity.map((item) => ({
      ...item.toObject(),
      targetName: item.resource === "User" ? userNames.get(String(item.resourceId)) : undefined,
    }));
    const attendanceCounts = Object.fromEntries(attendance.map((item) => [item._id, item.count]));
    res.json({ data: {
      totalEmployees,
      pendingLeave,
      payrollRunCount,
      currentPayroll,
      recentActivity: activityWithTargets,
      attendance: {
        totalEligible: totalEmployees,
        presentTotal: (attendanceCounts.Present || 0) + (attendanceCounts.Remote || 0),
        inOffice: attendanceCounts.Present || 0,
        remote: attendanceCounts.Remote || 0,
        onLeave: attendanceCounts["On Leave"] || 0,
      },
    } });
  } catch (error) { next(error); }
});
router.get("/audit-logs", allowRoles("admin", "hr_manager", "hr_payroll_manager"), async (req, res, next) => {
  try { res.json({ data: await AuditLog.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(100) }); } catch (error) { next(error); }
});

export default router;
