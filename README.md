# Helebba

## Stack

- Runtime: Node.js 22+, TypeScript, pnpm, Turborepo.
- APIs: Fastify REST (`apps/edge`), Express REST (`apps/express-api`) y GraphQL Apollo/Fastify (`apps/graphql`).
- Auth/security: JWT, refresh token helpers, OAuth-ready config, RBAC, API keys, token rotation primitives, security headers, CORS, Redis-backed rate limiting.
- Tenancy: tenant context by host, path, or `x-tenant` header.
- Data: PostgreSQL/AWS RDS via Drizzle-ready package, MongoDB Atlas via Mongoose, Redis, Meilisearch.
- Workers: BullMQ workers in `apps/worker` backed by Redis.
- Frontend: Next.js SEO-first (`apps/site`), Vite React console (`apps/web`), CSS Modules, TanStack Query, Zustand, Lucide React.
- Mobile: React Native CLI app in `apps/app`.
- Platform: OpenTelemetry, Sentry, PostHog, SNS, SQS, AWS Secrets Manager.
- Infra: Docker Compose for local dependencies, Terraform baseline for ECS, ECR, CloudWatch, IAM, RDS, SNS, SQS and Secrets Manager.
- Quality: ESLint, Prettier, Vitest, Playwright, Changesets, GitHub Actions.

## Apps

| App                | Purpose                                                        | Default port |
| ------------------ | -------------------------------------------------------------- | ------------ |
| `apps/edge`        | Primary Fastify REST API gateway                               | `8000`       |
| `apps/graphql`     | GraphQL API                                                    | `8100`       |
| `apps/express-api` | Express REST example for teams that need Express compatibility | `8200`       |
| `apps/worker`      | BullMQ workers                                                 | n/a          |
| `apps/site`        | SEO-first Next.js site                                         | `3000`       |
| `apps/web`         | Vite React internal console                                    | `5173`       |
| `apps/app`         | React Native CLI app                                           | native       |

## Packages

| Package              | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `@hlb/contracts`     | Shared domain contracts and branded IDs       |
| `@hlb/database`      | Drizzle schema and SQL migration baseline     |
| `@hlb/security`      | JWT, API keys, RBAC and tenancy helpers       |
| `@hlb/data-sources`  | PostgreSQL and Mongoose initialization/health |
| `@hlb/queue`         | BullMQ/Redis queue primitives                 |
| `@hlb/events`        | Domain-event and outbox helpers               |
| `@hlb/search`        | Tenant-scoped Meilisearch helpers             |
| `@hlb/cloud`         | AWS SNS, SQS and Secrets Manager adapters     |
| `@hlb/observability` | OpenTelemetry, Sentry and PostHog bootstrap   |
| `@hlb/design-system` | Shared tokens for product UI                  |

## Environments

The supported environment names are:

- `dev`
- `stg`
- `prod`

## Infra

Local dependencies live in `docker-compose.yaml`. AWS baseline lives in `infra/aws/terraform` and creates the first production primitives: ECS cluster, ECR repositories, CloudWatch log groups, IAM execution role, encrypted RDS PostgreSQL, Secrets Manager namespace, SNS and SQS.

See `docs/architecture.md` and `docs/runbooks` for the operating model. This is still a boilerplate, but the boundaries are explicit: multi-tenant by design, backend-owned by design, and ready to harden instead of rewrite.
