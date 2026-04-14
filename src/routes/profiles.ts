import { Router, Request, Response } from "express";
import { v7 as uuidv7 } from "uuid";
import { validateName } from "../utils/validation.js";
import { classifyAgeGroup } from "../utils/ageGroup.js";
import { fetchGenderPrediction } from "../services/genderize.js";
import { fetchAgePrediction } from "../services/agify.js";
import { fetchNationalityPrediction } from "../services/nationalize.js";
import { sql } from "../utils/db.js";
import { badGateway, notFound } from "../utils/errors.js";
import { ProfileData, ProfileListItem, ProfileSuccessResponse, ProfileListResponse } from "../types/api.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const raw = validateName(req.body?.name);
  const name = raw.toLowerCase();

  const existing = await sql<ProfileData[]>`
    SELECT * FROM profiles WHERE name = ${name}
  `;

  if (existing.length > 0) {
    const body: ProfileSuccessResponse = {
      status: "success",
      message: "Profile already exists",
      data: existing[0],
    };
    res.status(200).json(body);
    return;
  }

  const [genderResult, ageResult, nationalityResult] = await Promise.all([
    fetchGenderPrediction(name),
    fetchAgePrediction(name),
    fetchNationalityPrediction(name),
  ]);

  if (genderResult.gender === null || genderResult.count === 0) {
    throw badGateway("Genderize returned an invalid response");
  }

  if (ageResult.age === null) {
    throw badGateway("Agify returned an invalid response");
  }

  if (!nationalityResult.country || nationalityResult.country.length === 0) {
    throw badGateway("Nationalize returned an invalid response");
  }

  const topCountry = nationalityResult.country.reduce((max, c) =>
    c.probability > max.probability ? c : max,
    nationalityResult.country[0]
  );

  const profile: ProfileData = {
    id: uuidv7(),
    name,
    gender: genderResult.gender,
    gender_probability: genderResult.probability,
    sample_size: genderResult.count,
    age: ageResult.age,
    age_group: classifyAgeGroup(ageResult.age),
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
    created_at: new Date().toISOString(),
  };

  try {
    await sql`
      INSERT INTO profiles (
        id, name, gender, gender_probability, sample_size,
        age, age_group, country_id, country_probability, created_at
      ) VALUES (
        ${profile.id}, ${profile.name}, ${profile.gender},
        ${profile.gender_probability}, ${profile.sample_size},
        ${profile.age}, ${profile.age_group}, ${profile.country_id},
        ${profile.country_probability}, ${profile.created_at}
      )
    `;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      const rows = await sql<ProfileData[]>`
        SELECT * FROM profiles WHERE name = ${name}
      `;
      const body: ProfileSuccessResponse = {
        status: "success",
        message: "Profile already exists",
        data: rows[0],
      };
      res.status(200).json(body);
      return;
    }
    throw err;
  }

  const body: ProfileSuccessResponse = {
    status: "success",
    data: profile,
  };
  res.status(201).json(body);
});

router.get("/", async (req: Request, res: Response) => {
  const { gender, age_group, country_id } = req.query;

  const conditions = [];

  if (gender) {
    conditions.push(sql`LOWER(gender) = ${String(gender).toLowerCase()}`);
  }
  if (age_group) {
    conditions.push(sql`LOWER(age_group) = ${String(age_group).toLowerCase()}`);
  }
  if (country_id) {
    conditions.push(sql`LOWER(country_id) = ${String(country_id).toLowerCase()}`);
  }

  const where = conditions.length > 0
    ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    : sql``;

  const rows = await sql<ProfileData[]>`
    SELECT * FROM profiles ${where} ORDER BY created_at DESC
  `;

  const data: ProfileListItem[] = rows.map(({ id, name, gender, age, age_group, country_id }) => ({
    id, name, gender, age, age_group, country_id,
  }));

  const body: ProfileListResponse = {
    status: "success",
    count: data.length,
    data,
  };
  res.json(body);
});

router.get("/:id", async (req: Request, res: Response) => {
  const rows = await sql<ProfileData[]>`
    SELECT * FROM profiles WHERE id = ${req.params.id}
  `;

  if (rows.length === 0) {
    throw notFound("Profile not found");
  }

  const body: ProfileSuccessResponse = {
    status: "success",
    data: rows[0],
  };
  res.json(body);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const rows = await sql`
    DELETE FROM profiles WHERE id = ${req.params.id} RETURNING id
  `;

  if (rows.length === 0) {
    throw notFound("Profile not found");
  }

  res.status(204).end();
});

export default router;
