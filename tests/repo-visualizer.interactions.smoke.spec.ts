import { expect, test } from "@playwright/test";

test.describe("Repository Visualizer loading and playback", () => {
  test("keeps playback disabled until the repository history is ready", async ({
    page,
  }) => {
    await page.route("**/repo-visualizer/demo-git-log.txt", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ status: 404, body: "Demo log unavailable" });
    });

    await page.goto("/repo-visualizer", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("status")).toContainText(
      "Loading repository history",
    );
    await expect(
      page.getByRole("button", {
        name: "Playback unavailable while repository loads",
      }),
    ).toBeDisabled();
    await expect(
      page.getByLabel("Repository statistics loading"),
    ).toHaveAttribute("aria-busy", "true");
    await expect(page.getByTestId("timeline-progress")).toHaveCSS(
      "width",
      "0px",
    );
    await expect(page.getByText("Press Play to begin simulation")).toHaveCount(
      0,
    );

    await expect(page.getByRole("status")).toContainText(
      "Repository history unavailable",
    );
    await expect(
      page.getByRole("button", {
        name: "Playback unavailable while repository loads",
      }),
    ).toBeDisabled();
    await expect(page.getByTestId("timeline-progress")).toHaveCSS(
      "width",
      "0px",
    );
    await expect(page.getByText("Press Play to begin simulation")).toHaveCount(
      0,
    );

    await page.getByRole("button", { name: "Choose repository" }).click();
    await expect(
      page.getByText("Switch repository", { exact: true }),
    ).toBeVisible();
  });

  test("freezes the canvas while playback is paused", async ({ page }) => {
    await page.goto("/repo-visualizer", { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const playButton = page.getByRole("button", { name: "Start playback" });
    await expect(playButton).toBeEnabled();
    await playButton.click();
    await expect(
      page.getByRole("button", { name: "Pause playback" }),
    ).toBeVisible();

    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "Pause playback" }).click();
    await page.waitForTimeout(100);

    const canvas = page.locator("canvas");
    const pausedFrame = await canvas.screenshot();
    await page.waitForTimeout(350);
    const heldFrame = await canvas.screenshot();
    expect(heldFrame.equals(pausedFrame)).toBe(true);

    await page.getByRole("button", { name: "Start playback" }).click();
    await page.waitForTimeout(350);
    const resumedFrame = await canvas.screenshot();
    expect(resumedFrame.equals(heldFrame)).toBe(false);
  });

  test("continues playing after the timeline is scrubbed", async ({ page }) => {
    await page.goto("/repo-visualizer", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Start playback" }).click();
    const timeline = page.getByRole("slider", { name: "Commit timeline" });
    const pauseButton = page.getByRole("button", { name: "Pause playback" });

    await timeline.fill("12");
    await expect(timeline).toHaveValue("12");
    await expect(pauseButton).toBeVisible();

    await timeline.press("Space");
    await expect(
      page.getByRole("button", { name: "Start playback" }),
    ).toBeVisible();
    await timeline.press("Space");
    await expect(pauseButton).toBeVisible();

    await timeline.fill("3");
    await expect(timeline).toHaveValue("3");
    await expect(pauseButton).toBeVisible();
    await expect
      .poll(async () => Number(await timeline.inputValue()), {
        timeout: 3_000,
      })
      .toBeGreaterThan(3);
  });

  test("settles the final animation before stopping playback", async ({
    page,
  }) => {
    await page.goto("/repo-visualizer", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Start playback" }).click();
    await page.getByRole("button", { name: "8×" }).click();

    const timeline = page.getByRole("slider", { name: "Commit timeline" });
    const finalCursor = await timeline.getAttribute("max");
    expect(finalCursor).not.toBeNull();
    await timeline.fill(finalCursor!);

    const pauseButton = page.getByRole("button", { name: "Pause playback" });
    await expect(pauseButton).toBeVisible();
    await page.waitForTimeout(300);
    await expect(pauseButton).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start playback" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("opens the shared export modal without downloading immediately", async ({
    page,
  }) => {
    let downloadStarted = false;
    page.on("download", () => {
      downloadStarted = true;
    });

    await page.goto("/repo-visualizer", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Download PNG" }).click();

    await expect(
      page.getByRole("heading", { name: "Repository Snapshot" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Download PNG" }),
    ).toBeVisible();
    await expect(page.getByText("Share this visualization")).toBeVisible();
    await page.waitForTimeout(150);
    expect(downloadStarted).toBe(false);
  });
});
