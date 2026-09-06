import AuditLog from "../models/AuditLog.js";

export function logAudit(actor, action, resource, resourceId, details = {}) {
  return AuditLog.create({ actor, action, resource, resourceId: String(resourceId), details });
}
