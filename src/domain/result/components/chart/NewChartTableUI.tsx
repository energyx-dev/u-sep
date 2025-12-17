import beforeAllIcon from "@/assets/beforeAllIcon.svg";
// Legend color mapping for category labels
import { resultChartColors } from "@/domain/result/constants/result.color";

const LEGEND_COLOR_BY_CATEGORY: Record<string, string> = {
  가스: resultChartColors.natural_gas,
  급탕: resultChartColors.hotwater,
  난방: resultChartColors.heating,
  냉방: resultChartColors.cooling,
  유류: resultChartColors.oil,
  전기: resultChartColors.electricity,
  조명: resultChartColors.lightning,
  지역난방: resultChartColors.district_heating,
  환기: resultChartColors.circulation,
  // 합계 행에는 레전드를 표시하지 않음
  "개선 전 합계": "",
  "개선 후 합계": "",
};
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ChartTableDataProps {
  chartData: ChartDatum[];
  isConsumption?: boolean;
  unit?: string;
}

export type EnergyRow = {
  category: string; // e.g., '리모델링 전(kWh/m²)'
  m1: number | string;
  m2: number | string;
  m3: number | string;
  m4: number | string;
  m5: number | string;
  m6: number | string;
  m7: number | string;
  m8: number | string;
  m9: number | string;
  m10: number | string;
  m11: number | string;
  m12: number | string;
};

type ChartDatum = {
  afterTotal?: number;
  beforeTotal?: number;
  circulation?: number;
  cooling?: number;
  districtheating?: number;
  electricity?: number;
  heating?: number;
  hotwater?: number;
  label: string; // '1월' ...
  lightning?: number; // source key 'lighting'
  naturalgas?: number;
  oil?: number;
};

const toFixed1 = (v: number | undefined) =>
  typeof v === "number" && isFinite(v) ? Number(v.toFixed(1)) : 0;

const seriesFrom = (chartData: ChartDatum[], key: keyof ChartDatum): number[] =>
  Array.from({ length: 12 }, (_, i) => toFixed1(chartData?.[i]?.[key] as number | undefined));

const arrToRow = (category: string, arr: number[]): EnergyRow => ({
  category,
  m1: arr?.[0] ?? "-",
  m10: arr?.[9] ?? "-",
  m11: arr?.[10] ?? "-",
  m12: arr?.[11] ?? "-",
  m2: arr?.[1] ?? "-",
  m3: arr?.[2] ?? "-",
  m4: arr?.[3] ?? "-",
  m5: arr?.[4] ?? "-",
  m6: arr?.[5] ?? "-",
  m7: arr?.[6] ?? "-",
  m8: arr?.[7] ?? "-",
  m9: arr?.[8] ?? "-",
});

const sumOfRow = (r: EnergyRow) => {
  const nums = [r.m1, r.m2, r.m3, r.m4, r.m5, r.m6, r.m7, r.m8, r.m9, r.m10, r.m11, r.m12].filter(
    (v) => typeof v === "number",
  ) as number[];
  const sum = nums.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
  // Show "-" if completely zero
  if (sum === 0) return "-";
  // Round to integer and add thousands separators
  return Math.round(sum).toLocaleString();
};

