export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  url?: string;
  resetUrl?: string;
};

export const idleState: ActionState = { status: "idle" };

export function actionError(
  message: string,
  errors?: Record<string, string>,
): ActionState {
  return { status: "error", message, errors };
}

export function actionSuccess(message: string, url?: string): ActionState {
  return { status: "success", message, url };
}

export class ForbiddenError extends Error {
  constructor(message = "No tenés permiso para realizar esta acción.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  errors?: Record<string, string>;

  constructor(message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
