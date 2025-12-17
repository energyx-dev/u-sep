import { toast } from "sonner";

type TDownloadOptions = {
  /** 저장할 데이터 (문자열 또는 직렬화 가능한 객체) */
  data: object | string;
  /** 파일 확장자 (기본: txt) */
  extension?: string;
  /** 파일 이름 (확장자 제외) */
  filename?: string;
  /** MIME 타입 (기본: text/plain) */
  mimeType?: string;
};

/**
 * 클라이언트 측 파일 다운로드 헬퍼
 */
export const downloadFile = ({
  data,
  extension = "txt",
  filename = "download",
  mimeType = "text/plain",
}: TDownloadOptions) => {
  try {
    const isObject = typeof data === "object";
    let content: string;

    if (isObject) {
      try {
        content = JSON.stringify(data, null, 2);
      } catch (jsonError) {
        console.error("🚫 JSON 직렬화 실패:", jsonError);
        return;
      }
    } else {
      content = String(data);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const now = new Date();

    // 한국 시간 기준으로 포맷
    const timestamp = now
      .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }) // "2025-05-07 15:13:25"
      .replace(" ", "_")
      .replace(/:/g, "-");

    link.download = `${filename}_${timestamp}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
  }
};

/**
 * electron 파일 열기
 */
export const openJsonFile = async <T>() => {
  try {
    const { content, name, path } = await window.fileApi.openFile();
    if (content) {
      const parsedContent = JSON.parse(content);
      return {
        data: parsedContent as T,
        name,
        path,
      };
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      toast.error("파일 형식이 올바르지 않습니다.");
    } else {
      toast.error("알 수 없는 에러가 발생했습니다.");
    }
  }
};

/**
 * electron 파일 저장
 */
export const saveJsonFile = async <T>({
  data,
  defaultPath,
  fileName,
}: {
  data: T;
  defaultPath: null | string;
  fileName?: string;
}) => {
  return await window.fileApi.saveFile({ data, defaultPath, fileName });
};
