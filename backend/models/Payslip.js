import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    payrollRun: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollRun", required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    earnings: {
      basicSalary: Number,
      allowances: Number,
      overtimePay: Number,
      bonus: Number,
      gross: Number,
    },
    deductions: { tax: Number, unpaidLeave: Number, total: Number },
    netPay: Number,
    flags: [String],
    status: { type: String, enum: ["Draft", "Published", "Rejected", "Paid"], default: "Draft" },
    decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decisionAt: Date,
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

payslipSchema.index({ payrollRun: 1, employee: 1 }, { unique: true });
export default mongoose.model("Payslip", payslipSchema);
