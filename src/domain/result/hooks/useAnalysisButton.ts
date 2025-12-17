import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

import { executeDebugging } from "@/domain/result/helpers/debug.core";
import {
  getExistDebugError,
  TDebugErrorSetWithCount,
} from "@/domain/result/helpers/debug.ui.helper";
import { useCreateGuiData } from "@/hooks/useCreateGuiData";
import { TResultSchemaV2 } from "@/schemas/result.schema";
import { useDebugStore } from "@/store/debug.store";

export type TResultPrevDialogData =
  | TAnalysisSuccess
  | TDebugOptionalStatus
  | TDebugRequiredStatus
  | TErrorStatus
  | TIdleStatus
  | TLoadingStatus
  | TReadyStatus
  | TSaveStatus;

type TAnalysisSuccess = {
  data: TResultSchemaV2;
  status: "success";
};

type TDebugOptionalStatus = {
  data: TDebugErrorSetWithCount;
  status: "debug-optional";
};

type TDebugRequiredStatus = {
  data: TDebugErrorSetWithCount;
  status: "debug-required";
};

type TErrorStatus = {
  status: "error";
};

type TIdleStatus = {
  status: "idle";
};

type TLoadingStatus = {
  status: "loading";
};

type TReadyStatus = {
  status: "ready";
};

type TSaveStatus = {
  status: "save";
};

export const useAnalysisButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState<TResultPrevDialogData>({
    status: "idle",
  });
  const { guiData } = useCreateGuiData();
  const { isDebuggingMode, setIsDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
      setIsDebuggingMode: state.setIsDebuggingMode,
    })),
  );

  const handleDebug = useCallback(() => {
    const result = executeDebugging(guiData);
    const existRequiredError = getExistDebugError(result.required);
    const existOptionalError = getExistDebugError(result.optional);

    if (existRequiredError && existRequiredError.totalCount > 0) {
      setDialogData({ data: existRequiredError, status: "debug-required" });
    } else if (existOptionalError && existOptionalError.totalCount > 0) {
      setDialogData({ data: existOptionalError, status: "debug-optional" });
    } else {
      setDialogData({ status: "save" });
    }
  }, [guiData]);

  useEffect(() => {
    if (isDebuggingMode) {
      handleDebug();
    }
  }, [handleDebug, isDebuggingMode]);

  const handleClick = useCallback(() => {
    setIsDebuggingMode(true);
    handleDebug();
    setIsOpen(true);
  }, [handleDebug, setIsDebuggingMode]);

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return {
    dialogData,
    handleClick,
    handleCloseDialog,
    isOpen,
    setDialogData,
  };
};
