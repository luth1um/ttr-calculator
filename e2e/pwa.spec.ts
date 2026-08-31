import { test, expect } from "@playwright/test";

import { LANGUAGE_FILE_PATHS } from "../src/i18n";
import { skipBrowsersWithoutOfflineEmulation, skipBrowsersWithoutOfflineNavigation } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The PWA capabilities", () => {
  test("register a service worker that controls the app when the app is first loaded", async ({ page }) => {
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.gotoProductionBuild();
    await appPage.waitForServiceWorkerActivation();

    // then
    await expect.poll(() => appPage.isControlledByServiceWorker()).toBe(true);
  });

  test("precache the app shell, the icons, and all translations when the app is loaded", async ({ page }) => {
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.gotoProductionBuild();
    await appPage.waitForServiceWorkerActivation();

    // then
    await expect
      .poll(() => appPage.getPrecachedPaths())
      .toEqual(
        expect.arrayContaining([
          "index.html",
          "manifest.webmanifest",
          "icon.svg",
          "pwa-192x192.png",
          "pwa-512x512.png",
          "pwa-maskable-512x512.png",
          "apple-touch-icon-180x180.png",
          ...LANGUAGE_FILE_PATHS,
        ]),
      );
    const precachedPaths = await appPage.getPrecachedPaths();
    expect(precachedPaths.some((path) => path.endsWith(".js"))).toBe(true);
    expect(precachedPaths.some((path) => path.endsWith(".css"))).toBe(true);
  });

  test("provide a manifest that makes the app installable when the app is loaded", async ({ page }) => {
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.gotoProductionBuild();
    const manifest = await appPage.fetchManifest();

    // then
    expect(manifest.name).toBe("TTR Calculator");
    expect(manifest.short_name).toBe("TTR Calc");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/ttr-calculator/");
    expect(manifest.scope).toBe("/ttr-calculator/");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192" }),
        expect.objectContaining({ sizes: "512x512" }),
        expect.objectContaining({ purpose: "maskable" }),
      ]),
    );
  });

  test("render the app when reloading while offline", async ({ page }, testInfo) => {
    skipBrowsersWithoutOfflineEmulation(testInfo);
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);
    await appPage.gotoProductionBuild();
    await appPage.waitForServiceWorkerActivation();
    await expect.poll(() => appPage.getPrecachedPaths()).toContain("index.html");

    // when
    await appPage.setOffline(true);
    await page.reload();

    // then
    await expect(appPage.appRoot).toBeVisible();
    await expect(appPage.ownTtrLabel).toHaveText("Player TTR");
  });

  test("serve translations when offline although they are requested with a cache-busting parameter", async ({
    page,
  }, testInfo) => {
    skipBrowsersWithoutOfflineEmulation(testInfo);
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);
    await appPage.gotoProductionBuild();
    await appPage.waitForServiceWorkerActivation();
    await expect.poll(() => appPage.getPrecachedPaths()).toContain(LANGUAGE_FILE_PATHS[0]);
    await expect.poll(() => appPage.isControlledByServiceWorker()).toBe(true);

    // when
    await appPage.setOffline(true);
    const status = await appPage.fetchStatus(`${LANGUAGE_FILE_PATHS[0]}?v=cache-buster`);

    // then
    expect(status).toBe(200);
  });

  test("serve the app for an unknown deep link when offline", async ({ page }, testInfo) => {
    skipBrowsersWithoutOfflineNavigation(testInfo);
    test.slow(); // because of gotoProductionBuild()

    // given
    const appPage = new AppPage(page);
    await appPage.gotoProductionBuild();
    await appPage.waitForServiceWorkerActivation();
    await expect.poll(() => appPage.getPrecachedPaths()).toContain("index.html");

    // when
    await appPage.setOffline(true);
    await appPage.gotoProductionBuild("unknown/deep/link");

    // then
    await expect(appPage.appRoot).toBeVisible();
  });
});
