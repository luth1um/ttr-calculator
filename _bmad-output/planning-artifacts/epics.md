---
stepsCompleted:
  - "step-01-validate-prerequisites"
  - "step-02-design-epics"
  - "step-03-create-stories"
  - "step-04-final-validation"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
---

# ttr-calculator - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ttr-calculator, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The player can enter their own TTR value
FR2: The player's own TTR is pre-filled from the previous session on page load
FR3: The player's own TTR is persisted locally whenever the value is changed
FR4: The player can add opponent entries to the list
FR5: The player can remove any opponent entry except the last remaining one
FR6: Opponent entries are labelled sequentially ("Opponent 1", "Opponent 2", etc.) and renumber automatically when an entry is removed
FR7: Each opponent entry has a TTR input defaulting to 1000
FR8: Each opponent entry has a Win/Loss selection defaulting to Win
FR9: The player can change the TTR value of any opponent entry at any time
FR10: The player can change the Win/Loss selection of any opponent entry at any time
FR11: The player can trigger a TTR calculation across all entered opponents
FR12: The calculation is only triggerable when all opponent entries have a valid TTR value
FR13: TTR inputs enforce a valid range of 0–3000
FR14: The system computes the player's new TTR, the TTR delta, the win expectation per opponent, and the expected wins total using the `ttr-calculator-typescript` library
FR15: After calculation, each opponent entry displays the computed win expectation for that match
FR16: After calculation, a summary block displays the player's new TTR and TTR delta
FR17: After calculation, the summary block displays the total expected wins across all opponents
FR18: The system indicates when displayed results no longer correspond to current inputs
FR19: The player can recalculate at any time after modifying inputs, updating all results in place
FR20: The player can reset the session to a clean state
FR21: Reset requires explicit confirmation before executing
FR22: After reset, the opponent list contains exactly one default entry; the player's own TTR is preserved; all results are cleared
FR23: The UI is presented in the player's browser language when English or German is detected
FR24: The UI falls back to English for all other browser languages
FR25: No manual language selection is available or required
FR26: All interactive elements are operable via keyboard and assistive technology
FR27: The UI meets axe-core zero-violation accessibility standard across all flows

### NonFunctional Requirements

NFR1: The application loads and is interactive within a time that feels instant on a modern mobile device on a typical mobile connection — zero-framework, minimal-dependency architecture is the enforcing constraint
NFR2: TTR calculations, DOM updates, and stale indicator state changes complete synchronously with no perceptible delay after user interaction
NFR3: Adding or removing opponent rows does not produce visible layout reflow or flicker
NFR4: No personal data is transmitted to any server — all state is local to the browser
NFR5: The only data persisted to localStorage is the player's own TTR value (a number); no other data is stored or read from localStorage
NFR6: The application makes no network requests after initial page load
NFR7: The application passes axe-core with zero violations across all user flows — this is the binding, testable minimum
NFR8: All interactive elements meet a minimum touch target size of 44×44px
NFR9: The application is fully operable via keyboard navigation alone
NFR10: All form inputs have associated visible labels
NFR11: All result labels and UI copy use neutral, factual language — "New TTR", "Delta", "Win Expectation", "Expected Wins" — with no evaluative framing

### Additional Requirements

- **No starter template required** — project scaffold is already fully initialised with all required tooling (TypeScript 5.9.3, Vite 8.0.0, Vitest, Playwright, oxlint, Prettier, husky)
- **Module structure**: 6 modules must be created — `state.ts`, `render.ts`, `calculator.ts`, `storage.ts`, `i18n.ts`, `main.ts` — each with strict, non-overlapping responsibilities
- **`tsconfig.json` must be created** as part of project setup (noted as missing in Architecture)
- **Translation files** must be created at `public/locales/en/translation.json` and `public/locales/de/translation.json`, served by `i18next-http-backend` at runtime
- **`AppState` shape is architecturally mandated**: `{ ownTtr: number | null, opponents: OpponentEntry[], results: CalculationResults | null, isStale: boolean }`; `OpponentEntry` has a stable `id` field
- **localStorage key**: `"ownTtr"` (stringified number); no other keys may be written
- **State mutation → render cycle**: Every user interaction must follow: event → state mutation → `render(state)` — never update DOM directly from event listeners
- **Reset confirmation**: Must use a native `<dialog>` element (not a custom modal) for accessibility compliance
- **i18n initialisation**: `main.ts` must `await i18n.init()` before first `render()` to prevent flash of untranslated content
- **Strict module boundary enforcement**: `state.ts` and `calculator.ts` must never access the DOM; `render.ts` must never mutate state; `calculator.ts` must never be called outside `calculator.ts`
- **E2E and unit test coverage**: Vitest unit tests for `state.ts`, `calculator.ts`, `storage.ts`; Playwright E2E for full user flows; axe-core accessibility tests in a dedicated spec file

