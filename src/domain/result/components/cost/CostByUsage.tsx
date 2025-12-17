import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Bar, BarChart, XAxis } from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { resultChartColors } from "@/domain/result/constants/result.color";
import { formatCurrency } from "@/lib/utils";
import { TResultUseCost } from "@/schemas/result.schema";

const USAGE_CATEGORIES = [
  { color: resultChartColors.cooling, key: "cooling", label: "냉방" },
  { color: resultChartColors.heating, key: "heating", label: "난방" },
  { color: resultChartColors.hotwater, key: "hotwater", label: "급탕" },
  { color: resultChartColors.lightning, key: "lighting", label: "조명" },
  { color: resultChartColors.circulation, key: "circulation", label: "환기" },
] as const;

type TUsageLabel = (typeof USAGE_CATEGORIES)[number]["label"];

const chartConfig: ChartConfig = Object.fromEntries(
  USAGE_CATEGORIES.map((c) => [c.key, { color: c.color, label: c.label }]),
);

const columnHelper = createColumnHelper<{
  after: number;
  before: number;
  label: TUsageLabel;
  saving: number;
  saving_rate: number;
}>();

type TProps = {
  data: TResultUseCost;
};

export const CostByUsage = ({ data }: TProps) => {
  const { circulation, cooling, heating, hotwater, lighting } = data;

  const chartData = [
    {
      circulation: circulation.gr_before,
      cooling: cooling.gr_before,
      heating: heating.gr_before,
      hotwater: hotwater.gr_before,
      label: "GR 전",
      lighting: lighting.gr_before,
    },
    {
      circulation: circulation.gr_after,
      cooling: cooling.gr_after,
      heating: heating.gr_after,
      hotwater: hotwater.gr_after,
      label: "GR 후",
      lighting: lighting.gr_after,
    },
  ];

  const tableData = USAGE_CATEGORIES.map((c) => {
    const before = data[c.key].gr_before;
    const after = data[c.key].gr_after;
    const saving = data[c.key].diff;
    const saving_rate = data[c.key].diff_rate;

    return {
      after,
      before,
      label: c.label,
      saving,
      saving_rate,
    };
  });

  const COST_BY_USAGE_COLUMNS = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.label, {
        cell: ({ getValue }) => {
          const cat = USAGE_CATEGORIES.find((c) => c.label === getValue());
          const color = cat?.color ?? "#fff";

          return (
            <div className="flex items-center gap-1">
              <span className="flex items-center justify-center p-1">
                <span className="h-2 w-2" style={{ backgroundColor: color }} />
              </span>
              <span className="block text-left text-xs">{getValue()}</span>
            </div>
          );
        },
        header: "",
        id: "label",
      }),
      columnHelper.accessor((row) => row.before, {
        cell: ({ getValue }) => (getValue() ? formatCurrency(getValue()) : "-"),
        header: "GR 전",
        id: "before",
      }),
      columnHelper.accessor((row) => row.after, {
        cell: ({ getValue }) => (getValue() ? formatCurrency(getValue()) : "-"),
        header: "GR 후",
        id: "after",
      }),
      columnHelper.accessor((row) => row.saving, {
        cell: ({ getValue }) => (getValue() ? formatCurrency(getValue()) : "-"),
        header: "절감",
        id: "saving",
      }),
      columnHelper.accessor((row) => row.saving_rate, {
        cell: ({ getValue }) => (getValue() ? `${formatCurrency(getValue())}%` : "-"),
        header: "절감률",
        id: "saving_rete",
      }),
    ];
  }, []);

  const table = useReactTable({
    columns: COST_BY_USAGE_COLUMNS,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col gap-5">
      <ResultItemTitle title="용도별 요금" unit="천 원" />
      <div className="flex flex-col items-center gap-2.5">
        {/* 차트 영역 */}
        <div>
          <ChartContainer className="h-[217px] w-[190px]" config={chartConfig}>
            <BarChart accessibilityLayer barSize={60} data={chartData}>
              <XAxis
                axisLine={true}
                dataKey="label"
                padding={{ left: 20, right: 20 }}
                tickLine={false}
                tickMargin={4}
              />
              <Bar dataKey="circulation" fill="var(--color-circulation)" stackId="after" />
              <Bar dataKey="lighting" fill="var(--color-lighting)" stackId="after" />
              <Bar dataKey="hotwater" fill="var(--color-hotwater)" stackId="after" />
              <Bar dataKey="heating" fill="var(--color-heating)" stackId="after" />
              <Bar dataKey="cooling" fill="var(--color-cooling)" stackId="after" />
            </BarChart>
          </ChartContainer>
        </div>
        {/* 테이블 영역 */}
        <div>
          <table className="w-full table-fixed">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="text-neutral560 px-1 py-2 text-center text-xs font-medium"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr className="border-neutral160 border border-x-0" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="text-2xs text-neutral480 px-1 py-2 text-center"
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
