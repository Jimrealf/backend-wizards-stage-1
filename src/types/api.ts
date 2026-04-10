export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

export interface ClassifySuccessData {
  name: string;
  gender: string;
  probability: number;
  sample_size: number;
  is_confident: boolean;
  processed_at: string;
}

export interface ApiSuccessResponse {
  status: "success";
  data: ClassifySuccessData;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}
