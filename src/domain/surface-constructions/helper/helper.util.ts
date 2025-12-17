import { toast } from "sonner";
import { z } from "zod";

import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { SURFACE_LAYERS_COLUMN_COUNT } from "@/domain/surface-constructions/constants/constants";
import { UPDATE_SURFACE_CONSTRUCTION_MESSAGE } from "@/domain/surface-constructions/helper/message";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { ERROR_MESSAGES } from "@/lib/message-helper";

/**
 * Converts millimeters (mm) to meters (m)
 * @param mm - Length in millimeters
 * @returns Length in meters
 */
export const mmToM = (mm: number) => mm / 1000;

/**
 * Converts meters (m) to millimeters (mm)
 * @param m - Length in meters
 * @returns Length in millimeters
 */
export const mToMm = (m: number) => m * 1000;

const materialShape = Array.from({ length: SURFACE_LAYERS_COLUMN_COUNT }).reduce<
  Record<string, z.ZodTypeAny>
>((acc, _, i) => {
  acc[`material_${i}`] =
    i === 0
      ? z.string({
          invalid_type_error: ERROR_MESSAGES.required(`재료 ${i + 1}`),
          required_error: ERROR_MESSAGES.required(`재료 ${i + 1}`),
        })
      : z.string().optional();
  return acc;
}, {});

const thicknessShape = Array.from({ length: SURFACE_LAYERS_COLUMN_COUNT }).reduce<
  Record<string, z.ZodTypeAny>
>((acc, _, i) => {
  acc[`thickness_${i}`] =
    i === 0
      ? z.number({
          invalid_type_error: ERROR_MESSAGES.required(`두께 ${i + 1}`),
          required_error: ERROR_MESSAGES.required(`두께 ${i + 1}`),
        })
      : z.number().optional();
  return acc;
}, {});

export const SurfaceConstructionTableSchema = z.object({
  name: z.string({
    invalid_type_error: ERROR_MESSAGES.required("이름"),
    required_error: ERROR_MESSAGES.required("이름"),
  }),
  ...materialShape,
  ...thicknessShape,
  type: z.enum([BUILDING_SURFACE_TYPE.floor, BUILDING_SURFACE_TYPE.wall]),
});

export type TSurfaceConstructionTable = Record<`material_${number}`, string | undefined> &
  Record<`thickness_${number}`, number | undefined> & {
    id: string;
    name: string;
  } & { type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall };

export type TSurfaceConstructionViewTable = Omit<TSurfaceConstructionEngineAndGuiSchema, "id">;

// layers를 Dialog에 맞게 변환하는 함수 ex. {name: "벽체", material_0: "벽돌", thickness_0: 0.2, ...}
export const convertToFlatTableSchema = (
  data: TSurfaceConstructionEngineAndGuiSchema[],
): TSurfaceConstructionTable[] => {
  return data.map(({ id, layers, name, type }) => {
    const flat: TSurfaceConstructionTable = {
      id,
      name,
      type,
    };

    layers.forEach((layer, index) => {
      flat[`material_${index}`] = layer.material_id;
      // Convert stored thickness from m to mm for UI
      const thicknessValue = layer.thickness == null ? undefined : mToMm(layer.thickness);
      flat[`thickness_${index}`] = thicknessValue;
    });
    return flat;
  });
};

// 추가/수정 시, flat한 형태의 데이터를 layers 배열로 변환하는 함수 ex. {material_0: "벽돌", thickness_0: 0.2, ...} -> [{material_id: "벽돌", thickness: 0.2}, ...]
export const convertToNestedLayerSchema = (
  flat: TSurfaceConstructionTable,
): TSurfaceConstructionEngineAndGuiSchema["layers"] => {
  const layers: TSurfaceConstructionEngineAndGuiSchema["layers"] = [];

  const flatRecord = flat as Record<string, unknown>;

  for (const key in flat) {
    if (key.startsWith("material_")) {
      const index = Number(key.split("material_")[1]);
      const material_id = flatRecord[key] as string;
      const thickness = flatRecord[`thickness_${index}`] as number;
      if (
        material_id !== "" &&
        material_id !== undefined &&
        thickness !== undefined &&
        Number(thickness) > 0
      ) {
        // Convert UI thickness from mm to m for storage
        const thicknessInM = typeof thickness === "number" ? mmToM(thickness) : undefined;
        layers.push({
          material_id,
          thickness: thicknessInM!,
        });
      }
    }
  }

  return layers;
};

export const validateLayerPairs = (rows: Partial<TSurfaceConstructionTable>[]) => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const materialIndices = new Set<number>();
    const thicknessIndices = new Set<number>();
    for (const key in row) {
      if (key.startsWith("material_")) {
        const idx = Number(key.slice("material_".length));
        const val = row[key as keyof TSurfaceConstructionTable];
        if (val !== undefined && val !== null && val !== "") {
          materialIndices.add(idx);
        }
      } else if (key.startsWith("thickness_")) {
        const idx = Number(key.slice("thickness_".length));
        const val = row[key as keyof TSurfaceConstructionTable];
        if (val !== undefined && val !== null && Number.isFinite(val)) {
          thicknessIndices.add(idx);
        }
      }
    }
    const allIndices = new Set<number>([...materialIndices, ...thicknessIndices]);
    for (const idx of allIndices) {
      const hasMaterial = materialIndices.has(idx);
      const hasThickness = thicknessIndices.has(idx);
      if (hasMaterial !== hasThickness) {
        toast.error("재료 및 두께가 같이 입력되지 않으면 등록되지 않습니다.");
        return false;
      }
    }
  }
  return true;
};

// 짝이 맞지 않는 material / thickness 있으면 제거
export const stripUnpairedLayerFields = (row: Partial<TSurfaceConstructionTable>) => {
  if (!row) return row;
  const next: Partial<TSurfaceConstructionTable> = { ...row };

  // Collect layer indexes present in the row
  const indexes = new Set<number>();
  Object.keys(next).forEach((k) => {
    const m = k.match(/^(material|thickness)_(\d+)$/);
    if (m) indexes.add(Number(m[2]));
  });

  let hasUnpaired = false;

  // For each index, keep the pair only if BOTH are valid
  indexes.forEach((i) => {
    const mKey = `material_${i}` as keyof TSurfaceConstructionTable;
    const tKey = `thickness_${i}` as keyof TSurfaceConstructionTable;

    const mat = next[mKey] as unknown as string | undefined;
    const thk = next[tKey] as unknown as number | undefined;

    const matValid = typeof mat === "string" && mat.length > 0;
    const thkValid = typeof thk === "number" && !Number.isNaN(thk);

    if (!(matValid && thkValid)) {
      hasUnpaired = true;
      delete (next as Partial<TSurfaceConstructionTable>)[mKey];
      delete (next as Partial<TSurfaceConstructionTable>)[tKey];
    }
  });

  if (hasUnpaired) {
    toast.error("재료 및 두께가 같이 입력되지 않으면 등록되지 않습니다.");
  } else {
    toast.success(UPDATE_SURFACE_CONSTRUCTION_MESSAGE.success);
  }

  return next;
};
