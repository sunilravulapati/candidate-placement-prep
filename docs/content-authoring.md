# DSA & Aptitude Content Authoring Guide

This guide explains how to add, modify, validate, and publish content in PrepGenie's metadata-driven problem repository.

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Scaffolding a New Problem (`npm run create-problem`)](#scaffolding-a-new-problem)
3. [Required Files & Specifications](#required-files--specifications)
4. [Bulk Operations (`npm run bulk-update`)](#bulk-operations)
5. [Validation & Health Reporting](#validation--health-reporting)
6. [Publishing Workflow](#publishing-workflow)

---

## 1. Repository Structure

All DSA problems reside under `backend/data/problems/<problem-slug>/`.

```text
backend/data/problems/
└── two-sum/
    ├── problem.json        # Main metadata specification
    ├── tests.json          # Test cases (sample, edge, corner, stress, hidden)
    ├── editorial.md        # Comprehensive editorial markdown
    ├── hints.md            # Multi-level hints (separated by ---)
    └── solutions/
        └── reference.ts    # Trusted reference solution
```

---

## 2. Scaffolding a New Problem

To create a new problem folder with pre-filled templates, run:

```bash
npm run create-problem -- --title="House Robber II" --difficulty="Medium" --topic="dynamic-programming" --company="Google"
```

This creates:
- `backend/data/problems/house-robber-ii/problem.json`
- `backend/data/problems/house-robber-ii/tests.json`
- `backend/data/problems/house-robber-ii/editorial.md`
- `backend/data/problems/house-robber-ii/hints.md`
- `backend/data/problems/house-robber-ii/solutions/reference.ts`

---

## 3. Required Files & Specifications

### `problem.json`
Contains schema versioning, core metadata, starter signature, execution parameters, driver settings, rich relationships, and solution metadata.

```json
{
  "schemaVersion": 1,
  "contentVersion": 1,
  "lastReviewed": "2026-07-25",
  "lastModified": "2026-07-25",
  "author": "PrepGenie Content Team",
  "reviewStatus": "draft",
  "slug": "house-robber-ii",
  "title": "House Robber II",
  "difficulty": "MEDIUM",
  "topic": "dynamic-programming",
  "tags": ["Dynamic Programming", "Array"],
  "companies": ["Google", "Amazon"],
  "starterMetadata": {
    "functionName": "rob",
    "className": "Solution",
    "returnType": "int",
    "parameters": [{ "name": "nums", "type": "array<int>" }],
    "problemType": "FUNCTION"
  },
  "executionMetadata": {
    "comparator": "EXACT",
    "expectedComplexity": { "time": "O(N)", "space": "O(1)" }
  },
  "driverMetadata": {
    "driver": "DEFAULT"
  },
  "relationships": {
    "prerequisites": ["house-robber"],
    "followUps": [],
    "variants": [],
    "related": [],
    "learningPathPrevious": null,
    "learningPathNext": null
  }
}
```

### `solutions/`
Must contain at least one trusted reference solution (e.g. `reference.ts` or `reference.cpp`).

---

## 4. Bulk Operations

To perform batch updates across multiple problems without editing JSON files manually:

```bash
# Add a company to all dynamic programming problems (Dry run first)
npm run bulk-update -- --add-company="Meta" --filter-topic="dynamic-programming" --dry-run

# Execute bulk update
npm run bulk-update -- --add-company="Meta" --filter-topic="dynamic-programming"

# Batch update review status
npm run bulk-update -- --set-review-status="verified"
```

---

## 5. Validation & Health Reporting

Before submitting content, verify repository health:

```bash
# Validate DSA problem content
npm run validate-content

# Validate aptitude questions
npm run validate-aptitude

# Generate repository health metrics & actionable missing counts
npm run health-report
```

---

## 6. Publishing Workflow

1. Scaffold problem using `npm run create-problem`.
2. Fill in `problem.json`, `tests.json`, `editorial.md`, `hints.md`, and `solutions/reference.ts`.
3. Set `"reviewStatus": "published"` in `problem.json`.
4. Run `npm run validate-content` and `npm run health-report`.
5. Commit and push.
