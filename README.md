# BenchAI

BenchAI is a model benchmarking platform where users can upload local AI models and evaluate them across multiple benchmarks on cloud-hosted GPU infrastructure. It provides standardized performance metrics, automated testing, and stored results without requiring users to run the benchmarks on their own machines.

<img width="1547" height="681" alt="Untitled-2026-09-12-1456" src="https://github.com/user-attachments/assets/3614582c-4f52-4aa3-97a9-fbc003fa6fd1" />

<details>
<summary>Previous architecture sketches</summary>

<img width="1002" height="529" alt="image" src="https://github.com/user-attachments/assets/021ff3a4-296c-4c09-8c11-6ad9cff779ea" />
<img width="1203" height="622" alt="image" src="https://github.com/user-attachments/assets/2341c142-f608-406e-a0c8-d3ae4991bd8e" />
<img width="1195" height="451" alt="image" src="https://github.com/user-attachments/assets/fd449ca1-f343-48b4-beb5-ea3c1d9f537f" />

</details>

## Table of Contents

1. [What is BenchAI?](#what-is-benchai)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running the Project](#running-the-project)
4. [Project Structure](#project-structure)
5. [Backend (API)](#backend-api)
   - [API Routes](#api-routes)
   - [Authentication](#authentication)
   - [Model Upload](#model-upload)
   - [Benchmark Dispatch](#benchmark-dispatch)
   - [GPU Slots & Dispatcher](#gpu-slots--dispatcher)
   - [Results Ingestion](#results-ingestion)
   - [User Endpoints](#user-endpoints)
6. [Benchmark Worker](#benchmark-worker)
7. [Database (Prisma + PostgreSQL)](#database-prisma--postgresql)
8. [Shared Packages](#shared-packages)
9. [How Benchmarks Work (Data Flow)](#how-benchmarks-work-data-flow)
10. [Scripts](#scripts)
11. [Notes & Current Status](#notes--current-status)

---

## What is BenchAI?

BenchAI lets you upload local AI models (in GGUF format) and tests them against standardized benchmarks like **Coding**, **Math**, and **Reasoning** on cloud GPUs. Answers are graded by Gemini, throughput is measured with `llama-bench`, and the results are stored against your account — no high-end hardware needed locally.

→ [Back to top](#table-of-contents)

---

## Architecture

BenchAI is a **monorepo** built with [Turborepo](https://turbo.build) and managed with [Bun](https://bun.sh). It contains one application (the API) and five shared packages. Compute is outsourced to AWS (S3, SQS, Lambda, DynamoDB) and [Modal](https://modal.com) GPU sandboxes.

```
benchai
│
├── apps/
│   └── api/                → Express + Bun backend
│
└── packages/
    ├── db/                 → Prisma + PostgreSQL models
    ├── ui/                 → Shared React components
    ├── zod/                → Validation schemas
    ├── eslint-config/      → Shared ESLint configs
    └── typescript-config/  → Shared TS configs
```

External services involved at runtime:

| Service | Role |
|---------|------|
| **AWS S3** (`screenio-s3`, `ap-southeast-2`) | Stores uploaded `.gguf` models via presigned URLs |
| **AWS SQS** (`eu-north-1`) | Queue of models waiting to be benchmarked |
| **AWS Lambda** (`benchaiLambda`) | Dispatcher invoked by the API to pull queue messages and spin up sandboxes |
| **AWS DynamoDB** (`eu-north-1`) | Tracks GPU slot availability (`sandboxes` / `GpuSlots` tables) |
| **Modal** (T4 GPU sandbox) | Runs the benchmark container with llama.cpp built for CUDA |
| **Gemini** (`gemini-2.5-flash`) | Judges model answers and produces scores/summaries |
| **PostgreSQL** | Stores users, models, and benchmark results |

→ [Back to top](#table-of-contents)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Bun](https://bun.sh) 1.3.13 (the package manager)
- [PostgreSQL](https://www.postgresql.org/) database
- AWS credentials (S3, SQS, Lambda, DynamoDB) for upload/dispatch features
- A [Modal](https://modal.com) account (`MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET`)
- A Gemini API key for answer grading (provided to the sandbox via the `benchmark-secrets` Modal secret)

### Installation

```bash
bun install
```

Generate the Prisma client and apply migrations:

```bash
cd packages/db
bunx prisma migrate deploy
```

### Environment Variables

The API reads its configuration from a `.env` in [`apps/api`](apps/api) (loaded via `dotenv`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (also read by [`packages/db`](packages/db)) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `SALT` | bcrypt configuration for password hashing |
| `PORT` | API port (e.g. `3000`) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3/SQS/Lambda/DynamoDB |
| `QUEUE_URL` | SQS queue URL for pending benchmark jobs |
| `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` | Modal API credentials for creating/terminating GPU sandboxes |

The benchmark worker inside the sandbox additionally needs `SERVER_URL` (callback URL for posting results) and `GEMINI_API_KEY` (plus optional `GEMINI_MODEL`), which are supplied through the Modal `benchmark-secrets` secret.

A minimal [`apps/api/.env.example`](apps/api/.env.example) is included.

### Running the Project

```bash
bun run dev      # starts all workspaces in watch mode
```

On boot the API also starts its SQS polling loop (see [GPU Slots & Dispatcher](#gpu-slots--dispatcher)).

→ [Back to top](#table-of-contents)

---

## Project Structure

The core logic lives in these locations:

| Area | Location |
|------|----------|
| Backend app | [`apps/api`](apps/api) |
| Route definitions | [`apps/api/router/router.ts`](apps/api/router/router.ts) |
| AWS integrations (S3/SQS/Lambda/DynamoDB) | [`apps/api/aws`](apps/api/aws) |
| Benchmark worker + Modal sandbox | [`apps/api/extras`](apps/api/extras) |
| Database code | [`packages/db`](packages/db) |
| Shared UI | [`packages/ui`](packages/ui) |
| Validation schemas | [`packages/zod`](packages/zod) |
| Turborepo pipeline | [`turbo.json`](turbo.json) |

→ [Back to top](#table-of-contents)

---

## Backend (API)

Located in [`apps/api`](apps/api). The entry point is [`index.ts`](apps/api/index.ts), which sets up Express with cookie parsing, CORS (allowing `http://localhost:5173`), JSON body parsing, mounts the router from [`router/router.ts`](apps/api/router/router.ts), and starts the background polling loop.

### API Routes

| Method | Path | Auth | Handler | Purpose |
|--------|------|------|---------|---------|
| POST | `/api/v1/auth/signup` | — | [`controller/signup.ts`](apps/api/controller/signup.ts) | Create an account |
| POST | `/api/v1/auth/login` | — | [`controller/login.ts`](apps/api/controller/login.ts) | Log in, sets JWT cookie |
| GET | `/api/v1/getpresignedurl` | ✅ | [`controller/signedUrl.ts`](apps/api/controller/signedUrl.ts) | Presigned S3 PUT URL + `Model` row |
| POST | `/api/v1/response=200` | ✅ | [`controller/checkFile.ts`](apps/api/controller/checkFile.ts) | Verify upload, enqueue to SQS |
| POST | `/api/v1/addsandboxid` | — | [`controller/saveSandboxId.ts`](apps/api/controller/saveSandboxId.ts) | Save sandbox/queue receipt IDs on the model |
| POST | `/api/v1/benchmark/results` | — | [`controller/summaryDetails.ts`](apps/api/controller/summaryDetails.ts) | Worker callback: store results, terminate sandbox |
| POST | `/api/v1/user/models` | ✅ | [`controller/checkModels.ts`](apps/api/controller/checkModels.ts) | List the user's models |
| POST | `/api/v1/user/model/result` | ✅ | [`controller/modelResult.ts`](apps/api/controller/modelResult.ts) | Fetch a model's benchmark result |

### Authentication

Handled with bcrypt + JWT (httpOnly cookies):

- **Signup** — [`controller/signup.ts`](apps/api/controller/signup.ts) validates the body with `@repo/zod`, checks for duplicate emails, hashes the password, and creates the user.
- **Login** — [`controller/login.ts`](apps/api/controller/login.ts) verifies credentials and sets a signed JWT cookie (24h, `httpOnly`).
- **Middleware** — [`middleware/authMiddleware.ts`](apps/api/middleware/authMiddleware.ts) verifies the JWT and attaches the user id to the request.

→ [Back to `#backend-api`](#backend-api)

### Model Upload

Uses presigned S3 URLs so users upload `.gguf` models directly to cloud storage (bucket: `screenio-s3`):

- [`controller/signedUrl.ts`](apps/api/controller/signedUrl.ts) generates a presigned PUT URL (`uploads/{userId}/models/{uuid}.gguf`) and creates a `Model` record with status `pending`.
- [`aws/putSignedUrl.ts`](apps/api/aws/putSignedUrl.ts) builds the presigned PUT URL.
- [`aws/getSignedUrl.ts`](apps/api/aws/getSignedUrl.ts) builds presigned GET URLs for downloading models.
- [`aws/s3Client.ts`](apps/api/aws/s3Client.ts) configures the S3 client (`ap-southeast-2`).

→ [Back to `#backend-api`](#backend-api)

### Benchmark Dispatch

After upload, models are queued for testing:

- [`controller/checkFile.ts`](apps/api/controller/checkFile.ts) verifies the file exists in S3, then dispatches the model to a queue.
- [`aws/sendSqs.ts`](apps/api/aws/sendSqs.ts) sends `{ modelId, modelUrl }` (a presigned GET URL) to the SQS queue.
- [`aws/sqsClient.ts`](apps/api/aws/sqsClient.ts) configures the SQS client (`eu-north-1`).

→ [Back to `#backend-api`](#backend-api)

### GPU Slots & Dispatcher

On startup [`index.ts`](apps/api/index.ts) calls [`aws/processPoll.ts`](apps/api/aws/processPoll.ts), which runs a 5-second loop:

1. [`aws/getDbSlots.ts`](apps/api/aws/getDbSlots.ts) scans the DynamoDB slot table for GPUs with status `free`.
2. If slots are available, [`aws/pollSqs.ts`](apps/api/aws/pollSqs.ts) triggers [`aws/invokeLambda.ts`](apps/api/aws/invokeLambda.ts), which invokes the `benchaiLambda` dispatcher function.
3. The dispatcher pulls up to *N* messages from SQS (see [`extras/pollSqs.ts`](apps/api/extras/pollSqs.ts) / [`extras/event.ts`](apps/api/extras/event.ts)) and, for each message, [`extras/sandbox.ts`](apps/api/extras/sandbox.ts) creates a Modal GPU sandbox (T4, Ubuntu 24.04, llama.cpp built with CUDA) that runs `benchmark.py`.
4. The sandbox reports its id back to `POST /api/v1/addsandboxid`, which stores `sandboxId` + `receiptHandle` on the `Model` row.
5. [`aws/changeDbSlots.ts`](apps/api/aws/changeDbSlots.ts) marks the occupied slots as running.

→ [Back to `#backend-api`](#backend-api)

### Results Ingestion

When the worker finishes, it POSTs the final result object to `POST /api/v1/benchmark/results` ([`controller/summaryDetails.ts`](apps/api/controller/summaryDetails.ts)), which:

- updates the `Model` (`jobId`, `status: "done"`),
- creates a `Modelresults` row (scores, summary, performance, response time, model info, benchmark data),
- terminates the Modal sandbox via [`controller/terminate.ts`](apps/api/controller/terminate.ts).

→ [Back to `#backend-api`](#backend-api)

### User Endpoints

Authenticated endpoints for reading data back:

- `POST /api/v1/user/models` — returns the caller's models.
- `POST /api/v1/user/model/result` — returns the stored result for a model.

→ [Back to `#backend-api`](#backend-api)

---

## Benchmark Worker

The actual benchmarking runs inside a Modal GPU sandbox, driven by [`apps/api/extras/benchmark.py`](apps/api/extras/benchmark.py):

1. **Download** the GGUF model from the presigned S3 URL.
2. **Run 30 benchmark prompts** (10 Coding + 10 Math + 10 Reasoning) through `llama-cli`.
   - *Coding* — two-sum, palindrome, linked-list reversal, longest increasing subsequence, bug-finding, etc.
   - *Math* — percentages/tax, algebra, rate/distance, probability.
   - *Reasoning* — logical ordering, mislabeled boxes, syllogisms, number sequences.
3. **Measure timing** — per-question response-time metrics.
4. **Throughput** — `llama-bench` for tokens/second and prompt-processing numbers.
5. **Grade** — Gemini (`gemini-2.5-flash`) scores each answer and writes summaries.
6. **Report** — build the final JSON result and POST it to `{SERVER_URL}/benchmark/results`.

Container setup lives in [`extras/sandbox.ts`](apps/api/extras/sandbox.ts); sandbox lifecycle helpers in [`extras/terminate.ts`](apps/api/extras/terminate.ts).

→ [Back to top](#table-of-contents)

---

## Database (Prisma + PostgreSQL)

Located in [`packages/db`](packages/db). Uses Prisma 7 with a PostgreSQL driver adapter. Schema is defined in [`prisma/schema.prisma`](packages/db/prisma/schema.prisma):

- **User** — `id`, `username`, `email`, `password`, `createdAt`, plus relations to `models` and `modelResults`.
- **Model** — `id`, `modelName`, `key` (S3 object path), `status`, `description`, `jobId`, `sandboxId`, `receiptHandle`, `userId`, `createdAt`.
- **Modelresults** — `id`, `scores`, `summary`, `performance`, `responseTime`, `modelInfo`, `benchmark` (JSON stored as strings), `modelId` (unique), `userId`.

Migrations live in [`prisma/migrations`](packages/db/prisma/migrations).

→ [Back to top](#table-of-contents)

---

## Shared Packages

### UI Components

Located in [`packages/ui`](packages/ui). Reusable React components importable as `@repo/ui/*`:

- `Button` — [`src/button.tsx`](packages/ui/src/button.tsx)
- `Card` — [`src/card.tsx`](packages/ui/src/card.tsx)
- `Code` — [`src/code.tsx`](packages/ui/src/code.tsx)

→ [Back to `#shared-packages`](#shared-packages)

### Validation Schemas

Located in [`packages/zod`](packages/zod). Uses Zod 4:

- `signupSchema` — username, email, password validation
- `loginSchema` — email, password validation

Defined in [`zod.ts`](packages/zod/zod.ts).

→ [Back to `#shared-packages`](#shared-packages)

### ESLint Config

Located in [`packages/eslint-config`](packages/eslint-config). Exports flat ESLint 9 configs: `base`, `next-js`, and `react-internal`.

→ [Back to `#shared-packages`](#shared-packages)

### TypeScript Config

Located in [`packages/typescript-config`](packages/typescript-config). Shares `base.json` (plus `nextjs.json` / `react-library.json` templates) across workspaces.

→ [Back to `#shared-packages`](#shared-packages)

---

## How Benchmarks Work (Data Flow)

1. **Sign up / log in** via the API ([Authentication](#authentication)) to get a JWT cookie.
2. **Request an upload URL** → the API returns a presigned S3 PUT URL and creates a `Model` row ([Model Upload](#model-upload)).
3. **Upload the `.gguf` model** directly to S3.
4. **Verify & dispatch** → call `response=200`; if the file exists in S3, the model is sent to SQS ([Benchmark Dispatch](#benchmark-dispatch)).
5. **Dispatcher** → the polling loop finds free GPU slots and invokes `benchaiLambda`, which pulls from the queue and starts a Modal T4 sandbox running `benchmark.py` ([GPU Slots & Dispatcher](#gpu-slots--dispatcher)).
6. **Benchmark** → the worker downloads the model, runs Coding/Math/Reasoning prompts, `llama-bench`, and Gemini grading ([Benchmark Worker](#benchmark-worker)).
7. **Results** → the worker POSTs the final result; the API stores it in `Modelresults` and terminates the sandbox ([Results Ingestion](#results-ingestion)).
8. **Read results** → the user fetches their models and stored results via the authenticated user endpoints ([User Endpoints](#user-endpoints)).

→ [Back to top](#table-of-contents)

---

## Scripts

Run any of these from the repo root (delegated to Turborepo):

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all workspaces in watch mode |
| `bun run build` | Build all workspaces |
| `bun run lint` | Lint all workspaces |
| `bun run format` | Format code with Prettier |
| `bun run check-types` | Type-check all workspaces |

In [`apps/api`](apps/api):

| Command | Description |
|---------|-------------|
| `bun run start` | Run the API with `--watch` |
| `bun run dev` | Run the API once |

→ [Back to top](#table-of-contents)

---

## Notes & Current Status

- The project is **API-only** for now — the previous Vite client was removed. CORS still allows `http://localhost:5173` for a future frontend.
- Benchmark questions live in [`apps/api/extras/benchmark.py`](apps/api/extras/benchmark.py) (the old `lambdaBenchmarks.ts` was removed).
- The dispatcher Lambda (`benchaiLambda`) and its IAM/DynamoDB infrastructure are defined outside this repo.

→ [Back to top](#table-of-contents)
