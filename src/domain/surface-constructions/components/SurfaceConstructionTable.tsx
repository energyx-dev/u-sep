import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { SurfaceConstructionsEditTable } from "@/domain/surface-constructions/components/SurfaceConstructionsEditTable";
import { SurfaceConstructionsViewTable } from "@/domain/surface-constructions/components/SurfaceConstructionsViewTable";
import { TSurfaceConstructionTable } from "@/domain/surface-constructions/helper/helper.util";
import { useSurfaceConstructionColumn } from "@/domain/surface-constructions/hooks/useSurfaceConstructionColumn";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { TTableError } from "@/lib/table-helper";
import { cn } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

type OpenMaterialDialogParams<Row extends { type?: BUILDING_SURFACE_TYPE }> = {
  columnId: string;
  row: Partial<Row>;
  rowIndex: number;
};

type TProps = {
  actionEditTable: {
    CopyOrRemoveActionButton: React.ReactNode;
    CopyOrRemoveActionCellButton: (args: { rowIndex: number }) => React.ReactNode;
    handleAddRow: () => void;
    handleDeleteRow: () => void;
    onBeforeDelete?: (deletedItems: Partial<TSurfaceConstructionTable>[]) => Promise<boolean>;
    PlacementButton: ({
      isEditMode,
      systemId,
      systemObj,
      type,
    }: {
      isEditMode?: boolean;
      systemId: string;
      systemObj: Partial<TSurfaceConstructionTable>;
      type: string;
    }) => React.ReactNode;
    RowSelectCheckbox: (args: { rowIndex: number }) => React.ReactNode;
  };
  handleChangeMode: (mode: TViewMode) => void;
  isEdit: boolean;
  onCancel: (args: { type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall }) => void;
  openDialog: (args: OpenMaterialDialogParams<TSurfaceConstructionTable>) => void;
  surface_constructions: TSurfaceConstructionEngineAndGuiSchema[];
  tableEditValidator: {
    disabled: boolean;
    handleSubmit: (args: {
      type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall;
    }) => void;
    setSystemList: React.Dispatch<React.SetStateAction<Partial<TSurfaceConstructionTable>[]>>;
    systemList: Partial<TSurfaceConstructionTable>[];
    validationErrors: TTableError[];
  };
  type: BUILDING_SURFACE_TYPE.floor | BUILDING_SURFACE_TYPE.wall;
};

export const SurfaceConstructionTable = ({
  actionEditTable,
  handleChangeMode,
  isEdit,
  onCancel,
  openDialog,
  surface_constructions,
  tableEditValidator,
  type,
}: TProps) => {
  const { handleSubmit, setSystemList, systemList } = tableEditValidator;

  // 현재 테이블(바닥/천장)의 리스트만 갱신하고 나머지 타입 데이터는 유지
  const setFloorData = (next: Partial<TSurfaceConstructionTable>[]) => {
    setSystemList((prev) => {
      const others = prev.filter((item) => item.type !== type);
      // 안전장치로 floor type 보장
      const nextWithType = next.map((item) => ({
        ...item,
        type,
      }));
      return [...others, ...nextWithType];
    });
  };

  const { surfaceConstructionsColumn, surfaceConstructionsViewColumn } =
    useSurfaceConstructionColumn({ type });

  return (
    <>
      <div className={cn(isEdit && "pr-0")}>
        <TableSection.Header
          description={
            isEdit
              ? type === BUILDING_SURFACE_TYPE.floor
                ? "재료 순서: 외부→내부"
                : "재료 순서: 외부→내부"
              : ""
          }
          title={type === BUILDING_SURFACE_TYPE.floor ? "바닥/천장" : "벽"}
        >
          {isEdit ? (
            <TableSection.ActionButtons
              onCancel={() => {
                onCancel({ type });
                handleChangeMode("view");
              }}
              onDelete={actionEditTable.handleDeleteRow}
              onSubmit={() => {
                if (tableEditValidator.validationErrors.length > 0) return;
                handleSubmit({ type });
                handleChangeMode("view");
              }}
            />
          ) : (
            <Button
              className="border-neutral-200 p-1 text-neutral-600"
              onClick={() => {
                handleChangeMode("edit");
              }}
              variant="monoOutline"
            >
              관리
            </Button>
          )}
        </TableSection.Header>
      </div>
      <div>
        {isEdit ? (
          <SurfaceConstructionsEditTable
            columns={surfaceConstructionsColumn}
            data={systemList.filter((item) => item.type === type)}
            errors={tableEditValidator.validationErrors}
            onBeforeDelete={actionEditTable.onBeforeDelete}
            openDialog={openDialog}
            setData={setFloorData}
            type={type}
          />
        ) : (
          <SurfaceConstructionsViewTable
            columns={surfaceConstructionsViewColumn}
            data={surface_constructions}
            getPlacementButton={actionEditTable?.PlacementButton}
            setData={() => {}}
            setMode={handleChangeMode}
          />
        )}
      </div>
    </>
  );
};
