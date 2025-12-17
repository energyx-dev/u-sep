import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { NewTemplateLayout } from "@/components/layout/NewTemplateLayout";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NewAddSystemSelect } from "@/domain/systems/components/NewAddSystemSelect";
import { SourceSystemTableSection } from "@/domain/systems/source/components/SourceSystemTableSection";
import { SOURCE_SYSTEM_LABEL } from "@/domain/systems/source/constants/source-system.constants";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { SupplySystemTableSection } from "@/domain/systems/supply/components/SupplySystemTableSection";
import { SUPPLY_SYSTEM_LABEL } from "@/domain/systems/supply/constants/supply-system.constants";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";

const NewSourceSupplySystemPage = () => {
  const [selectedSupplyState, setSelectedSupplyState] = useState<ESupplySystemType>(); // 공급 설비 추가 선택 타입
  const [selectedSourceState, setSelectedSourceState] = useState<ESourceSystemType>(); // 생산 설비 추가 선택 타입

  // 공급 설비 전역 데이터
  const supplySystemState = useSupplySystemStore(
    useShallow((state) => ({
      [ESupplySystemType.AIR_HANDLING_UNIT]: state[ESupplySystemType.AIR_HANDLING_UNIT],
      [ESupplySystemType.ELECTRIC_RADIATOR]: state[ESupplySystemType.ELECTRIC_RADIATOR],
      [ESupplySystemType.FAN_COIL_UNIT]: state[ESupplySystemType.FAN_COIL_UNIT],
      [ESupplySystemType.PACKAGED_AIR_CONDITIONER]:
        state[ESupplySystemType.PACKAGED_AIR_CONDITIONER],
      [ESupplySystemType.RADIANT_FLOOR]: state[ESupplySystemType.RADIANT_FLOOR],
      [ESupplySystemType.RADIATOR]: state[ESupplySystemType.RADIATOR],
    })),
  );

  // 생산 설비 전역 데이터
  const sourceSystemState = useSourceSystemStore(
    useShallow((state) => ({
      [ESourceSystemType.ABSORPTION_CHILLER]: state.absorption_chiller,
      [ESourceSystemType.BOILER]: state.boiler,
      [ESourceSystemType.CHILLER]: state.chiller,
      [ESourceSystemType.DISTRICT_HEATING]: state.district_heating,
      [ESourceSystemType.GEOTHERMAL_HEATPUMP]: state.geothermal_heatpump,
      [ESourceSystemType.HEATPUMP]: state.heatpump,
    })),
  );

  /**
   * 공급 설비 데이터 가공
   *
   * sortedSupplySystemsEntries: label 순으로 정렬된 데이터 (Array)
   * hasSupplyData: 공급 설비 데이터가 있는지 체크하는 변수 (boolean)
   * supplyItems: 0개의 공급 설비만 필터링하여 Select 에 넘겨줄 데이터 (Array)
   */
  const { hasSupplyData, sortedSupplySystemsEntries, supplyItems } = useMemo(() => {
    let hasData = false;

    const entries = Object.entries(supplySystemState)
      .map(([key, value]) => {
        const type = key as ESupplySystemType;
        const data = value as TSupplySystemGuiSchema[ESupplySystemType];

        if (data.length > 0) hasData = true;

        return {
          data,
          label: SUPPLY_SYSTEM_LABEL[type],
          type,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const itemsArr = entries
      .filter(({ data }) => data.length === 0)
      .map(({ data: _data, ...rest }) => rest);

    return {
      hasSupplyData: hasData,
      sortedSupplySystemsEntries: entries,
      supplyItems: itemsArr,
    };
  }, [supplySystemState]);

  /**
   * 생산 설비 데이터 가공
   *
   * sortedSourceSystemsEntries: label 순으로 정렬된 데이터 (Array)
   * hasSourceData: 생산 설비 데이터가 있는지 체크하는 변수 (boolean)
   * sourceItems: 0개의 생산 설비만 필터링하여 Select 에 넘겨줄 데이터 (Array)
   */
  const { hasSourceData, sortedSourceSystemsEntries, sourceItems } = useMemo(() => {
    let hasData = false;

    const entries = Object.entries(sourceSystemState)
      .map(([key, value]) => {
        const type = key as ESourceSystemType;
        const data = value as TSourceSystemGuiSchema[ESourceSystemType];

        if (data.length > 0) hasData = true;

        return {
          data,
          label: SOURCE_SYSTEM_LABEL[type],
          type,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const itemsArr = entries
      .filter(({ data }) => data.length === 0)
      .map(({ data: _data, ...rest }) => rest);

    return {
      hasSourceData: hasData,
      sortedSourceSystemsEntries: entries,
      sourceItems: itemsArr,
    };
  }, [sourceSystemState]);

  // 공급 설비 Select 선택 이벤트
  const handleSupplySelect = (value: string) => {
    setSelectedSupplyState(value as ESupplySystemType);
  };

  // 생산 설비 Select 선택 이벤트
  const handleSourceSelect = (value: string) => {
    setSelectedSourceState(value as ESourceSystemType);
  };

  return (
    <NewTemplateLayout>
      <ResizablePanelGroup className="flex min-h-dvh flex-col" direction="vertical">
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <div className="mb-10 flex items-center justify-between">
            <HeadingWithRequired heading={PAGE_TITLES.SUPPLY_SYSTEM} />
            <NewAddSystemSelect
              items={supplyItems}
              onSelect={handleSupplySelect}
              triggerLabel="공급 설비 추가"
            />
          </div>
          <div className="flex flex-col gap-9">
            {!hasSupplyData && !selectedSupplyState ? (
              <p className="text-neutral480 py-20 text-center">등록된 공급 설비가 없습니다.</p>
            ) : (
              sortedSupplySystemsEntries.map(({ data, type }) =>
                selectedSupplyState === type || data.length > 0 ? (
                  <div key={type}>
                    <SupplySystemTableSection supplySystem={data} supplySystemType={type} />
                  </div>
                ) : null,
              )
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle className="my-5" withHandle />
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <div className="mb-10 flex items-center justify-between">
            <HeadingWithRequired heading={PAGE_TITLES.SOURCE_SYSTEM} />
            <NewAddSystemSelect
              items={sourceItems}
              onSelect={handleSourceSelect}
              triggerLabel="생산 설비 추가"
            />
          </div>
          <div className="flex flex-col gap-9">
            {!hasSourceData && !selectedSourceState ? (
              <p className="text-neutral480 py-20 text-center">등록된 생산 설비가 없습니다.</p>
            ) : (
              sortedSourceSystemsEntries.map(({ data, type }) =>
                selectedSourceState === type || data.length > 0 ? (
                  <div key={type}>
                    <SourceSystemTableSection sourceSystem={data} sourceSystemType={type} />
                  </div>
                ) : null,
              )
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </NewTemplateLayout>
  );
};

export default NewSourceSupplySystemPage;
