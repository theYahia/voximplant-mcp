#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";

import { VERSION, assertCredentials, loadDotenv } from "./config.js";
import { registerCallTools } from "./tools/calls.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerScenarioTools } from "./tools/scenarios.js";
import { registerRuleTools } from "./tools/rules.js";
import { registerCallManagementTools } from "./tools/calls-management.js";
import { registerRecordingTools } from "./tools/recordings.js";
import { registerObservabilityTools } from "./tools/observability.js";
import { registerA2pTools } from "./tools/a2p.js";
import { skillCallHistory } from "./skills/call-history.js";
import { skillAccountInfo } from "./skills/account-info.js";

const TOOL_COUNT = 21;
const SKILL_COUNT = 2;

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "voximplant-mcp", version: VERSION });

  // 21 инструмента, сгруппированных по доменам
  registerCallTools(server);            // get_call_history, get_users, send_sms
  registerAccountTools(server);         // get_account_info
  registerCallManagementTools(server);  // start_call, get_acd_state, get_sms_history
  registerRecordingTools(server);       // get_recordings
  registerScenarioTools(server);        // get_scenarios, update_scenario
  registerRuleTools(server);            // get_rules
  registerObservabilityTools(server);   // phone_numbers, applications, queues, skills, sq_state, caller_ids, record_storages, transaction_history
  registerA2pTools(server);             // get_a2p_sms_history, send_a2p_sms (guarded)

  // 2 skills (зарегистрированы как tools без параметров)
  server.tool(skillCallHistory.name, skillCallHistory.description, {}, () => skillCallHistory.run());
  server.tool(skillAccountInfo.name, skillAccountInfo.description, {}, () => skillAccountInfo.run());

  return server;
}

async function main(): Promise<void> {
  loadDotenv();
  assertCredentials();

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
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: TOOL_COUNT, skills: SKILL_COUNT }));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[voximplant-mcp] HTTP mode on http://localhost:${port}/mcp — v${VERSION}, ${TOOL_COUNT} tools, ${SKILL_COUNT} skills.`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[voximplant-mcp] Stdio mode. v${VERSION}, ${TOOL_COUNT} tools, ${SKILL_COUNT} skills. Env: VOXIMPLANT_ACCOUNT_ID + VOXIMPLANT_API_KEY.`);
  }
}

export { createMcpServer };

main().catch((error) => {
  console.error("[voximplant-mcp] Ошибка:", error);
  process.exit(1);
});
