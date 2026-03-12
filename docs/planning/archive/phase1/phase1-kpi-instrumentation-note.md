# Phase 1 KPI Instrumentation Note

Date: 2026-03-10
Owner: Agent 1 (Backend)

## Metric Storage

1. Wizard completion timing
- Emitted/stored in `recommendation_sessions.wizard_duration_seconds` on `POST /api/recommendation/session`.

2. Unlock conversion
- Denominator stored in `recommendations` (one row per computed recommendation via `POST /api/recommendation/compute`).
- Numerator stored in `recommendations.unlocked_at` (set on `POST /api/recommendation/unlock`).

3. Try-it CTR
- Stored in `recommendation_try_it_clicks` via `POST /api/recommendation/:id/try-it-click`.
- Tracking is idempotent per (`recommendation_id`, `session_id`) to keep CTR stable.

## Executable Artifacts
- KPI SQL report: `backend/scripts/phase1-kpi-report.sql`
- Compute latency benchmark: `cd backend && npm run perf:compute`

## Query Examples

### 1) Wizard completion timing (daily)
```sql
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS session_count,
  ROUND(AVG(wizard_duration_seconds)::numeric, 2) AS avg_wizard_seconds,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY wizard_duration_seconds)::numeric, 2) AS p50_wizard_seconds
FROM recommendation_sessions
WHERE wizard_duration_seconds IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### 2) Unlock conversion (daily)
```sql
SELECT
  DATE(r.created_at) AS day,
  COUNT(*) AS computed_recommendations,
  COUNT(*) FILTER (WHERE r.unlocked_at IS NOT NULL) AS unlocked_recommendations,
  ROUND(
    (
      COUNT(*) FILTER (WHERE r.unlocked_at IS NOT NULL)::numeric
      / NULLIF(COUNT(*), 0)
    ) * 100,
    2
  ) AS unlock_conversion_pct
FROM recommendations r
GROUP BY DATE(r.created_at)
ORDER BY day DESC;
```

### 3) Try-it CTR after unlock (daily, unique click-through)
```sql
SELECT
  DATE(r.unlocked_at) AS day,
  COUNT(*) FILTER (WHERE r.unlocked_at IS NOT NULL) AS unlocked_recommendations,
  COUNT(DISTINCT tc.recommendation_id) AS clicked_recommendations,
  ROUND(
    (
      COUNT(DISTINCT tc.recommendation_id)::numeric
      / NULLIF(COUNT(*) FILTER (WHERE r.unlocked_at IS NOT NULL), 0)
    ) * 100,
    2
  ) AS try_it_ctr_pct
FROM recommendations r
LEFT JOIN recommendation_try_it_clicks tc
  ON tc.recommendation_id = r.id
WHERE r.unlocked_at IS NOT NULL
GROUP BY DATE(r.unlocked_at)
ORDER BY day DESC;
```
