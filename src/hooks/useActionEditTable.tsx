import { useOverlay } from "@toss/use-overlay";
import { Ellipsis, EllipsisVertical, Plus } from "lucide-react";
import { useCallback } from "react";

import { PopoverUI } from "@/components/custom/PopoverUI";
import { FenestrationPlacementDialog } from "@/components/dialog/FenestrationPlacementDialog";
import { LightningDensityPlacementDialog } from "@/components/dialog/LightningDensityPlacementDialog";
import { LightningPlacementDialog } from "@/components/dialog/LightningPlacementDialog";
import { RenewablePlacementDialog } from "@/components/dialog/RenewablePlacementDialog";
import { SupplySystemPlacementDialog } from "@/components/dialog/SupplySystemPlacementDialog";
import { SurfaceConstructionPlacementDialog } from "@/components/dialog/SurfaceConstructionPlacementDialog";
import { VentilationSystemPlacementDialog } from "@/components/dialog/VentilationSystemPlacementDialog";
import { Table } from "@/components/table/Table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ThreeStateCheckbox } from "@/components/ui/three-state-checkbox";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { useSetToggle } from "@/hooks/useSetToggle";
import { cn } from "@/lib/utils";

interface IParams<
  T extends {
    id?: string;
    name?: string;
  },
> {
  data: Partial<T>[];
  onBeforeDelete?: (deletedItems: Partial<T>[]) => Promise<boolean | undefined>;
  setData: (update: Partial<T>[]) => void;
}

