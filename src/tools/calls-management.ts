import { z } from "zod";
import { voxGet } from "../client.js";

// ──────────────────────────────────────────────────────────────
// start_call — инициировать исходящий звонок
// ──────────────────────────────────────────────────────────────

export const startCallSchema = z.object({
  rule_id: z.number().int().describe("ID правила маршрутизации для звонка"),
  destination: z.string().describe("Номер назначения для звонка"),
  caller_id: z.string().optional().describe("Номер в Caller ID (если не указан — берётся из правила)"),
  script_custom_data: z.string().optional().describe("Кастомные данные для сценария VoxEngine"),
});

export async function handleStartCall(
  params: z.infer<typeof startCallSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    rule_id: String(params.rule_id),
    script_custom_data: params.script_custom_data ?? "",
  };
  if (params.caller_id) query.caller_id = params.caller_id;
  const result = await voxGet("StartScenarios", query);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_active_calls — список активных сессий
// ──────────────────────────────────────────────────────────────

export const getActiveCallsSchema = z.object({
  application_id: z.number().int().optional().describe("Фильтр по ID приложения"),
});

export async function handleGetActiveCalls(
  params: z.infer<typeof getActiveCallsSchema>,
): Promise<string> {
  const query: Record<string, string> = {};
  if (params.application_id) query.application_id = String(params.application_id);
  const result = await voxGet("GetActiveSessions", query);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_sms_history — история SMS-сообщений
// ──────────────────────────────────────────────────────────────

export const getSmsHistorySchema = z.object({
  from_date: z.string().describe("Начало периода (YYYY-MM-DD HH:mm:ss)"),
  to_date: z.string().describe("Конец периода (YYYY-MM-DD HH:mm:ss)"),
  source_number: z.string().optional().describe("Фильтр по номеру отправителя"),
  destination_number: z.string().optional().describe("Фильтр по номеру получателя"),
  count: z.number().int().min(1).max(200).default(20),
  offset: z.number().int().default(0),
});

export async function handleGetSmsHistory(
  params: z.infer<typeof getSmsHistorySchema>,
): Promise<string> {
  const query: Record<string, string> = {
    from_date: params.from_date,
    to_date: params.to_date,
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.source_number) query.source_number = params.source_number;
  if (params.destination_number) query.destination_number = params.destination_number;
  const result = await voxGet("GetSMSHistory", query);
  return JSON.stringify(result, null, 2);
}
