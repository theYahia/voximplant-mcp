import { z } from "zod";
import { voxGet } from "../client.js";

export const getScenariosSchema = z.object({
  count: z.number().int().min(1).max(200).default(50).describe("Количество сценариев"),
  offset: z.number().int().default(0).describe("Смещение"),
  scenario_name: z.string().optional().describe("Фильтр по имени сценария"),
});

export async function handleGetScenarios(params: z.infer<typeof getScenariosSchema>): Promise<string> {
  const query: Record<string, string> = {
    count: String(params.count),
    offset: String(params.offset),
  };
  if (params.scenario_name) query.scenario_name = params.scenario_name;
  const result = await voxGet("GetScenarios", query);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// update_scenario — обновить код сценария VoxEngine
// ──────────────────────────────────────────────────────────────

export const updateScenarioSchema = z.object({
  scenario_id: z.number().int().describe("ID сценария Voximplant"),
  scenario_name: z.string().optional().describe("Новое имя сценария (необязательно)"),
  script: z.string().optional().describe("Новый JavaScript код сценария VoxEngine"),
});

export async function handleUpdateScenario(
  params: z.infer<typeof updateScenarioSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    scenario_id: String(params.scenario_id),
  };
  if (params.scenario_name) query.scenario_name = params.scenario_name;
  if (params.script) query.script = params.script;
  const result = await voxGet("SetScenarioInfo", query);
  return JSON.stringify(result, null, 2);
}
