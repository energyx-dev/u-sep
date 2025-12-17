import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { resultChartColors } from "@/domain/result/constants/result.color";
import { EnergySourceKeyEnum, UseCategoryKeyEnum } from "@/domain/result/constants/result.enum";
import { TGrrSchema } from "@/schemas/result.schema";

interface IProps {
  data: {
    after: TGrrSchema["co2"] | TGrrSchema["site_uses"] | TGrrSchema["source_uses"];
    before: TGrrSchema["co2"] | TGrrSchema["site_uses"] | TGrrSchema["source_uses"];
  };
}

const chartConfig = {
  after: {
    color: resultChartColors.radarAfter,
    label: "후",
  },
  before: {
    color: resultChartColors.radarBefore,
    label: "전",
  },
} satisfies ChartConfig;

export function RadarChartUI({ data }: IProps) {
  const { after, before } = data;

  const useCategories: { key: UseCategoryKeyEnum; label: string }[] = [
    { key: UseCategoryKeyEnum.COOLING, label: "냉방" },
    { key: UseCategoryKeyEnum.HEATING, label: "난방" },
    { key: UseCategoryKeyEnum.HOTWATER, label: "급탕" },
    { key: UseCategoryKeyEnum.CIRCULATION, label: "환기" },
    { key: UseCategoryKeyEnum.LIGHTING, label: "조명" },
    { key: UseCategoryKeyEnum.GENERATORS, label: "발전" },
  ];

  const getSum = (categoryObj: Partial<Record<EnergySourceKeyEnum, number[]>>) =>
    Object.values(categoryObj || {})
      .flatMap((arr) => arr)
      .reduce((sum, val) => sum + val, 0);

  const chartData = useCategories.map(({ key, label }) => ({
    after: Number(getSum(after[key] ?? {})?.toFixed(0)),
    before: Number(getSum(before[key] ?? {})?.toFixed(0)),
    label: label,
  }));

  return (
    <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={chartConfig}>
      <RadarChart
        data={chartData}
        margin={{
          bottom: 10,
          left: 10,
          right: 10,
          top: 10,
        }}
      >
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
        <PolarAngleAxis
          dataKey="label"
          tick={({ index, textAnchor, x, y, ...props }) => {
            const data = chartData[index];

            return (
              <text
                fontSize={13}
                fontWeight={500}
                textAnchor={textAnchor}
                x={x}
                y={index === 0 ? y - 10 : y}
                {...props}
              >
                <tspan className="fill-bk6">{data.before}</tspan>
                <tspan className="fill-bk6">/</tspan>
                <tspan className="fill-primary">{data.after}</tspan>
                <tspan className="fill-bk6" dy={"1rem"} fontSize={12} x={x}>
                  {data.label}
                </tspan>
              </text>
            );
          }}
        />

        <PolarGrid opacity={0.3} />
        <Radar dataKey="before" fill={chartConfig.before.color} fillOpacity={0.6} />
        <Radar dataKey="after" fill={chartConfig.after.color} fillOpacity={0.6} />
      </RadarChart>
    </ChartContainer>
  );
}
