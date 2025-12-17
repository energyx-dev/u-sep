"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartLegend } from "@/domain/result/components/ChartLegend";
import { resultChartColors } from "@/domain/result/constants/result.color";
import { UseCategoryKeyEnum } from "@/domain/result/constants/result.enum";
import { getEnergySourceMonthlySums } from "@/domain/result/helpers/helper";
import { TGrrSchema } from "@/schemas/result.schema";

export const chartConfig = {
  electricityAfter: { color: resultChartColors.electricityAfter, label: "전기 (후)" },
  electricityBefore: { color: resultChartColors.electricityBefore, label: "전기 (전)" },
  fuelAfter: { color: resultChartColors.fuelAfter, label: "유류 (후)" },
  fuelBefore: { color: resultChartColors.fuelBefore, label: "유류 (전)" },
  gasAfter: { color: resultChartColors.gasAfter, label: "가스 (후)" },
  gasBefore: { color: resultChartColors.gasBefore, label: "가스 (전)" },
  heatAfter: { color: resultChartColors.heatAfter, label: "지역난방 (후)" },
  heatBefore: { color: resultChartColors.heatBefore, label: "지역난방 (전)" },
} satisfies ChartConfig;

interface IProps {
  data: {
    after: TGrrSchema;
    before: TGrrSchema;
  };
  labelKey: UseCategoryKeyEnum;
  title?: string;
}

export function StackedChartComponent({ data, labelKey, title }: IProps) {
  const { after, before } = data;

  const beforeSiteUsesData = before.site_uses[labelKey] ?? {};
  const beforeSourceUsesData = before.source_uses[labelKey] ?? {};
  const beforeCo2Data = before.co2[labelKey] ?? {};

  const afterSiteUsesData = after.site_uses[labelKey] ?? {};
  const afterSourceUsesData = after.source_uses[labelKey] ?? {};
  const afterCo2Data = after.co2[labelKey] ?? {};

  const beforeMonthlySums = getEnergySourceMonthlySums(
    beforeSiteUsesData,
    beforeSourceUsesData,
    beforeCo2Data,
  );

  const afterMonthlySums = getEnergySourceMonthlySums(
    afterSiteUsesData,
    afterSourceUsesData,
    afterCo2Data,
  );

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    electricityAfter: afterMonthlySums.ELECTRICITY[i],
    electricityBefore: beforeMonthlySums.ELECTRICITY[i],
    fuelAfter: afterMonthlySums.OIL[i],
    fuelBefore: beforeMonthlySums.OIL[i],
    gasAfter: afterMonthlySums.NATURALGAS[i],
    gasBefore: beforeMonthlySums.NATURALGAS[i],
    heatAfter: afterMonthlySums.DISTRICTHEATING[i],
    heatBefore: beforeMonthlySums.DISTRICTHEATING[i],
    month: `${i + 1}월`,
  }));

  return (
    <Card className="gap-5 border-none p-0 shadow-none">
      <CardHeader className="border-primary flex items-center justify-between border-l-4 pl-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <p className="text-bk7 text-xs">단위: kWh/m²</p>
        </div>
        <ChartLegend />
      </CardHeader>
      <CardContent>
        <ChartContainer className="max-h-[255px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer barSize={20} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value}
              tickLine={false}
              tickMargin={2}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="electricityBefore"
              fill="var(--color-electricityBefore)"
              stackId="before"
            />
            <Bar dataKey="gasBefore" fill="var(--color-gasBefore)" stackId="before" />
            <Bar dataKey="fuelBefore" fill="var(--color-fuelBefore)" stackId="before" />
            <Bar dataKey="heatBefore" fill="var(--color-heatBefore)" stackId="before" />
            <Bar dataKey="electricityAfter" fill="var(--color-electricityAfter)" stackId="after" />
            <Bar dataKey="gasAfter" fill="var(--color-gasAfter)" stackId="after" />
            <Bar dataKey="fuelAfter" fill="var(--color-fuelAfter)" stackId="after" />
            <Bar dataKey="heatAfter" fill="var(--color-heatAfter)" stackId="after" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
