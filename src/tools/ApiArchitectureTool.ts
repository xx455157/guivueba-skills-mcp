/**
 * GUIVueBA API 架構工具
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ApiArchitectureTool implements Tool {
  [key: string]: any;
  name = "get-api-architecture";
  description = "查詢 GUIVueBA 專案的 API 通訊架構。當使用者詢問 API 架構、API 呼叫方式、開發新的 REST API，或需要參考 API 標準範例時使用此工具。";
  inputSchema = {
    type: "object",
    properties: {
      topic: { type: "string", description: "要查詢的主題 (basic/advanced/crud/report/example)", enum: ["basic", "advanced", "crud", "report", "example"] },
      apiName: { type: "string", description: "要查詢的 API 範例名稱 (可選)" },
    },
    required: ["topic"],
  } as any;

  async run(params: any): Promise<string> {
    const { topic, apiName } = params;
    const topicLower = topic.toLowerCase();

    switch (topicLower) {
      case "basic": return getBasicApiGuide();
      case "advanced": return getAdvancedApiGuide();
      case "crud": return getCrudExample();
      case "report": return getReportExample();
      case "example": return getApiExample(apiName);
      default: return getBasicApiGuide();
    }
  }
}

function getBasicApiGuide(): string {
  return `# 📡 GUIVueBA API 通訊架構 - 基礎指南

## 一、架構總覽
前端 (GUIVueBA) → 後端 (ASP.NET Core) → 資料層
- g$.CallRestAPI() - 發送 HTTP 請求
- g$.APIConst - API 路徑定義
- g$.TextFunc.Format() - 參數格式化

## 二、API 呼叫方式
\`\`\`javascript
g$.CallRestAPI({ apiUrl: g$.APIConst.pattern.customers_getRow })
g$.CallRestAPI({ apiUrl: g$.TextFunc.Format(g$.APIConst.pattern.private.vqpattern_query, companyId, currentPage) })
\`\`\`

## 三、API 命名規範
| 類型 | 命名規則 | 範例 |
|------|----------|------|
| 查詢多筆 | getData/query | getHelpPaging |
| 查詢單筆 | getRow | 'pattern/customers/{0}' |
| 新增 | insert | 'pattern/customers' |
| 更新 | update | 'pattern/customers/{0}' |
| 刪除 | delete | 'pattern/customers/{0}' |
| 報表 | report | 'pattern/private/vscr01/report' |
`;
}

function getAdvancedApiGuide(): string {
  return `# 📡 GUIVueBA API 通訊架構 - 進階指南

## 完整呼叫參數
\`\`\`javascript
const result = await g$.CallRestAPI({
    apiUrl: g$.TextFunc.Format(g$.APIConst.pattern.private.vqpattern_query, companyId, currentPage),
    callType: g$.Const.apiMethods.post,
    queryParams: { rowsPerPage: 20, sortField: 'createDate' },
    bodyContent: { filterConditions: {} },
});
\`\`\`

## REST API 路徑規則: {系統}/{模組}/{功能}/{動作}
| 層級 | 範例 | 說明 |
|------|------|------|
| 系統 | pattern, as, htl | 大分類 |
| 模組 | customers, employees | 業務模組 |
| 功能 | query, help, trans | 功能區分 |
| 動作 | insert, update, delete | CRUD |
`;
}

function getCrudExample(): string {
  return `# 📝 CRUD API 開發範例

## 前端 API 定義
\`\`\`javascript
if (!g$.APIConst.pattern) g$.APIConst.pattern = {};
if (!g$.APIConst.pattern.private) g$.APIConst.pattern.private = {};
g$.APIConst.pattern.private = {
    vqpattern_query: 'pattern/vqpattern/query/{0}/pages/{1}',
    vqpattern_getRow: 'pattern/vqpattern/{0}',
    vqpattern_insert: 'pattern/vqpattern/insert',
    vqpattern_update: 'pattern/vqpattern/{0}',
    vqpattern_delete: 'pattern/vqpattern/{0}',
};
\`\`\`

## 後端 Controller
\`\`\`csharp
[Route("pattern/[controller]")]
public class CustomersController : GUIAppAuthController {
    [HttpPost("query/{customerIds}/{customerIde}/pages/{pageNo}")]
    public MdPTNCustomers_p GetData(...) { return BlT01.GetData(...); }
    [HttpGet("{customerId}")]
    public MdPTNCustomer GetRow(string customerId) { return BlT01.GetRow(customerId); }
    [HttpPost]
    public MdApiMessage Insert([FromBody] MdPTNCustomer obj) { return HttpContext.Response.InsertSuccess(BlT01.ProcessInsert(obj)); }
    [HttpPut("{customerId}")]
    public MdApiMessage Update(string customerId, [FromBody] MdPTNCustomer obj) { return HttpContext.Response.UpdateSuccess(BlT01.ProcessUpdate(customerId, obj)); }
    [HttpDelete("{customerId}")]
    public MdApiMessage Delete(string customerId) { return HttpContext.Response.DeleteSuccess(BlT01.ProcessDelete(customerId)); }
}
\`\`\`
`;
}

function getReportExample(): string {
  return `# 📊 報表 API 開發範例

\`\`\`csharp
[Route("pattern/private/[controller]")]
public class vSCR01Controller : GUIAppAuthController {
    [HttpPost("report")]
    public async Task<IActionResult> GetReport([FromBody] MdReportQuery<MdSCR01_q> obj) {
        var _info = await BlMain.GetReport(obj);
        if (_info.Contents != null) return this.SendFileOrUtf8Text(_info.Contents, _info.FileName);
        return BadRequest(HttpContext.Response.SendReportNoQueryData());
    }
}
\`\`\`
`;
}

function getApiExample(apiName?: string): string {
  if (!apiName) return `# 📋 API 範例總覽\n\n| 主題 | 說明 |\n|------|------|\n| basic | API 基礎呼叫方式 |\n| advanced | 完整參數說明 |\n| crud | CRUD API 開發範例 |\n| report | 報表 API 開發範例 |`;

  if (apiName.toLowerCase() === "vhtrgm09") {
    return `# 📊 vHTRGM09 房價稽核 API\n\n前端呼叫:\n\`\`\`javascript\nconst result = await g$.CallRestAPI({\n    apiUrl: g$.TextFunc.Format(g$.APIConst.htl.reports.priceAudit, setupDates, setupDatee),\n    callType: g$.Const.apiMethods.post,\n    queryParams: { floor: floor || '', roomNo: roomNo || '' },\n    bodyContent: filterModel,\n});\n\`\`\`\n\n後端 endpoint: POST /htlpre/Reports/PriceAudit\n\n關鍵資料表關聯:\n- HTHF.FX01 → HTFX.FX01\n- HTVS.VS24 → HTHF.HF03\n- HTFX.FX04 = '01' (房價), '02' (服務費)\n`;
  }

  return "❌ 找不到 API 範例: " + apiName;
}
