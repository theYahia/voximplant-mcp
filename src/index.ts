#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getCallHistorySchema, handleGetCallHistory, getUsersSchema, handleGetUsers, sendSmsSchema, handleSendSms } from "./tools/calls.js";

const server = new McpServer({
  name: "voximplant-mcp",
  version: "1.0.0",
});

server.tool(
  "get_call_history",
  "Получить историю звонков Voximplant за период.",
  getCallHistorySchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCallHistory(params) }] }),
);

server.tool(
  "get_users",
  "Получить список пользователей Voximplant.",
  getUsersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetUsers(params) }] }),
);

server.tool(
  "send_sms",
  "Отправить SMS через Voximplant.",
  sendSmsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleSendSms(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[voximplant-mcp] Сервер запущен. 3 инструмента. Требуется VOXIMPLANT_ACCOUNT_ID + VOXIMPLANT_API_KEY.");
}

main().catch((error) => {
  console.error("[voximplant-mcp] Ошибка:", error);
  process.exit(1);
});
