import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { resultChartColors } from "@/domain/result/constants/result.color";
import { TResultSchemaV2 } from "@/schemas/result.schema";

const chartConfig = {
  afterTotal: { color: resultChartColors.beforeAll, label: "개선 후 합계" },
  beforeTotal: { color: resultChartColors.beforeAll, label: "개선 전 합계" },
  district_heating: { color: resultChartColors.district_heating, label: "지역난방" },
  electricity: { color: resultChartColors.electricity, label: "전기" },
  generator: { color: resultChartColors.generator, label: "태양광" },
  natural_gas: { color: resultChartColors.natural_gas, label: "가스" },
  oil: { color: resultChartColors.oil, label: "유류" },
} satisfies ChartConfig;

interface IProps {
  data:
    | TResultSchemaV2["circulation_uses"]
    | TResultSchemaV2["cooling_uses"]
    | TResultSchemaV2["generators_uses"]
    | TResultSchemaV2["heating_uses"]
    | TResultSchemaV2["hotwater_uses"]
    | TResultSchemaV2["lighting_uses"];
  title: string;
}

export function UsesStackedChartComponent({ data, title }: IProps) {
  const { after, before_total } = data;

  const to2 = (v: number | undefined) => Number((v ?? 0).toFixed(2));
  const A = after as Record<string, number[]>;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    // Bar stacks → after (energy sources)
    districtheating: to2(A.DISTRICTHEATING?.[i]),
    electricity: to2(A.ELECTRICITY?.[i]),
    naturalgas: to2(A.NATURALGAS?.[i]),
    oil: to2(A.OIL?.[i]),
    // Line → before_total
    beforeTotal: to2(before_total?.[i]),
  }));

  const yAxisDomain = (() => {
    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((item) => {
      const stackedTotal = item.electricity + item.naturalgas + item.oil + item.districtheating;
      const lineValue = item.beforeTotal;

      min = Math.min(min, stackedTotal, lineValue);
      max = Math.max(max, stackedTotal, lineValue);
    });

    const padding = (max - min) * 0.05;
    return [Math.max(0, min - padding), max + padding];
  })();

  // 데이터 범위가 작을 경우(예: 2 미만) 소수점 2자리까지 표시 -> y축 값 뭉침 방지
  const formatYAxis = (value: number) => {
    const maxVal = yAxisDomain[1];
    if (maxVal < 2) {
      return Number(value).toFixed(2);
    }
    return Number(value).toFixed(1);
  };

  return (
    <Card className="gap-5 border-none p-0 shadow-none">
      <ResultItemTitle title={title} unit="kWh/m²" />
      <CardContent className="px-0 pl-25">
        <ChartContainer className="max-h-[255px] w-full" config={chartConfig}>
          <ComposedChart accessibilityLayer barSize={36} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={2} />
            <YAxis
              axisLine={false}
              domain={yAxisDomain}
              stroke="#D5D5D5"
              tick={{ fill: "#D5D5D5", fontSize: 10 }}
              tickFormatter={formatYAxis}
              width={24}
            />

            {/* Bars */}
            <Bar dataKey="naturalgas" fill="var(--color-natural_gas)" stackId="after" />
            <Bar dataKey="oil" fill="var(--color-oil)" stackId="after" />
            <Bar dataKey="districtheating" fill="var(--color-district_heating)" stackId="after" />
            <Bar dataKey="electricity" fill="var(--color-electricity)" stackId="after" />

            {/* Line */}
            <Line dataKey="beforeTotal" dot stroke="#959595" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
