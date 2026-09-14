import { describe, expect, it } from "vitest";

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3000/";

describe("NodalWaves Quest application title", () => {
  it("exposes the rebranded title from the app endpoint", async () => {
    const response = await fetch(appUrl);
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toContain("NodalWaves Quest");
  });
});

export {};

// This test intentionally calls the running app endpoint instead of inspecting
// an environment variable directly, validating the configured title as served.
void process.env.VITE_APP_TITLE;
