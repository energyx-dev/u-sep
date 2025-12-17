import { TSelectOption } from "@/components/custom/select/select.types";
import { EFenestrationType } from "@/domain/fenestration/constants/fenestration.enum";
import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";

// 개구부 구조체 타입별 투명 여부 검사 후 투명하지 않은 경우 제외하고 옵션 반환
// type=”window” or “glass_door” 이면 is_transparent=True인 fenestration_construction만 가능
export const getValidConstructionOptionsForType = ({
  constructionList,
  type,
}: {
  constructionList: TFenestrationConstructionEngineAndGuiSchema[];
  type: EFenestrationType;
}): TSelectOption[] => {
  return constructionList
    .filter((construction) => isValidConstructionIdForType({ construction, type }))
    .map(({ id, name }) => ({ label: name, value: id }));
};

// 개구부 구조체 타입별 투명 여부 검사
export const isValidConstructionIdForType = ({
  construction,
  type,
}: {
  construction: TFenestrationConstructionEngineAndGuiSchema;
  type: EFenestrationType;
}) => {
  if (type === EFenestrationType.WINDOW || type === EFenestrationType.GLASS_DOOR) {
    return construction.is_transparent;
  }

  return true;
};
