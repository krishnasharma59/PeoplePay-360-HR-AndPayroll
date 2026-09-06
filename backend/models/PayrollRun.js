import mongoose from "mongoose";

const payrollRunSchema = new mongoose.Schema(
  {
    periodName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    payDate: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "In Review", "Approved", "Paid"], default: "Draft", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totals: { gross: { type: Number, default: 0 }, deductions: { type: Number, default: 0 }, net: { type: Number, default: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("PayrollRun", payrollRunSchema);
