import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
