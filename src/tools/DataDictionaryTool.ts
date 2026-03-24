/**
 * HOTEL2000 資料字典工具
 * 提供飯店管理系統資料表結構查詢
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = "D:/GUINet/WebRWD/GUIVueBA";

const DATA_TABLES: Record<string, { pk: string; description: string; fields: Record<string, string> }> = {
  RV: { pk: "RV01", description: "訂房檔 (Reservation)", fields: { RV01: "訂房號碼", RV05: "訂房類別", RV06: "訂房狀況", RV07: "登記狀況", RV29: "網路訂房號碼" } },
  VS: { pk: "VS24", description: "住宿檔 (Visit/Stays)", fields: { VS01: "訂房號碼", VS02: "客戶號碼", VS03: "入住日期", VS04: "退房日期", VS06: "房號", VS17: "登記狀況", VS24: "住宿號碼" } },
  GR: { pk: "GR01", description: "旅客檔 (Guest Record)", fields: { GR01: "旅客碼", GR03: "旅客名稱", GR06: "會員號碼", GR10: "證件號碼", GR13: "國籍" } },
  HF: { pk: "HF01", description: "帳單檔 (House Folio)", fields: { HF01: "帳單號碼", HF03: "住宿號碼" } },
  FX: { pk: "FX001,FX002", description: "帳務交易檔 (Foc Transaction)", fields: { FX01: "帳單號碼", FX04: "科目代碼", FX05: "金額", FX25: "資料來源" } },
  HK: { pk: "HK01", description: "房務檔 (Housekeeping)", fields: { HK01: "房號", HK02: "房間類別", HK05: "房務管制" } },
  RT: { pk: "RT01", description: "房型檔 (Room Type)", fields: { RT01: "房型代碼", RT02: "房型名稱" } },
};

export class DataDictionaryTool implements Tool {
  [key: string]: any;
  name = "query-data-dictionary";
  description = "查詢 HOTEL2000 飯店管理系統的資料表結構。當需要查詢特定資料表的所有欄位、確認主鍵和索引、了解欄位的業務意義、確認資料表之間的關聯，或進行資料庫開發或維護時使用此工具。";
  inputSchema = {
    type: "object",
    properties: {
      tableName: { type: "string", description: "資料表名稱 (例如: RV, VS, GR, HF, FX, HK, RT)" },
      fieldName: { type: "string", description: "要查詢的特定欄位 (可選)" },
    },
    required: ["tableName"],
  } as any;

  async run(params: any): Promise<string> {
    const { tableName, fieldName } = params;

    try {
      const tableNameUpper = tableName.toUpperCase();
      const table = DATA_TABLES[tableNameUpper];

      if (!table) {
        const fullDictPath = path.join(PROJECT_ROOT, ".cursor/skills/hotel2000-data-dictionary/references/full-data-dictionary.md");
        if (fs.existsSync(fullDictPath)) {
          const content = fs.readFileSync(fullDictPath, "utf-8");
          const lines = content.split("\n");
          const relevantLines: string[] = [];
          let inTable = false;
          for (const line of lines) {
            if (line.includes(tableNameUpper) || line.includes(tableName)) {
              inTable = true;
            }
            if (inTable) {
              relevantLines.push(line);
              if (relevantLines.length > 100) break;
            }
          }
          if (relevantLines.length > 0) {
            return "📚 **" + tableNameUpper + " 資料表資訊**\n\n" + relevantLines.join("\n");
          }
        }
        return "❌ 找不到資料表: " + tableNameUpper + "\n\n可用資料表: " + Object.keys(DATA_TABLES).join(", ");
      }

      let report = "# 📊 " + tableNameUpper + " 資料表結構\n\n";
      report += "## 基本資訊\n";
      report += "- **說明**: " + table.description + "\n";
      report += "- **主鍵**: " + table.pk + "\n\n";

      if (fieldName) {
        const fieldKey = fieldName.toUpperCase();
        if (table.fields[fieldKey]) {
          report += "## 欄位詳情: " + fieldKey + "\n";
          report += "- **說明**: " + table.fields[fieldKey] + "\n";
        } else {
          report += "❌ 找不到欄位: " + fieldKey + "\n";
        }
      } else {
        report += "## 欄位結構\n";
        report += "| 欄位 | 說明 |\n";
        report += "|------|------|\n";
        for (const [field, desc] of Object.entries(table.fields)) {
          report += "| " + field + " | " + desc + " |\n";
        }
      }

      report += "\n## 相關資料表關聯\n";
      if (tableNameUpper === "VS") {
        report += "- VS01 → RV.RV00\n- VS04 → RT.RT01\n- VS06 → HK.HK01\n";
      } else if (tableNameUpper === "HF") {
        report += "- HF03 → VS.VS24\n";
      } else if (tableNameUpper === "FX") {
        report += "- FX01 → HF.HF01\n- FX04 = '01' (房價), '02' (服務費)\n";
      }

      return report;
    } catch (error) {
      return "❌ 執行錯誤: " + (error instanceof Error ? error.message : String(error));
    }
  }
}