export const useActionEditTable = <T extends { id?: string; name?: string }>({
  data,
  onBeforeDelete,
  setData,
}: IParams<T>) => {
  const {
    selected: checkedRowIndexList,
    setSelected: setCheckedRowIndexList,
    toggle: toggleCheckedRowIndexList,
  } = useSetToggle<number>(new Set());
  const hasCheckedRowIndexList = checkedRowIndexList.size > 0;

  const handleAddRow = useCallback(() => {
    setData([...data, {}]);
  }, [data, setData]);

  // 공급 설비 행 추가 시 용도의 기본 값 추가
  const handleSupplyAddRow = useCallback(
    <K extends ESupplySystemType>(
      systemType: K,
      defaultValues?: Partial<TSupplySystemGuiSchema[K][number]>,
    ) => {
      const purposeByType: Record<ESupplySystemType, EPurpose | null> = {
        [ESupplySystemType.AIR_HANDLING_UNIT]: EPurpose.COOLING_HEATING, // 냉난방 (필요시 양방향 enum으로 교체)
        [ESupplySystemType.ELECTRIC_RADIATOR]: EPurpose.HEATING,
        [ESupplySystemType.FAN_COIL_UNIT]: null,
        [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: EPurpose.COOLING,
        [ESupplySystemType.RADIANT_FLOOR]: EPurpose.HEATING,
        [ESupplySystemType.RADIATOR]: EPurpose.HEATING,
      };

      const baseRow: TSupplySystemGuiSchema[K][number] = {
        ...(purposeByType[systemType] ? { purpose: purposeByType[systemType]! } : {}),
        ...(defaultValues as TSupplySystemGuiSchema[K][number]),
      };
      // If the row has a source_system_id field, set its default to null
      if ("source_system_id" in baseRow) {
        (baseRow as { source_system_id: null | string }).source_system_id = null;
      }

      setData([...data, baseRow as unknown as Partial<T>]);
    },
    [data, setData],
  );

  const handleCopyRow = useCallback(() => {
    const copyData = data
      .filter((_, index) => checkedRowIndexList.has(index))
      .map(({ name, ...rest }) => ({
        ...rest,
        id: undefined,
        name: name ? `${name}_복사` : "",
      })) as Partial<T>[];

    setData([...data, ...copyData]);
    setCheckedRowIndexList(new Set());
  }, [checkedRowIndexList, data, setCheckedRowIndexList, setData]);

  const handleDeleteRow = useCallback(async () => {
    const itemToDelete = data.filter((_, index) => checkedRowIndexList.has(index));
    const remainingItems = data.filter((_, index) => !checkedRowIndexList.has(index));

    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete(itemToDelete);
      if (!canDelete) {
        return;
      }
    }
    setData(remainingItems);
    setCheckedRowIndexList(new Set());
  }, [checkedRowIndexList, data, setCheckedRowIndexList, setData, onBeforeDelete]);

  const handleCopyRowByIndex = useCallback(
    (rowIndex: number) => {
      const src = data[rowIndex] ?? ({} as Partial<T>);
      const { name, ...rest } = src as Partial<T> & { name?: string };
      const copied = {
        ...rest,
        id: undefined,
        name: name ? `${name}_복사` : "",
      } as Partial<T>;
      setData([...data, copied]);
    },
    [data, setData],
  );

  const handleDeleteRowByIndex = useCallback(
    (rowIndex: number) => {
      setData(data.filter((_, i) => i !== rowIndex));
    },
    [data, setData],
  );

  const checkAllRows = useCallback(() => {
    const all = new Set<number>();
    data.forEach((_, idx) => all.add(idx));
    setCheckedRowIndexList(all);
  }, [data, setCheckedRowIndexList]);

  const resetCheckedRows = useCallback(() => {
    setCheckedRowIndexList(new Set());
  }, [setCheckedRowIndexList]);

  const toggleCheckAll = useCallback(() => {
    if (checkedRowIndexList.size === data.length) {
      resetCheckedRows();
    } else {
      checkAllRows();
    }
  }, [checkedRowIndexList, data.length, checkAllRows, resetCheckedRows]);

  // jsx
  const CopyOrRemoveActionButton = (
    <PopoverUI
      options={[
        {
          label: "복사",
          onClick: handleCopyRow,
          value: "copy",
        },
        {
          label: "삭제",
          onClick: handleDeleteRow,
          value: "delete",
        },
      ]}
      portal
      triggerClassName={cn(
        "bg-white pointer-events-none absolute -top-2 right-8 !p-1 opacity-0 transition-opacity duration-200 ease-in-out",
        hasCheckedRowIndexList && "pointer-events-auto opacity-100",
      )}
      triggerNode={<Ellipsis height={16} width={16} />}
    />
  );

  const CopyOrRemoveActionCellButton = ({ rowIndex }: { rowIndex: number }) => (
    <PopoverUI
      options={[
        {
          label: "복사",
          onClick: () => handleCopyRowByIndex(rowIndex),
          value: "copy",
        },
        // {
        //   label: "삭제",
        //   onClick: () => handleDeleteRowByIndex(rowIndex),
        //   value: "delete",
        // },
      ]}
      portal
      triggerClassName={cn(
        "bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent data-[state=open]:bg-transparent",
      )}
      triggerNode={<EllipsisVertical height={16} width={16} />}
    />
  );

  const AddRowButton = (
    <Button
      className="flex w-full items-center justify-start gap-1 rounded-none border-b border-gray-200 px-3 py-2 text-[#767676]"
      onClick={handleAddRow}
      variant="ghost"
    >
      <Plus className="aspect-square h-3 w-3 text-current" />
      <span className="text-2xs font-medium">행 추가</span>
    </Button>
  );

  const PlacementButton = ({
    isEditMode = false,
    systemId,
    systemObj,
    type,
  }: {
    isEditMode?: boolean;
    systemId: string;
    systemObj: Partial<T>;
    type: string;
  }) => {
    const overlay = useOverlay();

    const openPhotovoltaicPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <RenewablePlacementDialog isOpen={isOpen} onClose={close} renewableSystemId={systemId} />
      ));
    }, [overlay, systemId]);

    const openLightningPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <LightningPlacementDialog isOpen={isOpen} onClose={close} renewableSystemId={systemId} />
      ));
    }, [overlay, systemId]);

    const openLightningDensityPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <LightningDensityPlacementDialog isOpen={isOpen} onClose={close} systemObj={systemObj} />
      ));
    }, [overlay, systemId]);

    const openSupplySystemPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <SupplySystemPlacementDialog
          isOpen={isOpen}
          onClose={close}
          supplySystemId={systemId}
          systemObj={systemObj}
        />
      ));
    }, [overlay, systemId]);

    const openVentilationSystemPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <VentilationSystemPlacementDialog
          isOpen={isOpen}
          onClose={close}
          supplySystemId={systemId}
          systemObj={systemObj}
        />
      ));
    }, [overlay, systemId]);

    const openFenestrationPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <FenestrationPlacementDialog
          isOpen={isOpen}
          onClose={close}
          supplySystemId={systemId}
          systemObj={systemObj}
        />
      ));
    }, [overlay, systemId]);

    const openSurfaceConstructionPlacementDialog = useCallback(() => {
      overlay.open(({ close, isOpen }) => (
        <SurfaceConstructionPlacementDialog isOpen={isOpen} onClose={close} systemObj={systemObj} />
      ));
    }, [overlay, systemObj]);

    switch (type) {
      case "density":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openLightningDensityPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "fenestration":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openFenestrationPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "lightning":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openLightningPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "photovoltaicSystems":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openPhotovoltaicPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "supplySystem":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openSupplySystemPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "surfaceConstruction":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openSurfaceConstructionPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      case "ventilationSystem":
        return !isEditMode ? (
          <Table.Td className="px-2">
            <Button
              className="px-1 py-0.5"
              onClick={openVentilationSystemPlacementDialog}
              variant="secondary"
            >
              배치
            </Button>
          </Table.Td>
        ) : null;
      default:
        return null;
    }
  };

  const HeaderSelectCheckbox = () => (
    <ThreeStateCheckbox
      checkIconClassName="size-3"
      className="mt-1"
      onChange={toggleCheckAll}
      value={
        checkedRowIndexList.size === data.length
          ? "checked"
          : checkedRowIndexList.size === 0
            ? "unchecked"
            : "indeterminate"
      }
    />
  );

  const RowSelectCheckbox = ({ rowIndex }: { rowIndex: number }) => (
    <Checkbox
      checked={checkedRowIndexList.has(rowIndex)}
      checkIconClassName="size-3"
      className="mt-1"
      onCheckedChange={() => toggleCheckedRowIndexList(rowIndex)}
    />
  );

  return {
    AddRowButton,
    checkedRowIndexList,
    CopyOrRemoveActionButton,
    CopyOrRemoveActionCellButton,
    handleAddRow,
    handleCopyRowByIndex,
    handleDeleteRow,
    handleDeleteRowByIndex,
    handleSupplyAddRow,
    HeaderSelectCheckbox,
    PlacementButton,
    resetCheckedRows,
    RowSelectCheckbox,
  };
};
