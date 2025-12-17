import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis } from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { cn, formatCurrency } from "@/lib/utils";
import { TResultAllCost } from "@/schemas/result.schema";

const chartConfig = {} satisfies ChartConfig;
const columnHelper = createColumnHelper<{
  after: number;
  before: number;
  label: string;
  saving: number;
  saving_rate: number;
}>();

type TProps = {
  data: TResultAllCost;
};

export const TotalCost = ({ data }: TProps) => {
  const { energy_usage_cost, final_cost, saving_cost } = data;

  const chartData = [
    { label: "GR 전", value: final_cost.gr_before },
    { label: "GR 후", value: final_cost.gr_after },
  ];

  const tableData = [
    {
      after: energy_usage_cost.gr_after,
      before: energy_usage_cost.gr_before,
      label: "에너지 사용 요금",
      saving: energy_usage_cost.diff,
      saving_rate: energy_usage_cost.diff_rate,
    },
    {
      after: saving_cost.gr_after,
      before: saving_cost.gr_before,
      label: "차감(자기발전) 요금",
      saving: saving_cost.diff,
      saving_rate: saving_cost.diff_rate,
    },
    {
      after: final_cost.gr_after,
      before: final_cost.gr_before,
      label: "최종 요금",
      saving: final_cost.diff,
      saving_rate: final_cost.diff_rate,
    },
  ];

  const TOTAL_COST_COLUMNS = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.label, {
        cell: ({ getValue }) => <span className="block text-left text-xs">{getValue()}</span>,
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
    ];
  }, []);

  const table = useReactTable({
    columns: TOTAL_COST_COLUMNS,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      <ResultItemTitle title="전체" unit="천 원" />
      <div className="flex items-center gap-6">
        {/* 차트 영역 */}
        <div className="px-28">
          <ChartContainer className="h-[217px] w-[180px]" config={chartConfig}>
            <BarChart accessibilityLayer barSize={60} data={chartData} margin={{ top: 36 }}>
              <XAxis
                axisLine={false}
                dataKey="label"
                padding={{ left: 20, right: 20 }}
                tickLine={false}
                tickMargin={4}
              />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell fill={index === 0 ? "#d5d5d5" : "#4ba257"} key={entry.label} />
                ))}
                <LabelList
                  className="font-medium"
                  dataKey="value"
                  fontSize={13}
                  formatter={(v: number) => v.toLocaleString()}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        {/* 테이블 영역 */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="text-primary flex flex-col items-end gap-1 text-xl font-bold">
            <p>최종 요금</p>
            <p>
              <strong className="text-[28px] font-extrabold">{`${formatCurrency(final_cost.diff)}(${formatCurrency(final_cost.diff_rate)}%) `}</strong>
              {final_cost.diff >= 0 ? "감소" : "증가"}
            </p>
          </div>
          <table className="w-full table-fixed">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th className="text-neutral560 px-1 py-2 text-center text-xs" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => {
                const isFinal = idx === table.getRowModel().rows.length - 1;

                return (
                  <tr
                    className={cn(
                      "border border-x-0",
                      isFinal ? "border-neutral240 border-y-2" : "border-neutral160",
                    )}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td className="text-2xs text-neutral480 px-1 py-2 text-center" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
