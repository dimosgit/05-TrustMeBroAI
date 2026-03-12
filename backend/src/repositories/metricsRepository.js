export function createMetricsRepository({ query }) {
  return {
    async createFunnelEvent({
      eventName,
      userId = null,
      sessionId = null,
      recommendationId = null,
      eventSource = "backend",
      eventMetadata = {}
    }) {
      const result = await query(
        `INSERT INTO funnel_events (
           event_name,
           user_id,
           session_id,
           recommendation_id,
           event_source,
           event_metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         RETURNING
           id,
           event_name,
           user_id,
           session_id,
           recommendation_id,
           event_source,
           event_metadata,
           created_at`,
        [
          eventName,
          userId,
          sessionId,
          recommendationId,
          eventSource,
          JSON.stringify(eventMetadata || {})
        ]
      );

      return result.rows[0];
    }
  };
}
