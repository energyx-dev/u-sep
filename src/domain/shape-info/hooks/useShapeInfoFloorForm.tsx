import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { floorErrorMap } from "@/domain/shape-info/schemas/floor/floor.error-map";
import { floorGuiSchema, TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useDebugStore } from "@/store/debug.store";

export const useShapeInfoFloorForm = ({ floor }: { floor?: null | TFloorGuiSchema }) => {
  const { setShapeInfo } = useDataSyncActions();
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();
  const { isDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      isDebuggingMode: state.isDebuggingMode,
    })),
  );

  const form = useForm<TFloorGuiSchema>({
    defaultValues: {
      floor_id: floor?.floor_id,
      floor_name: floor?.floor_name,
      floor_number: floor?.floor_number,
    },
    mode: "onBlur",
    resolver: zodResolver(floorGuiSchema, { errorMap: floorErrorMap }),
  });

  useEffect(() => {
    form.reset({
      floor_id: floor?.floor_id,
      floor_name: floor?.floor_name,
      floor_number: floor?.floor_number,
    });

    // 디버깅 모드 -> 렌더링 시 에러 체크
    if (isDebuggingMode) {
      form.trigger();
    }
  }, [form, floor?.floor_id, isDebuggingMode]);

  const handleChangeFloorName = useCallback(async () => {
    if (!floor) return;

    const isValid = await form.trigger("floor_name");
    const value = form.getValues("floor_name");

    if (isValid) {
      setShapeInfo(
        shapeInfo.map((f) => (f.floor_id === floor.floor_id ? { ...f, floor_name: value } : f)),
      );
    } else {
      setShapeInfo(
        shapeInfo.map((f) => (f.floor_id === floor.floor_id ? { ...f, floor_name: `층` } : f)),
      );
    }
  }, [form, setShapeInfo, shapeInfo, floor]);

  return { form, handleChangeFloorName };
};
