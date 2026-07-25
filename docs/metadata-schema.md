# Metadata Schema Specification

This document details the exact JSON schema specification for `problem.json` in PrepGenie's DSA content repository.

## Schema Versioning

Every `problem.json` includes top-level metadata control fields:

| Field | Type | Description | Allowed Values |
|---|---|---|---|
| `schemaVersion` | `number` | Version of the metadata schema definition | `1` |
| `contentVersion` | `number` | Version of the specific problem content | `number` (default `1`) |
| `lastReviewed` | `string` | ISO date of last editorial review | `YYYY-MM-DD` |
| `lastModified` | `string` | ISO date of last modification | `YYYY-MM-DD` |
| `author` | `string` | Author or team responsible | `string` |
| `reviewStatus` | `string` | Review state of the content | `draft`, `reviewed`, `verified`, `published` |

---

## Core Problem Specification

```json
{
  "schemaVersion": 1,
  "contentVersion": 1,
  "lastReviewed": "2026-07-25",
  "lastModified": "2026-07-25",
  "author": "PrepGenie Content Team",
  "reviewStatus": "published",
  "slug": "two-sum",
  "title": "Two Sum",
  "difficulty": "EASY",
  "leetcodeNumber": 1,
  "estimatedMinutes": 15,
  "frequency": 68,
  "acceptanceRate": 75,
  "premium": false,
  "topic": "arrays-strings",
  "subtopic": "Hashing",
  "tags": ["Array", "Hash Table"],
  "companies": ["Google", "Amazon", "Microsoft", "Meta"],
  "learningPaths": ["Placement Essentials", "Blind 75"]
}
```

---

## Rich Relationships Specification

The `relationships` block links problems together for recommendations and learning paths:

```json
"relationships": {
  "prerequisites": [],
  "followUps": ["3sum"],
  "variants": ["two-sum-ii-input-array-is-sorted"],
  "related": ["valid-anagram"],
  "learningPathPrevious": null,
  "learningPathNext": "best-time-to-buy-and-sell-stock"
}
```

---

## Test Classifications

Test cases in `tests.json` must specify a `classification` property:

| Classification | Purpose |
|---|---|
| `sample` | Visible test case shown in problem statement and UI |
| `edge` | Boundary condition test case (empty inputs, min/max lengths) |
| `corner` | Special values (negatives, zeroes, duplicates, special chars) |
| `stress` | High load / maximum input boundary test |
| `performance` | Time limit optimization verification test |
| `hidden` | Hidden test case for grading |

---

## Solution Metadata Specification

`solutionMetadata` contains complexity definitions and learning notes:

```json
"solutionMetadata": {
  "optimalComplexity": {
    "time": "O(N)",
    "space": "O(N)"
  },
  "alternativeApproaches": [
    {
      "name": "Brute Force",
      "time": "O(N^2)",
      "space": "O(1)",
      "description": "Check all pairs using nested loops."
    }
  ],
  "patterns": ["One-pass Hash Map"],
  "commonMistakes": [
    "Not handling same element used twice",
    "Assuming sorted input"
  ],
  "edgeCases": [
    "Array with 2 elements",
    "Negative target and numbers"
  ],
  "interviewNotes": [
    "Clarify if array is sorted.",
    "Discuss space-time trade-offs between sorting and hashing."
  ]
}
```
