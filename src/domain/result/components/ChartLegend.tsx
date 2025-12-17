import { chartConfig } from "@/domain/result/components/StackedChartComponent";
import { resultChartColors } from "@/domain/result/constants/result.color";

export const ChartLegend = () => {
  return (
    <div className="flex text-xs">
      <div className="flex items-center gap-2 text-neutral-600">
        <p className="text-neutral-700">리모델링 전</p>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 opacity-50"
            style={{ backgroundColor: chartConfig.electricityBefore.color }}
          />
          <span>전기</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 opacity-50"
            style={{ backgroundColor: chartConfig.gasBefore.color }}
          />
          <span>가스</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 opacity-50"
            style={{ backgroundColor: chartConfig.fuelBefore.color }}
          />
          <span>유류</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 opacity-50"
            style={{ backgroundColor: chartConfig.gasBefore.color }}
          />
          <span>지역난방</span>
        </div>
      </div>
      <p className="px-2 text-neutral-700">|</p>
      <div className="text-bk7 flex items-center gap-2">
        <p className="text-neutral-700">리모델링 후</p>
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2"
            style={{ backgroundColor: chartConfig.electricityAfter.color }}
          />
          <span>전기</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2" style={{ backgroundColor: chartConfig.gasAfter.color }} />
          <span>가스</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2" style={{ backgroundColor: chartConfig.fuelAfter.color }} />
          <span>유류</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2" style={{ backgroundColor: chartConfig.gasAfter.color }} />
          <span>지역난방</span>
        </div>
      </div>
    </div>
  );
};

export const RadarChartLegend = () => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="text-bk7 flex items-center gap-2">
        <div
          className="border-primary h-2 w-2"
          style={{ backgroundColor: resultChartColors.radarAfter }}
        />
        <p className="text-bk8">리모델링 전</p>
      </div>
      <div className="text-bk7 flex items-center gap-2">
        <div className="h-2 w-2 border-neutral-400 bg-neutral-200" />
        <p className="text-bk8">리모델링 후</p>
      </div>
    </div>
  );
};
