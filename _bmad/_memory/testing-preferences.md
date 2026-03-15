# Testing Preferences

## Test Structure (Vitest & Playwright)

- All tests use **given/when/then** structure with comments at the start of each block:
  - `// given` — test setup (omit block entirely if no setup needed)
  - `// when` — executes the function(s) under test
  - `// then` — checks/asserts results
- Each `it()` description format: **"should [expected outcome] when [circumstances]"**
  - Example: `it("should be disabled when some form values are invalid", ...)`

### Example structure:

```ts
describe("The calculate button", () => {
  it("should be disabled when some form values are invalid", () => {
    // given
    /* setup here */
    // when
    /* function call for test here */
    // then
    /* result check here */
  });
});
```

## Playwright Specifics

- Tests must cover **all user workflows**
- Tests must include **accessibility tests** (e.g. via axe-core)
- All Playwright tests use a **shared Page Object Model (POM)** for all tests
