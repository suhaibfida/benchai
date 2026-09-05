# BenchAI

BenchAI is a model benchmarking platform where users can upload local AI models and evaluate them across multiple benchmarks on cloud-hosted infrastructure. It provides standardized performance metrics, automated testing, and detailed results without requiring users to run the benchmarks on their own machines.

<img width="1203" height="622" alt="image" src="https://github.com/user-attachments/assets/2341c142-f608-406e-a0c8-d3ae4991bd8e" />

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
   - [Authentication](#authentication)
   - [Model Upload](#model-upload)
   - [Benchmark Dispatch](#benchmark-dispatch)
   - [Benchmark Categories](#benchmark-categories)
6. [Frontend (Client)](#frontend-client)
7. [Database (Prisma + PostgreSQL)](#database-prisma--postgresql)
8. [Shared Packages](#shared-packages)
   - [UI Components](#ui-components)
   - [Validation Schemas](#validation-schemas)
   - [ESLint Config](#eslint-config)
   - [TypeScript Config](#typescript-config)
9. [How Benchmarks Work (Data Flow)](#how-benchmarks-work-data-flow)
10. [Scripts](#scripts)

---

## What is BenchAI?

BenchAI lets you upload local AI models (in GGUF format) and tests them against standardized benchmarks like **Coding**, **Math**, and **Reasoning** on cloud infrastructure. You get consistent, reliable performance metrics without needing high-end hardware locally.

→ [Back to top](#table-of-contents)

---

## Architecture

BenchAI is a **monorepo** built with [Turborepo](https://turbo.build) and managed with [Bun](https://bun.sh). It contains two applications and five shared packages.

```
benchai
│
├── apps/
│   ├── client/    → React + Vite typeScript SPA frontend
│   └── api/       → Express + Bun backend
│
└── packages/
    ├── db/                → Prisma + PostgreSQL models
    ├── ui/                → Shared React components
    ├── zod/               → Validation schemas
    ├── eslint-config/     → Shared ESLint configs
    └── typescript-config/ → Shared TS configs
```

→ [Back to top](#table-of-contents)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Bun](https://bun.sh) 1.3.13 (the package manager)
- [PostgreSQL](https://www.postgresql.org/) database
- AWS credentials (S3 + SQS) for upload/benchmark features

### Installation

```bash
bun install
```

### Environment Variables

The API reads its configuration from environment variables. Create a `.env` file with:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `SALT` | bcrypt salt rounds for password hashing |
| `PORT` | API port (defaults to `process.env.PORT`) |
| `AWS_*` | AWS credentials and region for S3/SQS |

### Running the Project

```bash
bun run dev      # starts all workspaces in watch mode
```

→ [Back to top](#table-of-contents)

---

## Project Structure

The core logic lives in these locations:

| Area | Location |
|------|----------|
| Frontend app | [`apps/client`](apps/client) |
| Backend app | [`apps/api`](apps/api) |
| Database code | [`packages/db`](packages/db) |
| Shared UI | [`packages/ui`](packages/ui) |
| Validation schemas | [`packages/zod`](packages/zod) |
| Turborepo pipeline | [`turbo.json`](turbo.json) |

→ [Back to top](#table-of-contents)

---

## Backend (API)

Located in [`apps/api`](apps/api). The entry point is [`index.ts`](apps/api/index.ts), which sets up Express with cookie parsing, CORS (allowing `localhost:5173`), JSON body parsing, and mounts the router from [`router/router.ts`](apps/api/router/router.ts).

### Authentication

Handled with bcrypt + JWT (httpOnly cookies):

- **Signup** — [`controller/signup.ts`](apps/api/controller/signup.ts) validates the body, checks for duplicate emails, hashes the password, and creates the user.
- **Login** — [`controller/login.ts`](apps/api/controller/login.ts) verifies credentials and sets a signed JWT cookie.
- **Middleware** — [`middleware/authMiddleware.ts`](apps/api/middleware/authMiddleware.ts) verifies the JWT and attaches `userId` to the request.

→ [Back to `#backend-api`](#backend-api)

### Model Upload

Uses presigned S3 URLs so users upload `.gguf` models directly to cloud storage (bucket: `screenio-s3`):

- [`controller/signedUrl.ts`](apps/api/controller/signedUrl.ts) generates a presigned PUT URL (`uploads/{userId}/models/{uuid}.gguf`) and creates a `Model` record with status `pending`.
- [`lib/putSignedUrl.ts`](apps/api/lib/putSignedUrl.ts) builds the presigned PUT URL.
- [`lib/getSignedUrl.ts`](apps/api/lib/getSignedUrl.ts) builds presigned GET URLs for downloading models.
- [`lib/s3Client.ts`](apps/api/lib/s3Client.ts) configures the S3 client (`ap-southeast-2`).

→ [Back to `#backend-api`](#backend-api)

### Benchmark Dispatch

After upload, models are queued for testing:

- [`controller/checkFile.ts`](apps/api/controller/checkFile.ts) verifies the file exists in S3, then dispatches the model to a queue.
- [`lib/sendSqs.ts`](apps/api/lib/sendSqs.ts) sends model details to an AWS SQS queue with the benchmark test list.
- [`lib/sqsClient.ts`](apps/api/lib/sqsClient.ts) configures the SQS client (`eu-north-1`).

→ [Back to `#backend-api`](#backend-api)

### Benchmark Categories

The benchmark prompts consumed by the Lambda worker are defined in [`extras/lambdaBenchmarks.ts`](apps/api/extras/lambdaBenchmarks.ts):

- **Coding** — includes two-sum, palindrome, linked-list reversal, longest increasing subsequence, bug-finding
- **Math** — includes percentage/tax, algebra, rate/distance, probability
- **Reasoning** — includes logical ordering, mislabeled boxes, syllogisms, number sequences
- **TokensPerSecond** — throughput measurement

→ [Back to `#backend-api`](#backend-api)

---

## Frontend (Client)

Located in [`apps/client`](apps/client). Built with **React 19 + Vite 8 + TypeScript**, served on port `5173` during development. Currently a fresh scaffold — BenchAI-specific pages, routing, and API integration are still being built.

→ [Back to top](#table-of-contents)

---

## Database (Prisma + PostgreSQL)

Located in [`packages/db`](packages/db). Uses Prisma 7 with a PostgreSQL driver adapter. Schema is defined in [`prisma/schema.prisma`](packages/db/prisma/schema.prisma):

- **User** — `id`, `username`, `email`, `password`, `createdAt`, and related `models`.
- **Model** — `id`, `modelName`, `key` (S3 object path), `status`, `description`, `userId`, `createdAt`.

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

Defined in [`zod.ts`](packages/zod/src/zod.ts).

→ [Back to `#shared-packages`](#shared-packages)

### ESLint Config

Located in [`packages/eslint-config`](packages/eslint-config). Exports flat ESLint 9 configs: `base`, `next-js`, and `react-internal`.

→ [Back to `#shared-packages`](#shared-packages)

### TypeScript Config

Located in [`packages/typescript-config`](packages/typescript-config). Shares `base.json`, `nextjs.json`, and `react-library.json` TypeScript configurations across workspaces.

→ [Back to `#shared-packages`](#shared-packages)

---

## How Benchmarks Work (Data Flow)

1. **Sign up / log in** via the API ([Authentication](#authentication)) to get a JWT cookie.
2. **Request an upload URL** → the API returns a presigned S3 PUT URL ([Model Upload](#model-upload)).
3. **Upload the `.gguf` model** directly to S3.
4. **Verify & dispatch** → call `checkfile`; if the file exists in S3, the model is sent to SQS ([Benchmark Dispatch](#benchmark-dispatch)).
5. **A Lambda worker** consumes the queue, downloads the model via a presigned GET URL, and runs the configured benchmarks ([Benchmark Categories](#benchmark-categories)).
6. **Results** would then be stored and surfaced to the user (this step is not yet implemented).

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
