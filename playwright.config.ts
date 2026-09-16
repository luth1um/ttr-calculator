import { defineConfig, devices } from "@playwright/test";

export const PROJECT_NAME_DESKTOP_SAFARI = "webkit";
export const PROJECT_NAME_FIREFOX = "firefox";
export const PROJECT_NAME_DESKTOP_CHROME = "chromium";
export const PROJECT_NAME_MOBILE_CHROME = "Mobile Chrome";
export const PROJECT_NAME_MOBILE_SAFARI = "Mobile Safari";

/**
 * Serves the production build (needed for PWA service worker). Do not use the dev server (port 5173) as some E2E
 * tests for the PWA functionality only work with the production build.
 */
export const PREVIEW_BASE_URL = "http://localhost:4173/ttr-calculator/";
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries (not even on CI) */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "blob" : "list",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: PROJECT_NAME_DESKTOP_CHROME,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: PROJECT_NAME_FIREFOX,
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: PROJECT_NAME_DESKTOP_SAFARI,
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: PROJECT_NAME_MOBILE_CHROME,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: PROJECT_NAME_MOBILE_SAFARI,
      use: { ...devices["iPhone 15"] },
    },
  ],

  /*  Single template for all assertions */
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? "npm run preview" : "npm run build && npm run preview",
    url: PREVIEW_BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
