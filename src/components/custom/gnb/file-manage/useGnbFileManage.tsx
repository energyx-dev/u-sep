import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FEATURES_CONFIG,
  FILES_CONFIG,
  GUIDES_CONFIG,
  TFeaturesConfigKey,
  TFilesConfigKey,
  TGuidesConfigKey,
} from "@/components/custom/gnb/file-manage/constants";
import { useFileManage } from "@/components/custom/gnb/file-manage/useFileManage";
import { STEP_PATH } from "@/constants/routes";
import { useBuildingDataCopyOverwriteOptions } from "@/domain/building/hooks/useBuildingDataCopyOverwriteOptions";
import { useResultStore } from "@/domain/result/stores/result.store";
import { downloadManualPdf } from "@/lib/guides";
import { useFileStore } from "@/store/file.store";
import { EFileType } from "@/store/file.type";

type TFileManageButton = {
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  visible: boolean;
};

const BUTTON_CONFIG_KEYS: TFilesConfigKey[] = ["new", "open", "save", "saveAs"];
const FEATURES_CONFIG_KEYS: TFeaturesConfigKey[] = ["overwrite", "review"];
const GUIDES_CONFIG_KEYS: TGuidesConfigKey[] = ["pdf"];

const MODIFIED_FILE_HEADER_TEXT = "*";

export const useGnbFileManage = () => {
  const isElectron = import.meta.env.MODE === "electron";
  const navigate = useNavigate();

  const result = useResultStore((state) => state.result);
  const fileMetadata = useFileStore((state) => state.fileMetadata);

  const { handleOpenOverwriteOverlay } = useBuildingDataCopyOverwriteOptions();
  const { isDirty, loadFile, newFile, saveAsFile, saveFile } = useFileManage();

  const [isOpenResult, setIsOpenResult] = useState<boolean>(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState<boolean>(false);
  const [leaveDialogState, setLeaveDialogState] = useState({
    onSuccess: () => {},
    title: "",
  });

  const handleResultOpen = () => setIsOpenResult(true);
  const handleResultClose = () => setIsOpenResult(false);

  const openLeaveDialog = (config: { onSuccess: () => void; title: string }) => {
    setLeaveDialogState(config);
    setIsLeaveDialogOpen(true);
  };

  const onNew = useCallback(async () => {
    if (isDirty) {
      openLeaveDialog({
        onSuccess: () => {
          newFile();
          navigate(STEP_PATH.BASIC_INFO.path);
        },
        title: "새 파일",
      });
    } else {
      newFile();
      navigate(STEP_PATH.BASIC_INFO.path);
    }
  }, [navigate, newFile, isDirty]);

  const onOpen = useCallback(async () => {
    if (isDirty) {
      openLeaveDialog({
        onSuccess: () => loadFile(),
        title: "열기",
      });
    } else {
      loadFile();
    }
  }, [isDirty, loadFile]);

  const isSaveDisabled = useMemo(() => {
    return fileMetadata === null || fileMetadata.type === EFileType.COMPLETED;
  }, [fileMetadata]);

  const isInProgress = fileMetadata?.type === EFileType.IN_PROGRESS;

  const files: TFileManageButton[] = useMemo(
    () =>
      BUTTON_CONFIG_KEYS.map((key) => {
        const { icon, labelBase, onlyVisibleOnElectron } = FILES_CONFIG[key];

        const disabled = {
          new: false,
          open: false,
          save: isSaveDisabled,
          saveAs: isSaveDisabled,
        }[key];

        const onClick = {
          new: onNew,
          open: onOpen,
          save: saveFile,
          saveAs: saveAsFile,
        }[key];

        const label =
          key === "save" && isInProgress ? `${labelBase}${MODIFIED_FILE_HEADER_TEXT}` : labelBase;

        return {
          disabled,
          icon,
          label,
          onClick,
          visible: isElectron || !onlyVisibleOnElectron,
        } satisfies TFileManageButton;
      }),
    [isElectron, isInProgress, isSaveDisabled, onNew, onOpen, saveFile, saveAsFile],
  );

  const features: TFileManageButton[] = useMemo(
    () =>
      FEATURES_CONFIG_KEYS.map((key) => {
        const { icon, labelBase, onlyVisibleOnElectron } = FEATURES_CONFIG[key];

        const disabled = {
          overwrite: false,
          review: !result,
        }[key];

        const onClick = {
          overwrite: () => handleOpenOverwriteOverlay(),
          review: handleResultOpen,
        }[key];

        return {
          disabled,
          icon,
          label: labelBase,
          onClick,
          visible: isElectron || !onlyVisibleOnElectron,
        } satisfies TFileManageButton;
      }),
    [handleOpenOverwriteOverlay, isElectron, result],
  );

  const guides: TFileManageButton[] = useMemo(
    () =>
      GUIDES_CONFIG_KEYS.map((key) => {
        const { icon, labelBase, onlyVisibleOnElectron } = GUIDES_CONFIG[key];

        const disabled = {
          pdf: false,
          video: false,
        }[key];

        const onClick = {
          pdf: downloadManualPdf,
          video: () => {},
        }[key];

        return {
          disabled,
          icon,
          label: labelBase,
          onClick,
          visible: isElectron || !onlyVisibleOnElectron,
        } satisfies TFileManageButton;
      }),
    [],
  );

  return {
    features,
    files,
    guides,
    leaveDialog: {
      fileName: fileMetadata?.name,
      onOpenChange: setIsLeaveDialogOpen,
      onSuccess: leaveDialogState.onSuccess,
      open: isLeaveDialogOpen,
      title: leaveDialogState.title,
    },
    resultDialog: { close: handleResultClose, isOpen: isOpenResult, result },
  };
};
