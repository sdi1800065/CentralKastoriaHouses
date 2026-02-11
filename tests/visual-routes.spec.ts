import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/diamerismata",
  "/topo8esia",
  "/epikoinwnia",
  "/centralkastoriahouseone",
  "/centralkastoriahousetwo",
];

for (const route of routes) {
  const routeSlug =
    route === "/" ? "home" : route.replaceAll("/", "").toLowerCase();

  test(`visual snapshot: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("iframe.legacy-frame-active")).toBeVisible();
    await page.waitForTimeout(2300);

    await expect(page).toHaveScreenshot(`route-${routeSlug}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });
}
