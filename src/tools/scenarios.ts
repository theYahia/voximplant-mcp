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
