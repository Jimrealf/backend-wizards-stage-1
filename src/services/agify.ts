import { AgifyResponse } from "../types/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const AGIFY_BASE_URL = "https://api.agify.io";

export async function fetchAgePrediction(name: string): Promise<AgifyResponse> {
  const url = `${AGIFY_BASE_URL}/?name=${encodeURIComponent(name)}`;
  return fetchWithTimeout<AgifyResponse>(url, "Agify");
}
