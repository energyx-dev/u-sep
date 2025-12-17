import { useState } from "react";

/**
 * 파일 열기 훅
 * @returns 파일 데이터
 */
export const useFileOpen = () => {
  const [fileData, setFileData] = useState<unknown>(null);

  const handleFileOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === "string") {
            try {
              setFileData(JSON.parse(content));
            } catch {
              setFileData(content);
            }
          }
        };

        reader.onerror = () => {
          console.error("파일 읽기 오류 발생");
        };

        reader.readAsText(file);
      }
    };
    input.click();
  };

  return { fileData, handleFileOpen };
};
