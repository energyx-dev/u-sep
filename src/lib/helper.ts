import { sortBy } from "es-toolkit";

import { TSelectOption } from "@/components/custom/select/select.types";
import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceConstructionViewTable } from "@/domain/surface-constructions/helper/helper.util";

export const getOptions = (obj: Record<string, string>): TSelectOption[] => {
  return Object.entries(obj).map(([key, value]) => ({ label: value, value: key }));
};

export const getOptionsSortedByLabel = (obj: Record<string, string>): TSelectOption[] => {
  return sortBy(getOptions(obj), ["label", "value"]);
};

export const getSortedObjectArray = <T extends object>({
  arr,
  sortBase,
  sortByKeys,
}: {
  arr: T[];
  sortBase?: { baseList: string[]; key: keyof T };
  sortByKeys?: (keyof T)[];
}) => {
  if (sortByKeys) {
    return sortBy(arr, sortByKeys);
  }

  if (sortBase) {
    const { baseList, key } = sortBase;
    return arr.sort((a, b) => {
      const aIndex = baseList.indexOf(a[key] as string);
      const bIndex = baseList.indexOf(b[key] as string);
      return aIndex - bIndex;
    });
  }

  return arr;
};

// 열 관류율 로직

// 열 관류율 계산식
export const computeU = ({
  isMaxFloor,
  isMinFloor,
  layers,
  materials,
  surface_type,
}: {
  isMaxFloor?: boolean;
  isMinFloor?: boolean;
  layers: TSurfaceConstructionViewTable["layers"];
  materials: TMaterialEngineAndGuiSchema[];
  surface_type?: string;
}) => {
  if (!layers || layers.length === 0) return null;

  // 동적 Ri, Ro 값 결정
  let Ri = 0.086;
  let Ro = 0;

  // 경계조건: 벽
  if (surface_type === BUILDING_SURFACE_TYPE.wall) {
    Ri = 0.11;
    Ro = 0.043;

    // 경계조건: 바닥 & 최하층, 천장 & 최상층
  } else if (
    (surface_type === BUILDING_SURFACE_TYPE.floor && isMinFloor) ||
    (surface_type === BUILDING_SURFACE_TYPE.ceiling && isMaxFloor)
  ) {
    Ri = 0.086;
    Ro = 0.043;
  }

  let sumR = 0;
  for (const layer of layers) {
    const m = materials.find((mm) => mm.id === layer.material_id);
    const k = m?.conductivity; // W/(m·K)
    if (k == null || k <= 0) return null;
    const t_m = layer.thickness;
    sumR += t_m / k; // ㎡·K/W
  }
  return 1 / (Ri + Ro + sumR);
};

// 열 관류율 소수점 3자리만 보이게 처리
export const formatU = (u: null | number, digits = 3) =>
  u == null ? "-" : Number(u).toFixed(digits);
