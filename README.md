# @guivueba/skills-mcp

GUIVueBA 飯店管理系統 Skills MCP Server - 將專業技能封裝成 MCP 工具

## 功能

本 MCP Server 提供以下 5 個專業工具：

| 工具名稱 | 功能 |
|---------|------|
| `check-vqpattern-page` | 檢查指定網頁是否符合 GUIVueBA 專案的 vQPattern 標準頁面結構與畫面規範 |
| `query-data-dictionary` | 查詢 HOTEL2000 飯店管理系統的資料表結構 |
| `get-api-architecture` | 查詢 GUIVueBA 專案的 API 通訊架構 |
| `audit-mobile-page` | vHTRGM09 客房平面圖頁面功能完整性檢查 |
| `get-architecture-guide` | 取得 GUIVueBA 前端開發樣式守衛規範 |

## 兩種運行模式

本套件支援兩種運行模式：

| 模式 | 傳輸方式 | 優點 | 缺點 |
|------|---------|------|------|
| **Stdio（預設）** | stdin/stdout | 簡單，Cursor 原生支援 | 每次呼叫都要重啟程序 |
| **HTTP Server** | HTTP/WebSocket | 速度快，可同時服務多個客戶端 | 需要管理進程 |

### Stdio 模式（預設，快速上手）

適合個人使用或快速測試。

### HTTP Server 模式（推薦，生產環境）

適合需要長期運行、高效能的場景。

---

## 安裝方式

### 模式一：Stdio 模式

#### 作為全域 MCP Server

```json
{
  "mcpServers": {
    "guivueba-skills": {
      "command": "npx",
      "args": ["-y", "@guivueba/skills-mcp"]
    }
  }
}
```

#### 作為本機全域安裝

```bash
npm install -g @guivueba/skills-mcp
```

```json
{
  "mcpServers": {
    "guivueba-skills": {
      "command": "guivueba-skills"
    }
  }
}
```

---

### 模式二：HTTP Server 模式

#### 1. 啟動 HTTP Server

```bash
# 安裝為全域套件
npm install -g @guivueba/skills-mcp

# 啟動伺服器（預設 127.0.0.1:3100）
guivueba-skills-http

# 或指定埠和主機
MCP_PORT=8080 MCP_HOST=0.0.0.0 guivueba-skills-http

# 也可用 node 直接執行
node dist/index-http.js
```

#### 2. 在 Cursor mcp.json 中設定 HTTP Client

```json
{
  "mcpServers": {
    "guivueba-skills": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/typescript-sdk", "src/cli.ts", "client", "--http", "http://127.0.0.1:3100/mcp"]
    }
  }
}
```

> **注意**：你需要本地安裝 `@modelcontextprotocol/typescript-sdk` 來使用 HTTP client。或者你可以直接使用 MCP SDK 的 CLI 工具。

---

## 使用方式

### 1. check-vqpattern-page

檢查頁面是否符合 vQPattern 標準：

```json
{
  "name": "check-vqpattern-page",
  "arguments": {
    "targetPage": "Security/SP/MobileHTL/vHTRGM09.html"
  }
}
```

### 2. query-data-dictionary

查詢資料表結構：

```json
{
  "name": "query-data-dictionary",
  "arguments": {
    "tableName": "VS"
  }
}
```

### 3. get-api-architecture

查詢 API 架構：

```json
{
  "name": "get-api-architecture",
  "arguments": {
    "topic": "crud"
  }
}
```

支援的主題：`basic`, `advanced`, `crud`, `report`, `example`

### 4. audit-mobile-page

審計頁面功能：

```json
{
  "name": "audit-mobile-page",
  "arguments": {
    "pageName": "vHTRGM09",
    "checkType": "all"
  }
}
```

支援的檢查類型：`all`, `buttons`, `structure`, `dependencies`

### 5. get-architecture-guide

取得樣式規範或檢查檔案：

```json
{
  "name": "get-architecture-guide",
  "arguments": {
    "action": "get-guide"
  }
}
```

或檢查檔案：

```json
{
  "name": "get-architecture-guide",
  "arguments": {
    "action": "check-file",
    "filePath": "Security/SP/MobileHTL/vHTRGM09.html"
  }
}
```

---

## HTTP Server API 端點

HTTP Server 模式提供以下 REST 端點：

| 端點 | 方法 | 說明 |
|------|------|------|
| `/mcp` | GET/POST | MCP JSON-RPC 端點 |
| `/health` | GET | 健康檢查 |
| `/tools` | GET | 工具列表（JSON 格式） |

### 健康檢查

```bash
curl http://127.0.0.1:3100/health
```

```json
{
  "status": "ok",
  "name": "guivueba-skills",
  "version": "1.0.0",
  "mode": "http",
  "tools": ["get-api-architecture", "get-architecture-guide", "check-vqpattern-page", "query-data-dictionary", "audit-mobile-page"]
}
```

### 工具列表

```bash
curl http://127.0.0.1:3100/tools
```

---

## 本地開發

```bash
# 克隆專案
git clone https://github.com/xx455157/guivueba-skills-mcp.git
cd guivueba-skills-mcp

# 安裝依賴
npm install

# 建置（同時建置 Stdio 和 HTTP 兩個入口）
npm run build

# 開發模式 - Stdio
npm run dev

# 開發模式 - HTTP Server
npm run dev:http

# 分別建置
npm run build        # Stdio 入口
npm run build:http   # HTTP 入口
```

---

## 發佈到 npm

```bash
# 登入 npm
npm login

# 發佈（需要 npm 組織權限）
npm publish --access public
```

注意：由於使用 `@guivueba` 前綴，你需要：
1. 在 npm 上建立 `guivueba` 組織，或
2. 將套件名稱改為你自己的名稱前綴（如 `@your-name/skills-mcp`）

---

## License

MIT
