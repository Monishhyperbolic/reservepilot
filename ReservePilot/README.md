# ReservePilot

React + TypeScript treasury workspace backed by live CoinMarketCap quotes and Supabase authentication/storage. Client data is scoped to the authenticated user; market prices are never hardcoded.

## Run locally

```bash
npm install
npm run dev
```

Create a local `.env` file before starting Vite:

```bash
VITE_CMC_API_KEY=your_coinmarketcap_pro_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Vite development proxy adds the CoinMarketCap key to requests sent to `/api/coinmarketcap`. Supabase uses its public anon key from the browser and protects rows with the policies in `supabase/schema.sql`. Do not commit `.env`.

In Supabase, open **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql), then add the three variables to Vercel for Production, Preview, and Development. Enable Email auth under **Authentication > Providers**. For verification, password reset, and Google login, configure the Supabase email templates and Google provider redirect URL to your deployed domain.

## Routes

`/welcome`, `/overview`, `/treasury`, `/token`, `/market`, `/reserve-plan`, `/stress-test`, `/history`, `/evidence`, and `/settings`.

Start at `/welcome` for the public treasury-OS landing page, then authenticate and add actual holdings. Dashboard metrics, runway, reserve planning, stress projections, allocation charts, filtered history, evidence exports, CSV import/export, and asset tables are derived from those holdings. Monthly burn, reserve targets, workspace name, and automatic quote refresh intervals persist to the Supabase client profile.

Security and maintenance checks: `npm run build` passes and `npm audit --audit-level=moderate` reports zero vulnerabilities. Vite and the chart/vendor bundles are split for faster initial loading.
