---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-02b-vision",
    "step-02c-executive-summary",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain",
    "step-06-innovation",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nonfunctional",
    "step-11-polish",
    "step-12-complete",
  ]
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-15-setup.md"
workflowType: "prd"
briefCount: 0
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
classification:
  projectType: "web_app"
  domain: "general"
  complexity: "low"
  projectContext: "greenfield"
---

# Product Requirements Document - ttr-calculator

**Author:** Luth1um
**Date:** 2026-03-15

## Executive Summary

The TTR Calculator is a single-page web application for table tennis club players to calculate their TTR (Tischtennis-Rating) change after a competition. Players enter their own TTR, add opponents with TTR values and match results, then trigger a calculation that shows the new rating, the delta, and per-match win expectations inline. The app treats the session as a live scratchpad — inputs remain editable after calculation, results update in-place, and a stale indicator signals when displayed results no longer match the current inputs. No backend, no login, no persistence beyond the player's own TTR in localStorage.

**Target user:** Regular table tennis club players who want an instant, accurate, frictionless answer to "what happened to my rating after today's competition?"

**Problem solved:** No purpose-built TTR calculator exists that handles multi-match competition sessions with this degree of interactivity and simplicity. Existing tools (if any) are static forms requiring re-entry to explore alternatives.

### What Makes This Special

The core design insight is treating the calculation as a persistent scratchpad rather than a one-shot form. After hitting Calculate, the opponent list stays fully editable — flip a win to a loss, change an opponent's TTR, hit Calculate again — without re-entering anything. This makes the "what if I had won that last match?" workflow natural and instant.

The stale indicator eliminates the UX ambiguity of "are these results still valid?" without a complex state machine — a visual dimming cue is sufficient.

Zero-framework architecture (plain TypeScript + Vite) means the bundle is minimal, there are no dependency churn concerns, and the app loads instantly on mobile. Accessibility and mobile-first design are enforced at the test level via axe-core, not just aspirationally.

### Project Classification

- **Project Type:** Web Application (SPA)
- **Domain:** Sports utility / general
- **Complexity:** Low
- **Project Context:** Greenfield
- **Tech stack:** TypeScript, Vite, i18next, Vitest, Playwright, oxlint, Prettier; runtime dependencies `ttr-calculator-typescript`, `i18next`, `i18next-browser-languagedetector`

## Success Criteria

### User Success

- A player arriving immediately after a competition can enter their TTR, add all opponents with results, and read their new rating and delta without confusion or friction
- Returning users find their own TTR pre-filled from the previous session — no re-entry required
- Players can flip a win/loss or change an opponent TTR and recalculate without losing any other entered data
- The stale indicator unambiguously communicates "these results reflect your current inputs" vs. "inputs have changed since last calculation"
- The Reset flow (with confirmation dialog) prevents accidental data loss while remaining accessible

### Technical Success

- All Vitest unit tests pass with no failures
- All Playwright E2E tests pass with no failures
- axe-core reports zero accessibility violations across all tested flows — this is the minimum bar; improvements above zero violations are welcome
- Application runs correctly on modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest stable versions)
- No legacy browser support required
- Bundle remains minimal: zero-framework (plain TypeScript + Vite); runtime dependencies are `ttr-calculator-typescript`, `i18next`, and `i18next-browser-languagedetector`

### Measurable Outcomes

- Every item from the defined MVP must-have list is implemented and functional
- TTR calculation results match the output of the `ttr-calculator-typescript` library exactly (correctness delegated entirely to the library)
- Own TTR is persisted to and restored from localStorage reliably across sessions

## Product Scope

**MVP Approach:** Experience MVP — ship a tool that is immediately and completely useful for the single use case it targets. The product either solves the post-competition TTR calculation problem fully or it doesn't ship. Solo developer build; zero-framework architecture eliminates framework-related complexity.

### MVP — Minimum Viable Product

All of the following are required; nothing is deferred:

