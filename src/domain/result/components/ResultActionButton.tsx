/* eslint-disable perfectionist/sort-switch-case */
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AnalysisConfirmDialog } from "@/domain/result/components/AnalysisConfirmDialog";
import { AnalysisLoading } from "@/domain/result/components/AppLoading";
import { DebugFloatingWindow } from "@/domain/result/components/debug/DebugFloatingWindow";
import { ErrorDialog } from "@/domain/result/components/ErrorDialog";
import { ResultDialog } from "@/domain/result/components/ResultDialog";
import { SaveDialog } from "@/domain/result/components/SaveDialog";
// mock data test
// import { RESPONSE_DATA_V2 } from "@/domain/result/constants/mock.response";
import { useAnalysisButton } from "@/domain/result/hooks/useAnalysisButton";

export const ResultActionButton = () => {
  const { dialogData, handleClick, handleCloseDialog, isOpen, setDialogData } = useAnalysisButton();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleAnalysisClick = () => {
    setIsMinimized(false); // DebugDialog를 최대화 상태로 설정
    handleClick();
  };

  return (
    <>
      <Button
        className="h-full w-full rounded-none px-6 py-2 text-base font-semibold"
        onClick={handleAnalysisClick}
      >
        분석하기
      </Button>

      {isOpen &&
        (() => {
          switch (dialogData.status) {
            case "debug-required": // 1. 필수 디버깅
            case "debug-optional": // 2. 권장 디버깅
              return (
                <DebugFloatingWindow
                  debugResult={dialogData.data}
                  isMinimized={isMinimized}
                  isOpen={isOpen}
                  onClose={handleCloseDialog}
                  setDialogData={setDialogData}
                  setIsMinimized={setIsMinimized}
                  type={dialogData.status}
                />
                // <ResultDialog data={RESPONSE_DATA_V2} isOpen={isOpen} onClose={handleCloseDialog} />
              );

            // 2. 저장
            case "save":
              return (
                <SaveDialog
                  isOpen={isOpen}
                  onClose={handleCloseDialog}
                  setDialogData={setDialogData}
                />
              );

            // 3. 분석 확인
            case "ready":
              return (
                <AnalysisConfirmDialog
                  isOpen={isOpen}
                  onClose={handleCloseDialog}
                  setDialogData={setDialogData}
                />
              );

            // 4. 로딩
            case "loading":
              return <AnalysisLoading />;

            // 5.1 분석 성공
            case "success":
              return (
                <ResultDialog data={dialogData.data} isOpen={isOpen} onClose={handleCloseDialog} />
              );

            // 5.2 분석 실패
            case "error":
              return <ErrorDialog isOpen={isOpen} onClose={handleCloseDialog} />;

            default:
              return null;
          }
        })()}
    </>
  );
};
