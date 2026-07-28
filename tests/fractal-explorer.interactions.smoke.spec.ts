import { expect, test } from "@playwright/test";

test.describe("fractal explorer interactions", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/fractal-explorer", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Fractal Audio" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Explore Silently" }).click();
    await expect(
      page.getByRole("heading", { name: "Fractal Audio" }),
    ).toBeHidden();
  });

  test("updates rendering controls and switches fractal modes", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Settings", exact: true }).click();

    const depthSlider = page.locator('input[type="range"]').first();
    await depthSlider.fill("400");
    await expect(depthSlider).toHaveValue("400");

    const palette = page.locator("select");
    await palette.selectOption("Ocean");
    await expect(palette).toHaveValue("Ocean");

    await page.getByRole("button", { name: "Julia Set", exact: true }).click();
    await expect(
      page.getByText("Seed Constants", { exact: true }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Back to Mandelbrot Overview" })
      .click();
    await expect(
      page.getByText("Julia Seed Finder", { exact: true }),
    ).toBeVisible();
  });

  test("toggles coordinate visibility and locks a Julia seed", async ({
    page,
  }) => {
    await expect(page.getByText("Coordinates", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Settings", exact: true }).click();

    const coordinatesPreference = page
      .getByText("Show Coordinates", { exact: true })
      .locator("..");
    await coordinatesPreference.getByRole("button").click();
    await expect(page.getByText("Coordinates", { exact: true })).toBeHidden();

    await page.getByTitle("Close Settings").click();
    await expect(page.getByTitle("Close Settings")).toBeHidden();
    await page
      .locator("canvas")
      .first()
      .click({ position: { x: 80, y: 80 } });
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Seed Locked" }),
    ).toBeVisible();
  });

  test("previews a fractal before downloading it", async ({ page }) => {
    let downloadCount = 0;
    page.on("download", () => {
      downloadCount += 1;
    });

    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByRole("button", { name: "Export Fractal PNG" }).click();

    await expect(
      page.getByRole("heading", { name: "Fractal snapshot" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Fractal Explorer export preview" }),
    ).toBeVisible();
    expect(downloadCount).toBe(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^fractal-mandelbrot-Neon-\d+\.png$/,
    );
  });
});