1. Own TTR input at page top, restored from localStorage on return visits, saved to localStorage whenever the player changes the value
2. Dynamic opponent list — labeled "Opponent 1", "Opponent 2", etc.; rows added via "+ Add Opponent"; last row not removable; rows renumber sequentially on delete
3. Per-row Win/Loss toggle (default: Win); per-row TTR input (default: 1000, type=number, range 0–3000)
4. Calculate button — disabled until all opponent rows have valid TTR (0–3000); placed directly below opponent list
5. Inline results after calculation — each opponent row gains a win expectation percentage column; summary block shows New TTR, delta (e.g. "+12"), and Expected Wins total
6. Combined list + inline results: inputs and toggles remain fully editable after calculation; Calculate re-runs in place
7. Stale indicator — results visually dimmed/muted when any input changes after last calculation; Calculate re-activates
8. Reset button with confirmation dialog — clears opponent list to one default row, preserves own TTR
9. English + German UI via i18next with browser-language auto-detection; English fallback
10. Responsive, mobile-first layout; all interactive elements meet 44×44px minimum touch target
11. Semantic HTML throughout; axe-core zero violations enforced in E2E tests

### Growth Features (Post-MVP)

None currently defined.

### Vision (Out of Scope)

- Pre-competition planning mode
- Set score inputs (only binary Win/Loss is in scope)
- Sticky/fixed summary bar
- Real-time calculation (explicit Calculate action required)
- Any backend, login, user accounts, or analytics

### Risk Mitigation

**Technical:** Stale indicator state logic must respond correctly to all input events (TTR field edits, Win/Loss toggle changes, add/remove row). Mitigated by Vitest unit tests covering all state transition paths.

**Market:** None meaningful for a personal utility tool. Correctness of TTR output is delegated entirely to `ttr-calculator-typescript`.

**Resource:** Solo developer project. Zero-framework architecture minimises accidental complexity. Scope is fixed and tight.

## User Journeys

### Journey 1: First Visit — New Player

**Persona:** Markus, 34, club player in a regional league. He's just heard about this calculator from a teammate and opens it on his phone right after a competition evening.

**Opening Scene:** Markus lands on the page for the first time. He has his rating card in his pocket — TTR 1423. He played four matches tonight. He has no idea what happened to his rating.

**Rising Action:** There's one input at the top: "Your TTR". He types 1423 — the value is saved to localStorage the moment he enters it. Below is a single opponent row, pre-labeled "Opponent 1", with a default value of 1000 and a Win toggle. He changes the TTR to 1380, leaves it as Win. He adds three more opponents — one at 1510 (Win), one at 1290 (Loss), one at 1600 (Win). The Calculate button activates as soon as all rows are valid.

**Climax:** He taps Calculate. Each row immediately shows a win expectation percentage. The summary block below shows: "New TTR: 1441 (+18)". He sees his expected wins were 2.7 — he outperformed slightly.

**Resolution:** Markus bookmarks the page. His TTR of 1423 was already saved to localStorage the moment he typed it — no further action needed. Next time he visits, it will be pre-filled. He got the answer he wanted in under a minute, on his phone, standing in the sports hall.

**Requirements revealed:** Own TTR input, localStorage persistence on own TTR input change (not on calculation), opponent list with add/defaults, Win/Loss toggle, Calculate button guard, inline win expectation, summary block with delta.

---

### Journey 2: Return Visit — Post-Competition

**Persona:** Same Markus, three weeks later after another competition.

**Opening Scene:** He opens the app. His TTR field already shows 1441 — the value he entered manually on his last visit, restored from localStorage. He doesn't touch it.

**Rising Action:** He clears the one default opponent row (it stays, just empty) and starts entering tonight's opponents. Three opponents this time. Two wins, one loss. All rows are valid after entry.

**Climax:** He hits Calculate. Results appear inline. Summary: "New TTR: 1447 (+6)". A small but positive evening.

**Resolution:** The experience takes 30 seconds. No login, no "what was my TTR again?" friction. His TTR had been saved from his last visit when he entered it manually. He closes the tab.

**Requirements revealed:** localStorage pre-fill on load, opponent rows always start fresh (no persistence of opponents across sessions), smooth repeat-use workflow.

---

### Journey 3: What-If Exploration

**Persona:** Lena, 28, competitive club player. She just calculated her results but lost a close match she thinks she should have won.

**Opening Scene:** Lena just hit Calculate and sees "New TTR: 1558 (-4)". She lost against an opponent rated 1490 — a match she nearly won. She wonders: what if she had won that one?

**Rising Action:** She finds the row for that opponent, flips the toggle from "Loss" to "Win". The result block immediately dims — the stale indicator makes it obvious the displayed results no longer correspond to her current inputs. The Calculate button re-activates.

