# Backend Wizards Stage 0: Classify Name

A REST API that classifies names by predicted gender using the Genderize API. Built for the HNG 14 Internship Backend Track, Stage 0.

**Live URL:** https://backend-wizards-stage-0.vercel.app

## Stack

- Node.js
- TypeScript
- Express

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The server starts on `http://localhost:3000` by default. Set `PORT` in `.env` to change it.

## API

### GET /api/classify?name={name}

Classifies a name by predicted gender. Calls the Genderize API, processes the response, and returns a structured result.

**Example request:**

```bash
curl "https://backend-wizards-stage-0.vercel.app/api/classify?name=john"
```

**Success response (200):**

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 1,
    "sample_size": 2692560,
    "is_confident": true,
    "processed_at": "2026-04-10T12:00:00.000Z"
  }
}
```

**Fields:**

- `name` - The queried name (trimmed)
- `gender` - Predicted gender from Genderize
- `probability` - Confidence score (0 to 1)
- `sample_size` - Number of data points behind the prediction
- `is_confident` - `true` when probability >= 0.7 and sample_size >= 100
- `processed_at` - UTC timestamp generated fresh on each request

### Error Responses

All errors return:

```json
{ "status": "error", "message": "<description>" }
```

**400 Bad Request** - Missing or empty name parameter:

```bash
curl "https://backend-wizards-stage-0.vercel.app/api/classify"
```

```json
{ "status": "error", "message": "Missing required query parameter: name" }
```

**422 Unprocessable Entity** - Name is not a string:

```bash
curl "https://backend-wizards-stage-0.vercel.app/api/classify?name=a&name=b"
```

```json
{ "status": "error", "message": "Query parameter 'name' must be a string" }
```

**404 Not Found** - No prediction available (null gender or zero sample size):

```bash
curl "https://backend-wizards-stage-0.vercel.app/api/classify?name=asdfghjkl123"
```

```json
{ "status": "error", "message": "No prediction available for the provided name" }
```

**502 Bad Gateway** - Genderize API is unreachable or returns an error.

## Deploy

Deployed on Vercel. The Express app is exported as a serverless function via `api/index.ts`, with `vercel.json` rewriting all routes to `/api`.
