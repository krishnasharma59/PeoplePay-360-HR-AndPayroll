import mongoose from "mongoose";

const salaryStructureSchema = new mongoose.Schema({
  gradeCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
  gradeName: { type: String, required: true, trim: true },
  minSalary: { type: Number, required: true, min: 0 },
  midSalary: { type: Number, required: true, min: 0 },
  maxSalary: { type: Number, required: true, min: 0 },
  fixedAllowancesTotal: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
export default mongoose.model("SalaryStructure", salaryStructureSchema);
