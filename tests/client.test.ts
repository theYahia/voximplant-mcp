import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the client module by mocking fetch
describe("voxGet", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.VOXIMPLANT_ACCOUNT_ID = "test-account-123";
    process.env.VOXIMPLANT_API_KEY = "test-key-456";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("throws when env vars missing", async () => {
    delete process.env.VOXIMPLANT_ACCOUNT_ID;
    delete process.env.VOXIMPLANT_API_KEY;
    // Re-import to test with cleared env
    const { voxGet } = await import("../src/client.js");
    await expect(voxGet("GetAccountInfo")).rejects.toThrow("VOXIMPLANT_ACCOUNT_ID");
  });

  it("calls correct URL with params", async () => {
    const mockResponse = { api_version: "2024-04-10", result: [] };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const { voxGet } = await import("../src/client.js");
    const result = await voxGet("GetCallHistory", { count: "10" });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("https://api.voximplant.com/platform_api/GetCallHistory");
    expect(url).toContain("account_id=test-account-123");
    expect(url).toContain("api_key=test-key-456");
    expect(url).toContain("count=10");
    expect(result).toEqual(mockResponse);
  });

  it("handles API error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { msg: "Forbidden", code: 403 } }), { status: 200 }),
    );

    const { voxGet } = await import("../src/client.js");
    await expect(voxGet("GetAccountInfo")).rejects.toThrow("Forbidden");
  });

  it("retries on 429", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: "ok" }), { status: 200 }));

    const { voxGet } = await import("../src/client.js");
    const result = await voxGet("Test");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ result: "ok" });
  });
});
