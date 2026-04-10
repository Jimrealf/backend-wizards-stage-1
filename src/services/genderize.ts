import { GenderizeResponse } from "../types/api";
import { AppError, badGateway } from "../utils/errors";

const GENDERIZE_BASE_URL = "https://api.genderize.io";
const TIMEOUT_MS = 5000;

export async function fetchGenderPrediction(name: string): Promise<GenderizeResponse> {
  const url = `${GENDERIZE_BASE_URL}/?name=${encodeURIComponent(name)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw badGateway("Upstream API error");
    }

    const data = (await response.json()) as GenderizeResponse;
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw badGateway("Upstream API timeout");
    }

    if (err instanceof AppError) {
      throw err;
    }

    throw badGateway("Upstream API error");
  } finally {
    clearTimeout(timeoutId);
  }
}
