import AttendanceRecord from "../models/AttendanceRecord.js";
import Employee from "../models/Employee.js";
import { logAudit } from "../utils/audit.js";

export async function upsertAttendance(req, res, next) {
  try {
    const { date, status, overtimeHours = 0 } = req.body;
    const employee = req.user.role === "employee" ? req.user.employee : req.body.employee;
    if (!employee || !date || !status) return res.status(400).json({ message: "employee, date and status are required." });
    const record = await AttendanceRecord.findOneAndUpdate({ employee, date }, { status, overtimeHours }, { upsert: true, new: true, runValidators: true });
    const employeeDetails = await Employee.findById(employee).select("firstName lastName employeeCode");
    await logAudit(req.user.id, "Recorded attendance", "AttendanceRecord", record._id, {
      employeeName: employeeDetails ? `${employeeDetails.firstName} ${employeeDetails.lastName}`.trim() : "Employee",
      employeeCode: employeeDetails?.employeeCode,
      status: record.status,
      date: record.date,
      overtimeHours: record.overtimeHours,
    });
    res.status(201).json({ data: record });
  } catch (error) { next(error); }
}

export async function getAttendance(req, res, next) {
  try {
    const filter = req.user.role === "employee" ? { employee: req.user.employee } : {};
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.from || req.query.to) filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
    const records = await AttendanceRecord.find(filter).populate("employee", "firstName lastName employeeCode").sort({ date: -1 });
    res.json({ data: records });
  } catch (error) { next(error); }
}
