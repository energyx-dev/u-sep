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
import { TResultEnergySourceCost } from "@/schemas/result.schema";

const ENERGY_SOURCE = [
  { color: resultChartColors.electricity, key: "electricity", label: "전기" },
  { color: resultChartColors.district_heating, key: "district_heating", label: "지역난방" },
  { color: resultChartColors.oil, key: "oil", label: "유류" },
  { color: resultChartColors.natural_gas, key: "natural_gas", label: "가스" },
] as const;

type TEnergySourceLabel = (typeof ENERGY_SOURCE)[number]["label"];

const chartConfig: ChartConfig = Object.fromEntries(
  ENERGY_SOURCE.map((c) => [c.key, { color: c.color, label: c.label }]),
);

const columnHelper = createColumnHelper<{
  after: number;
  before: number;
  label: TEnergySourceLabel;
  saving: number;
  saving_rate: number;
}>();

type TProps = {
  data: TResultEnergySourceCost;
};

export const CostByEnergySource = ({ data }: TProps) => {
  const { district_heating, electricity, natural_gas, oil } = data;

  const chartData = [
    {
      district_heating: district_heating.gr_before,
      electricity: electricity.gr_before,
      label: "GR 전",
      natural_gas: natural_gas.gr_before,
      oil: oil.gr_before,
    },
    {
      district_heating: district_heating.gr_after,
      electricity: electricity.gr_after,
      label: "GR 후",
      natural_gas: natural_gas.gr_after,
      oil: oil.gr_after,
    },
  ];

  const tableData = ENERGY_SOURCE.map((c) => {
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

  const COST_BY_ENERGY_SOURCE_COLUMNS = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.label, {
        cell: ({ getValue }) => {
          const cat = ENERGY_SOURCE.find((c) => c.label === getValue());
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
    columns: COST_BY_ENERGY_SOURCE_COLUMNS,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col gap-5">
      <ResultItemTitle title="에너지원별 요금" unit="천 원" />
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
              <Bar dataKey="natural_gas" fill="var(--color-natural_gas)" stackId="after" />
              <Bar dataKey="oil" fill="var(--color-oil)" stackId="after" />
              <Bar
                dataKey="district_heating"
                fill="var(--color-district_heating)"
                stackId="after"
              />
              <Bar dataKey="electricity" fill="var(--color-electricity)" stackId="after" />
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
