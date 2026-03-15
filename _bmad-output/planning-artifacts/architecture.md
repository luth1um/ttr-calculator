---
stepsCompleted:
  ["step-01-init", "step-02-context", "step-03-starter", "step-04-decisions", "step-05-patterns", "step-06-structure"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
workflowType: "architecture"
project_name: "ttr-calculator"
user_name: "Luth1um"
date: "2026-03-15"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

27 FRs across 7 capability areas: Own TTR Management, Opponent List Management, Calculation, Result Display, Stale State, Reset, Internationalisation, Accessibility. Architecturally, the most consequential are:

- _Stale State (FR18–19)_: Requires the app to track whether displayed results correspond to current inputs — a reactive state management concern without a reactive framework
- _Opponent List (FR4–10)_: Dynamic DOM management (add/remove/relabel rows) with consistent state binding — no framework means manual DOM synchronisation
- _Combined editable + inline results (FR15–17, FR19)_: Rows must simultaneously hold input state and display calculation output; two roles for one DOM element set
- _localStorage persistence on input change (FR3)_: Own TTR written to localStorage on every value change, read on load

**Non-Functional Requirements:**

- Performance: Synchronous, no-perceptible-delay UI interactions; zero-framework bundle
- Security: No network requests post-load; localStorage contains only a numeric TTR value
- Accessibility: axe-core zero violations; keyboard operability; 44×44px touch targets; visible labels
- Tone: Neutral/factual label language (NFR11)

**Scale & Complexity:**

- Primary domain: Web SPA (client-side only)
- Complexity level: Low — single page, single user, no auth, no backend, no routing
- Estimated architectural components: ~4–5 logical modules (state, DOM rendering, calculation bridge, i18n integration, localStorage adapter)

### Technical Constraints & Dependencies

- **Zero framework**: No React/Vue/Angular — all DOM management is manual TypeScript
- **Vite** as build tool (already configured)
- **`ttr-calculator-typescript`** owns all calculation logic — architecture must not reimplement any TTR math
- **`i18next` + `i18next-browser-languagedetector`** for EN/DE auto-detection
- **Vitest** for unit tests, **Playwright + axe-core** for E2E/accessibility tests
- Static file deployment — no server, no build-time env vars needed

### Cross-Cutting Concerns Identified

1. **State management**: No framework, so the app needs a clear pattern for how UI state (opponent list, own TTR, has-calculated flag, is-stale flag) is represented, mutated, and reflected in the DOM — this will shape every other module
2. **DOM/state synchronisation**: Adding/removing opponent rows and updating inline results must not produce stale references or orphaned event listeners
3. **i18n integration**: All user-visible strings must go through i18next; must be initialised before first render
4. **Testability**: Zero-framework code must be structured to allow unit testing of pure logic (state, calculation bridge) separately from DOM manipulation

## Starter Template Evaluation

### Primary Technology Domain

Web SPA — vanilla TypeScript compiled by Vite. No framework. Static file output.

### Starter Options Considered

No starter template selection required. The project scaffold is already fully initialised with all required tooling. The existing `package.json` defines the complete dependency set.

### Established Project Scaffold

**No initialization command required** — project already exists.

**Architectural Decisions Already Made:**

**Language & Runtime:**

- TypeScript 5.9.3, ESM modules (`"type": "module"`)

**Build Tooling:**

- Vite 8.0.0 — dev server + production bundler
- `tsc` for type checking prior to Vite build

**Runtime Dependencies:**

- `ttr-calculator-typescript` 2.0.1 — all TTR calculation logic
- `i18next` 25.8.18 + `i18next-browser-languagedetector` 8.2.1 — EN/DE i18n with auto-detection
- `i18next-http-backend` 3.0.2 — lazy-loading of translation files from external JSON at runtime

**Testing Framework:**

- Vitest 4.1.0 — unit tests
- Playwright 1.58.2 + `@axe-core/playwright` 4.11.1 — E2E and accessibility tests

**Code Quality:**

- oxlint 1.55.0 — linting
- Prettier 3.8.1 — formatting
- husky 9.1.7 + lint-staged 16.4.0 — pre-commit hooks

**Notable constraint:** `i18next-http-backend` loads translation files from external JSON at runtime — translation files must be served alongside the app (not bundled inline).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- State management pattern: single state object + render-on-mutation
- DOM rendering strategy: full re-render on state change
- Module structure: 6-module split
- i18n initialisation: await before first render

**Deferred Decisions:**

- Hosting/deployment: to be decided when app is complete

### Frontend Architecture

**State Management**

- Decision: Single typed `AppState` object held in `state.ts`; all mutations via defined functions; `render()` called after every mutation
- Rationale: Testable (pure logic separated from DOM), predictable, no stale DOM references
- Affected modules: `state.ts`, `render.ts`, `main.ts`

**DOM Rendering Strategy**

- Decision: Full re-render of opponent list on every state change
- Rationale: Eliminates stale reference bugs and orphaned event listeners; list size is small (≤~10 rows) so cost is negligible; focus preservation handled by restoring active element after re-render if needed
- Affected modules: `render.ts`

### Module Structure

| Module          | Responsibility                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `state.ts`      | `AppState` type; initial state factory; all state mutation functions                                         |
| `render.ts`     | Reads state, rebuilds DOM — no logic, no mutation                                                            |
| `calculator.ts` | Adapter over `ttr-calculator-typescript` — maps `AppState` to library calls, returns results                 |
| `storage.ts`    | localStorage read/write for own TTR                                                                          |
| `i18n.ts`       | i18next initialisation; typed `t()` wrapper                                                                  |
| `main.ts`       | Entry point — awaits i18n init, sets initial state from storage, wires event listeners, calls initial render |

Event listeners live in `main.ts` (or a dedicated `events.ts` if scope grows). Each listener calls a state mutation function then `render()`.

### i18n Initialisation

- Decision: `main.ts` awaits `i18n.init()` before calling first `render()`
- Rationale: Prevents flash of untranslated content; translation files are small and co-deployed so async delay is imperceptible
- Constraint: Translation files (EN, DE JSON) must be served at a known path alongside the built app

### Infrastructure & Deployment

- Decision: Deferred — hosting to be decided after app is complete
- Constraint: App is pure static files (HTML, JS, CSS, translation JSON); any static host is compatible

## Implementation Patterns & Consistency Rules

### Naming Patterns

**File Naming:**

- All source files: `camelCase.ts` (e.g. `state.ts`, `calculator.ts`, `main.ts`)
- Test files: co-located with source, suffix `.test.ts` (e.g. `state.test.ts`)
- Translation files: `public/locales/{locale}/translation.json`

**TypeScript Naming:**

- Types/Interfaces: `PascalCase` (e.g. `AppState`, `OpponentEntry`, `CalculationResult`)
- Functions: `camelCase` (e.g. `addOpponent`, `calculateResults`, `renderApp`)
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants (e.g. `DEFAULT_OPPONENT_TTR`)
- Private/internal: prefix with `_` only when needed to avoid name collision

**i18n Keys:**

- Dot-notation, kebab-case segments (e.g. `opponent.label`, `button.calculate`, `result.new-ttr`)

### Structure Patterns

**Module Responsibilities (strict boundaries):**

- `state.ts` — ONLY defines types and mutation functions; no DOM access, no library calls
- `render.ts` — ONLY reads state and updates DOM; no state mutation, no calculation logic
- `calculator.ts` — ONLY calls `ttr-calculator-typescript`; no DOM access, no state mutation
- `storage.ts` — ONLY reads/writes localStorage; no business logic
- `i18n.ts` — ONLY initialises i18next and exports `t()`; no DOM access
- `main.ts` — wires everything together; event listeners call state mutations then `render()`

**Test placement:**

- Unit tests: `src/*.test.ts` co-located with source modules
- E2E tests: `e2e/` directory at project root
- Priority unit test targets: `state.ts` and `calculator.ts` (pure logic); `render.ts` covered by E2E

### Format Patterns

**AppState shape:**

```ts
type AppState = {
  ownTtr: number | null;
  opponents: OpponentEntry[];
  results: CalculationResults | null;
  isStale: boolean;
};

type OpponentEntry = {
  id: string; // stable identifier for re-render
  ttr: number | null;
  won: boolean;
};
```

- `id` on `OpponentEntry` preserves row identity across re-renders
- `results` is `null` before first calculation; `isStale` is `false` when `results` is `null`
- `ttr: null` means the field is empty/invalid; `ttr: 0` is valid (0 is a legal TTR)

**localStorage:**

- Key: `"ownTtr"`
- Value: stringified number or absent; parse with fallback to `null` on load

### Process Patterns

**State mutation → render cycle:**
Every user interaction follows this exact sequence:

1. Event listener fires
2. Call state mutation function
3. Call `render(state)` — always a full re-render of the affected region
4. Never update the DOM directly from event listeners

**Stale indicator rule:**

- `isStale = true` on any input change when `results !== null`
- `isStale = false` immediately after a successful calculation
- `isStale = false` after reset (results are cleared)

**Calculate button guard:**

- Disabled when: any `opponent.ttr === null` OR opponent list is empty
- Enabled when: all opponents have `ttr` in range 0–3000

**Reset flow:**

- Use a custom `<dialog>` element for the confirmation — required for accessibility compliance
- On confirm: reset opponents to one default entry, set `results: null`, `isStale: false`, preserve `ownTtr`

### Enforcement Guidelines

**All AI agents MUST:**

- Never access the DOM from `state.ts`, `calculator.ts`, or `storage.ts`
- Never mutate state from `render.ts`
- Never call `ttr-calculator-typescript` directly outside `calculator.ts`
- Always call `render()` after every state mutation
- Always use `t()` from `i18n.ts` for all user-visible strings — no hardcoded English strings in source

## Project Structure & Boundaries

### Complete Project Directory Structure

```
ttr-calculator/
├── index.html                        # Single HTML page — app entry point
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json                     # To be created
├── oxlintrc.json
├── prettier.config.ts
├── .gitignore
├── .prettierignore
├── .husky/
│   └── pre-commit
├── public/
│   └── locales/
│       ├── en/
│       │   └── translation.json      # English strings
│       └── de/
│           └── translation.json      # German strings
├── src/
│   ├── main.ts                       # Entry point: init i18n → load state → wire events → render
│   ├── state.ts                      # AppState type, initial state factory, mutation functions
│   ├── state.test.ts                 # Unit tests for state mutations
│   ├── render.ts                     # DOM rendering — reads state, rebuilds UI
│   ├── calculator.ts                 # Adapter over ttr-calculator-typescript
│   ├── calculator.test.ts            # Unit tests for calculation adapter
│   ├── storage.ts                    # localStorage read/write for ownTtr
│   ├── storage.test.ts               # Unit tests for storage
│   └── i18n.ts                       # i18next init + typed t() wrapper
├── e2e/
│   ├── app.spec.ts                   # E2E tests covering full user flows
│   └── accessibility.spec.ts         # axe-core accessibility tests
└── playwright.config.ts              # Playwright configuration
```

### Architectural Boundaries

**Module Boundaries (strict — no cross-boundary imports except as listed):**

```
main.ts
  ├── imports state.ts       (mutation functions, initial state)
  ├── imports render.ts      (render function)
  ├── imports calculator.ts  (calculateResults)
  ├── imports storage.ts     (loadOwnTtr)
  └── imports i18n.ts        (init)

render.ts
  ├── imports state.ts       (AppState type only — read-only)
  └── imports i18n.ts        (t() for all strings)

calculator.ts
  └── imports ttr-calculator-typescript (external lib only)

storage.ts
  └── no internal imports

i18n.ts
  └── imports i18next + i18next-browser-languagedetector + i18next-http-backend
```

**Forbidden imports:**

- `render.ts` → may NOT import `calculator.ts` or `storage.ts`
- `state.ts` → may NOT import any other internal module
- `calculator.ts` → may NOT import `state.ts`, `render.ts`, or `storage.ts`

### Requirements to Structure Mapping

| FR Category                       | Primary file(s)                                        |
| --------------------------------- | ------------------------------------------------------ |
| Own TTR Management (FR1–3)        | `state.ts`, `storage.ts`, `render.ts`                  |
| Opponent List Management (FR4–10) | `state.ts`, `render.ts`                                |
| Calculation (FR11–14)             | `calculator.ts`, `state.ts`, `main.ts`                 |
| Result Display (FR15–17)          | `render.ts`                                            |
| Stale State (FR18–19)             | `state.ts`, `render.ts`                                |
| Reset (FR20–22)                   | `state.ts`, `render.ts`, `main.ts`                     |
| Internationalisation (FR23–25)    | `i18n.ts`, `public/locales/`                           |
| Accessibility (FR26–27)           | `index.html`, `render.ts`, `e2e/accessibility.spec.ts` |

### Data Flow

```
User interaction
  → event listener in main.ts
  → state mutation in state.ts (+ storage.ts for ownTtr)
  → render(state) in render.ts
  → DOM updated

Calculate button
  → event listener in main.ts
  → calculator.ts.calculateResults(state)
  → state mutation: set results, isStale = false
  → render(state)
```

### Asset Organisation

- `public/locales/` — translation JSON files served at runtime by i18next-http-backend
- `index.html` — single HTML shell; all dynamic content injected by `render.ts`
- Vite outputs to `dist/` on build; `dist/` is not committed
