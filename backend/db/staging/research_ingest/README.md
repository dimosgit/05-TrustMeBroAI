# Research Ingest Staging Artifacts

This directory is the deterministic dry-run staging area for `docs/research` ingestion.

Generated artifacts:

1. `candidate_tools.jsonl` - normalized candidate tool records.
2. `candidate_evidence.jsonl` - field-level provenance evidence for each candidate.
3. `candidate_conflicts.json` - unresolved conflicts and validation findings.
4. `curation_decisions.json` - review decisions scaffold for curator workflow.
5. `approved_tool_updates.sql` - deterministic SQL upsert artifact (dry-run generation only).

Generate/update artifacts:

```bash
cd backend
npm run research:ingest:dry-run
```

Apply approved candidates (guarded):

```bash
cd backend
npm run research:ingest:apply -- --release-id <release-id> --confirm APPLY_CANDIDATE_RELEASE
```
