import { ReactNode, useEffect } from "react";
import { useBeforeUnload, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { useFileStore } from "@/store/file.store";

type TProps = {
  children: ReactNode;
};

// 새로고침 방지 hook
export const RefreshPreventionWrapper = ({ children }: TProps) => {
  const isElectron = import.meta.env.MODE === "electron";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { fileMetadata } = useFileStore(
    useShallow((state) => ({
      fileMetadata: state.fileMetadata,
    })),
  );

  // file 전역상태 초기화 없이, 분석 단계 접근 시 랜딩페이지로 이동
  useEffect(() => {
    if (isElectron) {
      const isAnalysisPage = pathname !== "/";
      const emptyFile = fileMetadata === null;

      if (isAnalysisPage && emptyFile) {
        navigate("/", { replace: true });
      }
    }
  }, [fileMetadata, isElectron, navigate, pathname]);

  useBeforeUnload((e) => {
    if (!isElectron) {
      e.preventDefault();
    }
  });

  return <>{children}</>;
};
