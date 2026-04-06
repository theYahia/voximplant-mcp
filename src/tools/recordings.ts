import { z } from "zod";
import { voxGet } from "../client.js";

// ──────────────────────────────────────────────────────────────
// get_recordings — список записей разговоров
// ──────────────────────────────────────────────────────────────

export const getRecordingsSchema = z.object({
  from_date: z.string().describe("Начало периода (YYYY-MM-DD HH:mm:ss)"),
  to_date: z.string().describe("Конец периода (YYYY-MM-DD HH:mm:ss)"),
  call_session_history_id: z.number().int().optional().describe("ID конкретной сессии для получения записи"),
  count: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().default(0),
});

export async function handleGetRecordings(
  params: z.infer<typeof getRecordingsSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    from_date: params.from_date,
    to_date: params.to_date,
    with_records: "1",
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.call_session_history_id) {
    query.call_session_history_id = String(params.call_session_history_id);
  }
  const result = await voxGet("GetCallHistory", query);
  return JSON.stringify(result, null, 2);
}
