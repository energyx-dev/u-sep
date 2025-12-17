"use client";

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { resultChartColors } from "@/domain/result/constants/result.color";

export const chartConfig = {
  afterTotal: { color: resultChartColors.beforeAll, label: "개선 후 합계" },
  beforeTotal: { color: resultChartColors.beforeAll, label: "개선 전 합계" },
  circulation: { color: resultChartColors.circulation, label: "환기" },
  cooling: { color: resultChartColors.cooling, label: "냉방" },
  heating: { color: resultChartColors.heating, label: "난방" },
  hotwater: { color: resultChartColors.hotwater, label: "급탕" },
  lightning: { color: resultChartColors.lightning, label: "조명" },
} satisfies ChartConfig;

interface DetailEnergySeries {
  [key: string]: number[] | undefined;
}

interface IProps {
  data: {
    after: DetailEnergySeries; // keys should align with EnergySourceKeyEnum (ELECTRICITY, NATURALGAS, OIL, DISTRICTHEATING)
    before: DetailEnergySeries;
    title: string;
    unit: string;
  };
}

export function DetailStackedChartComponent({ data }: IProps) {
  const { after, before, title, unit } = data;

  const to2 = (v: number | undefined) => Number((v ?? 0).toFixed(2));
  const A = after as Record<string, number[]>;
  const B = before as Record<string, number[]>;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    // 막대(개선 후): chartConfig 키와 동일하게 매핑
    circulation: to2(A.circulation?.[i]),
    cooling: to2(A.cooling?.[i]),
    heating: to2(A.heating?.[i]),
    hotwater: to2(A.hotwater?.[i]),
    lightning: to2(A.lighting?.[i]), // 데이터 키는 lighting, chartConfig 키는 lightning
    // 라인(개선 전/후 총합)
    afterTotal: to2(A.total?.[i]),
    beforeTotal: to2(B.total?.[i]),
  }));

  // Y축 domain 계산: Line과 stacked Bar의 최소/최대값
  const yAxisDomain = (() => {
    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((item) => {
      const stackedTotal =
        item.cooling + item.heating + item.hotwater + item.lightning + item.circulation;
      const lineValue = item.beforeTotal;

      min = Math.min(min, stackedTotal, lineValue);
      max = Math.max(max, stackedTotal, lineValue);
    });

    const padding = (max - min) * 0.05;
    return [Math.max(0, min - padding), max + padding];
  })();

  return (
    <Card className="gap-5 border-none p-0 shadow-none">
      <ResultItemTitle title={title} unit={unit} />
      <CardContent className="px-0 pl-25">
        <ChartContainer className="max-h-[255px] w-full" config={chartConfig}>
          <ComposedChart accessibilityLayer barSize={36} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              stroke="#D5D5D5"
              tickLine={false}
              tickMargin={2}
            />
            <YAxis
              axisLine={false}
              domain={yAxisDomain}
              stroke="#D5D5D5"
              tick={{ fill: "#D5D5D5", fontSize: 10 }}
              tickFormatter={(value) => Number(value).toFixed(1)}
              width={24}
            />

            {/* Stacked Bars */}
            <Bar dataKey="circulation" fill="var(--color-circulation)" stackId="after" />
            <Bar dataKey="lightning" fill="var(--color-lightning)" stackId="after" />
            <Bar dataKey="hotwater" fill="var(--color-hotwater)" stackId="after" />
            <Bar dataKey="heating" fill="var(--color-heating)" stackId="after" />
            <Bar dataKey="cooling" fill="var(--color-cooling)" stackId="after" />

            {/* Line */}
            <Line dataKey="beforeTotal" dot stroke="#959595" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
