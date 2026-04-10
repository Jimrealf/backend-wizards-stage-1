import { badRequest, unprocessable } from "./errors";

export function validateName(raw: unknown): string {
  if (raw === undefined || raw === null) {
    throw badRequest("Missing required query parameter: name");
  }

  if (typeof raw !== "string") {
    throw unprocessable("Query parameter 'name' must be a string");
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw badRequest("Missing required query parameter: name");
  }

  return trimmed;
}
