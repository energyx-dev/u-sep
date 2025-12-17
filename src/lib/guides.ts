export const downloadManualPdf = async () => {
  const isElectron = typeof window !== "undefined" && window.fileApi?.downloadManual;

  if (isElectron) {
    const result = await window.fileApi.downloadManual();

    if (!result?.success) {
      console.error("매뉴얼 저장 실패:", result?.error);
    }

    return;
  }

  const link = document.createElement("a");
  link.href = `${window.location.origin}/U-SEP 사용 매뉴얼.pdf`;
  link.download = "U-SEP 사용 매뉴얼.pdf";
  link.click();
};
