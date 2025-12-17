import dayjs from "dayjs";
import { useMemo } from "react";

import { useFileStore } from "@/store/file.store";
import { EFileType } from "@/store/file.type";

const DEFAULT_HEADER_TEXT = "";
const MAX_HEADER_TEXT_LENGTH = 30;

const formatDate = (date: Date) => {
  return dayjs(date).format("YY.MM.DD HH:mm");
};

export const useGnbHeader = () => {
  const fileMetadata = useFileStore((state) => state.fileMetadata);

  const originHeaderText = useMemo(() => {
    if (!fileMetadata) return DEFAULT_HEADER_TEXT;
    return fileMetadata.name;
  }, [fileMetadata]);

  const viewHeaderText = useMemo(() => {
    if (originHeaderText.length > MAX_HEADER_TEXT_LENGTH) {
      return originHeaderText.slice(0, MAX_HEADER_TEXT_LENGTH) + "...";
    }
    return originHeaderText;
  }, [originHeaderText]);

  const subText = useMemo(() => {
    if (!fileMetadata) return;
    if (fileMetadata.type === EFileType.IN_PROGRESS) return "저장되지 않음";
    if (fileMetadata.loadedAt) return `${formatDate(fileMetadata.loadedAt)} 불러옴`;
    if (fileMetadata.saveAt) return `${formatDate(fileMetadata.saveAt)} 저장됨`;
  }, [fileMetadata]);

  const isDirty = useMemo(() => {
    return fileMetadata?.type === EFileType.IN_PROGRESS;
  }, [fileMetadata]);

  return { isDirty, originHeaderText, subText, viewHeaderText };
};
