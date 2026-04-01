import { voxGet } from "../client.js";

export const skillCallHistory = {
  name: "skill-call-history",
  title: "История звонков",
  description: "Получить сводку истории звонков за последние 24 часа.",
  async run(): Promise<string> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");

    const result = (await voxGet("GetCallHistory", {
      from_date: fmt(yesterday),
      to_date: fmt(now),
      count: "100",
      offset: "0",
    })) as { result?: unknown[]; total_count?: number };

    const calls = result.result ?? [];
    const total = result.total_count ?? calls.length;

    return JSON.stringify(
      {
        title: "История звонков (24ч)",
        period: { from: fmt(yesterday), to: fmt(now) },
        total_count: total,
        returned: calls.length,
        calls,
      },
      null,
      2,
    );
  },
};
