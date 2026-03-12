# Phase 1 KPI + Performance Evidence

Date: 2026-03-11  
Owner: Back-End Hardening

## KPI Query Artifact

Use:

`backend/scripts/phase1-kpi-report.sql`

This report contains executable SQL for:
1. Wizard completion timing sample (`recommendation_sessions.wizard_duration_seconds`)
2. Unlock conversion numerator/denominator (`recommendations.unlocked_at`)
3. Try-it CTR numerator/denominator (`recommendation_try_it_clicks`)

Run against DB:

```bash
psql "$DATABASE_URL" -f backend/scripts/phase1-kpi-report.sql
```

## Compute p95 Benchmark Artifact

Executable benchmark command (default quick sample, rate-limit-safe):

```bash
cd backend && npm run perf:compute
```

Script path:

`backend/scripts/measure-compute-latency.mjs`

## Reproducible Run (local hardening check)

For higher-confidence sampling (e.g., 200 measured runs), default local rate limits will throttle. For that case, compute p95 was measured with a dedicated local process on port `8081` and relaxed session/compute limits:

```bash
cd backend && PORT=8081 USE_MOCK_DATA=true RATE_LIMIT_SESSION_MAX=10000 RATE_LIMIT_COMPUTE_MAX=10000 node src/index.js
API_BASE_URL=http://localhost:8081/api ITERATIONS=200 WARMUP=30 node scripts/measure-compute-latency.mjs
```

Observed output:

```json
{
  "api_base_url": "http://localhost:8081/api",
  "warmup_runs": 30,
  "measured_runs": 200,
  "avg_ms": 0.43,
  "p50_ms": 0.35,
  "p95_ms": 0.82,
  "p99_ms": 1.4,
  "max_ms": 4.07,
  "target_p95_ms": 500,
  "target_met": true
}
```

## DB Bootstrap Requirement Status

Command:

```bash
cd backend && npm run db:bootstrap
```

Result:
- `PASS` on local PostgreSQL (`postgresql@17` via Homebrew).
- Output: `Database schema and seed are up to date.`

## DB-Backed KPI Snapshot (Closeout)

Run:

```bash
psql "postgresql://localhost:5432/trustmebroai" -f backend/scripts/phase1-kpi-report.sql
```

Observed:
- recommendation denominator: `11`
- unlock numerator: `7`
- unlock conversion: `63.64%`
- try-it denominator (unlocked): `7`
- try-it numerator: `4`
- try-it CTR: `57.14%`

Wizard timing median query:

```sql
SELECT COUNT(*) AS sample_size,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY wizard_duration_seconds)::numeric, 2) AS median_seconds
FROM recommendation_sessions
WHERE wizard_duration_seconds IS NOT NULL;
```

Observed:
- sample size: `11`
- median seconds: `45.00` (`< 60s` target met)

## DB-Backed Compute p95 Snapshot (Closeout)

Run:

```bash
cd backend && API_BASE_URL=http://localhost:8082/api npm run perf:compute
```

Observed:
- `p95_ms: 2.43`
- `target_p95_ms: 500`
- `target_met: true`
