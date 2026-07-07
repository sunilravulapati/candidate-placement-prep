<!--
  scoring-rubric.md
  Shared scoring rubric included inline by analyze-resume.md and ats-analysis.md.
  VERSION: 1.0.0
-->

## SCORING RUBRIC

Score all three dimensions independently. Sum them for `semanticScore`.

### DIMENSION 1 — Complexity (0–15)
Measures the technical depth of projects and work experience.

| Range | Description |
|-------|-------------|
| 2–4   | Tutorial clone, to-do app, basic CRUD with no real architecture |
| 5–8   | Multi-feature app; some thought put in but no real depth |
| 9–12  | Real backend work — auth flows, job queues, caching, multiple DBs, APIs |
| 13–15 | Distributed systems, ML pipelines, notable scale, open-source contribution |

### DIMENSION 2 — Professionalism (0–5)
Measures the quality and precision of written language.

| Range | Description |
|-------|-------------|
| 0–1   | Vague filler ("worked on", "helped with", "was involved in") |
| 2–3   | Action verbs present but few/no metrics; passive or fluffy phrasing |
| 4–5   | Every bullet starts with a strong past-tense verb; quantified results throughout |

### DIMENSION 3 — Skill–Project Fit (0–10)
Measures whether listed skills are backed up by evidence in projects/roles.

| Range | Description |
|-------|-------------|
| 0–3   | Laundry-list of skills with no project evidence |
| 4–6   | Some skills demonstrably used, others dangling |
| 7–10  | Every key skill is clearly exercised in at least one described project or role |

### CALIBRATION ANCHORS
Use these to normalise your scoring:

- "Built a to-do app with React and Node.js." → Complexity **3**
- "Developed a REST API with JWT auth and Redis caching." → Complexity **9**
- "Architected a Kafka-based event pipeline serving 50K req/s." → Complexity **14**
- "Worked on the backend." → Professionalism **0**
- "Reduced API latency by 40% by introducing a Redis cache layer." → Professionalism **5**
