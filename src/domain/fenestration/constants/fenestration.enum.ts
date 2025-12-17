// 개구부 종류
export enum EFenestrationType {
  DOOR = "door",
  GLASS_DOOR = "glass_door",
  WINDOW = "window",
}

export const FENESTRATION_TYPE_LABEL = {
  [EFenestrationType.DOOR]: "문",
  [EFenestrationType.GLASS_DOOR]: "유리문",
  [EFenestrationType.WINDOW]: "창문",
} as const;

// 블라인드 종류
export enum EFenestrationBlind {
  SHADE = "shade",
  VENETIAN = "venetian",
}

export const FENESTRATION_BLIND_LABEL = {
  [EFenestrationBlind.SHADE]: "쉐이드",
  [EFenestrationBlind.VENETIAN]: "베네시안",
} as const;
