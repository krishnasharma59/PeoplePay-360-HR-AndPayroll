import mongoose from "mongoose";

const salaryRuleSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Allowance", "Statutory Withholding", "Deduction", "Employer Tax"], required: true },
  calculationType: { type: String, enum: ["Fixed", "Percentage of Basic", "Percentage of Gross"], required: true },
  value: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("SalaryRule", salaryRuleSchema);