export const NewChartTableUI: React.FC<ChartTableDataProps> = ({
  chartData,
  isConsumption,
  unit,
}) => {
  // Build rows for each category directly from chartData
  const rows = React.useMemo<EnergyRow[]>(() => {
    const rowCirculation = arrToRow("환기", seriesFrom(chartData, "circulation"));
    const rowCooling = arrToRow("냉방", seriesFrom(chartData, "cooling"));
    const rowHeating = arrToRow("난방", seriesFrom(chartData, "heating"));
    const rowHotwater = arrToRow("급탕", seriesFrom(chartData, "hotwater"));
    const rowLighting = arrToRow("조명", seriesFrom(chartData, "lightning"));

    // New source-based rows
    const rowElectricity = arrToRow("전기", seriesFrom(chartData, "electricity"));
    const rowNaturalGas = arrToRow("가스", seriesFrom(chartData, "naturalgas"));
    const rowOil = arrToRow("유류", seriesFrom(chartData, "oil"));
    const rowDistrictHeating = arrToRow("지역난방", seriesFrom(chartData, "districtheating"));

    const beforeTotal = seriesFrom(chartData, "beforeTotal");
    const afterTotal = seriesFrom(chartData, "afterTotal");

    const rowBeforeTotal = arrToRow("개선 전 합계", beforeTotal);
    const rowAfterTotal = arrToRow("개선 후 합계", afterTotal);

    const allRows = [
      rowBeforeTotal,
      rowAfterTotal,
      rowCooling,
      rowHeating,
      rowHotwater,
      rowLighting,
      rowCirculation,
      rowElectricity,
      rowDistrictHeating,
      rowOil,
      rowNaturalGas,
    ];

    const filtered = allRows.filter((r) => {
      const nums = [
        r.m1,
        r.m2,
        r.m3,
        r.m4,
        r.m5,
        r.m6,
        r.m7,
        r.m8,
        r.m9,
        r.m10,
        r.m11,
        r.m12,
      ].filter((v) => typeof v === "number") as number[];
      const sum = nums.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
      const isTotalRow =
        r.category === "개선 전 합계" ||
        r.category === "계산 전 합계" ||
        r.category === "개선 후 합계";
      // Keep total rows regardless of sum; otherwise hide rows whose sum is 0
      return isTotalRow || sum !== 0;
    });

    return filtered;
  }, [chartData]);

  // Hide if no rows
  const shouldHide = React.useMemo(() => rows.length === 0, [rows]);

  const columns = React.useMemo<ColumnDef<EnergyRow, string>[]>(() => {
    const monthCols: ColumnDef<EnergyRow, string>[] = Array.from({ length: 12 }, (_, i) => {
      const key = `m${i + 1}` as keyof EnergyRow;
      const monthHeader = chartData?.[i]?.label ?? `${i + 1}월`;
      return {
        accessorKey: key,
        cell: ({ getValue, row }) => {
          const v = getValue();
          const cat = String(row?.original?.category ?? "");

          if (typeof v === "number") {
            if (v === 0) {
              const isDelta = typeof cat === "string" && cat.includes("증감률");
              return <div>{isDelta ? "0%" : "-"}</div>;
            }
            const formatted = Number(v).toFixed(1);
            const isDelta = typeof cat === "string" && cat.includes("증감률");
            return <div>{isDelta ? `${formatted}%` : formatted}</div>;
          }
          return <div>{String(v ?? "-")}</div>;
        },
        header: monthHeader,
      } as ColumnDef<EnergyRow, string>;
    });

    const heading = unit ? `(${unit})` : unit ? `소모량 (${unit})` : "소모량";

    return [
      {
        accessorKey: "category",
        cell: ({ getValue }) => {
          const label = String(getValue());
          const swatchClass = LEGEND_COLOR_BY_CATEGORY[label];
          const isAfterTotal = label === "개선 후 합계";
          const isBeforeTotal = label === "개선 전 합계" || label === "계산 전 합계"; // 지원: 오타 변형

          return (
            <div
              className={cn("flex items-center gap-1", !isAfterTotal && !isBeforeTotal && "pl-3")}
            >
              {isBeforeTotal ? (
                <span aria-hidden className="h-2.5 w-2.5">
                  <img alt="" className="h-2.5 w-2.5" src={beforeAllIcon} />
                </span>
              ) : isAfterTotal ? (
                <span className="inline-block h-2 w-2 border border-neutral-400" />
              ) : swatchClass ? (
                <span className="inline-block h-2 w-2" style={{ backgroundColor: swatchClass }} />
              ) : (
                <span className="inline-block h-2 w-2" />
              )}
              <span className="flex-1 text-left font-medium whitespace-nowrap">{label}</span>
            </div>
          );
        },
        header: heading,
      },
      {
        cell: ({ row }) => {
          const cat = String(row?.original?.category ?? "");

          // Colorize sums for selected end-use categories
          const colorizeTargets = ["환기", "냉방", "난방", "급탕", "조명"];
          const color = colorizeTargets.includes(cat) ? LEGEND_COLOR_BY_CATEGORY[cat] : undefined;

          return (
            <div className="font-bold" style={color ? { color } : undefined}>
              {isConsumption ? "" : sumOfRow(row.original)}
            </div>
          );
        },
        header: "합계",
        id: "sum",
      },
      ...monthCols,
    ];
  }, [chartData, unit]);

  const table = useReactTable({
    columns,
    data: shouldHide ? [] : rows,
    getCoreRowModel: getCoreRowModel(),
  });

  if (shouldHide) return null;

  return (
    <div className="-mt-2">
      <table className="w-full table-fixed text-sm text-neutral-700">
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isZeroRow = sumOfRow(row.original) === "-";
            const cat = String(row?.original?.category ?? "");
            const isTotalRow =
              cat === "개선 전 합계" || cat === "계산 전 합계" || cat === "개선 후 합계";

            // Only collapse to a single cell when it's a zero row AND not a total row
            if (isZeroRow && !isTotalRow) {
              return (
                <tr className="border-neutral-20 border border-x-0" key={row.id}>
                  <td
                    className="text-2xs py-1 text-center text-neutral-400"
                    colSpan={table.getAllLeafColumns().length}
                  >
                    분석된 데이터가 없습니다.
                  </td>
                </tr>
              );
            }

            return (
              <tr className="border-neutral-20 border border-x-0" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className={`text-2xs py-1 text-center`} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
