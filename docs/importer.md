# Importer & Validation Architecture

This document describes the validation rules, normalization pipeline, and error handling enforced by `DSAContentImporter` and `validate-content`.

## Import Pipeline

```text
Raw problem.json / Directory Problem
          │
          ▼
   DSAContentImporter.validate()
   ├── 1. Kebab-case Slug & Duplicate Check
   ├── 2. Schema & Content Versioning Fields
   ├── 3. Review Status Validation ('draft' | 'reviewed' | 'verified' | 'published')
   ├── 4. Starter, Execution & Driver Metadata Validation
   ├── 5. Rich Test Category Verification
   └── 6. Solutions Folder Verification (>=1 reference solution)
          │
          ▼
   DSAContentImporter.importBatch() -> Normalized DSAProblemMetadata Object
```

---

## Validation Error Rules

Any of the following causes `npm run validate-content` to fail with exit code `1`:

1. **Missing or invalid `slug`**: Must be lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
2. **Missing Metadata Sections**: `starterMetadata`, `executionMetadata`, or `driverMetadata` missing.
3. **Missing `editorial.md` or `hints.md`**: Empty or non-existent documentation files.
4. **Missing `solutions/` Folder**: Folder missing or contains no reference solution files (`reference.ts`, `reference.cpp`, etc.).
5. **Insufficient Hidden Tests**: Fewer than 3 hidden/stress test cases in `tests.json`.
6. **Invalid Driver**: Driver name not in allowed driver list (`DEFAULT`, `LINKED_LIST`, `TREE`, `GRAPH`, `COMMAND_SEQUENCE`, `MATRIX`, `INTERACTIVE`, `SQL`, `SCRIPT`, `CUSTOM`).
