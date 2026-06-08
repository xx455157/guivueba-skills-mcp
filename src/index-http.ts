#!/usr/bin/env node

/**
 * GUIVueBA Skills MCP Server (HTTP Mode)
 * 飯店管理系統專業技能服務器 - HTTP 網頁服務模式
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { CheckVQLayoutTool } from "./tools/CheckVQLayoutTool.js";
import { DataDictionaryTool } from "./tools/DataDictionaryTool.js";
import { ApiArchitectureTool } from "./tools/ApiArchitectureTool.js";
import { MobileAuditTool } from "./tools/MobileAuditTool.js";
import { ArchitectureGuideTool } from "./tools/ArchitectureGuideTool.js";

// 建立工具實例
const checkVQLayoutTool = new CheckVQLayoutTool();
const dataDictionaryTool = new DataDictionaryTool();
const apiArchitectureTool = new ApiArchitectureTool();
const mobileAuditTool = new MobileAuditTool();
const architectureGuideTool = new ArchitectureGuideTool();

// 工具對應表
const toolMap: Record<string, any> = {
  [checkVQLayoutTool.name]: checkVQLayoutTool,
  [dataDictionaryTool.name]: dataDictionaryTool,
  [apiArchitectureTool.name]: apiArchitectureTool,
  [mobileAuditTool.name]: mobileAuditTool,
  [architectureGuideTool.name]: architectureGuideTool,
};

const tools = [
  checkVQLayoutTool,
  dataDictionaryTool,
  apiArchitectureTool,
  mobileAuditTool,
  architectureGuideTool,
];

// 建立 MCP Server (使用底層 Server 以支援 JSON Schema)
const server = new Server({
  name: "guivueba-skills",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// 處理 tools/list 請求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// 處理 tools/call 請求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = toolMap[name];

  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await tool.run(args);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

// 建立 Express App
const app = createMcpExpressApp();

// 健康檢查端點
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "guivueba-skills",
    version: "1.0.0",
    mode: "http",
    tools: tools.map((t) => t.name),
  });
});

// 工具列表端點 (REST 格式)
app.get("/tools", (_req, res) => {
  res.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  });
});

// MCP POST 端點
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: `Internal server error: ${error instanceof Error ? error.message : String(error)}`,
        },
        id: null,
      });
    }
  }

  res.on("close", () => {
    transport.close();
    server.close();
  });
});

// MCP GET 端點（返回方法不允許）
app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  });
});

// MCP DELETE 端點
app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  });
});

// 啟動設定
const PORT = parseInt(process.env.MCP_PORT || "3100", 10);
const HOST = process.env.MCP_HOST || "127.0.0.1";

const serverInstance = app.listen(PORT, HOST, (err?: Error) => {
  if (err) {
    console.error("Server start error:", err);
    process.exit(1);
  }
  console.error(`GUIVueBA Skills MCP Server (HTTP) started`);
  console.error(`  Mode: HTTP`);
  console.error(`  URL: http://${HOST}:${PORT}`);
  console.error(`  MCP Endpoint: http://${HOST}:${PORT}/mcp`);
  console.error(`  Health Check: http://${HOST}:${PORT}/health`);
});

serverInstance.on("error", (err: Error) => {
  console.error("Server error:", err);
  process.exit(1);
});

// 優雅關閉
process.on("SIGTERM", () => {
  console.error("SIGTERM received, shutting down...");
  serverInstance.close(() => {
    console.error("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.error("SIGINT received, shutting down...");
  serverInstance.close(() => {
    console.error("Server closed");
    process.exit(0);
  });
});
