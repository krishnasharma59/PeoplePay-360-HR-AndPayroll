import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contractor"], default: "Full-time" },
    status: { type: String, enum: ["Active", "Onboarding", "On Leave", "Terminated"], default: "Onboarding" },
    joinDate: { type: Date, required: true },
    baseSalary: { type: Number, required: true, min: 0 },
    fixedAllowances: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1, status: 1 });
export default mongoose.model("Employee", employeeSchema);
