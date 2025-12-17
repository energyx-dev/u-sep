import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const themePath = join(__dirname, "../src/styles/themeColor.ts");
const cssPath = join(__dirname, "../src/styles/global.color.css");

function generateCSSVariables(): void {
  const themeContent = readFileSync(themePath, "utf8");

  const themeMatch = themeContent.match(/export const themeColor = ({[\s\S]*?}) as const;/);
  if (!themeMatch) {
    throw new Error("theme.ts 파일에서 theme 객체를 찾을 수 없습니다.");
  }

  const themeStr = themeMatch[1];
  const theme = eval(`(${themeStr})`) as Record<string, unknown>;

  let cssContent = readFileSync(cssPath, "utf8");

  const cssVarMap: Record<string, string> = {};
  const inlineVarMap: Record<string, string> = {};

  function processObject(obj: Record<string, unknown>, path: string[] = []): void {
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = [...path, key];
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      if (typeof value === "object" && value !== null) {
        processObject(value as Record<string, unknown>, newPath);
      } else {
        const flatKey = kebabKey;
        const inlineKey = newPath.map((k) => k.replace(/([A-Z])/g, "-$1").toLowerCase()).join("-");

        cssVarMap[`--${flatKey}`] = String(value);
        inlineVarMap[`--color-${inlineKey}`] = `var(--${flatKey})`;
      }
    });
  }

  processObject(theme);

  const updateSection = (
    content: string,
    sectionName: string,
    newVars: Record<string, string>,
  ): string => {
    const regex = new RegExp(`${sectionName}\\s*{([\\s\\S]*?)}`, "m");
    const match = content.match(regex);

    const existingVars: Record<string, string> = {};
    if (match) {
      const body = match[1];
      body.split(";").forEach((line) => {
        const parts = line.trim().split(":");
        if (parts.length === 2) {
          existingVars[parts[0].trim()] = parts[1].trim();
        }
      });
    }

    const newSection =
      `${sectionName} {\n` +
      Object.entries(newVars)
        .map(([key, val]) => `  ${key}: ${val};`)
        .join("\n") +
      `\n}`;

    if (match) {
      return content.replace(regex, newSection);
    } else {
      return content + `\n\n${newSection}`;
    }
  };

  cssContent = updateSection(cssContent, ":root", cssVarMap);
  cssContent = updateSection(cssContent, "@theme inline", inlineVarMap);

  writeFileSync(cssPath, cssContent);
  console.log("✅ Theme variables updated successfully");
}

// 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const isDev = process.argv.includes("--dev");

  if (isDev) {
    // 개발 모드: 10분마다 실행
    console.log("🔄 Starting theme variable watcher in development mode...");
    setInterval(generateCSSVariables, 10 * 60 * 1000);
    // 초기 실행
    generateCSSVariables();
  } else {
    // 빌드 모드: 한 번만 실행
    generateCSSVariables();
  }
}
