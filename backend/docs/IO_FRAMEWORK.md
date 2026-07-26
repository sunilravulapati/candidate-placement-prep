# Metadata-Driven I/O Framework (`IOFramework`) Architecture & Design Specification

## Overview

The **Metadata-Driven I/O Framework (`IOFramework`)** is a generic, extensible platform component built for **PrepGenie**. It automatically generates language-specific I/O drivers (`main()` functions, standard input parsers, and return value printers) strictly from problem `starterMetadata` without relying on problem-specific logic, problem names, or hardcoded slug checks.

---

## 3-Layer Architecture

```
                       ┌────────────────────────────────┐
                       │        Problem Metadata        │
                       │       (starterMetadata)        │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │         IOFramework            │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │         DriverBuilder          │
                       │  Queries Parser/Printer Regs   │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │     DriverModel (IR AST)       │
                       │     Language-Independent       │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
       ┌───────────────────────────────┴───────────────────────────────┐
       │                                                               │
       ▼                                                               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ CppRenderer  │  │ JavaRenderer │  │PythonRenderer│  │  JSRenderer  │  │  TSRenderer  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼                 ▼
 ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
 │ C++ Code  │     │ Java Code │     │Python Code│     │  JS Code  │     │  TS Code  │
 └───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
```

---

## Component Details

### 1. Canonical Type System (`backend/src/features/dsa/io/canonical/types.ts`)
Decouples language-specific type definitions from standard problem metadata.

- **Primitives**: `int`, `long`, `float`, `double`, `bool`, `char`, `string`, `void`
- **Collections**: `array<T>`, `matrix<T>`
- **Data Structures**: `ListNode`, `TreeNode`, `GraphNode`, `Interval`, `Pair`, `NestedInteger`

### 2. Parser Registry (`backend/src/features/dsa/io/registry/parser/parserRegistry.ts`)
Maps canonical types and pattern matchers to parser descriptors. Adding a new canonical type requires registering a single parser descriptor in the registry without modifying core framework files.

### 3. Printer Registry (`backend/src/features/dsa/io/registry/printer/printerRegistry.ts`)
Maps canonical return types to printer descriptors for formatted output serialization.

### 4. Driver Builder (`backend/src/features/dsa/io/driver/builder/driverBuilder.ts`)
Translates raw `starterMetadata` into a language-independent `DriverModel` IR. It inspects parameters, queries parser and printer registries, and computes structure dependencies (`requiredStructures`).

### 5. Driver Model (`backend/src/features/dsa/io/driver/model/driverModel.ts`)
An abstract, language-agnostic Intermediate Representation (IR) containing:
- Target class name (`className`)
- Target function name (`functionName`)
- Method modifiers (`isStatic`)
- Parameter parse specifications (`ParamParseSpec[]`)
- Return value print specifications (`ReturnPrintSpec`)
- Structural type dependencies (`requiredStructures`)

### 6. Language Renderers (`backend/src/features/dsa/io/driver/renderers/`)
Extensible language renderers that transform the abstract `DriverModel` IR into target source code strings:
- `CppRenderer`
- `JavaRenderer`
- `PythonRenderer`
- `JavaScriptRenderer`
- `TypeScriptRenderer`

Adding support for a new language (e.g. Go or Rust) requires only adding a new `LanguageRenderer` consuming `DriverModel`.

---

## Future Execution Engine Wrapper Generation Roadmap

The `DriverModel` IR is designed for seamless future integration into the online judge execution pipeline:

```
                  Problem Metadata (starterMetadata)
                                  │
                                  ▼
                            DriverBuilder
                                  │
                                  ▼
                         DriverModel (IR AST)
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
        Input Helper UI                  Execution Engine Wrapper
   (Displays read-only driver)         (Merges User Code + Driver)
                                                    │
                                                    ▼
                                            Compiler / Runner
```

---

## Framework Verification & Validation

The framework includes automated validation utilities (`IOFrameworkValidator`) verified against all canonical types and 181 production problems with **0 errors and 0 warnings**.
