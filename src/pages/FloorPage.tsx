import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { HeadingWithRequired } from "@/components/custom/HeadingWithRequired";
import { Form } from "@/components/ui/form";
import { PLACEHOLDERS } from "@/constants/placeholders";
import { FormInput } from "@/domain/basic-info/components/FormInput";
import { useShapeInfoFloorForm } from "@/domain/shape-info/hooks/useShapeInfoFloorForm";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";

const FloorPage = () => {
  const { floorId } = useParams();
  const { buildingFloors: shapeInfo } = useBuildingGeometryStore();

  const floor = useMemo(() => {
    const floor = shapeInfo.find((e) => e.floor_id === floorId);

    if (!floor) return undefined;
    return floor;
  }, [shapeInfo, floorId]);

  const { form, handleChangeFloorName } = useShapeInfoFloorForm({ floor: floor! });

  return (
    <div className="relative">
      <div className="container-page">
        <div className="mb-10">
          {floor ? (
            <HeadingWithRequired
              heading={
                floor.floor_number < 0
                  ? `${floor.floor_name}(B${-floor.floor_number}F)`
                  : `${floor.floor_name}(${floor.floor_number}F)`
              }
            />
          ) : (
            <HeadingWithRequired heading={`${undefined}(${undefined}F)`} />
          )}
        </div>
        <Form {...form}>
          <FormInput
            form={form}
            isRequired
            label="층 이름"
            name="floor_name"
            onBlurCallback={handleChangeFloorName}
            placeholder={PLACEHOLDERS.FLOOR.FLOOR_NAME}
          />
        </Form>
      </div>
      {/* <div className="w-full">
        <Separator className="bg-neutral240 my-1 h-[1px]" />
        {floor?.zones.length === 0 ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <EmptyText emptyText="등록된 존이 없습니다." />
          </div>
        ) : (
          <div className="w-full">
            <InputVisualProvider>
              <VisualizationZoneFields />
            </InputVisualProvider>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default FloorPage;
