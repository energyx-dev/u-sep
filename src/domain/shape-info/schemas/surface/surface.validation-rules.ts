import {
  BOUNDARY_CONDITION_TYPE,
  BUILDING_SURFACE_TYPE,
} from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";

/**
 * 표면 필드별 유효성 검증 규칙을 반환합니다.
 * 특정 필드는 표면의 타입과 경계 조건에 따라 입력 가능 여부가 결정됩니다.
 */
export const getSurfaceFieldValidationRule = ({
  fieldName,
  surface,
}: {
  fieldName: keyof TSurfaceGuiSchema;
  surface: TSurfaceGuiSchema;
}) => {
  switch (fieldName) {
    case "adjacent_zone_id": {
      // 경계 조건이 존일 때만 인접존 ID 입력 가능
      return surface.boundary_condition === BOUNDARY_CONDITION_TYPE.zone;
    }
    case "azimuth": {
      // 벽 타입이고 외기와 접하는 경우에만 방위각 입력 가능
      return (
        surface.type === BUILDING_SURFACE_TYPE.wall &&
        surface.boundary_condition === BOUNDARY_CONDITION_TYPE.outdoors
      );
    }
    case "coolroof_reflectance": {
      // 천장 타입이고 외기와 접하는 경우에만 쿨루프 반사율 입력 가능
      return (
        surface.type === BUILDING_SURFACE_TYPE.ceiling &&
        surface.boundary_condition === BOUNDARY_CONDITION_TYPE.outdoors
      );
    }
    default:
      return true;
  }
};
