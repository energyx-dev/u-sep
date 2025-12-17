type TFileApi = {
  downloadManual: () => Promise<
    { error: string; success: false } | { path: string; success: true }
  >;
  getGuideVideoPath: () => Promise<string>;
  openFile: () => Promise<{ canceled: boolean; content: string; name: string; path: string }>;
  printToPDF: () => Promise<{ error: string; success: false } | { path: string; success: true }>;
  saveFile: <T>({
    data,
    defaultPath,
    fileName,
  }: {
    data: T;
    defaultPath: null | string;
    fileName?: string;
  }) => Promise<{ error: string; success: false } | { name: string; path: string; success: true }>;
};

declare global {
  interface Window {
    fileApi: TFileApi;
  }
}

export {};
