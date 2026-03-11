-- Phase 1 KPI report artifact
-- 1) wizard completion timing sample
SELECT
  id AS session_id,
  wizard_duration_seconds,
  selected_priority,
  created_at
FROM recommendation_sessions
WHERE wizard_duration_seconds IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- 2) unlock conversion numerator/denominator
SELECT
  COUNT(*) AS recommendation_denominator,
  COUNT(*) FILTER (WHERE unlocked_at IS NOT NULL) AS unlock_numerator,
  ROUND(
    (
      COUNT(*) FILTER (WHERE unlocked_at IS NOT NULL)::numeric
      / NULLIF(COUNT(*), 0)
    ) * 100,
    2
  ) AS unlock_conversion_pct
FROM recommendations;

-- 3) try-it CTR numerator/denominator (unlocked recommendations only)
SELECT
  COUNT(*) FILTER (WHERE r.unlocked_at IS NOT NULL) AS try_it_denominator,
  COUNT(DISTINCT tc.recommendation_id) AS try_it_numerator,
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
WHERE r.unlocked_at IS NOT NULL;
