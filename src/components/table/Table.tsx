import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const HeaderRow = ({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("h-7", className)} {...rest}>
    {children}
  </tr>
);

const BodyRow = ({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn(className)} {...rest}>
    {children}
  </tr>
);

const Th = ({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "text-neutral640 h-10 border-y border-r-1 border-b-1 px-3 py-2 text-left text-sm font-medium last:border-r-0",
      className,
    )}
    {...rest}
  >
    {children}
  </th>
);

const Td = ({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      "text-neutral640 h-10 border-r-1 border-b-1 px-3 py-2 text-left text-sm font-medium last:border-r-0",
      className,
    )}
    {...rest}
  >
    {children}
  </td>
);

export const Table = {
  BodyRow,
  HeaderRow,
  Td,
  Th,
} as const;
