/**
 * vQPattern 頁面檢查工具
 * 檢查指定網頁是否符合 GUIVueBA 專案的 vQPattern 標準頁面結構與畫面規範
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// 專案根目錄
const PROJECT_ROOT = "D:/GUINet/WebRWD/GUIVueBA";

export class CheckVQLayoutTool implements Tool {
  [key: string]: any;
  name = "check-vqpattern-page";
  description =
    "檢查指定網頁是否符合 GUIVueBA 專案的 vQPattern 標準頁面結構與畫面規範。當使用者要求：(1) 檢查某個網頁是否符合 vQPattern 標準，(2) 比對某個頁面與 vQPattern 的差異，(3) 確認某頁面是否能照另一個頁面改，(4) 檢查頁面是否遵循標準 Pattern 規範時使用此工具。";
  inputSchema = {
    type: "object",
    properties: {
      targetPage: {
        type: "string",
        description: "目標頁面路徑 (例如: Security/SP/MobileHTL/vHTRGM09.html)",
      },
      compareWithScreen: {
        type: "string",
        description: "要比較畫面的頁面路徑 (可選)",
      },
    },
    required: ["targetPage"],
  } as any;

  async run(params: any): Promise<string> {
    const { targetPage, compareWithScreen } = params;

    try {
      const targetPath = path.join(PROJECT_ROOT, targetPage);
      const patternPath = path.join(PROJECT_ROOT, "Security/SP/MobilePTN/vQPattern.html");
      const rulesPath = path.join(PROJECT_ROOT, "docs/pattern/vqpattern/README.md");

      if (!fs.existsSync(targetPath)) {
        return `❌ 錯誤：目標頁面不存在 - ${targetPage}`;
      }

      const targetContent = fs.readFileSync(targetPath, "utf-8");
      const patternContent = fs.existsSync(patternPath) ? fs.readFileSync(patternPath, "utf-8") : "";
      const rulesContent = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf-8") : "";

      return generateCheckReport(targetPage, targetContent, patternContent, rulesContent, compareWithScreen);
    } catch (error) {
      return `❌ 執行錯誤: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

function generateCheckReport(
  targetPage: string,
  targetContent: string,
  patternContent: string,
  rulesContent: string,
  compareWithScreen?: string
): string {
  const checks: string[] = [];
  const violations: string[] = [];
  const suggestions: string[] = [];

  const hasElContainer = targetContent.includes("el-container");
  const hasElHeader = targetContent.includes("el-header");
  const hasElMain = targetContent.includes("el-main");
  checks.push(`✅ HTML 結構: el-container=${hasElContainer}, el-header=${hasElHeader}, el-main=${hasElMain}`);

  const hasDynamicScript = targetContent.includes("g$.ScriptLoader") || targetContent.includes("loadScripts");
  checks.push(hasDynamicScript ? "✅ Script 載入: 使用動態載入" : "⚠️ Script 載入: 未使用動態載入");

  const hasCreateApp = targetContent.includes("createApp");
  const hasSetup = targetContent.includes("setup(");
  const hasInitializeComponents = targetContent.includes("initializeComponents");
  checks.push(`✅ Vue 初始化: createApp=${hasCreateApp}, setup=${hasSetup}, initializeComponents=${hasInitializeComponents}`);

  const hasElForm = targetContent.includes("el-form");
  const hasElTable = targetContent.includes("el-table");
  const hasElDialog = targetContent.includes("el-dialog");
  checks.push(`✅ Element Plus: el-form=${hasElForm}, el-table=${hasElTable}, el-dialog=${hasElDialog}`);

  const hasGetLang = targetContent.includes("GetLang(");
  checks.push(hasGetLang ? "✅ 多語系: 使用 GetLang()" : "❌ 多語系: 未使用 GetLang()");
  if (!hasGetLang) violations.push("未使用 GetLang() 函式");

  const hasTailwind =
    targetContent.includes("class=\"") &&
    (targetContent.includes("flex") ||
      targetContent.includes("grid") ||
      targetContent.includes("px-") ||
      targetContent.includes("py-") ||
      targetContent.includes("w-") ||
      targetContent.includes("h-"));
  checks.push(hasTailwind ? "✅ Tailwind CSS: 已使用" : "⚠️ Tailwind CSS: 可能未使用");

  const inlineStyleRegex = /\bstyle\s*=\s*["'][^"']*["']/gi;
  const inlineStyles = targetContent.match(inlineStyleRegex);
  if (inlineStyles && inlineStyles.length > 0) {
    violations.push(`發現 ${inlineStyles.length} 處 inline style 違規`);
    suggestions.push("移除所有 inline style，改用 Tailwind 類名");
  } else {
    checks.push("✅ 樣式規範: 無 inline style 違規");
  }

  const hasAPIConst = targetContent.includes("g$.APIConst");
  checks.push(hasAPIConst ? "✅ API 定義: 使用 g$.APIConst" : "⚠️ API 定義: 未使用 g$.APIConst");

  let report = `# ${path.basename(targetPage)} 檢查報告\n\n`;
  report += `## 📋 基本資訊\n`;
  report += `- **目標頁面**: ${targetPage}\n`;
  report += `- **檢查時間**: ${new Date().toLocaleString("zh-TW")}\n\n`;

  report += `## ✅ 符合項目\n`;
  checks.forEach((check) => {
    report += `- ${check}\n`;
  });

  if (violations.length > 0) {
    report += `\n## ❌ 違規項目\n`;
    violations.forEach((v) => {
      report += `- ${v}\n`;
    });
  }

  if (suggestions.length > 0) {
    report += `\n## 💡 建議修改\n`;
    suggestions.forEach((s) => {
      report += `- ${s}\n`;
    });
  }

  report += `\n## 📊 總結\n`;
  report += `- ✅ 符合項目: ${checks.length} 項\n`;
  report += `- ❌ 違規項目: ${violations.length} 項\n`;
  report += `- 💡 建議項目: ${suggestions.length} 項\n`;

  if (violations.length === 0 && suggestions.length === 0) {
    report += `\n🎉 **頁面完全符合 vQPattern 標準！**\n`;
  } else if (violations.length === 0) {
    report += `\n👍 **頁面基本符合標準，建議優化以上項目。**\n`;
  } else {
    report += `\n⚠️ **頁面需要修改以符合標準。**\n`;
  }

  return report;
}
