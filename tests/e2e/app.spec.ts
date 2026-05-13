import { expect, test } from "@playwright/test";

test("loads, starts tutorial, and exposes deterministic text state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Neon-fire survival drifting" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start Tutorial Race" }).click();
  await page.keyboard.down("w");
  await page.keyboard.down(" ");
  await page.waitForTimeout(750);
  await page.keyboard.up(" ");
  await page.keyboard.up("w");
  const textState = await page.evaluate(
    () => window.render_game_to_text?.() ?? "{}",
  );
  const parsed = JSON.parse(textState);
  expect(parsed.mode).toBe("tutorial");
  expect(parsed.player.speed).toBeGreaterThan(0);
  expect(errors.filter((error) => !error.includes("WebGL"))).toEqual([]);
});

test("mode menu, garage, settings, and mobile-safe controls render", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Modes" }).click();
  await expect(page.getByText("Battle Arena")).toBeVisible();
  await page.getByRole("button", { name: "Garage" }).click();
  await expect(page.getByText("Garage preview")).toBeVisible();
  await page.getByRole("button", { name: "Comet" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByText("Accessibility, audio, camera")).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Resume" }).click();
    await expect(page.getByRole("button", { name: "Boost" })).toBeVisible();
  }
});

test("offline backend indicator keeps game playable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Online" }).click();
  await expect(page.getByText("Offline bot mode is active")).toBeVisible();
  await page.getByRole("button", { name: "Drive" }).click();
  await page.getByRole("button", { name: "Max Arena" }).click();
  const textState = await page.evaluate(
    () => window.render_game_to_text?.() ?? "{}",
  );
  expect(JSON.parse(textState).mode).toBe("max-arena");
});
