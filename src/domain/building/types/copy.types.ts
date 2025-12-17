import {
  TCopyPhotovoltaicSystem,
  TCopyShapeInfo,
} from "@/domain/building/helpers/copy-remodeling.helper";

// 리모델링 전/후 데이터 타입
export type TCopyRemodelingData = {
  photovoltaicSystems: TCopyPhotovoltaicSystem[];
  shapeInfo: TCopyShapeInfo;
};
