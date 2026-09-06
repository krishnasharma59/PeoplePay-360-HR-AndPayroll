import SalaryRule from "../models/SalaryRule.js";
import SalaryStructure from "../models/SalaryStructure.js";
import { logAudit } from "../utils/audit.js";

export async function getSalaryStructures(req, res, next) { try { res.json({ data: await SalaryStructure.find().sort({ gradeCode: 1 }) }); } catch (error) { next(error); } }
export async function createSalaryStructure(req, res, next) { try {
  const { gradeCode, gradeName, minSalary, midSalary, maxSalary, fixedAllowancesTotal = 0 } = req.body;
  if (!gradeCode || !gradeName || minSalary === undefined || midSalary === undefined || maxSalary === undefined) return res.status(400).json({ message: "Grade code, name, and all salary ranges are required." });
  if (Number(minSalary) > Number(midSalary) || Number(midSalary) > Number(maxSalary)) return res.status(400).json({ message: "Salary ranges must be ordered minimum, midpoint, then maximum." });
  const structure = await SalaryStructure.create({ gradeCode, gradeName, minSalary, midSalary, maxSalary, fixedAllowancesTotal });
  await logAudit(req.user.id, "Created salary structure", "SalaryStructure", structure._id, { gradeCode }); res.status(201).json({ data: structure });
} catch (error) { next(error); } }
export async function getSalaryRules(req, res, next) { try { res.json({ data: await SalaryRule.find().sort({ ruleCode: 1 }) }); } catch (error) { next(error); } }
export async function createSalaryRule(req, res, next) { try {
  const { ruleCode, name, category, calculationType, value } = req.body;
  if (!ruleCode || !name || !category || !calculationType || value === undefined) return res.status(400).json({ message: "Rule code, name, category, calculation method, and value are required." });
  const rule = await SalaryRule.create({ ruleCode, name, category, calculationType, value });
  await logAudit(req.user.id, "Created salary rule", "SalaryRule", rule._id, { ruleCode }); res.status(201).json({ data: rule });
} catch (error) { next(error); } }

export async function updateSalaryRule(req, res, next) { try {
  const { name, category, calculationType, value, isActive } = req.body;
  if (!name || !category || !calculationType || value === undefined) return res.status(400).json({ message: "Rule name, category, calculation method, and value are required." });
  const rule = await SalaryRule.findByIdAndUpdate(req.params.id, { name, category, calculationType, value, isActive: Boolean(isActive) }, { new: true, runValidators: true });
  if (!rule) return res.status(404).json({ message: "Salary rule not found." });
  await logAudit(req.user.id, "Updated salary rule", "SalaryRule", rule._id, { ruleCode: rule.ruleCode, name: rule.name }); res.json({ data: rule });
} catch (error) { next(error); } }
