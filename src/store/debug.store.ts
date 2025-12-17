import { create } from "zustand";
import { devtools } from "zustand/middleware";

type TDebugAction = {
  setIsDebuggingMode: (isDebuggingMode: boolean) => void;
};

type TDebugState = {
  isDebuggingMode: boolean;
};

// 디버깅 모드
// 모든 페이지에서 공통으로 페이지 렌더링 시 에러 trigger 발생 시킴

// 초기 상태, 새 파일, 불러오기 -> false
// 분석 하기 동작 이후 -> true
const INITIAL_DEBUG_STATE: TDebugState = {
  isDebuggingMode: false,
};

export const useDebugStore = create<TDebugAction & TDebugState>()(
  devtools<TDebugAction & TDebugState>((set) => ({
    ...INITIAL_DEBUG_STATE,
    setIsDebuggingMode: (isDebuggingMode: boolean) => set({ isDebuggingMode: isDebuggingMode }),
  })),
);
