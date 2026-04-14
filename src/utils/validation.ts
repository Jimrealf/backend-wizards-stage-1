import { badRequest, unprocessable } from "./errors.js";

export function validateName(raw: unknown): string {
  if (raw === undefined || raw === null) {
    throw badRequest("Missing required parameter: name");
  }

  if (typeof raw !== "string") {
    throw unprocessable("Parameter 'name' must be a string");
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw badRequest("Missing required parameter: name");
  }

  return trimmed;
}
