import { useOverlay } from "@toss/use-overlay";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
import { useMaterialStore } from "@/domain/material/stores/material.store";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { MaterialAddDialog } from "@/domain/surface-constructions/components/MaterialAddDialog";
import { SurfaceConstructionTable } from "@/domain/surface-constructions/components/SurfaceConstructionTable";
import {
  convertToFlatTableSchema,
  convertToNestedLayerSchema,
  stripUnpairedLayerFields,
  SurfaceConstructionTableSchema,
  TSurfaceConstructionTable,
  validateLayerPairs,
} from "@/domain/surface-constructions/helper/helper.util";
import { surfaceConstructionErrorMap } from "@/domain/surface-constructions/schemas/surface-constructions.error-map";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { checkSurfaceConstructionMapping } from "@/domain/systems/utils/check-mapped-data";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableEditValidator } from "@/hooks/useTableEditValidator";
import { TTableError } from "@/lib/table-helper";
import { customNanoid, isAllArraysEmpty, isStrictEmptyObject } from "@/lib/utils";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

import { useSurfaceConstructionTableSectionViewMode } from "../hooks/useSurfaceConstructionTableSectionViewMode";

export const SurfaceConstructionTableSection = ({
  materials,
  surface_constructions,
}: {
  materials: TMaterialEngineAndGuiSchema[];
  surface_constructions: TSurfaceConstructionEngineAndGuiSchema[];
}) => {
  const dataSyncActions = useDataSyncActions();
  const { addSurfaceConstruction, syncSurfaceConstruction } = dataSyncActions;

  const { handleChangeMode: handleChangeModeFloor, isEdit: isEditFloor } =
    useSurfaceConstructionTableSectionViewMode(BUILDING_SURFACE_TYPE.floor);
  const { handleChangeMode: handleChangeModeWall, isEdit: isEditWall } =
    useSurfaceConstructionTableSectionViewMode(BUILDING_SURFACE_TYPE.wall);

  const materialsState = useMaterialStore(useShallow((state) => ({ materials: state.materials })));

  const isEmptyMaterialsState = isAllArraysEmpty(materialsState);

  const { openNewConfirmDialog } = useNewConfirmDialog();

  const tableEditValidator = useTableEditValidator<TSurfaceConstructionTable>({
    mode: "edit",
    savedList: useMemo(
      () => convertToFlatTableSchema(surface_constructions),
      [convertToFlatTableSchema, surface_constructions],
    ),
    schema: SurfaceConstructionTableSchema,
    setErrorMap: surfaceConstructionErrorMap,
    //
    addAction: (data) => {
      const updateDataList = data.map((item) => ({
        id: item.id,
        layers: convertToNestedLayerSchema(item),
        name: item.name,
        type: item.type,
      }));
      addSurfaceConstruction(updateDataList);
    },
    syncAction: (data) => {
      if (!validateLayerPairs(data)) return;
      const updateDataList = data.map((item) => ({
        id: item.id,
        layers: convertToNestedLayerSchema(item),
        name: item.name,
        type: item.type,
      }));
      syncSurfaceConstruction(updateDataList);
    },
  });

  const { setSystemList, systemList } = tableEditValidator;

  const getTypeScopedValidator = (type: BUILDING_SURFACE_TYPE) => {
    const filterByType = (err: TTableError) => {
      // Prefer rowIndex-based check if available
      if (typeof err?.rowIndex === "number") {
        const row = systemList?.[err.rowIndex];
        return row?.type === type;
      }
      // Fallback: some errors may carry type directly
      if (err && "type" in err) {
        return err.type === type;
      }
      // If structure unknown, don't block this table
      return false;
    };
    const scopedErrors = (tableEditValidator.validationErrors ?? [])
      .filter(filterByType)
      .filter((err) => {
        const row = systemList?.[err.rowIndex];
        return !isStrictEmptyObject({ obj: row, removeKeys: ["type"] });
      });
    return {
      ...tableEditValidator,
      // Type-scoped submit: persist only this table's rows
      disabled: scopedErrors.length > 0,

      handleSubmit: async ({
        type: submitType,
      }: {
        type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall;
      }) => {
        // 1) Build updated subset for the current type from the local editing buffer
        const allOfType = (systemList ?? []).filter((r) => r.type === submitType);

        // 비어있는 행(type 값만 있는 행)은 제외
        const nonEmptyRows = allOfType.filter(
          (item) => !isStrictEmptyObject({ obj: item, removeKeys: ["type"] }),
        );

        // Drop any unpaired material/thickness fields before persisting
        const cleanedOfType = nonEmptyRows.map(stripUnpairedLayerFields);

        if (!validateLayerPairs(cleanedOfType)) return;

        // Ensure every row has an id (auto-generate if missing)
        const updatedSubset = cleanedOfType.map((item) => {
          const ensuredId =
            typeof item.id === "string" && item.id.length > 0 ? item.id : customNanoid(16);
          return {
            id: ensuredId,
            layers: convertToNestedLayerSchema(item as TSurfaceConstructionTable),
            name: item.name!,
            type: submitType,
          };
        });
        // 2) Preserve the other type from the latest global props (unsaved edits for the other type should not persist)
        const preservedOther = surface_constructions
          .filter((s) => s.type !== submitType)
          .map((s) => ({
            id: s.id,
            layers: s.layers,
            name: s.name,
            type: s.type,
          }));

        const merged = [...updatedSubset, ...preservedOther];
        syncSurfaceConstruction(merged);

        setSystemList((prev: Partial<TSurfaceConstructionTable>[]) => {
          let idx = -1;
          return prev.map((row) => {
            if (row.type === submitType) {
              idx += 1;
              const ensuredId = row.id && row.id.length > 0 ? row.id : updatedSubset[idx]?.id;
              // Also reflect the cleaned (pair-stripped) fields back into the editing buffer
              const cleanedRow = cleanedOfType[idx] ?? row;
              return { ...cleanedRow, id: ensuredId };
            }
            return row;
          });
        });
      },
      validationErrors: scopedErrors,
    };
  };

  const onCancel = ({ type }: { type: BUILDING_SURFACE_TYPE }) => {
    // Reset the local editing buffer (systemList) for the given type
    // to exactly mirror the latest props (surface_constructions).
    const originalFlatAll = convertToFlatTableSchema(surface_constructions);
    const originalsOfType = originalFlatAll.filter((r) => r.type === type);

    setSystemList((prev: Partial<TSurfaceConstructionTable>[]) => {
      // Keep other types as-is, and replace only the requested type
      const others = (prev ?? []).filter((row) => row.type !== type);
      return [...others, ...originalsOfType];
    });
    // NOTE:
    // Don't call syncSurfaceConstruction here.
    // Cancel should only revert the local editing buffer (systemList).
    // Persisting a filtered list causes the other type to disappear until the next submit.
  };

  const handleBeforeDelete = useCallback(
    async (deletedItems: Partial<TSurfaceConstructionTable>[]) => {
      const deletedIds = deletedItems
        .filter((item) => item.id)
        .map((item) => (item as { id: string }).id);

      if (deletedIds.length === 0) return true;
      const beforeFloors = useBeforeBuildingGeometryStore.getState().buildingFloors;
      const afterFloors = useAfterBuildingGeometryStore.getState().buildingFloors;
      const { affectedZones, deletedSurfaceConstruction } = checkSurfaceConstructionMapping(
        deletedIds,
        beforeFloors,
        afterFloors,
        deletedItems as Partial<TSurfaceConstructionTable>[],
      );

      if (affectedZones.length === 0) return true;
      const deletedSurfaceConstructionNames = deletedSurfaceConstruction
        .map((surfaceConstruction: Partial<TSurfaceConstructionTable>) => surfaceConstruction.name)
        .join(", ");
      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedSurfaceConstructionNames}이(가) 선택된 면이 있어 삭제할 수 없습니다. 면에서 먼저 선택 해제해주세요.`,
        title: "면 구조체 삭제 불가",
      });

      return !confirm;
    },
    [openNewConfirmDialog],
  );

  const actionEditTable = useActionEditTable({
    data: systemList,
    setData: setSystemList,
  });

  const overlay = useOverlay();

  const openDialog = useCallback(
    ({
      columnId,
      row,
      rowIndex,
      type,
    }: {
      columnId: string;
      row: Partial<TSurfaceConstructionTable>;
      rowIndex: number;
      type: BUILDING_SURFACE_TYPE;
    }) => {
      if (isEmptyMaterialsState) {
        toast.error("등록된 재료가 존재하지 않습니다. 재료를 먼저 등록해주세요.");
        return;
      }
      overlay.open(({ close, isOpen }) => (
        <MaterialAddDialog
          columnId={columnId}
          isOpen={isOpen}
          mode="view"
          onClose={close}
          onSelect={({ columnId, materialId, rowIndex, type }) => {
            setSystemList((prev: Partial<TSurfaceConstructionTable>[]) => {
              let k = -1;
              return prev.map((row) => {
                if (row.type === type) {
                  k += 1;
                  if (k === rowIndex) {
                    return { ...row, [columnId]: materialId };
                  }
                }
                return row;
              });
            });
          }}
          row={row}
          rowIndex={rowIndex}
          savedList={materials}
          type={type}
        />
      ));
    },
    [overlay, materials, setSystemList],
  );

  return (
    <>
      <div className="mb-10">
        <HeadingWithRequired
          heading={PAGE_TITLES.SURFACE_CONSTRUCTION}
          isEdit={isEditFloor || isEditWall}
        />
      </div>

      <div className="space-y-9">
        <div>
          <SurfaceConstructionTable
            actionEditTable={{ ...actionEditTable, onBeforeDelete: handleBeforeDelete }}
            handleChangeMode={handleChangeModeFloor}
            isEdit={isEditFloor}
            onCancel={onCancel}
            openDialog={(args) => openDialog({ ...args, type: BUILDING_SURFACE_TYPE.floor })}
            surface_constructions={surface_constructions.filter(
              (item) => item.type === BUILDING_SURFACE_TYPE.floor,
            )}
            tableEditValidator={getTypeScopedValidator(BUILDING_SURFACE_TYPE.floor)}
            type={BUILDING_SURFACE_TYPE.floor}
          />
        </div>
        <div>
          <SurfaceConstructionTable
            actionEditTable={{ ...actionEditTable, onBeforeDelete: handleBeforeDelete }}
            handleChangeMode={handleChangeModeWall}
            isEdit={isEditWall}
            onCancel={onCancel}
            openDialog={(args) => openDialog({ ...args, type: BUILDING_SURFACE_TYPE.wall })}
            surface_constructions={surface_constructions.filter(
              (item) => item.type === BUILDING_SURFACE_TYPE.wall,
            )}
            tableEditValidator={getTypeScopedValidator(BUILDING_SURFACE_TYPE.wall)}
            type={BUILDING_SURFACE_TYPE.wall}
          />
        </div>
      </div>
    </>
  );
};