### UX Design Requirements

_No UX Design document exists for this project._

### FR Coverage Map

FR1: Epic 2 — Own TTR input
FR2: Epic 1 — localStorage pre-fill on load
FR3: Epic 1 — localStorage persist on change
FR4: Epic 2 — Add opponent entries
FR5: Epic 2 — Remove opponents (not last)
FR6: Epic 2 — Sequential labels + renumber
FR7: Epic 2 — Default TTR 1000 per row
FR8: Epic 2 — Default Win/Loss = Win per row
FR9: Epic 2 — Edit opponent TTR at any time
FR10: Epic 2 — Edit Win/Loss at any time
FR11: Epic 3 — Trigger calculation
FR12: Epic 3 — Calculate guard (all TTR valid)
FR13: Epic 3 — TTR range 0–3000
FR14: Epic 3 — Calculation via `ttr-calculator-typescript`
FR15: Epic 3 — Inline win expectation per row
FR16: Epic 3 — Summary: new TTR + delta
FR17: Epic 3 — Summary: expected wins total
FR18: Epic 3 — Stale indicator
FR19: Epic 3 — Recalculate in-place
FR20: Epic 4 — Reset trigger
FR21: Epic 4 — Confirmation dialog (`<dialog>`)
FR22: Epic 4 — Post-reset state (one row, own TTR kept, results cleared)
FR23: Epic 1 — EN/DE auto-detection
FR24: Epic 1 — English fallback
FR25: Epic 1 — No manual lang selection
FR26: Epics 2, 3, 4 — Keyboard + AT operability (per epic's UI surface)
FR27: Epics 2, 3, 4 — axe-core zero violations (per epic's UI surface)

## Epic List

### Epic 1: Project Foundation & Core Infrastructure

Developer can run the app — i18n initialized, state shape in place, localStorage wired, module boundaries established.
**FRs covered:** FR2, FR3, FR23, FR24, FR25
**Tests included:** Unit tests for `storage.ts` (load, save, null fallback); unit tests for `state.ts` initial state factory; i18n init smoke test

### Epic 2: Own TTR Input & Opponent List Management

A player can enter their own TTR and manage a dynamic opponent list with TTR values and Win/Loss toggles — full data-entry experience, keyboard-accessible.
**FRs covered:** FR1, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR26 (data-entry elements), FR27 (data-entry flows)
**Tests included:** Unit tests for all `state.ts` opponent mutation functions; E2E tests for data-entry user flows; axe-core scan of data-entry page state

### Epic 3: Calculation, Results & Stale Indicator

A player can trigger a calculation and see their new rating, delta, per-opponent win expectations, and a stale indicator when inputs change — fully keyboard-accessible.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR26 (Calculate button + result interactions), FR27 (post-calculation state)
**Tests included:** Unit tests for `calculator.ts` adapter; unit tests for stale state transitions in `state.ts`; E2E tests for full calculation + what-if workflows; axe-core scan of post-calculation state

### Epic 4: Reset Flow

A player can safely reset the session via a confirmation dialog — opponents cleared, own TTR preserved, fully keyboard and screen-reader accessible.
**FRs covered:** FR20, FR21, FR22, FR26 (dialog keyboard + AT), FR27 (dialog axe-core)
**Tests included:** Unit tests for reset state mutation; E2E tests for reset flow (confirm + cancel paths); axe-core scan of dialog

---

## Epic 1: Project Foundation & Core Infrastructure

Developer can run the app — i18n initialized, state shape in place, localStorage wired, module boundaries established.

### Story 1.1: TypeScript Configuration and Project Verification

As a developer,
I want a `tsconfig.json` matching the project's module and target settings,
So that the TypeScript compiler and Vite build work correctly without errors.

**Acceptance Criteria:**

**Given** the project scaffold exists with `vite.config.ts` and `package.json`
**When** `tsconfig.json` is created with `"module": "ESNext"`, `"target": "ES2022"`, `"strict": true`, `"moduleResolution": "bundler"`, and `"include": ["src", "e2e"]`
**Then** `npm run build` completes with zero TypeScript errors
**And** `npm run dev` starts the Vite dev server without errors

### Story 1.2: AppState Type Definitions and Initial State Factory

As a developer,
I want `src/state.ts` defining the `AppState` and `OpponentEntry` types and an `initialState()` factory,
So that all modules share a single, typed source of truth for application state.

**Acceptance Criteria:**

**Given** `src/state.ts` is created
**When** the module is imported
**Then** it exports `AppState` with fields: `ownTtr: number | null`, `opponents: OpponentEntry[]`, `results: CalculationResults | null`, `isStale: boolean`
**And** `OpponentEntry` has fields: `id: string`, `ttr: number | null`, `won: boolean`
**And** `initialState()` returns `{ ownTtr: null, opponents: [{ id: <uuid>, ttr: 1000, won: true }], results: null, isStale: false }`
**And** `state.ts` contains zero DOM access and zero imports of other internal modules
**And** unit tests in `src/state.test.ts` verify the shape and values returned by `initialState()`

### Story 1.3: localStorage Adapter

As a player,
I want my own TTR to be automatically saved and restored across page visits,
So that I never have to re-enter my base rating.

**Acceptance Criteria:**

**Given** `src/storage.ts` is created
**When** `saveOwnTtr(1423)` is called
**Then** `localStorage.getItem("ownTtr")` returns `"1423"`

**Given** `"ownTtr"` is set to `"1423"` in localStorage
**When** `loadOwnTtr()` is called
**Then** it returns `1423` as a number

**Given** `"ownTtr"` is absent from localStorage
**When** `loadOwnTtr()` is called
**Then** it returns `null`

**Given** `"ownTtr"` contains a non-numeric value
**When** `loadOwnTtr()` is called
**Then** it returns `null` (graceful fallback)

**And** `storage.ts` reads/writes only the `"ownTtr"` key — no other localStorage access
**And** unit tests in `src/storage.test.ts` cover all four scenarios above

### Story 1.4: i18n Module and Translation Files

As a player,
I want the UI to appear in my browser language (English or German),
So that I can use the app comfortably in my preferred language.

**Acceptance Criteria:**

**Given** `src/i18n.ts` is created using `i18next` + `i18next-browser-languagedetector` + `i18next-http-backend`
**When** `i18n.init()` is awaited
**Then** the module is ready to translate keys via an exported typed `t()` wrapper

**Given** the browser language is `de`
**When** `t("button.calculate")` is called
**Then** it returns the German string from `public/locales/de/translation.json`

**Given** the browser language is anything other than `de`
**When** any translation key is requested
**Then** the English string from `public/locales/en/translation.json` is returned as fallback

**And** translation files exist at `public/locales/en/translation.json` and `public/locales/de/translation.json` with at minimum the keys needed for the app shell (page title, placeholder labels)
**And** `i18n.ts` does not access the DOM and does not import any internal module other than the i18next libraries
**And** no hardcoded English strings exist in any `.ts` source file — all user-visible text goes through `t()`

### Story 1.5: App Entry Point and HTML Shell

As a developer,
I want `main.ts` to wire the initialization sequence and `index.html` to provide the semantic HTML shell,
So that the app boots correctly — i18n ready, own TTR loaded from storage, and a minimal rendered UI confirms the pipeline works end-to-end.

**Acceptance Criteria:**

**Given** the browser loads `index.html`
**When** `main.ts` executes
**Then** `i18n.init()` is awaited before any render call
**And** `loadOwnTtr()` is called and its result is set on `ownTtr` in the initial state
**And** a `render(state)` call produces at minimum a visible page heading translated via `t()`

**Given** `"ownTtr": "1423"` exists in localStorage
**When** the page loads
**Then** the own TTR input is pre-filled with `1423`

**And** `index.html` contains semantic landmarks: `<header>`, `<main>`, `<footer>` (or equivalent)
**And** all form inputs in the shell have associated `<label>` elements
**And** `npm run build` produces a `dist/` folder with no errors

---

## Epic 2: Own TTR Input & Opponent List Management

A player can enter their own TTR and manage a dynamic opponent list with TTR values and Win/Loss toggles — full data-entry experience, keyboard-accessible.

### Story 2.1: Own TTR Input with localStorage Persistence

As a player,
I want an own TTR input field at the top of the page that saves my value as I type,
So that my rating is always ready without re-entry on the next visit.

**Acceptance Criteria:**

**Given** the page is loaded
**When** the own TTR input is rendered by `render.ts`
**Then** it is a `type="number"` input with a visible associated `<label>` (translated via `t()`)
**And** if `state.ownTtr` is not null, the input is pre-filled with that value

**Given** the own TTR input is rendered
**When** the player types a value
**Then** the `setOwnTtr(value)` state mutation is called
**And** `saveOwnTtr(value)` is called to persist to localStorage
**And** `render(state)` is called after the mutation

**And** the input meets a minimum touch target size of 44×44px
**And** unit tests in `src/state.test.ts` verify `setOwnTtr()` correctly updates `state.ownTtr`

### Story 2.2: Opponent List State Mutations

As a developer,
I want `state.ts` to expose all opponent list mutation functions,
So that events in `main.ts` can modify the opponent list predictably and testably.

**Acceptance Criteria:**

**Given** `state.ts` already has the `AppState` type and `initialState()` factory (Story 1.2)
**When** the following functions are added: `addOpponent(state)`, `removeOpponent(state, id)`, `setOpponentTtr(state, id, ttr)`, `setOpponentWon(state, id, won)`
**Then** `addOpponent` appends a new `OpponentEntry` with a unique `id`, `ttr: 1000`, `won: true`
**And** `removeOpponent` removes the entry with the given `id` — only callable when `opponents.length > 1`
**And** `setOpponentTtr` updates the `ttr` field of the matching entry (accepts `null` for empty/invalid)
**And** `setOpponentWon` toggles the `won` field of the matching entry
**And** all mutations return a new state object (immutable update pattern)
**And** unit tests in `src/state.test.ts` cover: add (verifies unique id and defaults), remove (verifies renaming is not needed in state — labels are derived at render time), setOpponentTtr (valid value, null value), setOpponentWon (true→false, false→true)

### Story 2.3: Opponent List Rendering

As a player,
I want to see a list of opponent rows — each with a sequential label, TTR input, and Win/Loss toggle — that updates immediately when I add or remove opponents,
So that I can clearly see and edit my competition data.

**Acceptance Criteria:**

**Given** `render.ts` reads `state.opponents`
**When** `render(state)` is called
**Then** each opponent row is rendered with a visible label "Opponent N" (1-indexed, sequential, via `t()`)
**And** each row contains a `type="number"` TTR input (value from `state.opponents[i].ttr`, min=0, max=3000) with a visible `<label>`
**And** each row contains a Win/Loss toggle reflecting `state.opponents[i].won`
**And** a Delete button is rendered per row — it is disabled (or absent) when `opponents.length === 1`
**And** an "+ Add Opponent" button is rendered below the list
**And** all interactive elements (inputs, toggles, buttons) meet the 44×44px minimum touch target

**Given** an opponent is removed
**When** `render(state)` is called after the mutation
**Then** remaining rows are re-labeled sequentially from "Opponent 1"
**And** no orphaned event listeners remain (full re-render strategy)

**And** E2E test verifies: initial single row is rendered; adding a row produces two rows labeled "Opponent 1" / "Opponent 2"; removing row 1 relabels the remaining row to "Opponent 1"

### Story 2.4: Add and Remove Opponent Event Wiring

As a player,
I want the "+ Add Opponent" button and the per-row Delete button to update the list immediately,
So that I can freely build up or trim down my opponent list without friction.

**Acceptance Criteria:**

**Given** the opponent list is rendered
**When** the player clicks "+ Add Opponent"
**Then** `addOpponent(state)` is called
**And** `render(state)` is called, showing a new row at the bottom with defaults (TTR 1000, Win)
**And** the new row is labeled "Opponent N" where N is the new count

**Given** the opponent list has more than one row
**When** the player clicks the Delete button on a row
**Then** `removeOpponent(state, id)` is called for that row's id
**And** `render(state)` is called, with remaining rows re-labeled sequentially

**Given** the opponent list has exactly one row
**When** the Delete button is activated
**Then** no mutation occurs and the list remains unchanged (button is disabled)

**And** E2E tests cover: add three opponents then delete the middle one — verify labels renumber correctly

### Story 2.5: Opponent TTR and Win/Loss Input Wiring

As a player,
I want my TTR edits and Win/Loss toggles to be reflected in the state immediately,
So that the data I enter is always current and ready for calculation.

**Acceptance Criteria:**

**Given** a rendered opponent row
**When** the player changes the TTR input value to a number between 0 and 3000
**Then** `setOpponentTtr(state, id, value)` is called with the parsed number
**And** `render(state)` reflects the updated value

**Given** a rendered opponent row
**When** the player clears or enters an invalid value in the TTR input
**Then** `setOpponentTtr(state, id, null)` is called
**And** the input visually indicates an invalid/empty state

**Given** a rendered opponent row
**When** the player activates the Win/Loss toggle
**Then** `setOpponentWon(state, id, !current)` is called
**And** `render(state)` reflects the toggled value

**And** all TTR inputs enforce `min="0"` and `max="3000"` HTML attributes
**And** all interactive elements are operable via keyboard (tab focus, enter/space for toggle)
**And** E2E test covers: enter TTR 1380, toggle to Loss, verify state-driven re-render shows correct values

### Story 2.6: Data Entry Accessibility Verification

As a player with accessibility needs,
I want the entire data-entry interface to be operable without a mouse and free of accessibility violations,
So that the app is usable by everyone.

**Acceptance Criteria:**

**Given** the app is loaded with one opponent row (initial state)
**When** an axe-core accessibility scan is run via Playwright
**Then** zero violations are reported

**Given** the player adds two more opponent rows and modifies TTR values and toggles
**When** an axe-core scan is run on the resulting state
**Then** zero violations are reported

**Given** the data-entry interface is rendered
**When** the player uses Tab/Shift+Tab to navigate
**Then** all interactive elements (own TTR input, opponent TTR inputs, Win/Loss toggles, Delete buttons, Add Opponent button) receive focus in a logical order
**And** all focusable elements have a visible focus indicator

**And** all form inputs have programmatically associated labels (not just placeholder text)
**And** axe-core accessibility tests live in `e2e/accessibility.spec.ts`

---

## Epic 3: Calculation, Results & Stale Indicator

A player can trigger a calculation and see their new rating, delta, per-opponent win expectations, and a stale indicator when inputs change — fully keyboard-accessible.

### Story 3.1: Calculation Adapter

As a developer,
I want `src/calculator.ts` to wrap `ttr-calculator-typescript` and map `AppState` to its API,
So that all TTR math is delegated entirely to the library with a clean, testable interface.

**Acceptance Criteria:**

**Given** `src/calculator.ts` is created
**When** `calculateResults(state)` is called with a valid `AppState` (own TTR set, all opponents with valid TTR)
**Then** it calls `ttr-calculator-typescript` with the correct inputs derived from `state.ownTtr` and `state.opponents`
**And** it returns a `CalculationResults` object containing: `newTtr: number`, `delta: number`, `expectedWinsTotal: number`, `perOpponent: Array<{ id: string, winExpectation: number }>`

**And** `calculator.ts` does not import `state.ts`, `render.ts`, or `storage.ts`
**And** `calculator.ts` does not access the DOM
**And** unit tests in `src/calculator.test.ts` verify: correct mapping of a known state to library inputs; returned result shape matches `CalculationResults`; delta is computed correctly (newTtr − ownTtr)

### Story 3.2: Calculate Button Guard and State Mutations for Results

As a player,
I want the Calculate button to be disabled when any opponent TTR is missing or invalid,
So that I can only trigger a calculation when all inputs are complete.

**Acceptance Criteria:**

**Given** `state.ts` is extended with `setResults(state, results)` and `markStale(state)` mutations
**When** `setResults(state, results)` is called
**Then** the returned state has `results` set to the given value and `isStale: false`

**When** `markStale(state)` is called and `state.results !== null`
**Then** the returned state has `isStale: true`

**When** `markStale(state)` is called and `state.results === null`
**Then** `isStale` remains `false`

**Given** `render.ts` renders the Calculate button
**When** `render(state)` is called
**Then** the Calculate button is disabled when any `opponent.ttr === null` or `opponents` is empty
**And** the Calculate button is enabled when all opponents have `ttr` in range 0–3000

**And** the Calculate button meets the 44×44px minimum touch target
**And** unit tests in `src/state.test.ts` cover `setResults` and `markStale` for all branches above

### Story 3.3: Calculation Event Wiring and Inline Results Rendering

As a player,
I want clicking Calculate to immediately show my new TTR, delta, and per-opponent win expectations inline,
So that I get the answer I came for in a single tap.

**Acceptance Criteria:**

**Given** the Calculate button is enabled (all opponent TTRs valid)
**When** the player clicks Calculate
**Then** `calculateResults(state)` is called via `calculator.ts`
**And** `setResults(state, results)` is called with the returned results
**And** `render(state)` is called, updating the UI in-place

**Given** `state.results` is not null
**When** `render(state)` is called
**Then** each opponent row gains a win expectation column displaying the percentage for that opponent (e.g. "67%")
**And** a summary block below the list displays: new TTR value, delta formatted with sign (e.g. "+12" or "−4"), and expected wins total
**And** all result labels use neutral language via `t()`: "New TTR", "Delta", "Win Expectation", "Expected Wins"
**And** inputs and toggles remain fully editable in the same rows (no view/edit mode switch)

**And** E2E test covers the full Journey 1 flow: enter own TTR 1423, add four opponents with mixed results, click Calculate, verify new TTR and delta are displayed

### Story 3.4: Stale Indicator on Input Change

As a player,
I want the results to visually dim when I change any input after a calculation,
So that I always know whether the displayed results match my current inputs.

**Acceptance Criteria:**

**Given** `state.results !== null` (a calculation has been performed)
**When** the player changes the own TTR value
**Then** `markStale(state)` is called
**And** `render(state)` applies a visual stale style (e.g. dimmed/muted CSS class) to the results and summary block

**Given** `state.results !== null`
**When** the player changes any opponent TTR value
**Then** `markStale(state)` is called and the stale style is applied

**Given** `state.results !== null`
**When** the player toggles any Win/Loss value
**Then** `markStale(state)` is called and the stale style is applied

**Given** `state.results !== null`
**When** the player adds or removes an opponent row
**Then** `markStale(state)` is called and the stale style is applied

**Given** `state.isStale === true`
**When** the player clicks Calculate
**Then** `setResults` sets `isStale: false` and the stale style is removed

**Given** `state.results === null`
**When** any input changes
**Then** no stale style is applied (nothing to mark stale)

**And** unit tests in `src/state.test.ts` cover all stale transition paths above
**And** E2E test covers Journey 3 (what-if): calculate, flip a Win to Loss, verify stale indicator appears, recalculate, verify stale indicator clears

### Story 3.5: In-Place Recalculation

As a player,
I want clicking Calculate after changing inputs to update all results in-place without re-entering any data,
So that what-if exploration is instant and non-destructive.

**Acceptance Criteria:**

**Given** results are displayed and `state.isStale === true`
**When** the player clicks Calculate
**Then** `calculateResults(state)` is called with the current (modified) state
**And** `setResults(state, newResults)` is called, replacing all previous results
**And** `render(state)` updates every opponent row's win expectation and the summary block in-place
**And** no input values are cleared or reset

**Given** the player has added an opponent since the last calculation
**When** Calculate is clicked
**Then** the new opponent row also displays a win expectation after recalculation
**And** the summary block reflects the updated totals

**And** E2E test verifies: calculate with three opponents, change one opponent's TTR, recalculate, verify all three win expectations and summary values update, verify all input values are unchanged

### Story 3.6: Calculation and Results Accessibility Verification

As a player with accessibility needs,
I want the Calculate button, inline results, and stale indicator to be accessible and screen-reader friendly,
So that the full calculation workflow is usable without a mouse.

**Acceptance Criteria:**

**Given** the app is in a pre-calculation state with all opponent TTRs valid
**When** an axe-core scan is run
**Then** zero violations are reported (Calculate button enabled state)

**Given** the player has triggered a calculation and results are displayed
**When** an axe-core scan is run on the post-calculation state
**Then** zero violations are reported

**Given** the player has modified an input and `state.isStale === true`
**When** an axe-core scan is run on the stale state
**Then** zero violations are reported
**And** the stale indicator communicates staleness not only through color/opacity but also via an accessible means (e.g. `aria-live` region or visually hidden text) so screen readers are notified

**Given** the Calculate button is focused
**When** the player presses Enter or Space
**Then** the calculation executes identically to a click

**And** the win expectation columns and summary block values are readable by screen readers (not hidden from the accessibility tree)
**And** axe-core tests for these states are added to `e2e/accessibility.spec.ts`

---

## Epic 4: Reset Flow

A player can safely reset the session via a confirmation dialog — opponents cleared, own TTR preserved, fully keyboard and screen-reader accessible.

### Story 4.1: Reset State Mutation

As a developer,
I want `state.ts` to expose a `resetSession(state)` mutation,
So that the reset flow has a single, testable state transition.

**Acceptance Criteria:**

**Given** `state.ts` is extended with `resetSession(state)`
**When** `resetSession(state)` is called
**Then** the returned state has `opponents` reset to exactly one default entry (`ttr: 1000`, `won: true`, new unique `id`)
**And** `results` is set to `null`
**And** `isStale` is set to `false`
**And** `ownTtr` is unchanged (preserved from the incoming state)

**And** unit tests in `src/state.test.ts` cover: reset from a state with multiple opponents and results — verifies opponents length is 1, results is null, isStale is false, ownTtr is unchanged

### Story 4.2: Reset Button and Confirmation Dialog

As a player,
I want a Reset button that opens a confirmation dialog before clearing my session,
So that I can start fresh without risking accidental data loss.

**Acceptance Criteria:**

**Given** `render.ts` renders a Reset button
**When** `render(state)` is called
**Then** a Reset button is visible and meets the 44×44px minimum touch target

**Given** the player clicks the Reset button
**When** the event fires in `main.ts`
**Then** a native `<dialog>` element is opened (not a custom modal) with a confirmation message translated via `t()` (e.g. "Clear all opponents and start fresh? Your own TTR will be kept.")
**And** the dialog contains two actions: Confirm (proceeds with reset) and Cancel (closes dialog, no change)

**Given** the confirmation dialog is open and the player clicks Confirm
**When** the confirm action fires
**Then** `resetSession(state)` is called
**And** `render(state)` is called, showing the cleared opponent list (one default row), own TTR preserved, no results, no stale indicator
**And** the dialog closes

**Given** the confirmation dialog is open and the player clicks Cancel
**When** the cancel action fires
**Then** no state mutation occurs
**And** the dialog closes
**And** all previously entered data is intact

**And** E2E test covers both paths: confirm reset (verify one row, own TTR preserved, results cleared) and cancel reset (verify data unchanged)

### Story 4.3: Reset Accessibility Verification

As a player with accessibility needs,
I want the Reset button and confirmation dialog to be fully keyboard-operable and free of accessibility violations,
So that the reset flow is accessible to all users.

**Acceptance Criteria:**

**Given** the app is in a post-calculation state (results visible)
**When** an axe-core scan is run
**Then** zero violations are reported (Reset button present)

**Given** the confirmation dialog is open
**When** an axe-core scan is run
**Then** zero violations are reported

**Given** the Reset button is focused
**When** the player presses Enter or Space
**Then** the confirmation dialog opens

**Given** the confirmation dialog is open
**When** the player presses Tab
**Then** focus cycles between the Confirm and Cancel buttons only (focus trap within dialog)

**Given** the confirmation dialog is open
**When** the player presses Escape
**Then** the dialog closes and focus returns to the Reset button
**And** no state mutation occurs

**And** the dialog uses the native `<dialog>` element so browser-native focus management and `aria-modal` semantics apply automatically
**And** axe-core tests for the dialog-open state are added to `e2e/accessibility.spec.ts`
