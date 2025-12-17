import { BarChartUI } from "@/domain/result/components/chart/BarChartUI";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { EResults } from "@/domain/result/constants/result.enum";
import { RESULT_TOTAL_LABEL } from "@/domain/result/constants/result.label";
import { TGrrSchema, TResultSchemaV2 } from "@/schemas/result.schema";

interface IProps {
  data: {
    after: TGrrSchema["summary_per_area"];
    before: TGrrSchema["summary_per_area"];
    results: TResultSchemaV2["results"];
  };
  labelKey: keyof typeof RESULT_TOTAL_LABEL;
}

export const BarChartComponent = ({ data, labelKey }: IProps) => {
  const { after, before, results } = data;
  const textData = RESULT_TOTAL_LABEL[labelKey];

  const resultData = () => {
    switch (labelKey) {
      case EResults.CO2:
        return results.co2_saving_rate;
      case EResults.SITE_USES:
        return results.energy_saving_rate;
      case EResults.SOURCE_USES:
        return results.primary_energy_saving_rate;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 bg-white">
      <ResultItemTitle title={textData.title} unit={textData.unit} />
      <div className="flex items-center justify-between px-2">
        <BarChartUI
          afterTotalAnnual={after[labelKey].total_annual}
          beforeTotalAnnual={before[labelKey].total_annual}
        />
        <div className="text-primary text-right font-bold">
          <p className="text-5xl font-extrabold">
            {resultData().toFixed(0)}
            <span className="text-4xl">%</span>
          </p>
          <p className="text-4xl">감소</p>
        </div>
      </div>
      <div className="bg-neutral160 h-[1px]" />
      <p className="text-neutral480 text-2xs">{textData.description}</p>
    </div>
  );
};
