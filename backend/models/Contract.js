import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  contractNumber: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  contractType: { type: String, enum: ["Permanent", "Fixed-Term", "Executive", "Probationary"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  baseSalary: { type: Number, required: true, min: 0 },
  noticePeriodDays: { type: Number, default: 30, min: 0 },
  status: { type: String, enum: ["Draft", "Active", "Under Review", "Expired"], default: "Draft" },
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
