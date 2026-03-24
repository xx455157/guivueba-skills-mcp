#!/usr/bin/env node

/**
 * GUIVueBA Skills MCP Server
 * 飯店管理系統專業技能服務器
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

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

// 建立 MCP Server
const server = new Server(
  {
    name: "guivueba-skills",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 註冊工具列表處理
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    checkVQLayoutTool,
    dataDictionaryTool,
    apiArchitectureTool,
    mobileAuditTool,
    architectureGuideTool,
  ],
}));

// 處理工具呼叫
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case checkVQLayoutTool.name:
        result = await checkVQLayoutTool.run(args);
        break;
      case dataDictionaryTool.name:
        result = await dataDictionaryTool.run(args);
        break;
      case apiArchitectureTool.name:
        result = await apiArchitectureTool.run(args);
        break;
      case mobileAuditTool.name:
        result = await mobileAuditTool.run(args);
        break;
      case architectureGuideTool.name:
        result = await architectureGuideTool.run(args);
        break;
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

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

// 啟動伺服器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GUIVueBA Skills MCP Server started");
}

main().catch(console.error);
