import { expect, test } from "@playwright/test";

test.describe("Lo-Fi Pixel Study interactions", () => {
  test("keeps playing when skipping between tracks", async ({ page }) => {
    await page.goto("/lofi-pixel-study", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Enter Room" }).click();

    const audio = page.locator("audio").first();
    await expect(page.getByText("Lofi Hip Hop", { exact: true })).toBeVisible();
    await expect
      .poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused))
      .toBe(false);

    await page.getByRole("button", { name: "Next Track" }).click();

    await expect(page.getByText("Lofi Chill", { exact: true })).toBeVisible();
    await expect
      .poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused))
      .toBe(false);
    await expect
      .poll(() =>
        audio.evaluate((element: HTMLAudioElement) =>
          decodeURIComponent(element.currentSrc),
        ),
      )
      .toContain("/lofi-pixel-study/normalized/MondaMusic - Lofi Chill.mp3");

    await page.getByRole("button", { name: "Next Track" }).click();

    await expect(page.getByText("Lofi Music", { exact: true })).toBeVisible();
    await expect
      .poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused))
      .toBe(false);
  });
});
