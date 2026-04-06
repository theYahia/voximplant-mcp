#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";

import {
  getCallHistorySchema, handleGetCallHistory,
  getUsersSchema, handleGetUsers,
  sendSmsSchema, handleSendSms,
} from "./tools/calls.js";
import { getAccountInfoSchema, handleGetAccountInfo } from "./tools/accounts.js";
import {
  getScenariosSchema, handleGetScenarios,
  updateScenarioSchema, handleUpdateScenario,
} from "./tools/scenarios.js";
import { getRulesSchema, handleGetRules } from "./tools/rules.js";
import {
  startCallSchema, handleStartCall,
  getActiveCallsSchema, handleGetActiveCalls,
  getSmsHistorySchema, handleGetSmsHistory,
} from "./tools/calls-management.js";
import { getRecordingsSchema, handleGetRecordings } from "./tools/recordings.js";
import { skillCallHistory } from "./skills/call-history.js";
import { skillAccountInfo } from "./skills/account-info.js";

const TOOL_COUNT = 11;
const SKILL_COUNT = 2;

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "voximplant-mcp",
    version: "1.2.3",
  });

  // --- История и базовые операции ---
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

  server.tool(
    "get_account_info",
    "Получить информацию об аккаунте Voximplant (баланс, тариф, лимиты).",
    getAccountInfoSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleGetAccountInfo() }] }),
  );

  // --- Управление звонками ---
  server.tool(
    "start_call",
    "Инициировать исходящий звонок через Voximplant по заданному правилу маршрутизации.",
    startCallSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStartCall(params) }] }),
  );

  server.tool(
    "get_active_calls",
    "Получить список активных сессий (звонков в процессе) в Voximplant.",
    getActiveCallsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetActiveCalls(params) }] }),
  );

  server.tool(
    "get_sms_history",
    "Получить историю SMS-сообщений за период с фильтрами по номерам.",
    getSmsHistorySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetSmsHistory(params) }] }),
  );

  // --- Записи разговоров ---
  server.tool(
    "get_recordings",
    "Получить список записей разговоров за период. Возвращает URL для скачивания записи.",
    getRecordingsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetRecordings(params) }] }),
  );

  // --- Сценарии и правила ---
  server.tool(
    "get_scenarios",
    "Получить список сценариев Voximplant.",
    getScenariosSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetScenarios(params) }] }),
  );

  server.tool(
    "update_scenario",
    "Обновить код или имя сценария VoxEngine в Voximplant. Позволяет агенту динамически менять логику звонка.",
    updateScenarioSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleUpdateScenario(params) }] }),
  );

  server.tool(
    "get_rules",
    "Получить правила маршрутизации Voximplant для приложения.",
    getRulesSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetRules(params) }] }),
  );

  // --- 2 Skills ---
  server.tool(
    skillCallHistory.name,
    skillCallHistory.description,
    {},
    async () => ({ content: [{ type: "text", text: await skillCallHistory.run() }] }),
  );

  server.tool(
    skillAccountInfo.name,
    skillAccountInfo.description,
    {},
    async () => ({ content: [{ type: "text", text: await skillAccountInfo.run() }] }),
  );

  return server;
}

async function main() {
  const useHttp = process.argv.includes("--http");
  const port = parseInt(process.env.PORT ?? "3000", 10);

  const server = createMcpServer();

  if (useHttp) {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
    await server.connect(transport);

    const httpServer = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
      } else if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT, skills: SKILL_COUNT }));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[voximplant-mcp] HTTP mode on http://localhost:${port}/mcp — ${TOOL_COUNT} tools, ${SKILL_COUNT} skills.`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[voximplant-mcp] Stdio mode. ${TOOL_COUNT} tools, ${SKILL_COUNT} skills. Env: VOXIMPLANT_ACCOUNT_ID + VOXIMPLANT_API_KEY.`);
  }
}

export { createMcpServer };

main().catch((error) => {
  console.error("[voximplant-mcp] Ошибка:", error);
  process.exit(1);
});
