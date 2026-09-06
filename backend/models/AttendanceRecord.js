import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Remote", "On Leave", "Absent"], required: true },
    overtimeHours: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ employee: 1, date: 1 }, { unique: true });
export default mongoose.model("AttendanceRecord", attendanceRecordSchema);
