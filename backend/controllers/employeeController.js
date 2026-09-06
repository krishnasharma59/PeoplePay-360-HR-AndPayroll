import Employee from "../models/Employee.js";
import { logAudit } from "../utils/audit.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendMail } from "../utils/mailer.js";

export async function getEmployees(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === "employee") {
      if (!req.user.employee) return res.json({ data: [] });
      filter._id = req.user.employee;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    const employees = await Employee.find(filter).sort({ lastName: 1, firstName: 1 });
    res.json({ data: employees });
  } catch (error) { next(error); }
}

export async function createEmployee(req, res, next) {
  try {
    const required = ["firstName", "lastName", "email", "department", "title", "joinDate", "baseSalary"];
    const missing = required.filter((field) => req.body[field] === undefined || req.body[field] === "");
    if (missing.length) return res.status(400).json({ message: `Missing: ${missing.join(", ")}` });
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(String(req.body.email).trim())) {
      return res.status(400).json({ message: "Use a valid Gmail address ending in @gmail.com for the employee email." });
    }
    const employee = await Employee.create({
      ...req.body,
      employeeCode: `EMP-${Date.now().toString().slice(-8)}`,
    });
    const existingUser = await User.findOne({ email: employee.email });
    if (existingUser) {
      existingUser.employee = employee._id;
      await existingUser.save();
    } else {
      const temporaryPassword = crypto.randomBytes(9).toString("base64url");
      await User.create({
        name: `${employee.firstName} ${employee.lastName === "-" ? "" : employee.lastName}`.trim(),
        email: employee.email,
        password: await bcrypt.hash(temporaryPassword, 12),
        role: "employee",
        employee: employee._id,
      });
      // Do not undo a successfully created employee if email delivery is temporarily unavailable.
      sendMail({
        to: employee.email,
        subject: "Welcome to PeoplePay360",
        text: `Welcome ${employee.firstName}! Your PeoplePay360 account is ready. Sign in with email ${employee.email} and temporary password ${temporaryPassword}. Please change your password after signing in.`,
        html: `<h2>Welcome to PeoplePay360, ${employee.firstName}!</h2><p>Your account is ready.</p><p><strong>Email:</strong> ${employee.email}<br/><strong>Temporary password:</strong> ${temporaryPassword}</p><p>Please sign in and change this temporary password immediately.</p>`,
      }).catch((mailError) => console.error("Welcome email could not be sent:", mailError.message));
    }
    await logAudit(req.user.id, "Created employee", "Employee", employee._id, { employeeCode: employee.employeeCode });
    res.status(201).json({ data: employee });
  } catch (error) { next(error); }
}

export async function getEmployeeAccounts(req, res, next) {
  try {
    const users = await User.find().select("name email role employee avatarUrl createdAt").populate("employee", "employeeCode firstName lastName department title status").sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (error) { next(error); }
}

export async function updateEmployeeAccountRole(req, res, next) {
  try {
    const allowedRoles = ["admin", "hr_manager", "hr_payroll_manager", "hr_payroll_user", "employee"];
    const { role } = req.body;
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role." });
    if (String(req.user.id) === req.params.id) return res.status(400).json({ message: "You cannot change your own role." });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("name email role employee avatarUrl");
    if (!user) return res.status(404).json({ message: "User account not found." });
    await logAudit(req.user.id, "Changed user role", "User", user._id, { role, name: user.name, email: user.email });
    res.json({ data: user });
  } catch (error) { next(error); }
}

export async function updateEmployee(req, res, next) {
  try {
    if (Object.prototype.hasOwnProperty.call(req.body, "status") && req.user.role === "hr_manager" && String(req.user.employee) === req.params.id) {
      return res.status(403).json({ message: "HR Managers cannot change their own employment status." });
    }
    const editableFields = ["firstName", "lastName", "email", "department", "title", "employmentType", "status", "joinDate", "baseSalary", "fixedAllowances", "location"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => editableFields.includes(key)));
    if (updates.email && !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(String(updates.email).trim())) return res.status(400).json({ message: "Use a valid Gmail address ending in @gmail.com." });
    const account = await User.findOne({ employee: req.params.id });
    if (account && updates.email && String(updates.email).trim().toLowerCase() !== account.email) {
      const emailInUse = await User.exists({ _id: { $ne: account._id }, email: String(updates.email).trim().toLowerCase() });
      if (emailInUse) return res.status(409).json({ message: "Another user account already uses this email address." });
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    // Keep the login account synchronized with editable identity details.
    if (account) {
      if (updates.email) account.email = employee.email;
      if (updates.firstName !== undefined || updates.lastName !== undefined) account.name = `${employee.firstName} ${employee.lastName === "-" ? "" : employee.lastName}`.trim();
      await account.save();
    }
    await logAudit(req.user.id, "Updated employee", "Employee", employee._id, req.body);
    res.json({ data: employee, account: account ? { id: account._id, name: account.name, email: account.email, role: account.role, employee: account.employee, avatarUrl: account.avatarUrl || "" } : null });
  } catch (error) { next(error); }
}
