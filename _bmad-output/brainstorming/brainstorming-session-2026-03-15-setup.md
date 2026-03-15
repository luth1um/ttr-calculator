---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: "TTR Calculator web app for table tennis rating after competition matches"
session_goals: "Plan the app — features, UX, architecture, and interaction design for a variable number of opponents"
selected_approach: "ai-recommended"
techniques_used: ["Mind Mapping", "SCAMPER Method", "Six Thinking Hats"]
ideas_generated:
  - "Dynamic Opponent List + Calculate Button"
  - "New TTR + Delta display"
  - "Per-Match Win Expectation inline"
  - "Expected Wins total"
  - "Remember Own TTR via localStorage"
  - "Single Page Layout"
  - "English + German auto-detected i18n"
  - "Smart Defaults + Button Guard (TTR=1000, Win default)"
  - "TTR Range 0-3000 validation"
  - "Opponent List Interactions (add/remove/label)"
  - "Win/Loss Toggle default Win"
  - "Dynamic Renumbering on Delete"
  - "Combined List + Inline Results always editable"
  - "Stale Result Indicator"
  - "Single Use Case Post-Competition"
  - "Keep Opponent Labels"
  - "Conventional Input-First Layout"
  - "Neutral/Factual Language"
  - "Compact No Wasted Space layout"
  - "Reset Button with Confirmation Dialog"
  - "Calculate Button below opponent list"
  - "Zero Framework TypeScript + HTML + CSS"
  - "Accessibility-first with axe-core"
  - "Mobile-first touch targets 44px minimum"
  - "type=number for TTR inputs"
context_file: ""
---

# Brainstorming Session Results

**Facilitator:** Luth1um
**Date:** 2026-03-15

## Session Overview

**Topic:** TTR Calculator — a web app to calculate the Table Tennis Rating (TTR) change after a competition

**Goals:** Plan the app holistically — features, UX interactions, input design for variable opponents, calculation display, and anything that would make this genuinely great to use

### Session Setup

- The TTR system is similar to chess Elo: rating change depends on the strength difference between players
- Rating changes only after a **competition** (not a single match), meaning a user plays **multiple matches against different opponents** in one session — the app must handle a variable number of opponents
- The core calculation engine is already available as the npm dependency `ttr-calculator-typescript` (already in package.json)
- The existing project uses: Vite, TypeScript, i18next (i18n), Vitest, Playwright, oxlint, Prettier

## Technique Selection

**Approach:** AI-Recommended Techniques

**Recommended Techniques:**

- **Mind Mapping:** Map the full problem space — users, inputs, outputs, persistence, layout, i18n, validation, accessibility
- **SCAMPER Method:** Stress-test each design dimension through 7 creative lenses
- **Six Thinking Hats:** Validate all decisions from facts, emotions, benefits, risks, creative, and process perspectives

## Idea Organization and Prioritization

### Theme 1: Core Interaction Model

**The fundamental input → calculate → result loop.**

- **Dynamic Opponent List + Calculate Button:** A vertically growing list where each row has an opponent TTR field (default 1000) and a Win/Loss toggle (default Win). Rows added via "+ Add Opponent" button at bottom, removed via trash icon per row. Last remaining row is not removable. One "Calculate" button triggers the result.
- **Combined List + Inline Results, Always Editable:** After Calculate, each opponent row gains a win expectation column inline. TTR inputs and toggles remain fully editable at all times. Hitting Calculate again simply updates everything in place.
- **Stale Result Indicator:** When any input changes after a calculation, summary and inline win expectation columns become visually dimmed/muted. The Calculate button re-activates. Last result remains visible as a reference while editing.
- **Calculate Button Placement:** Directly below the opponent list, above the summary block.
- **Reset Button with Confirmation Dialog:** Clears the opponent list back to one default row (own TTR preserved). Requires confirmation to avoid accidental resets.

### Theme 2: Inputs and Validation

**What the player enters and how it's constrained.**

- **Own TTR Input:** A number field at the top of the page. Defaults to the last-used value from localStorage on return visits. `type="number"` for mobile numeric keyboard.
- **Opponent TTR Inputs:** Each row has a `type="number"` TTR field defaulting to 1000.
- **Win/Loss Toggle:** Per opponent row, defaults to Win. Player flips only for losses.
- **TTR Range 0–3000:** Values below 0 or above 3000 are disallowed. 0 is valid.
- **Calculate Button Guard:** Disabled until all opponent rows have a valid TTR (0–3000) and a win/loss selection. No explicit error messages — disabled state communicates invalidity implicitly.
- **Opponent Row Labels:** Each row labeled "Opponent 1", "Opponent 2", etc. Renumber dynamically when a row is deleted — always sequential.

