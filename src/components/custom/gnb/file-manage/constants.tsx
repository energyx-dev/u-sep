import { ClipboardListIcon, CopyPlus, File, FolderOpen, Save, SaveAllIcon } from "lucide-react";
import { ReactNode } from "react";

export type TFeaturesConfigKey = "overwrite" | "review";

export type TFilesConfigKey = "new" | "open" | "save" | "saveAs";
export type TGuidesConfigKey = "pdf" | "video";
type TFileButtonConfig = {
  icon?: ReactNode;
  labelBase: string;
  onlyVisibleOnElectron: boolean;
};

const iconSizeClassName = "size-4.5";

export const FILES_CONFIG: Record<TFilesConfigKey, TFileButtonConfig> = {
  new: {
    icon: <File className={iconSizeClassName} />,
    labelBase: "새 파일",
    onlyVisibleOnElectron: false,
  },
  open: {
    icon: <FolderOpen className={iconSizeClassName} />,
    labelBase: "파일 열기",
    onlyVisibleOnElectron: true,
  },
  save: {
    icon: <Save className={iconSizeClassName} />,
    labelBase: "저장",
    onlyVisibleOnElectron: true,
  },
  saveAs: {
    icon: <SaveAllIcon className={iconSizeClassName} />,
    labelBase: "다른 이름으로 저장",
    onlyVisibleOnElectron: true,
  },
};

export const FEATURES_CONFIG: Record<TFeaturesConfigKey, TFileButtonConfig> = {
  overwrite: {
    icon: <CopyPlus className={iconSizeClassName} />,
    labelBase: "덮어쓰기",
    onlyVisibleOnElectron: false,
  },
  review: {
    icon: <ClipboardListIcon className={iconSizeClassName} />,
    labelBase: "분석결과 다시보기",
    onlyVisibleOnElectron: false,
  },
};

export const GUIDES_CONFIG: Record<TGuidesConfigKey, TFileButtonConfig> = {
  pdf: {
    labelBase: "매뉴얼 PDF 다운로드",
    onlyVisibleOnElectron: false,
  },
  video: {
    labelBase: "가이드 영상 보기",
    onlyVisibleOnElectron: false,
  },
};
