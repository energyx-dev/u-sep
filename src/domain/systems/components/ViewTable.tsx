import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table } from "@/components/table/Table";

interface IProps<T> {
  // 제너릭 타입 대응
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
}

export const ViewTable = <T extends object>({ columns, data }: IProps<T>) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full overflow-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(({ headers, id }) => (
            <Table.HeaderRow key={id}>
              {headers.map((header) => (
                <Table.Th
                  colSpan={header.colSpan}
                  key={header.id}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </Table.Th>
              ))}
            </Table.HeaderRow>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.BodyRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <Table.Td className="text-2xs" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                );
              })}
            </Table.BodyRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};
