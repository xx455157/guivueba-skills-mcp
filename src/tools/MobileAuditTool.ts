/**
 * vHTRGM09 頁面審計工具
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = "D:/GUINet/WebRWD/GUIVueBA";

export class MobileAuditTool implements Tool {
  [key: string]: any;
  name = "audit-mobile-page";
  description = "vHTRGM09 客房平面圖頁面功能完整性檢查。提供頁面按鈕互動檢測、floorplan 參考比對、vQPattern 框架規範驗證。";
  inputSchema = {
    type: "object",
    properties: {
      pageName: { type: "string", description: "要審計的頁面名稱 (預設: vHTRGM09)" },
      checkType: { type: "string", description: "檢查類型 (all/buttons/structure/dependencies)", enum: ["all", "buttons", "structure", "dependencies"] },
    },
  } as any;

  async run(params: any): Promise<string> {
    const { pageName = "vHTRGM09", checkType = "all" } = params;

    try {
      const pagePath = path.join(PROJECT_ROOT, "Security/SP/MobileHTL/" + pageName + ".html");
      const floorplanPath = path.join(PROJECT_ROOT, "Security/SP/MobileHTL/floorplan.html");

      if (!fs.existsSync(pagePath)) {
        return "❌ 錯誤：頁面不存在 - " + pageName + ".html";
      }

      const pageContent = fs.readFileSync(pagePath, "utf-8");
      const floorplanContent = fs.existsSync(floorplanPath) ? fs.readFileSync(floorplanPath, "utf-8") : "";

      let report = "# 🔍 " + pageName + " 頁面審計報告\n\n";
      report += "**檢查時間**: " + new Date().toLocaleString("zh-TW") + "\n";
      report += "**檢查類型**: " + checkType + "\n\n";

      if (checkType === "all" || checkType === "structure") {
        report += "## 📐 結構檢查\n\n";
        const hasElContainer = pageContent.includes("el-container");
        const hasElHeader = pageContent.includes("el-header");
        const hasElMain = pageContent.includes("el-main");
        report += "- el-container: " + (hasElContainer ? "✅" : "❌") + " | el-header: " + (hasElHeader ? "✅" : "❌") + " | el-main: " + (hasElMain ? "✅" : "❌") + "\n";
        const hasDynamicScript = pageContent.includes("g$.ScriptLoader") || pageContent.includes("loadScripts");
        report += "- Script 載入: " + (hasDynamicScript ? "✅ 動態" : "⚠️ 靜態") + "\n";
        const hasCreateApp = pageContent.includes("createApp");
        report += "- Vue 初始化: " + (hasCreateApp ? "✅ createApp" : "⚠️ 其他") + "\n";
        const hasGetLang = pageContent.includes("GetLang(");
        report += "- 多語系: " + (hasGetLang ? "✅ GetLang()" : "❌ 未使用") + "\n";
        const hasTailwind = pageContent.includes("class=\"") && (pageContent.includes("flex") || pageContent.includes("px-") || pageContent.includes("w-"));
        report += "- Tailwind CSS: " + (hasTailwind ? "✅" : "⚠️") + "\n\n";
      }

      if (checkType === "all" || checkType === "buttons") {
        report += "## 🔘 按鈕與互動檢查\n\n";
        const buttonPatterns = [
          { pattern: /<button[^>]*>/gi, name: "原生 button" },
          { pattern: /<el-button/gi, name: "el-button" },
          { pattern: /onclick\s*=/gi, name: "onclick" },
          { pattern: /@click\s*=/gi, name: "@click" },
        ];
        buttonPatterns.forEach(({ pattern, name }) => {
          const matches = pageContent.match(pattern);
          report += "- " + name + ": " + (matches ? matches.length : 0) + " 處\n";
        });
        report += "\n";
      }

      if (checkType === "all" || checkType === "dependencies") {
        report += "## 📦 依賴資源檢查\n\n";
        const jsPattern = /<script[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
        const jsMatches = pageContent.match(jsPattern);
        if (jsMatches) {
          report += "**JavaScript 檔案** (" + jsMatches.length + " 個):\n";
          jsMatches.forEach((match) => {
            const srcMatch = match.match(/src\s*=\s*["']([^"']+)["']/);
            if (srcMatch) {
              const jsPath = srcMatch[1];
              const fullPath = path.join(PROJECT_ROOT, jsPath.replace(/\.\.\//g, ""));
              const exists = fs.existsSync(fullPath);
              report += "- " + jsPath + ": " + (exists ? "✅" : "❌") + "\n";
            }
          });
        }
        report += "\n";
      }

      if (floorplanContent) {
        report += "## 📊 與 floorplan.html 比較\n\n";
        const floorplanFeatures = [
          { pattern: /arrival|到達/i, name: "到達人數" },
          { pattern: /floor|樓層/i, name: "樓層選擇" },
          { pattern: /status|狀態/i, name: "狀態切換" },
          { pattern: /room|房間/i, name: "房間點擊" },
          { pattern: /dialog|對話框/i, name: "詳情對話框" },
        ];
        floorplanFeatures.forEach(({ pattern, name }) => {
          const inPage = pattern.test(pageContent);
          report += "- " + name + ": " + (inPage ? "✅" : "⚠️") + "\n";
        });
        report += "\n";
      }

      report += "## 📋 審計總結\n\n";
      const inlineStyleRegex = /\bstyle\s*=\s*["'][^"']*["']/gi;
      const issueCount = (pageContent.match(inlineStyleRegex) || []).length;
      const hasGetLang = pageContent.includes("GetLang(");
      const hasTailwind = pageContent.includes("px-") || pageContent.includes("w-");
      report += "- ⚠️ inline style: " + issueCount + " 處\n";
      report += "- 📝 多語系: " + (hasGetLang ? "✅ GetLang()" : "❌ 未使用") + "\n";
      report += "- 🎨 Tailwind: " + (hasTailwind ? "✅" : "⚠️") + "\n";

      return report;
    } catch (error) {
      return "❌ 執行錯誤: " + (error instanceof Error ? error.message : String(error));
    }
  }
}
