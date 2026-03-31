import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({
  voxGet: vi.fn(),
}));

import { voxGet } from "../src/client.js";
const mockVoxGet = vi.mocked(voxGet);

describe("skills", () => {
  it("skill-call-history returns 24h summary", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [{ call_id: 1 }, { call_id: 2 }], total_count: 2 });
    const { skillCallHistory } = await import("../src/skills/call-history.js");
    const result = JSON.parse(await skillCallHistory.run());
    expect(result.title).toBe("История звонков (24ч)");
    expect(result.total_count).toBe(2);
    expect(result.calls).toHaveLength(2);
  });

  it("skill-account-info returns account data", async () => {
    mockVoxGet.mockResolvedValueOnce({ account_id: 123, account_name: "test" });
    const { skillAccountInfo } = await import("../src/skills/account-info.js");
    const result = JSON.parse(await skillAccountInfo.run());
    expect(result.title).toBe("Информация об аккаунте Voximplant");
    expect(result.data.account_id).toBe(123);
  });
});
