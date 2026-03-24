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

## 安裝方式

### 作為全域 MCP Server

在 Cursor 的 `mcp.json` 中新增設定：

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

### 作為本機 MCP Server

```bash
npm install -g @guivueba/skills-mcp
```

然後在 `mcp.json` 中設定：

```json
{
  "mcpServers": {
    "guivueba-skills": {
      "command": "guivueba-skills"
    }
  }
}
```

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

## 本地開發

```bash
# 克隆專案
git clone https://github.com/YOUR_USERNAME/guivueba-skills-mcp.git
cd guivueba-skills-mcp

# 安裝依賴
npm install

# 開發模式（熱重載）
npm run dev

# 建置
npm run build
```

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

## License

MIT
