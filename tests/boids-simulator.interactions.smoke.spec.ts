import { expect, test } from "@playwright/test";

import { BASE_FRAME_DURATION } from "../src/app/boids-simulator/constants";
import {
  getFrameScale,
  getSeparationRadius,
} from "../src/app/boids-simulator/lib/flock";

test.describe("Boids Simulator interactions", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/boids-simulator", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Interactive Boids Simulator")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Boids Simulator", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Controls" })).toBeVisible();
    await expect(
      page.getByText(
        "Left click to attract boids. Right click to repel boids. Space to pause.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scatter" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reset", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download PNG" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Presets" })).toBeVisible();
  });

  test("changes flock behavior and pauses with the keyboard", async ({
    page,
  }) => {
    const population = page.getByRole("slider", { name: "Population" });
    await expect(population).toHaveValue("1000");
    await expect(
      page.getByRole("button", { name: "Balanced" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Reset", exact: true }),
    ).toBeVisible();
    for (const parameter of [
      "Movement accuracy",
      "Boid vision",
      "Alignment force",
      "Cohesion force",
      "Separation force",
      "Steering force",
      "Min speed",
      "Max speed",
    ]) {
      await expect(page.getByRole("slider", { name: parameter })).toBeVisible();
    }
    await expect(page.getByRole("slider", { name: "Drag" })).toHaveCount(0);
    await expect(
      page.getByRole("slider", { name: "Min speed" }),
    ).toHaveAttribute("max", "10");
    await expect(
      page.getByRole("slider", { name: "Max speed" }),
    ).toHaveAttribute("max", "10");

    await page.getByRole("button", { name: "Relaxed" }).click();
    await expect(page.getByRole("button", { name: "Relaxed" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByText("Slower movement with wide, smooth turns."),
    ).toBeVisible();

    await expect(population).toHaveValue("800");
    await population.fill("3000");
    await expect(population).toHaveValue("3000");

    await expect(
      page.getByRole("button", { name: "Toggle boid trails" }),
    ).toHaveAttribute("aria-pressed", "false");

    await expect(page.getByLabel("Simulation metrics")).toHaveCount(0);
    await page.getByRole("button", { name: "Toggle corner stats" }).click();
    await expect(page.getByLabel("Simulation metrics")).toBeVisible();

    const canvas = page.getByLabel("Interactive Boids Simulator");
    await canvas.click({ button: "left", position: { x: 320, y: 280 } });
    await canvas.click({ button: "right", position: { x: 420, y: 320 } });

    const collapse = page.getByRole("button", { name: "Collapse controls" });
    await collapse.click();
    await expect(
      page.getByRole("button", { name: "Expand controls" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Expand controls" }).click();

    await page.keyboard.press("Space");
    await expect(
      page.getByRole("button", { name: "Resume", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  test("maps vision and separation force to meaningful flocking ranges", async ({
    page,
  }) => {
    expect(getSeparationRadius(72, 0)).toBe(0);
    expect(getSeparationRadius(72, 1.5)).toBeCloseTo(32.4, 4);
    expect(getSeparationRadius(72, 3)).toBeCloseTo(64.8, 4);
    expect(getSeparationRadius(140, 3)).toBeGreaterThan(
      getSeparationRadius(24, 3),
    );

    await page.getByRole("slider", { name: "Population" }).fill("1000");
    await page.getByRole("slider", { name: "Movement accuracy" }).fill("160");
    await page.getByRole("button", { name: "Toggle corner stats" }).click();
    const neighborMetric = page
      .getByLabel("Simulation metrics")
      .getByText("Neighbors", { exact: true })
      .locator("..")
      .locator("strong");

    await page.getByRole("slider", { name: "Boid vision" }).fill("24");
    await page.waitForTimeout(750);
    const nearNeighbors = Number(await neighborMetric.textContent());

    await page.getByRole("slider", { name: "Boid vision" }).fill("140");
    await page.waitForTimeout(750);
    const farNeighbors = Number(await neighborMetric.textContent());

    expect(farNeighbors).toBeGreaterThan(nearNeighbors);
  });

  test("keeps simulation speed consistent at 60 Hz and 120 Hz", () => {
    expect(getFrameScale(BASE_FRAME_DURATION)).toBeCloseTo(1, 5);
    expect(getFrameScale(BASE_FRAME_DURATION / 2)).toBeCloseTo(0.5, 5);
  });

  test("previews a snapshot before downloading it", async ({ page }) => {
    let downloadCount = 0;
    page.on("download", () => {
      downloadCount += 1;
    });

    await page.getByRole("button", { name: "Download PNG" }).click();

    await expect(
      page.getByRole("heading", { name: "Boids snapshot" }),
    ).toBeVisible();
    expect(downloadCount).toBe(0);
    await expect(
      page.getByRole("img", { name: "Boids Simulator snapshot" }),
    ).toBeVisible();
    await expect(page.getByText("Share your flock")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Link" })).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^boids-simulator-\d+\.png$/);

    await page.getByRole("button", { name: "Close export preview" }).click();
    await expect(
      page.getByRole("heading", { name: "Boids snapshot" }),
    ).toHaveCount(0);
  });

  test("opens the compact control drawer on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });

    const drawer = page.getByRole("button", { name: "Boids Simulator" });
    const touchInstructions = page.getByText(
      "Tap to attract boids. Use two fingers to repel boids.",
    );
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("aria-expanded", "false");
    await expect(touchInstructions).toBeHidden();
    await drawer.click();
    await expect(drawer).toHaveAttribute("aria-expanded", "true");
    await expect(touchInstructions).toBeVisible();
    await expect(page.locator("main")).toHaveCSS("user-select", "none");
    const population = page.getByRole("slider", { name: "Population" });
    await expect(population).toHaveAttribute("max", "1500");
    await expect(population).toHaveValue("600");
    await population.fill("1500");
    await expect(population).toHaveValue("1500");
    const download = page.getByRole("button", { name: "Download PNG" });
    await download.scrollIntoViewIfNeeded();
    await expect(download).toBeVisible();
  });
});
