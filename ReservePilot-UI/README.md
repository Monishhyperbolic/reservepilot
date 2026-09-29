# ReservePilot

ReservePilot is a Vite React frontend with a Vercel Serverless API for planning crypto treasury runway, protected stablecoin reserves, portfolio concentration, and hypothetical downside scenarios. The API is TypeScript, validates requests with Zod, obtains CoinMarketCap prices only on the server, and persists treasuries and snapshots with Prisma/PostgreSQL.

ReservePilot is a planning tool, not financial advice. CoinMarketCap values are timestamped snapshots; stress tests are hypothetical; stablecoin classification is a symbol-based heuristic and does not guarantee stability. ReservePilot does not execute trades or transactions.

## Architecture

The static application is built to `dist/`. Vercel routes `/api/*` to [the Express serverless entrypoint](/Users/monishpatil/Downloads/ReservePilot-UI/api/[...path].ts), which loads the API app in `server/src/`. Prisma connects from serverless functions to a managed PostgreSQL database. Price keys are server-only Vercel environment variables and the frontend should use same-origin relative API URLs such as `/api/quotes?symbols=BTC,ETH,USDC`.

The quote cache is intentionally in memory for this MVP. It works within a warm function instance; use Redis/KV before relying on shared caching across many Vercel instances.

## Requirements

- Node.js 20.19 or newer
- A CoinMarketCap Pro API key for live prices
- PostgreSQL for snapshots and treasury data (Vercel Postgres, Neon, Supabase, or equivalent)

## Local setup

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and CMC_API_KEY in .env
npm run db:generate
npm run db:migrate
npm run db:seed
```

Run the frontend and API in separate terminals:

```bash
npm run dev
npm run dev:api
```

The API runs at `http://localhost:4000`; the Vite frontend runs at `http://localhost:5173`. The supplied frontend is still display-data driven, so connect new interactions through relative `/api/*` calls when wiring its controls to the API.

## Environment variables

Copy [.env.example](/Users/monishpatil/Downloads/ReservePilot-UI/.env.example). Required production values are:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Managed PostgreSQL connection string; use SSL where your host requires it. |
| `CMC_API_KEY` | CoinMarketCap Pro key, stored only in server/Vercel environment settings. |
| `FRONTEND_ORIGIN` | Approved browser origin(s), comma-separated. |
| `CMC_BASE_URL` | Defaults to `https://pro-api.coinmarketcap.com`. |
| `QUOTE_CACHE_TTL_SECONDS` | In-process quote cache TTL, default 60 seconds. |
| `MAX_HOLDINGS_PER_TREASURY` / `MAX_SNAPSHOTS_PER_TREASURY` | Safety limits. |

Production startup fails without `CMC_API_KEY`. No API key is returned or logged, and the API never generates synthetic prices.

## API

Every JSON response contains a `requestId`; validation and upstream errors use `{ error: { code, message, details, requestId } }`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness check |
| GET | `/api/status` | Safe CMC/database configuration status |
| GET | `/api/quotes?symbols=BTC,ETH,USDC` | Cached live or clearly labelled stale live quotes |
| GET/POST | `/api/treasuries` | List or create a treasury |
| GET/PUT | `/api/treasuries/:treasuryId` | Read or update profile and holdings |
| POST | `/api/treasuries/:treasuryId/archive` | Soft archive |
| POST | `/api/treasuries/:treasuryId/analyze` | Analysis; body `{ "saveSnapshot": true }` is optional |
| POST | `/api/treasuries/:treasuryId/stress-test` | Scenario with decline, stablecoin haircut, expense multiplier |
| GET | `/api/treasuries/:treasuryId/reserve-plan?scenario=25` | Non-execution reserve recommendation |
| GET/POST | `/api/treasuries/:treasuryId/snapshots` | List or create snapshots |
| GET | `/api/treasuries/:treasuryId/snapshots/compare?left=id&right=id` | Compare snapshots |
| GET | `/api/snapshots/:snapshotId` | Read a snapshot |
| GET | `/api/treasuries/:treasuryId/evidence?format=json|csv` | Formula, quote-source, and scenario evidence |

`POST /api/treasuries` accepts the treasury and holdings shape in the project brief. Prices are always JSON numbers, timestamps are ISO 8601 strings, and planning statuses are `covered`, `watch`, `reserve_gap`, or `high_exposure`.

## Formulas

- Asset value: `quantity × priceUsd`
- Treasury value: sum of all asset values
- Runway: `totalTreasuryValue ÷ monthlyExpenses`
- Target reserve: `monthlyExpenses × targetReserveMonths`
- First-month cash need: `monthlyExpenses + oneTimeExpenses`
- Stable reserve: sum of stablecoin-classified holdings
- Volatile exposure: `totalTreasuryValue − stableReserve`
- Stress value: volatile assets receive the chosen decline; stablecoins receive the chosen haircut

The concentration thresholds are ReservePilot product heuristics: high above 60%, moderate from 40–60%, otherwise diversified.

## Tests and checks

```bash
npm run typecheck
npm test
npm run build
```

Tests do not call CoinMarketCap. They cover core calculation, stress, reserve-plan, validation, and health-route behaviours.

## Deploy to Vercel

1. Push/import this repository into Vercel.
2. Provision PostgreSQL and add its pooled connection string as `DATABASE_URL` in Vercel Project Settings → Environment Variables.
3. Add `CMC_API_KEY` and set `FRONTEND_ORIGIN` to the production URL (and preview URL if needed).
4. Apply the committed production migration from a trusted machine or CI job:

   ```bash
   DATABASE_URL='your-production-url' npm run db:deploy
   ```

5. Deploy. `vercel.json` builds the Vite app and bundles the catch-all API function; `vercel-build` generates Prisma Client and runs both type checks and the frontend build.
6. Confirm `https://your-domain/api/health`, then create/seed a treasury as appropriate.

The Vercel build must not run migrations automatically: migration application is an intentional database change and should be handled in a dedicated, auditable CI step. For larger traffic, replace the in-memory quote cache with Vercel KV/Redis and use a pooled/Postgres serverless connection URL.

## Security and limitations

Helmet, an explicit CORS allowlist, a 100 KB JSON body limit, quote-route rate limiting, Zod input checks, request IDs, soft archival, Prisma parameterization, and safe error envelopes are included. This MVP has no authentication because the existing UI has no auth model; add tenant-scoped authentication before exposing personal or organization treasury data publicly.
