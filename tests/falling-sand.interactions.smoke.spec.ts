import { expect, test } from "@playwright/test";

test.describe("Falling Sand interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/falling-sand");
    await expect(
      page.getByLabel(
        "Interactive falling sand simulation. Draw materials with a pointer or touch.",
      ),
    ).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) > 720) {
      await expect(page.getByText("Preparing the sandbox")).toBeHidden();
    }
  });

  test("remembers when drawing tips are dismissed", async ({ page }) => {
    const drawingHint = page.getByText(
      "Draw with a pointer or touch. Scroll to resize. Right-click erases.",
    );
    await expect(drawingHint).toBeVisible();
    await page.getByRole("button", { name: "Dismiss drawing tips" }).click();
    await page.reload();
    await expect(drawingHint).toBeHidden();
  });

  test("draws, pauses, saves, and restores a world", async ({ page }) => {
    await expect(
      page.getByText("Draw a world. Let physics finish it."),
    ).toHaveCount(0);
    const drawingHint = page.getByText(
      "Draw with a pointer or touch. Scroll to resize. Right-click erases.",
    );
    await expect(drawingHint).toBeVisible();
    await page.getByRole("button", { name: "Dismiss drawing tips" }).click();
    await expect(drawingHint).toBeHidden();

    await expect(page.getByRole("tab", { name: "Elements" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Statistics" })).toBeVisible();
    await page.getByRole("tab", { name: "Statistics" }).click();
    await expect(
      page.getByText("Material types").locator("..").locator("strong"),
    ).toHaveText("4");
    await page.getByRole("tab", { name: "Elements" }).click();
    const materialTitles = await page
      .locator("#panel-elements button")
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute("title")),
      );
    expect(materialTitles.slice(0, 10)).toEqual([
      "Sand (1)",
      "Water (2)",
      "Fire (3)",
      "Lava (4)",
      "Plant (5)",
      "Acid (6)",
      "Stone (7)",
      "Wood (8)",
      "Oil (9)",
      "Salt (0)",
    ]);
    expect(materialTitles.slice(10, 20)).toEqual([
      "Ice (I)",
      "Steam (S)",
      "Dirt (D)",
      "Mud (M)",
      "Seed (B)",
      "Snow (N)",
      "Coal (C)",
      "Metal (H)",
      "Glass (V)",
      "Methane (A)",
    ]);
    expect(materialTitles.slice(20, 25)).toEqual([
      "Powder (G)",
      "Fuse (F)",
      "TNT (T)",
      "Nitro (R)",
      "C4 (X)",
    ]);
    await expect(
      page.getByRole("button", { name: "0.5× speed" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "1× speed" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "1× speed" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "4× speed" })).toBeVisible();

    const playbackControls = page
      .getByLabel("Playback controls")
      .getByRole("button");
    await expect(playbackControls).toHaveCount(5);
    expect(await playbackControls.allTextContents()).toEqual([
      "Pause",
      "0.5×",
      "1×",
      "2×",
      "4×",
    ]);

    const creationControls = page
      .getByLabel("Creation controls")
      .getByRole("button");
    await expect(creationControls).toHaveCount(5);
    expect(await creationControls.allTextContents()).toEqual([
      "Reset",
      "Clear",
      "Save",
      "Load",
      "Download PNG",
    ]);

    const playbackPosition = await page
      .getByLabel("Playback controls")
      .boundingBox();
    const initialViewport = page.viewportSize();
    expect(playbackPosition).not.toBeNull();
    expect(initialViewport).not.toBeNull();
    if (playbackPosition && initialViewport) {
      expect(
        Math.abs(
          playbackPosition.x +
            playbackPosition.width / 2 -
            initialViewport.width / 2,
        ),
      ).toBeLessThan(2);
    }

    await page.getByRole("button", { name: "Minimize control panel" }).click();
    await expect(page.getByRole("tab", { name: "Elements" })).toBeHidden();
    await expect(page.getByText("Toolbox", { exact: true })).toBeVisible();
    const minimizedToolbox = await page
      .getByLabel("Sandbox tools")
      .boundingBox();
    expect(minimizedToolbox?.width).toBeGreaterThan(170);
    expect(minimizedToolbox?.height).toBeLessThan(52);
    await page.getByRole("button", { name: "Restore control panel" }).click();
    await expect(page.getByRole("tab", { name: "Elements" })).toBeVisible();

    const toolbox = page.getByLabel("Sandbox tools");
    const panelBeforeDrag = await toolbox.boundingBox();
    const dragHandle = await page
      .getByText("Toolbox", { exact: true })
      .boundingBox();
    expect(panelBeforeDrag).not.toBeNull();
    expect(dragHandle).not.toBeNull();
    if (panelBeforeDrag && dragHandle) {
      const viewport = page.viewportSize();
      expect(viewport).not.toBeNull();
      if (viewport) {
        expect(
          Math.abs(
            panelBeforeDrag.y +
              panelBeforeDrag.height / 2 -
              viewport.height / 2,
          ),
        ).toBeLessThan(2);
      }
      await page.mouse.move(
        dragHandle.x + dragHandle.width / 2,
        dragHandle.y + dragHandle.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(dragHandle.x - 70, dragHandle.y + 28, { steps: 6 });
      await page.mouse.up();
      const panelAfterDrag = await toolbox.boundingBox();
      expect(panelAfterDrag?.x).toBeLessThan(panelBeforeDrag.x - 30);
      expect(panelAfterDrag?.y).toBeGreaterThan(panelBeforeDrag.y + 10);
    }

    const water = page.getByRole("button", { name: "Water" });
    await water.click();
    await expect(water).toHaveAttribute("aria-pressed", "true");
    expect(
      await water.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--material-color").trim(),
      ),
    ).toBe("#4c9bd8");

    const canvas = page.getByLabel(
      "Interactive falling sand simulation. Draw materials with a pointer or touch.",
    );
    await canvas.click({ position: { x: 360, y: 120 } });
    await canvas.hover();
    await page.mouse.wheel(0, -100);
    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.locator('output[for="sand-brush-size"]')).toHaveText("6");
    await expect(
      page.getByRole("checkbox", { name: /Right-click erases/ }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Pause while drawing/ }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Pause in background/ }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Auto-save world/ }),
    ).not.toBeChecked();

    await page.getByRole("checkbox", { name: /Display frame rate/ }).check();
    await expect(page.getByText(/^\d+ FPS$/)).toBeVisible();

    await canvas.hover();
    await page.mouse.wheel(0, 100);
    await expect(page.locator('output[for="sand-brush-size"]')).toHaveText("5");
    await page.getByRole("tab", { name: "Elements" }).click();
    for (const addedMaterial of [
      "Dirt",
      "Mud",
      "Coal",
      "Metal",
      "Glass",
      "Snow",
      "Methane",
      "Steam",
      "Seed",
      "TNT",
      "Nitro",
      "C4",
      "Fuse",
    ]) {
      await expect(
        page.getByRole("button", { name: addedMaterial }),
      ).toBeAttached();
    }
    await expect(page.getByRole("button", { name: "Firework" })).toHaveCount(0);
    await expect(page.getByText("G", { exact: true })).toHaveCount(1);
    await page.keyboard.press("s");
    await expect(page.getByRole("button", { name: "Steam" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.keyboard.press("b");
    const seed = page.getByRole("button", { name: "Seed" });
    await expect(seed).toHaveAttribute("aria-pressed", "true");
    expect(
      await seed.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--material-color").trim(),
      ),
    ).toBe("#9b66d1");
    await page.keyboard.press("x");
    await expect(page.getByRole("button", { name: "C4" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.keyboard.press("g");
    await expect(page.getByRole("button", { name: "Powder" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("tab", { name: "Statistics" }).click();
    await expect(page.getByText("Active cells")).toBeVisible();
    await expect(page.getByText("World grid")).toBeVisible();
    await expect(page.getByText("Empty cells")).toBeVisible();
    await expect(page.getByText("World coverage")).toBeVisible();
    await expect(page.getByText("Material types")).toBeVisible();
    await expect(page.getByText("Selected element")).toBeVisible();
    await expect(page.getByText("Playback speed")).toBeVisible();
    await expect(page.getByText("Frame rate", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("Space pauses. Number keys switch materials."),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByText("Creation saved in this browser."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();
    await page.getByRole("button", { name: "Load", exact: true }).click();
    await expect(page.getByText("Saved creation loaded.")).toBeVisible();
  });

  test("previews a PNG before downloading it", async ({ page }) => {
    let downloadCount = 0;
    page.on("download", () => {
      downloadCount += 1;
    });

    await page.getByRole("button", { name: "Download PNG" }).click();

    await expect(
      page.getByRole("heading", { name: "Your pocket world" }),
    ).toBeVisible();
    expect(downloadCount).toBe(0);
    await expect(page.getByText("Share your world")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "X", exact: true }),
    ).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^falling-sand-\d{4}-\d{2}-\d{2}\.png$/,
    );

    await page.getByRole("button", { name: "Close export preview" }).click();
    await expect(
      page.getByRole("heading", { name: "Your pocket world" }),
    ).toBeHidden();
  });

  test.describe("mobile toolbox", () => {
    test.use({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });

    test("starts minimized and can be restored", async ({ page }) => {
      const restoreButton = page.getByRole("button", {
        name: "Restore control panel",
      });

      await expect(restoreButton).toBeVisible();
      await expect(restoreButton).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("tab", { name: "Elements" })).toBeHidden();
      await expect(page.locator("[data-sand-brand-mark]")).toBeHidden();

      const controlBar = await page
        .locator("[data-sand-control-bar]")
        .boundingBox();
      const playbackControls = await page
        .getByLabel("Playback controls")
        .boundingBox();
      const creationControls = await page
        .getByLabel("Creation controls")
        .boundingBox();
      expect(controlBar?.x).toBeLessThan(10);
      expect(controlBar?.width).toBeGreaterThan(370);
      expect(controlBar?.height).toBeLessThan(50);
      expect(playbackControls?.y).toBe(creationControls?.y);
      expect(playbackControls?.width).toBeGreaterThan(180);
      expect(creationControls?.width).toBeGreaterThan(180);

      const minimizedToolbox = await page
        .getByLabel("Sandbox tools")
        .boundingBox();
      expect(minimizedToolbox?.height).toBeLessThan(52);

      await restoreButton.click();
      await expect(page.getByRole("tab", { name: "Elements" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Minimize control panel" }),
      ).toHaveAttribute("aria-expanded", "true");
    });
  });
});