**Climax:** She hits Calculate again. "New TTR: 1565 (+3)". That one match would have swung seven rating points.

**Resolution:** She flips it back, re-calculates, accepts the real outcome. The scratchpad workflow made the "what if?" exploration instant and non-destructive — she never had to re-enter anything.

**Requirements revealed:** Inputs always editable post-calculation, stale indicator on any input change, Calculate re-runs in-place updating all inline results and summary, no data loss when toggling.

---

### Journey 4: Reset — Fresh Competition Session

**Persona:** Markus again, at a tournament where he plays multiple rounds across the day.

**Opening Scene:** He calculated after the morning rounds. Now it's afternoon and he wants a clean slate for the next block of matches — but keep his updated TTR.

**Rising Action:** He taps "Reset". A confirmation dialog appears: "Clear all opponents and start fresh? Your own TTR will be kept." He confirms.

**Climax:** The opponent list resets to a single default row (Opponent 1, TTR 1000, Win). The own TTR field still shows his current value. No summary, no stale indicator — clean state.

**Resolution:** He re-enters the afternoon opponents in 20 seconds. The confirmation dialog prevented him from accidentally wiping data when he fat-fingered the button.

**Requirements revealed:** Reset button, confirmation dialog, post-reset state (one default row, own TTR preserved, results cleared, stale indicator cleared).

---

### Journey Requirements Summary

| Capability                                                    | Journeys |
| ------------------------------------------------------------- | -------- |
| Own TTR input with localStorage persistence (on input change) | 1, 2, 4  |
| Dynamic opponent list with add/remove/labels                  | 1, 2     |
| Win/Loss toggle per row                                       | 1, 3     |
| TTR validation and Calculate button guard                     | 1        |
| Inline win expectation per row                                | 1, 2, 3  |
| Summary block (New TTR, delta, Expected Wins)                 | 1, 2, 3  |
| Stale indicator on input change                               | 3        |
| Calculate re-runs in place                                    | 3        |
| Reset with confirmation dialog                                | 4        |

## Innovation & Novel Patterns

### Detected Innovation Areas

**Live scratchpad interaction model:** The defining innovation is that the opponent list never transitions into a "results view" — inputs and results coexist in the same rows simultaneously. After Calculate, each row gains an inline win expectation column while the TTR field and Win/Loss toggle remain fully editable. Re-calculating is a single button tap, not a form reset. This eliminates the view/edit mode split that characterises every comparable calculator tool.

**Stale indicator without state machine complexity:** Rather than disabling inputs or forcing a re-entry flow when data changes post-calculation, a simple visual dimming cue communicates staleness. The last result stays visible as a reference point while the user edits. This is a lean, accessible solution to a non-trivial UX problem.

### Market Context & Competitive Landscape

No purpose-built TTR calculator for multi-match competition sessions currently exists. Existing general Elo calculators are single-match forms with no support for the competition (multi-opponent) workflow that defines how TTR actually changes in practice.

### Validation Approach

- User can complete a full post-competition calculation in one session without re-entering data after a what-if toggle change
- Stale indicator correctly reflects state after every input interaction — no false positives, no false negatives
- Inline results update fully and correctly on each Calculate invocation

### Risk Mitigation

- The inline scratchpad model increases DOM complexity slightly — mitigated by zero-framework architecture (no virtual DOM overhead, direct DOM manipulation)
- Stale indicator logic must be robust to all input types (TTR field edits, Win/Loss toggle, add/remove row) — covered by unit tests on state transitions

## Web Application Specific Requirements

### Project-Type Overview

Single-page application (SPA) — one HTML page, no server-side rendering, no routing. All logic runs client-side. Vite bundles TypeScript to plain JS; no framework runtime. Deployed as static files.

### Browser Matrix

| Browser                        | Version       | Support          |
| ------------------------------ | ------------- | ---------------- |
| Chrome                         | Latest stable | ✅ Required      |
| Firefox                        | Latest stable | ✅ Required      |
| Safari                         | Latest stable | ✅ Required      |
| Edge                           | Latest stable | ✅ Required      |
| Legacy browsers (IE, pre-2020) | Any           | ❌ Not supported |

### Responsive Design

