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
import { getScenariosSchema, handleGetScenarios } from "./tools/scenarios.js";
import { getRulesSchema, handleGetRules } from "./tools/rules.js";
import { skillCallHistory } from "./skills/call-history.js";
import { skillAccountInfo } from "./skills/account-info.js";

const TOOL_COUNT = 6;
const SKILL_COUNT = 2;

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "voximplant-mcp",
    version: "1.1.0",
  });

  // --- 6 Tools ---
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

  server.tool(
    "get_scenarios",
    "Получить список сценариев Voximplant.",
    getScenariosSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetScenarios(params) }] }),
  );

  server.tool(
    "get_rules",
    "Получить правила маршрутизации Voximplant для приложения.",
    getRulesSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetRules(params) }] }),
  );

  // --- 2 Skills (exposed as tools with skill- prefix) ---
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
