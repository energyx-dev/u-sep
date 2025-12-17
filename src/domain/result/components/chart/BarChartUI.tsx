import { Bar, BarChart, Cell, LabelList, XAxis } from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { resultChartColors } from "@/domain/result/constants/result.color";

const chartConfig = {
  afterTotalAnnual: {
    label: "GR 후",
  },
  beforeTotalAnnual: {
    label: "GR 전",
  },
} satisfies ChartConfig;

export function BarChartUI({
  afterTotalAnnual,
  beforeTotalAnnual,
}: {
  afterTotalAnnual: number;
  beforeTotalAnnual: number;
}) {
  const data = [
    {
      label: chartConfig.beforeTotalAnnual.label,
      value: beforeTotalAnnual,
    },
    {
      label: chartConfig.afterTotalAnnual.label,
      value: afterTotalAnnual,
    },
  ];

  return (
    <ChartContainer className="h-[217px] w-[136px]" config={chartConfig}>
      <BarChart
        accessibilityLayer
        barGap={12}
        barSize={56}
        data={data}
        margin={{
          top: 36,
        }}
      >
        <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={4} />
        <defs>
          <linearGradient id="beforeGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={resultChartColors.barBefore} />
          </linearGradient>
          <linearGradient id="afterGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={resultChartColors.barAfter} />
          </linearGradient>
        </defs>
        <Bar dataKey="value">
          <LabelList className="font-medium" dataKey="value" fontSize={13} position="top" />
          {data.map((entry, index) => (
            <Cell
              fill={
                entry.label === chartConfig.beforeTotalAnnual.label
                  ? resultChartColors.barBefore
                  : resultChartColors.barAfter
              }
              key={`cell-${index}`}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
