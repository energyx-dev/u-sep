import { z } from "zod";

import { REGIONS } from "@/domain/basic-info/constants/region.constant";

// engine에 탑재되어야할 스키마
export const buildingInfoEngineSchema = z.object({
  // 건물명
  name: z.string().trim().min(1).max(50),

  // 주소
  address: z.string().trim().min(1),

  // 방위각
  north_axis: z
    .number()
    .min(0)
    .max(359.99)
    .or(z.undefined().refine(() => false)),

  // 지상층
  num_aboveground_floor: z.number().min(0).lte(100).int(),

  // 지하층
  num_underground_floor: z.number().min(0).lte(100).int(),

  // 허가일자
  vintage: z.array(z.number()).length(3),
});

// gui단에서 쓰일 전역상태 스키마
export const buildingGUISchema = buildingInfoEngineSchema
  .pick({
    name: true,
    north_axis: true,
  })
  .extend({
    // 주소
    // 지역 (시/도)
    addressRegion: z.enum(Object.keys(REGIONS) as [string, ...string[]]),

    // 지역 구분 (시/군/구)
    addressDistrict: z.string().min(1),

    // 상세 주소
    detailAddress: z.string().trim().max(50).optional(),

    // 허가일자
    vintage: z.string().min(1),
  });

export type TBuildingGUIInputSchema = z.infer<typeof buildingGUISchema>;

export type TBuildingGUISchema = z.infer<typeof buildingGUISchema>;
