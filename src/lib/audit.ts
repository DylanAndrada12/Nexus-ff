import "server-only";

import { db } from "@/lib/db";

export type AuditInput = {
  adminId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: unknown;
  ip?: string | null;
};

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        details: input.details
          ? JSON.stringify(input.details).slice(0, 4000)
          : null,
        ip: input.ip ?? null,
      },
    });
  } catch (error) {
    console.error("No se pudo registrar la auditoría:", error);
  }
}
