# Backend Wizards Stage 1: Profile Aggregation API

A REST API that aggregates name-based predictions from three external services (Genderize, Agify, Nationalize), applies classification logic, and stores the result in a PostgreSQL database. Built for the HNG 14 Internship Backend Track, Stage 1.

Extends the Stage 0 classify endpoint with data persistence, multi-API integration, and idempotency handling.

**Live URL:** (pending deployment)

## Stack

- Node.js
- TypeScript (strict mode)
- Express 5
- PostgreSQL (Neon)
- Deployed on Vercel

## Local Setup

```bash
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL to your Neon PostgreSQL connection string
npm run dev
```

The server starts on `http://localhost:3000` by default. Set `PORT` in `.env` to change it.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string with SSL |

## API

### POST /api/profiles

Creates a new profile by calling three external APIs, aggregating the results, and storing them in the database. If a profile with the same name already exists, returns the existing record without creating a duplicate.

**Request body:**

```json
{ "name": "ella" }
```

**Success response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "019d8cc1-00b7-737f-9392-e19eb2d1781a",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.09677289106552395,
    "created_at": "2026-04-14T16:09:12.119Z"
  }
}
```

**Duplicate name response (200 OK):**

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ... }
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID v7 (time-sortable) |
| `name` | string | Lowercased, trimmed input name |
| `gender` | string | Predicted gender from Genderize |
| `gender_probability` | number | Confidence score (0 to 1) |
| `sample_size` | integer | Number of data points behind the gender prediction |
| `age` | integer | Predicted age from Agify |
| `age_group` | string | Classification: child (0-12), teenager (13-19), adult (20-59), senior (60+) |
| `country_id` | string | ISO country code with highest probability from Nationalize |
| `country_probability` | number | Probability score for the predicted country |
| `created_at` | string | UTC ISO 8601 timestamp |

### GET /api/profiles

Returns all stored profiles. Supports optional query filters. Filter values are **case-insensitive** (`gender=Male` and `gender=male` return the same results).

**Query parameters (all optional):**

| Parameter | Example | Description |
|-----------|---------|-------------|
| `gender` | `?gender=female` | Filter by gender |
| `age_group` | `?age_group=adult` | Filter by age group |
| `country_id` | `?country_id=NG` | Filter by country |

Filters can be combined: `?gender=female&age_group=adult`

**Response (200):**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "a1c2d3e4-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

### GET /api/profiles/:id

Returns a single profile by UUID.

**Response (200):**

```json
{
  "status": "success",
  "data": { ... }
}
```

**404 if not found:**

```json
{ "status": "error", "message": "Profile not found" }
```

### DELETE /api/profiles/:id

Deletes a profile by UUID. Returns **204 No Content** on success.

**404 if not found:**

```json
{ "status": "error", "message": "Profile not found" }
```

### GET /api/classify?name={name}

Stage 0 endpoint. Classifies a name by predicted gender using the Genderize API.

```bash
curl "http://localhost:3000/api/classify?name=john"
```

### Error Responses

All errors follow this format:

```json
{ "status": "error", "message": "<description>" }
```

| Status | Condition |
|--------|-----------|
| 400 | Missing or empty name |
| 422 | Name is not a string |
| 404 | Profile not found (GET or DELETE by ID) |
| 502 | External API unreachable, timed out, or returned unusable data (null gender, null age, no countries) |
| 500 | Internal server error |

CORS is enabled on all endpoints (`Access-Control-Allow-Origin: *`).

## Processing Logic

1. All three external APIs are called in parallel for performance
2. Names are lowercased and trimmed before storage (idempotency is case-insensitive)
3. Age group classification boundaries: 12/13 (child/teenager), 19/20 (teenager/adult), 59/60 (adult/senior)
4. Country is selected by highest probability from the Nationalize response
5. If any external API returns unusable data (null gender, null age, empty countries), the request is rejected and nothing is stored

## Deploy

Deployed on Vercel. The Express app is exported as a serverless function via `api/index.ts`, with `vercel.json` rewriting all routes to `/api`. The database is a Neon PostgreSQL instance provisioned through the Vercel Marketplace.
