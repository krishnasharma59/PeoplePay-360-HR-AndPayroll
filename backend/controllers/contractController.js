import Contract from "../models/Contract.js";
import Employee from "../models/Employee.js";
import { logAudit } from "../utils/audit.js";

export async function getContracts(req, res, next) {
  try { res.json({ data: await Contract.find().populate("employee", "firstName lastName employeeCode department title").sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
}

export async function createContract(req, res, next) {
  try {
    const { employee, contractType, startDate, endDate, baseSalary, noticePeriodDays, status } = req.body;
    if (!employee || !contractType || !startDate || baseSalary === undefined) return res.status(400).json({ message: "Employee, contract type, start date, and base salary are required." });
    if (!await Employee.exists({ _id: employee })) return res.status(404).json({ message: "The selected employee was not found." });
    if (endDate && new Date(endDate) < new Date(startDate)) return res.status(400).json({ message: "Contract end date must be after the start date." });
    const contract = await Contract.create({ employee, contractType, startDate, endDate: endDate || undefined, baseSalary, noticePeriodDays, status, contractNumber: `CTR-${Date.now().toString().slice(-8)}` });
    await logAudit(req.user.id, "Created contract", "Contract", contract._id, { contractNumber: contract.contractNumber });
    res.status(201).json({ data: await contract.populate("employee", "firstName lastName employeeCode department title") });
  } catch (error) { next(error); }
}
