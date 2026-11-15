import { test, expect } from "@playwright/test";
test("saved music-off preference is honored, then playback, volume and effects work", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/audio/")) requests.push(r.url());
  });
  await page.addInitScript(() => localStorage.setItem("synapse-music", "off"));
  await page.goto("/");
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-ready",
    "true",
  );
  expect(requests).toEqual([]);
  await page.getByRole("button", { name: /Sound settings/ }).click();
  await expect(
    page.getByRole("region", { name: "Sound settings" }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  await page.getByRole("button", { name: "Play lounge music" }).click();
  await expect(page.getByRole("button", { name: "Pause music" })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("audio")
        .evaluate((el) => (el as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0.05);
  const volume = page.getByRole("slider", { name: "Music volume" });
  await volume.fill(".1");
  await expect
    .poll(() =>
      page.locator("audio").evaluate((el) => (el as HTMLAudioElement).volume),
    )
    .toBeCloseTo(0.1, 2);
  await expect(
    page.getByRole("switch", { name: /Interface sounds/ }),
  ).toHaveAttribute("aria-checked", "true");
  await expect
    .poll(() => requests.filter((url) => url.endsWith(".ogg")).length)
    .toBe(3);
  await page.getByRole("button", { name: "Pause music" }).click();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((el) => (el as HTMLAudioElement).paused),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Sound settings" }),
  ).toHaveCount(0);
});
test("the paper reading tools change density and the contents track the selected section", async ({
  page,
}) => {
  await page.goto("/study/paper");
  await page.getByRole("button", { name: "Compact reading" }).click();
  await expect(page.locator(".paper-page")).toHaveAttribute(
    "data-density",
    "compact",
  );
  await page
    .getByRole("navigation", { name: "Paper contents" })
    .getByRole("link", { name: "07 · Training-noise control" })
    .click();
  await expect(page).toHaveURL(/#control$/);
  await expect(page.locator('.paper-toc a[href="#control"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(page.locator("#control")).toContainText("2,736");
  await expect(
    page.getByRole("button", { name: "Print / save PDF" }),
  ).toBeVisible();
});
test("music and original interface clips are served with valid audio content", async ({
  request,
}) => {
  for (const [file, signature] of [
    ["click.ogg", "OggS"],
    ["switch.ogg", "OggS"],
    ["tick.ogg", "OggS"],
  ] as const) {
    const r = await request.get("/audio/" + file);
    expect(r.status()).toBe(200);
    expect((await r.body()).subarray(0, 4).toString()).toBe(signature);
  }
  const r = await request.get("/audio/airport-lounge.mp3", {
    headers: { range: "bytes=0-1023" },
  });
  expect([200, 206]).toContain(r.status());
  expect((await r.body()).byteLength).toBeGreaterThan(100);
  const license = await request.get("/audio/ATTRIBUTION.txt");
  expect(await license.text()).toContain("By Attribution 4.0");
});
