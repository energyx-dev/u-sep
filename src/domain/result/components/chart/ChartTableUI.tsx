import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import * as React from "react";

import {
  CONSTANT_ENERGY_LABELS,
  ConstantEnergyKeyEnum,
  EnergySourceKeyEnum,
} from "@/domain/result/constants/result.enum";

const ENERGY_CONST_TO_SOURCE: Record<ConstantEnergyKeyEnum, EnergySourceKeyEnum> = {
  district_heating: EnergySourceKeyEnum.DISTRICTHEATING,
  electricity: EnergySourceKeyEnum.ELECTRICITY,
  natural_gas: EnergySourceKeyEnum.NATURALGAS,
  oil: EnergySourceKeyEnum.OIL,
};

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

const arrToRow = (category: string, arr: number[]): EnergyRow => ({
  category,
  m1: arr?.[0] ?? "-",
  m2: arr?.[1] ?? "-",
  m3: arr?.[2] ?? "-",
  m4: arr?.[3] ?? "-",
  m5: arr?.[4] ?? "-",
  m6: arr?.[5] ?? "-",
  m7: arr?.[6] ?? "-",
  m8: arr?.[7] ?? "-",
  m9: arr?.[8] ?? "-",
  //
  m10: arr?.[9] ?? "-",
  m11: arr?.[10] ?? "-",
  m12: arr?.[11] ?? "-",
});

const toPercentRow = (category: string, beforeArr: number[], afterArr: number[]): EnergyRow => {
  const pct = Array.from({ length: 12 }, (_, i) => {
    const b = beforeArr?.[i] ?? 0;
    const a = afterArr?.[i] ?? 0;
    if (b === 0) {
      // if both are 0, treat change as 0%; if only after>0, keep '-'
      return a === 0 ? 0 : "-";
    }
    const v = ((a - b) / b) * 100;
    // round to one decimal place; you can tweak if needed
    return Math.round(v * 10) / 10;
  });
  return arrToRow(category, pct as unknown as number[]);
};

export interface ChartTableDataProps {
  after: Record<EnergySourceKeyEnum, number[]>;
  before: Record<EnergySourceKeyEnum, number[]>;
  className?: string;
  energyKey: ConstantEnergyKeyEnum;
}

export const ChartTableUI: React.FC<ChartTableDataProps> = ({
  after,
  before,
  className,
  energyKey,
}) => {
  const sourceKey = ENERGY_CONST_TO_SOURCE[energyKey];

  const tableData = React.useMemo<EnergyRow[]>(() => {
    const beforeArr = before?.[sourceKey] ?? Array(12).fill(0);
    const afterArr = after?.[sourceKey] ?? Array(12).fill(0);

    const rowBefore = arrToRow("리모델링 전(kWh/m²)", beforeArr);
    const rowAfter = arrToRow("리모델링 후(kWh/m²)", afterArr);
    const rowDelta = toPercentRow("증감률(%)", beforeArr, afterArr);

    return [rowBefore, rowAfter, rowDelta];
  }, [before, after, sourceKey]);

  const totalConsumption = React.useMemo(() => {
    const sumBefore = (before?.[sourceKey] ?? []).reduce((a, b) => a + b, 0);
    const sumAfter = (after?.[sourceKey] ?? []).reduce((a, b) => a + b, 0);
    return sumBefore + sumAfter;
  }, [before, after, sourceKey]);

  const shouldHide = React.useMemo(() => totalConsumption === 0, [totalConsumption]);

  const columns = React.useMemo<ColumnDef<EnergyRow, string>[]>(() => {
    const monthCols: ColumnDef<EnergyRow, string>[] = Array.from({ length: 12 }, (_, i) => {
      const key = `m${i + 1}` as keyof EnergyRow;
      return {
        accessorKey: key,
        cell: ({ getValue, row }) => {
          const v = getValue();
          const isDelta =
            typeof row?.original?.category === "string" && row.original.category.includes("증감률");
          if (typeof v === "number") {
            if (v === 0) {
              return <div>{isDelta ? "0%" : "-"}</div>;
            }
            const formatted = Number(v).toFixed(1);
            return <div>{isDelta ? `${formatted}%` : formatted}</div>;
          }
          return <div>{String(v ?? "-")}</div>;
        },
        header: `${i + 1}월`,
      } as ColumnDef<EnergyRow, string>;
    });

    return [
      {
        accessorKey: "category",
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
        header: `${CONSTANT_ENERGY_LABELS[energyKey]} 소모량`,
      },
      ...monthCols,
    ];
  }, [energyKey]);

  const table = useReactTable({
    columns,
    data: shouldHide ? [] : tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  if (shouldHide) return null;
  return (
    <div className={className}>
      <table className="w-full table-fixed text-sm text-neutral-700">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header, idx) => (
                <th
                  className={`border border-neutral-200 bg-neutral-200 py-1 pl-3 text-left font-medium whitespace-nowrap ${
                    idx === 0 && "w-[146px] max-w-[146px] min-w-[146px]"
                  }`}
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
            <tr className="border-b border-neutral-200" key={row.id}>
              {row.getVisibleCells().map((cell, idx) => (
                <td
                  className={`border border-neutral-200 py-2 pl-3 text-left ${
                    idx === 0 && "w-[146px] max-w-[146px] min-w-[146px] bg-neutral-100"
                  }`}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
