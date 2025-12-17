import { useCallback, useMemo } from "react";
import { z } from "zod";
import { useShallow } from "zustand/shallow";

import { TSelectOption } from "@/components/custom/select/select.types";
import { PLACEHOLDERS } from "@/constants/placeholders";
import { getCoolingOrHeatingTypeBySupplySystemType } from "@/domain/systems/helpers/helper.utils";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { EPurpose, PURPOSE_LABELS } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { supplySystemGuiAddSchema } from "@/domain/systems/supply/schemas/supply-system-add.schema";
import { SUPPLY_SYSTEM_CONFIG } from "@/domain/systems/supply/utils/supplySystem.helper";
import { getOptions, getSortedObjectArray } from "@/lib/helper";

/**
 * 공급 시스템 타입에 따라 동적으로 테이블 컬럼을 생성하는 커스텀 훅
 *
 * @param supplySystemType - 공급 시스템 타입 (ESupplySystemType)
 * @returns { columns } - 동적으로 생성된 컬럼 배열
 *
 * 주요 동작:
 * - 목적(purpose) 및 소스 시스템(source_system_id) 컬럼에 맞는 옵션을 동적으로 생성
 * - 각 행의 목적에 따라 소스 시스템 옵션을 필터링하여 제공
 * - 미설정(빈 값) 옵션을 항상 포함
 *
 * 사용 예시:
 * const { columns } = useDynamicSupplySystemColumns(supplySystemType);
 */
const EMPTY_OPTION: TSelectOption<null | string> = { label: "미설정", value: null };

export const useDynamicSupplySystemColumns = (supplySystemType?: ESupplySystemType | null) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const schema = supplySystemType ? supplySystemGuiAddSchema[supplySystemType] : z.any();
  type TDataType = z.infer<typeof schema>;

  const sourceSystemList = useSourceSystemStore(
    useShallow((state) => ({
      absorption_chiller: state.absorption_chiller,
      boiler: state.boiler,
      chiller: state.chiller,
      district_heating: state.district_heating,
      geothermal_heatpump: state.geothermal_heatpump,
      heatpump: state.heatpump,
    })),
  );

  // 용도 옵션 (공급 설비 타입에 따라 결정) (+ 정렬)
  const purposeOptions = useMemo(() => {
    const baseOptions = [...getOptions(PURPOSE_LABELS)];
    const sortedOptions = getSortedObjectArray({
      arr: baseOptions,
      sortBase: {
        baseList: [...Object.values(PURPOSE_LABELS)],
        key: "label",
      },
    });
    if (!supplySystemType) return [EMPTY_OPTION, ...sortedOptions];
    const systemType: ESupplySystemType = supplySystemType;
    return [
      ...sortedOptions.filter((option) =>
        getCoolingOrHeatingTypeBySupplySystemType(systemType).includes(option.value as EPurpose),
      ),
    ];
  }, [supplySystemType]);

  // id로 생산 설비 이름 찾는 함수
  const getSourceSystemNameById = useCallback(
    (id: null | string | undefined): null | string => {
      if (!id) return null;
      const allSystems = Object.values(sourceSystemList).flat();
      const found = allSystems.find((system) => system.id === id);
      return found ? found.name : null;
    },
    [sourceSystemList],
  );

  // "용도", "생산 설비 id"의 조회값, 옵션 동적 생성 컬럼
  const dynamicColumns = useMemo(() => {
    if (!supplySystemType) return [];
    const systemType: ESupplySystemType = supplySystemType;
    const baseColumns = SUPPLY_SYSTEM_CONFIG[systemType] ?? [];
    return baseColumns.map((column) => {
      if (column.id === "purpose") {
        return {
          ...column,
          accessorFn: (row: TDataType) => {
            const purpose = row.purpose;
            return purposeOptions.find((option) => option.value === purpose)?.label ?? "";
          },
          meta: {
            isRequired: true,
            placeholder: PLACEHOLDERS.systems.supply_system.purpose,
            selectOptions: purposeOptions,
          },
        };
      }

      if (column.id === "source_system_id") {
        type TRow = TDataType & { source_system_id: string };
        return {
          ...column,
          accessorFn: (row: TRow) => {
            if (!row.purpose) return null;

            const sourceSystemId = row.source_system_id;
            return getSourceSystemNameById(sourceSystemId) ?? "미설정";
          },
          meta: {
            disabled: (row: TRow) => !row.purpose,
            isRequired: true,
            openWithDialog: true,
            placeholder: PLACEHOLDERS.systems.supply_system.source_system_id,
          },
        };
      }

      return column;
    });
  }, [supplySystemType, getSourceSystemNameById, purposeOptions]);

  return {
    columns: dynamicColumns,
  };
};
