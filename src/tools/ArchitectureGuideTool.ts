/**
 * GUIVueBA 樣式守衛工具
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = "D:/GUINet/WebRWD/GUIVueBA";

export class ArchitectureGuideTool implements Tool {
  [key: string]: any;
  name = "get-architecture-guide";
  description = "取得 GUIVueBA 前端開發樣式守衛規範。當需要了解前端樣式規範、檢查是否有 inline style 違規，或需要參考 Tailwind CSS 使用方式時使用此工具。";
  inputSchema = {
    type: "object",
    properties: {
      action: { type: "string", description: "要執行的操作 (get-guide/check-file)", enum: ["get-guide", "check-file"] },
      filePath: { type: "string", description: "要檢查的檔案路徑 (當 action=check-file 時)" },
    },
    required: ["action"],
  } as any;

  async run(params: any): Promise<string> {
    const { action, filePath } = params;

    if (action === "get-guide") {
      return getStyleGuardGuide();
    }

    if (action === "check-file" && filePath) {
      try {
        const fullPath = path.join(PROJECT_ROOT, filePath);
        if (!fs.existsSync(fullPath)) {
          return "❌ 檔案不存在: " + filePath;
        }
        const content = fs.readFileSync(fullPath, "utf-8");
        const violations = checkStyleViolations(content);

        let report = "# 🔍 樣式規範檢查報告\n\n";
        report += "**檔案**: " + filePath + "\n\n";

        if (violations.length === 0) {
          report += "✅ **無違規！**\n此檔案符合 GUIVueBA 樣式規範。\n";
        } else {
          report += "❌ **發現 " + violations.length + " 處違規！**\n\n";
          violations.forEach((v, index) => {
            report += "### " + (index + 1) + ". " + v.type + "\n";
            report += "**位置**: 第 " + v.line + " 行\n";
            report += "**內容**: ```" + v.snippet + "```\n";
            report += "**建議**: " + v.suggestion + "\n\n";
          });
          report += "## 修復要求\n\n請移除所有 inline style，改用 Tailwind 類名。\n";
        }
        return report;
      } catch (error) {
        return "❌ 執行錯誤: " + (error instanceof Error ? error.message : String(error));
      }
    }

    return "❌ 未知操作: " + action;
  }
}

function getStyleGuardGuide(): string {
  return `# 🎨 GUIVueBA 樣式守衛規範

## 核心強制規則

### 1. 禁止使用 style 設定樣式

**任何情況下，都不可以使用：**

- ❌ HTML \`style=""\`
- ❌ Vue \`:style="..."\`
- ❌ Vue \`v-bind:style="..."\`
- ❌ JavaScript \`element.style.xxx = ...\`
- ❌ jQuery \`.css(...)\`

---

## 2. 樣式只能使用 Tailwind 類名

所有畫面樣式控制，**只能**透過：

- ✅ Tailwind utility classes
- ✅ Element Plus 元件屬性
- ✅ 專案既有全域共用樣式

---

## 3. 常見 Tailwind 類名

| 需求 | Tailwind 類名 |
|------|--------------|
| 寬度 | \`w-full\`, \`w-[120px]\` |
| 高度 | \`h-full\`, \`h-[42px]\` |
| 間距 | \`px-4\`, \`py-2\`, \`mt-2\` |
| 文字 | \`text-sm\`, \`text-lg\` |
| 顏色 | \`text-red-500\`, \`bg-blue-500\` |
| Flex | \`flex\`, \`items-center\`, \`justify-between\` |
| 邊框 | \`border\`, \`border-gray-300\` |
| 圓角 | \`rounded\`, \`rounded-md\` |
| 隱藏 | \`hidden\`, \`block\` |

---

## 4. 違規示例

**錯誤 ❌**
\`\`\`html
<div style="display:flex;padding:8px;">
    <span style="font-size:14px;">標題</span>
</div>
\`\`\`

**正確 ✅**
\`\`\`html
<div class="flex px-2">
    <span class="text-sm">標題</span>
</div>
\`\`\`

---

## 5. 快速檢查清單

在輸出任何前端程式碼前，檢查是否有：

- ❌ \`style=\`
- ❌ \`:style=\`
- ❌ \`v-bind:style\`
- ❌ \`.style.\`
- ❌ \`.css(\`

只要存在其中任一項，就代表輸出不合格！
`;
}

interface Violation {
  type: string;
  line: number;
  snippet: string;
  suggestion: string;
}

function checkStyleViolations(content: string): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const styleMatch = line.match(/\bstyle\s*=\s*["']([^"']*?)["']/i);
    if (styleMatch) {
      violations.push({ type: "inline style 屬性", line: index + 1, snippet: line.trim().substring(0, 100), suggestion: "移除 style 屬性，使用 Tailwind 類名替代" });
    }
    const vBindStyleMatch = line.match(/:style\s*=\s*["']([^"']*?)["']/);
    if (vBindStyleMatch) {
      violations.push({ type: "Vue :style 綁定", line: index + 1, snippet: line.trim().substring(0, 100), suggestion: "移除 :style，改用 Tailwind 動態類名" });
    }
    if (line.includes("v-bind:style")) {
      violations.push({ type: "Vue v-bind:style", line: index + 1, snippet: line.trim().substring(0, 100), suggestion: "移除 v-bind:style，改用 Tailwind 動態類名" });
    }
    if (line.includes(".style.") && !line.includes("//")) {
      violations.push({ type: "JavaScript style 操作", line: index + 1, snippet: line.trim().substring(0, 100), suggestion: "避免操作 DOM style，改用 classList.add/remove" });
    }
    if (line.includes("<style") || line.includes("</style>")) {
      violations.push({ type: "<style> 區塊", line: index + 1, snippet: line.trim().substring(0, 100), suggestion: "移除 <style> 區塊，使用 Tailwind 類名" });
    }
  });

  return violations;
}