### Theme 3: Result Display

**What the player sees after calculating.**

- **New TTR + Delta:** Prominently displayed — e.g., "1547 (+12)". Primary takeaway, front and center.
- **Expected Wins Total:** Sum of win expectations across all matches — e.g., "Expected wins: 2.3". Surfacing the probabilistic baseline.
- **Per-Match Win Expectation (inline):** Each opponent row shows its calculated win probability after Calculate — e.g., "34%". Stays inline with the editable row.
- **Summary Block Position:** Static, below the opponent list. No sticky/fixed positioning. May scroll out of view on long lists — accepted tradeoff.
- **Tone:** Neutral/factual throughout. Labels: "New TTR", "Delta", "Win Expectation", "Expected Wins". No evaluative framing.

### Theme 4: Persistence and State

**What the app remembers between sessions.**

- **localStorage for Own TTR:** Saved after each calculation, pre-filled on next visit. No login, no backend — zero friction for returning users.
- **localStorage Staleness Accepted:** No warning mechanism when TTR goes stale between competitions. Player is responsible for verifying their own TTR.

### Theme 5: Layout and Page Structure

**How the page is organized.**

- **Single Page, Conventional Input-First:** Own TTR at top → opponent list → Calculate button → summary block. No navigation, no view transitions.
- **Compact, No Wasted Space:** Tight layout with minimal padding. Some scrolling on very small phones acceptable.
- **No Automatic Scrolling:** After Calculate, the page does not scroll or jump.

### Theme 6: Architecture and Technical Constraints

**How the app is built.**

- **Zero Framework — TypeScript + HTML + CSS:** No React, Angular, Vue. Plain TypeScript compiled by Vite. Tiny bundle, no dependency churn.
- **Runtime Dependency:** `ttr-calculator-typescript` only. All calculation logic (TTR delta, win expectation per match, expected wins) delegated to this library.
- **W/L Only:** No set scores, no partial results. Binary win/loss per match.

### Theme 7: Internationalisation and Accessibility

**Who can use it and in what language.**

- **English + German, Auto-Detected:** Browser language detection via `i18next-browser-languagedetector`. English as fallback. No manual language picker.
- **Accessibility-First:** `@axe-core/playwright` enforces accessibility in E2E tests. Semantic HTML throughout.
- **Mobile-First Touch Targets:** All interactive elements meet minimum 44×44px touch target size. App works across desktop and mobile browsers.
- **`type="number"` for TTR inputs:** Triggers numeric keyboard on mobile.

## Prioritization Results

**All decisions are implementation-ready.** No speculative features — everything decided is in scope.

**Core must-haves (MVP):**

1. Dynamic opponent list with labeled rows, add/remove, Win/Loss toggle
2. Own TTR input with localStorage persistence
3. Calculate button with disabled guard + stale indicator
4. Result: New TTR, delta, expected wins total, per-match win expectation inline
5. Reset button with confirmation
6. English + German auto-detected
7. Responsive, accessible, compact layout

**Explicitly out of scope:**

- Pre-competition planning mode
- Set score inputs
- Sticky/fixed summary bar
- Real-time calculation (explicit Calculate action only)
- Any backend, login, or tracking

## Session Summary and Insights

**Key achievements:**

- Complete feature set defined with zero ambiguity
- Every UX micro-interaction decided (defaults, validation, stale state, reset flow)
- Architecture constraint (no framework) shapes implementation clearly
- Accessibility and mobile-first baked into requirements from the start

**Breakthrough insight:** The combined input/result list (rows stay editable after Calculate, inline win expectation added as a column) elegantly solves the "view vs. edit" problem without any mode switching — a genuinely better pattern than a separate result screen.

**What makes this session valuable:**

- Every decision is justified and traceable
- No feature bloat — scope is tight and purposeful
- The stale indicator + always-editable list creates a fast "what if" workflow naturally

**Recommended next step:** Create a PRD or architecture document from this brainstorming output, then move to implementation.
