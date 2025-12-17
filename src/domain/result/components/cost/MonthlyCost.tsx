import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import beforeAllIcon from "@/assets/beforeAllIcon.svg";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ResultItemTitle } from "@/domain/result/components/ResultItemTitle";
import { formatCurrency } from "@/lib/utils";
import { TResultMonthlyCost } from "@/schemas/result.schema";

const chartConfig = {} satisfies ChartConfig;
const columnHelper = createColumnHelper<{ [key: string]: string } & { label: string }>();

type TProps = {
  data: TResultMonthlyCost;
};

export const MonthlyCost = ({ data }: TProps) => {
  const { diff, diff_rate, gr_after, gr_before } = data;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    after: gr_after[i],
    before: gr_before[i],
    label: `${i + 1}월`,
  }));

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => `${i + 1}월`), []);

  const tableData = [
    {
      label: "GR 전 총합",
      ...Object.fromEntries(gr_before.map((v, i) => [months[i], v])),
    },
    {
      label: "GR 후 총합",
      ...Object.fromEntries(gr_after.map((v, i) => [months[i], v])),
    },
    {
      label: "절감",
      ...Object.fromEntries(diff.map((v, i) => [months[i], v])),
    },
    {
      label: "절감률",
      ...Object.fromEntries(diff_rate.map((v, i) => [months[i], v])),
    },
  ];

  const MONTHLY_COST_COLUMNS = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.label, {
        cell: ({ getValue, row }) => {
          const isBefore = row.original.label === "GR 전 총합";
          const isAfter = row.original.label === "GR 후 총합";
          return (
            <div className="flex items-center gap-0.5">
              {isBefore && (
                <span className="inline-block h-4 w-4">
                  <img alt="before icon" src={beforeAllIcon} />
                </span>
              )}
              {isAfter && (
                <span className="flex items-center justify-center p-1">
                  <span className="h-2 w-2 bg-[#4ba257]" />
                </span>
              )}
              <span className="block text-left text-xs">{getValue()}</span>
            </div>
          );
        },
        id: "label",
        size: 155,
      }),

      ...months.map((m) =>
        columnHelper.accessor((row) => row[m], {
          cell: ({ getValue, row }) => {
            const v = getValue();
            if (!v) return "-";
            const formatted = formatCurrency(Number(v));
            const isRate = row.original.label === "절감률";
            return isRate ? `${formatted}%` : formatted;
          },
          id: m,
          size: 62,
        }),
      ),
    ];
  }, [months]);

  const table = useReactTable({
    columns: MONTHLY_COST_COLUMNS,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      <ResultItemTitle title="월별 요금" unit="천 원" />
      <div className="flex flex-col gap-2.5">
        {/* 차트 영역 */}
        <div className="pl-24">
          <ChartContainer className="max-h-[255px] w-full" config={chartConfig}>
            <ComposedChart accessibilityLayer barSize={36} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={2} />
              <YAxis
                axisLine={false}
                stroke="#D5D5D5"
                tick={{ fill: "#D5D5D5", fontSize: 10 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Bar dataKey="after" fill="#4ba257" />
              <Line dataKey="before" dot stroke="#959595" strokeWidth={2} type="linear" />
            </ComposedChart>
          </ChartContainer>
        </div>
        {/* 테이블 영역 */}
        <div className="-mt-4 flex-1">
          <table className="w-full table-fixed">
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
