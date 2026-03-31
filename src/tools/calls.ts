import { z } from "zod";
import { voxGet } from "../client.js";

export const getCallHistorySchema = z.object({
  from_date: z.string().describe("Начало периода (YYYY-MM-DD HH:mm:ss)"),
  to_date: z.string().describe("Конец периода (YYYY-MM-DD HH:mm:ss)"),
  count: z.number().int().min(1).max(200).default(20).describe("Количество записей"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetCallHistory(params: z.infer<typeof getCallHistorySchema>): Promise<string> {
  const result = await voxGet("GetCallHistory", {
    from_date: params.from_date,
    to_date: params.to_date,
    count: String(params.count),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}

export const getUsersSchema = z.object({
  count: z.number().int().min(1).max(200).default(50).describe("Количество пользователей"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<string> {
  const result = await voxGet("GetUsers", {
    count: String(params.count),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}

export const sendSmsSchema = z.object({
  source: z.string().describe("Номер отправителя"),
  destination: z.string().describe("Номер получателя"),
  sms_body: z.string().describe("Текст сообщения"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<string> {
  const result = await voxGet("SendSmsMessage", {
    source: params.source,
    destination: params.destination,
    sms_body: params.sms_body,
  });
  return JSON.stringify(result, null, 2);
}
