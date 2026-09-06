import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "hr_manager", "hr_payroll_manager", "hr_payroll_user", "employee"],
      default: "employee",
    },
    avatarUrl: { type: String, trim: true, default: "" },
    passwordResetCode: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
