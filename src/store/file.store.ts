import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { EFileType } from "@/store/file.type";

type TFileAction = {
  setFileMetadataStore: (data: TFileMetadata) => void;
};

type TFileMetadata = null | {
  filePath?: string;
  loadedAt?: Date;
  name: string;
  saveAt?: Date;
  type: EFileType;
};

type TFileState = {
  fileMetadata: TFileMetadata;
};

export const useFileStore = create<TFileAction & TFileState>()(
  devtools<TFileAction & TFileState>((set) => ({
    fileMetadata: null,
    setFileMetadataStore: (data: TFileMetadata) => set({ fileMetadata: data }),
  })),
);
