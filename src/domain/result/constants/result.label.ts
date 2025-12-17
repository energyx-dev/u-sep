import { EResultEffect, EResults } from "@/domain/result/constants/result.enum";

export const RESULT_TOTAL_LABEL: Record<
  EResults,
  { description: string; title: string; unit: string }
> = {
  [EResults.CO2]: {
    description:
      "에너지 소비에 따른 CO₂ 등 온실가스 배출 총량. 에너지원별 배출계수를 곱해 산정하며, 환경영향의 핵심 지표로 사용됨.",
    title: "온실가스 배출량",
    unit: "kgCO₂eq",
  },
  [EResults.SITE_USES]: {
    description:
      "건물이 최종적으로 사용하는 에너지양. 전기, 가스, 지역난방 등 실제로 공급받아 사용한 에너지 총량을 의미함.",
    title: "에너지 소요량",
    unit: "kWh/m²",
  },
  [EResults.SOURCE_USES]: {
    description:
      "최종에너지를 얻기까지 소비된 에너지 총량을 1차 에너지 환산계수로 계산한 값. 에너지 공급원 전반의 실질적 소비를 반영함.",
    title: "1차 에너지 소요량",
    unit: "kWh/m²",
  },
} as const;

export const RESULT_EFFECT_LABEL = {
  [EResultEffect.FOREST_CREATION]: {
    description:
      "최종에너지를 얻기까지 소비된 에너지 총량을 1차 에너지 환산계수로 계산한 값. 에너지 공급원 전반의 실질적 소비를 반영함.",
    title: "산림 조성 효과",
    unit: "m²",
  },
  [EResultEffect.PLANTING_EFFECT]: {
    description:
      "식재효과에 대한 설명을 기재합니다. 식재효과에 대한 설명을 기재합니다. 식재효과에 대한 설명을 기재합니다.",
    title: "식재 효과",
    unit: "그루",
  },
  [EResultEffect.REPLACEMENT_OF_CARS]: {
    description:
      "승용차 대체효과에 대한 설명을 기재합니다. 승용차 대체효과에 대한 설명을 기재합니다.",
    title: "승용차 대체효과",
    unit: "대",
  },
} as const;
