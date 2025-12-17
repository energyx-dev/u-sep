import { RadarChartUI } from "@/domain/result/components/chart/RadarChartUI";
import { RESULT_TOTAL_LABEL } from "@/domain/result/constants/result.label";
import { TGrrSchema } from "@/schemas/result.schema";

interface IProps {
  data: {
    after: TGrrSchema["co2"] | TGrrSchema["site_uses"] | TGrrSchema["source_uses"];
    before: TGrrSchema["co2"] | TGrrSchema["site_uses"] | TGrrSchema["source_uses"];
  };
  labelKey: keyof typeof RESULT_TOTAL_LABEL;
}

export const RadarChartComponent = ({ data, labelKey }: IProps) => {
  const { title, unit } = RESULT_TOTAL_LABEL[labelKey];

  return (
    <div className="w-full space-y-4 rounded-md bg-white p-1">
      <div className="flex items-center justify-between">
        <div className="border-primary border-l-4 pl-2">
          <p className="text-bk11 text-lg font-semibold">{title}</p>
          <p className="text-bk7 text-2xs">단위: {unit}</p>
        </div>
      </div>
      <RadarChartUI data={data} />
    </div>
  );
};
