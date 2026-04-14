export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

export interface AgifyResponse {
  name: string;
  age: number | null;
  count: number;
}

export interface NationalizeCountry {
  country_id: string;
  probability: number;
}

export interface NationalizeResponse {
  name: string;
  count: number;
  country: NationalizeCountry[];
}

export type AgeGroup = "child" | "teenager" | "adult" | "senior";

export interface ClassifySuccessData {
  name: string;
  gender: string;
  probability: number;
  sample_size: number;
  is_confident: boolean;
  processed_at: string;
}

export interface ProfileData {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: AgeGroup;
  country_id: string;
  country_probability: number;
  created_at: string;
}

export interface ApiSuccessResponse {
  status: "success";
  data: ClassifySuccessData;
}

export interface ProfileSuccessResponse {
  status: "success";
  message?: string;
  data: ProfileData;
}

export interface ProfileListItem {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: AgeGroup;
  country_id: string;
}

export interface ProfileListResponse {
  status: "success";
  count: number;
  data: ProfileListItem[];
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}
