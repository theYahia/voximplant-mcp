import { z } from "zod";
import { voxGet } from "../client.js";

export const getAccountInfoSchema = z.object({});

export async function handleGetAccountInfo(): Promise<string> {
  const result = await voxGet("GetAccountInfo", {});
  return JSON.stringify(result, null, 2);
}
