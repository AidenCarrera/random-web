import { expect, test, type Page } from "@playwright/test";

import {
  DEFAULT_SIZE,
  MIN_PLAYBACK_MS,
  RACE_DURATION_MS,
  SIZE_OPTIONS,
} from "../src/app/algo-race/config";

// Everything below is derived from config.ts, so adding, removing, resizing or
// relabelling a size option -- or retiming the race -- needs no edits here.

const RACE_SECONDS = RACE_DURATION_MS / 1000;
const LARGEST = SIZE_OPTIONS.reduce((max, option) =>
  option.size > max.size ? option : max,
);
const DEFAULT_OPTION =
  SIZE_OPTIONS.find((option) => option.size === DEFAULT_SIZE) ??
  SIZE_OPTIONS[0];
// The default is already selected on load, so racing it needs no extra click.
const RACED_OPTIONS = [
  ...new Map(
    [DEFAULT_OPTION, LARGEST].map((option) => [option.size, option]),
  ).values(),
];

const parseMs = (text: string) => {
  const match = text.match(/([\d.]+)(ms|µs|ns)/);
  if (!match) throw new Error(`unparseable duration: ${text}`);
  const scale = match[2] === "ms" ? 1 : match[2] === "µs" ? 0.001 : 0.000001;
  return Number(match[1]) * scale;
};

const selectSize = async (page: Page, label: string, size: number) => {
  // Retry through hydration: a pre-hydration click is silently dropped.
  await expect(async () => {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(
      page.getByText(`N=${size.toLocaleString("en-US")}`),
    ).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
};

const startRace = async (page: Page) => {
  const start = page.getByRole("button", { name: "START" });
  const preparing = page.getByRole("button", { name: /TIMING|FRAMES|PAUSE/ });
  await expect(async () => {
    await start.click();
    await expect(preparing).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible({
    timeout: 30_000,
  });
  return Date.now();
};

const readResults = async (page: Page, expected: number) => {
  const cards = page.locator("section div.grid-cols-2 > div");
  await expect(cards).toHaveCount(expected);
  const rows: { name: string; exec: number; screen: number }[] = [];
  for (let index = 0; index < expected; index++) {
    const lines = (await cards.nth(index).innerText()).split("\n");
    rows.push({
      name: lines[1],
      exec: parseMs(lines[2]),
      screen: Number(lines[3].replace("s on screen", "")),
    });
  }
  return rows;
};

/** Bar heights per painted device column, read back from the canvas pixels. */
const canvasProfiles = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("canvas")].map((canvas) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];
      const { width, height } = canvas;
      const { data } = ctx.getImageData(0, 0, width, height);
      const heights: number[] = [];
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          if (data[(y * width + x) * 4 + 3] > 0) {
            heights.push(height - y);
            break;
          }
        }
      }
      return heights;
    }),
  );

test.describe("Algo Race interactions", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (error) =>
      console.log(`[pageerror] ${error.message}`),
    );
    await page.goto("/algo-race", { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "ALGO RACE" }),
    ).toBeVisible();
  });

  test("offers every configured size and renders each one", async ({
    page,
  }) => {
    for (const option of SIZE_OPTIONS) {
      await expect(
        page.getByRole("button", { name: option.label, exact: true }),
      ).toBeVisible();
    }

    await expect(
      page.getByText(`N=${DEFAULT_SIZE.toLocaleString("en-US")}`),
    ).toBeVisible();

    for (const option of SIZE_OPTIONS) {
      await selectSize(page, option.label, option.size);
      const profiles = await canvasProfiles(page);
      expect(profiles.length).toBeGreaterThan(0);
      for (const profile of profiles) {
        // Unsorted data must actually be painted, and it must not be sorted.
        expect(profile.length).toBeGreaterThan(0);
        expect(Math.max(...profile)).toBeGreaterThan(0);
      }
    }
  });

  for (const option of RACED_OPTIONS) {
    test(`replays ${option.label} (${option.size}) in proportion to measured time`, async ({
      page,
    }) => {
      test.setTimeout(RACE_DURATION_MS * 4 + 60_000);

      if (option.size !== DEFAULT_SIZE) {
        await selectSize(page, option.label, option.size);
      }

      const startedAt = await startRace(page);
      await expect(page.getByText("Post-Race Results")).toBeVisible({
        timeout: RACE_DURATION_MS * 2,
      });

      const seconds = (Date.now() - startedAt) / 1000;
      expect(seconds).toBeGreaterThan(RACE_SECONDS * 0.85);
      expect(seconds).toBeLessThan(RACE_SECONDS * 1.25);

      const panels = await page.locator("canvas").count();
      const rows = await readResults(page, panels);

      // Ranked by measured execution time, ascending, and each replay window
      // is that algorithm's share of the race budget.
      const slowest = rows[rows.length - 1];
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].exec).toBeGreaterThanOrEqual(rows[i - 1].exec);
        expect(rows[i].screen).toBeGreaterThanOrEqual(rows[i - 1].screen);
      }
      expect(slowest.screen).toBeCloseTo(RACE_SECONDS, 0);
      for (const row of rows) {
        const expected = Math.max(
          MIN_PLAYBACK_MS / 1000,
          RACE_SECONDS * (row.exec / slowest.exec),
        );
        expect(Math.abs(row.screen - expected)).toBeLessThan(
          Math.max(0.25, RACE_SECONDS * 0.01),
        );
      }

      // Every panel ends on a monotonically rising profile.
      const profiles = await canvasProfiles(page);
      expect(profiles).toHaveLength(panels);
      for (const profile of profiles) {
        expect(profile.length).toBeGreaterThan(4);
        const drops = profile.filter(
          (height, index) => index > 0 && height < profile[index - 1] - 2,
        );
        expect(drops, `${option.label} should finish sorted`).toHaveLength(0);
      }
    });
  }

  test("pauses, resumes and resets", async ({ page }) => {
    test.setTimeout(RACE_DURATION_MS * 4 + 60_000);
    await startRace(page);

    const pause = page.getByRole("button", { name: "PAUSE" });
    const resume = page.getByRole("button", { name: "RESUME" });
    const firstPanel = page.locator("canvas").first();

    await page.waitForTimeout(1500);
    await pause.click();
    await expect(resume).toBeVisible();

    const frozen = await firstPanel.screenshot();
    await page.waitForTimeout(2000);
    expect(await firstPanel.screenshot()).toEqual(frozen);

    await resume.click();
    await expect(pause).toBeVisible();

    await expect(page.getByText("Post-Race Results")).toBeVisible({
      timeout: RACE_DURATION_MS * 2,
    });

    await page.getByRole("button", { name: "RESET" }).click();
    await expect(page.getByText("Post-Race Results")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "START" })).toBeVisible();
  });
});
