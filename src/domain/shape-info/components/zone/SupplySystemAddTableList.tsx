import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useDynamicSupplySystemColumns } from "@/domain/systems/supply/hooks/useDynamicSupplySystemColumns";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";

export type TAnySupplySystemRow = {
  [K in ESupplySystemType]: TSupplySystemRow<K>;
}[ESupplySystemType];

export type TSupplySystemRow<T extends ESupplySystemType = ESupplySystemType> =
  TSupplySystemGuiSchema[T][number] & { type: T };

export type TSupplySystemView = {
  data: TSupplySystemGuiSchema[ESupplySystemType];
  label: string;
  type: ESupplySystemType;
};

interface IProps {
  selectedSupplySystem: null | TAnySupplySystemRow;
  setSelectedSupplySystem: (system: null | TAnySupplySystemRow) => void;
  supplySystems: TSupplySystemView[];
}

export const SupplySystemAddTableList = ({
  selectedSupplySystem,
  setSelectedSupplySystem,
  supplySystems,
}: IProps) => {
  const SupplySystemTableItem = ({ system }: { system: TSupplySystemView }) => {
    const { data, label, type } = system;
    const { columns } = useDynamicSupplySystemColumns(type);

    return (
      <div className="space-y-2">
        <p className="font-semibold">{label}</p>
        <ViewAndSelectTable<TSourceSystemGuiSchema[ESourceSystemType][number]>
          columns={columns}
          data={data}
          onSelectRow={(row) =>
            setSelectedSupplySystem({
              ...row,
              type,
            } as Extract<TAnySupplySystemRow, { type: typeof type }>)
          }
          selectedRowId={selectedSupplySystem?.id ?? ""}
          type="single-select"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {supplySystems.map((system) =>
        system.data.length === 0 ? null : (
          <SupplySystemTableItem key={system.type} system={system} />
        ),
      )}
    </div>
  );
};