- Mobile-first layout — designed for small screens first, scales up to desktop
- All interactive elements (buttons, toggles, inputs) meet 44×44px minimum touch target
- `type="number"` on all TTR inputs to trigger numeric keyboard on mobile
- Compact layout with minimal padding; some scrolling on very small phones is acceptable
- No sticky/fixed positioning for the summary block — may scroll off-screen on long lists (accepted tradeoff)
- No automatic scrolling or page jumps after Calculate

### SEO Strategy

Not applicable. This is a client-side utility tool with no content to index. SEO is explicitly out of scope.

### Technical Architecture Considerations

- Zero framework: plain TypeScript compiled by Vite, no React/Angular/Vue
- Single runtime dependency for calculation: `ttr-calculator-typescript`
- i18n runtime: `i18next` + `i18next-browser-languagedetector`
- State management: vanilla — no state library; DOM reflects application state directly
- Persistence: `localStorage` for own TTR value only; no IndexedDB, no cookies, no session storage

### Implementation Considerations

- i18next browser language detection auto-selects English or German; English fallback for all other locales
- No build-time locale selection — language resolved at runtime
- No backend, no API calls, no network requests after initial page load
- All test tooling (Vitest unit tests, Playwright E2E, axe-core) is dev-only — zero test code in production bundle

## Functional Requirements

### Own TTR Management

- FR1: The player can enter their own TTR value
- FR2: The player's own TTR is pre-filled from the previous session on page load
- FR3: The player's own TTR is persisted locally whenever the value is changed

### Opponent List Management

- FR4: The player can add opponent entries to the list
- FR5: The player can remove any opponent entry except the last remaining one
- FR6: Opponent entries are labelled sequentially ("Opponent 1", "Opponent 2", etc.) and renumber automatically when an entry is removed
- FR7: Each opponent entry has a TTR input defaulting to 1000
- FR8: Each opponent entry has a Win/Loss selection defaulting to Win
- FR9: The player can change the TTR value of any opponent entry at any time
- FR10: The player can change the Win/Loss selection of any opponent entry at any time

### Calculation

- FR11: The player can trigger a TTR calculation across all entered opponents
- FR12: The calculation is only triggerable when all opponent entries have a valid TTR value
- FR13: TTR inputs enforce a valid range of 0–3000
- FR14: The system computes the player's new TTR, the TTR delta, the win expectation per opponent, and the expected wins total using the `ttr-calculator-typescript` library

### Result Display

- FR15: After calculation, each opponent entry displays the computed win expectation for that match
- FR16: After calculation, a summary block displays the player's new TTR and TTR delta
- FR17: After calculation, the summary block displays the total expected wins across all opponents

### Stale State

- FR18: The system indicates when displayed results no longer correspond to current inputs
- FR19: The player can recalculate at any time after modifying inputs, updating all results in place

### Reset

- FR20: The player can reset the session to a clean state
- FR21: Reset requires explicit confirmation before executing
- FR22: After reset, the opponent list contains exactly one default entry; the player's own TTR is preserved; all results are cleared

### Internationalisation

- FR23: The UI is presented in the player's browser language when English or German is detected
- FR24: The UI falls back to English for all other browser languages
- FR25: No manual language selection is available or required

### Accessibility

- FR26: All interactive elements are operable via keyboard and assistive technology
- FR27: The UI meets axe-core zero-violation accessibility standard across all flows

## Non-Functional Requirements

### Performance

- NFR1: The application loads and is interactive within a time that feels instant on a modern mobile device on a typical mobile connection — no explicit numeric budget, but the zero-framework, minimal-dependency architecture is the enforcing constraint
- NFR2: TTR calculations, DOM updates, and stale indicator state changes complete synchronously with no perceptible delay after user interaction
- NFR3: Adding or removing opponent rows does not produce visible layout reflow or flicker

### Security

- NFR4: No personal data is transmitted to any server — all state is local to the browser
- NFR5: The only data persisted to localStorage is the player's own TTR value (a number); no other data is stored or read from localStorage
- NFR6: The application makes no network requests after initial page load

### Accessibility

- NFR7: The application passes axe-core with zero violations across all user flows — this is the binding, testable minimum
- NFR8: All interactive elements meet a minimum touch target size of 44×44px
- NFR9: The application is fully operable via keyboard navigation alone
- NFR10: All form inputs have associated visible labels
- NFR11: All result labels and UI copy use neutral, factual language — "New TTR", "Delta", "Win Expectation", "Expected Wins" — with no evaluative framing
