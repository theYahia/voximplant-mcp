import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/client.js", () => ({
  voxGet: vi.fn(),
}));

import { voxGet } from "../src/client.js";
const mockVoxGet = vi.mocked(voxGet);

describe("tools", () => {
  beforeEach(() => {
    mockVoxGet.mockReset();
  });

  it("handleGetCallHistory passes correct params", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [], total_count: 0 });
    const { handleGetCallHistory } = await import("../src/tools/calls.js");
    const result = await handleGetCallHistory({
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-01-02 00:00:00",
      count: 10,
      offset: 0,
    });
    expect(mockVoxGet).toHaveBeenCalledWith("GetCallHistory", {
      from_date: "2025-01-01 00:00:00",
      to_date: "2025-01-02 00:00:00",
      count: "10",
      offset: "0",
    });
    expect(JSON.parse(result)).toHaveProperty("total_count", 0);
  });

  it("handleGetUsers passes correct params", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [{ user_id: 1 }] });
    const { handleGetUsers } = await import("../src/tools/calls.js");
    const result = await handleGetUsers({ count: 5, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetUsers", { count: "5", offset: "0" });
    const parsed = JSON.parse(result);
    expect(parsed.result).toHaveLength(1);
  });

  it("handleSendSms passes correct params", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: 1 });
    const { handleSendSms } = await import("../src/tools/calls.js");
    const result = await handleSendSms({
      source: "+79001234567",
      destination: "+79007654321",
      sms_body: "Test",
    });
    expect(mockVoxGet).toHaveBeenCalledWith("SendSmsMessage", {
      source: "+79001234567",
      destination: "+79007654321",
      sms_body: "Test",
    });
    expect(JSON.parse(result)).toHaveProperty("result", 1);
  });

  it("handleGetAccountInfo works", async () => {
    mockVoxGet.mockResolvedValueOnce({ account_id: 123, account_name: "test" });
    const { handleGetAccountInfo } = await import("../src/tools/accounts.js");
    const result = await handleGetAccountInfo();
    expect(mockVoxGet).toHaveBeenCalledWith("GetAccountInfo", {});
    expect(JSON.parse(result)).toHaveProperty("account_id", 123);
  });

  it("handleGetScenarios works", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [{ scenario_id: 1 }] });
    const { handleGetScenarios } = await import("../src/tools/scenarios.js");
    const result = await handleGetScenarios({ count: 10, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetScenarios", { count: "10", offset: "0" });
    expect(JSON.parse(result).result).toHaveLength(1);
  });

  it("handleGetScenarios with scenario_name filter", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [] });
    const { handleGetScenarios } = await import("../src/tools/scenarios.js");
    await handleGetScenarios({ count: 10, offset: 0, scenario_name: "my-scenario" });
    expect(mockVoxGet).toHaveBeenCalledWith("GetScenarios", {
      count: "10",
      offset: "0",
      scenario_name: "my-scenario",
    });
  });

  it("handleGetRules works", async () => {
    mockVoxGet.mockResolvedValueOnce({ result: [{ rule_id: 1 }] });
    const { handleGetRules } = await import("../src/tools/rules.js");
    const result = await handleGetRules({ application_id: 42, count: 10, offset: 0 });
    expect(mockVoxGet).toHaveBeenCalledWith("GetRules", {
      application_id: "42",
      count: "10",
      offset: "0",
    });
    expect(JSON.parse(result).result).toHaveLength(1);
  });
});
