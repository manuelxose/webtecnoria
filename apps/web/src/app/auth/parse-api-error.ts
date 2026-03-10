import { HttpErrorResponse } from "@angular/common/http";

export interface ParsedApiError {
  status: number;
  code: string;
  message: string;
  unavailable: boolean;
}

export function parseApiError(error: unknown): ParsedApiError | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const payload =
    error.error && typeof error.error === "object"
      ? (error.error as Record<string, unknown>)
      : null;

  const code = typeof payload?.["code"] === "string" ? payload["code"] : "";
  const objectMessage =
    typeof payload?.["message"] === "string" ? payload["message"].trim() : "";
  const stringMessage =
    typeof error.error === "string" ? error.error.trim() : "";
  const message = objectMessage || stringMessage;
  const unavailable =
    error.status === 0 ||
    error.status === 502 ||
    error.status === 503 ||
    code === "API_UNAVAILABLE" ||
    code === "BAD_GATEWAY";

  return {
    status: error.status,
    code,
    message,
    unavailable,
  };
}
