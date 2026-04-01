import { z } from "zod";
import { voxGet } from "../client.js";

export const getRulesSchema = z.object({
  application_id: z.number().int().describe("ID приложения"),
  count: z.number().int().min(1).max(200).default(50).describe("Количество правил"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetRules(params: z.infer<typeof getRulesSchema>): Promise<string> {
  const result = await voxGet("GetRules", {
    application_id: String(params.application_id),
    count: String(params.count),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}
