import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { SOURCE_SYSTEM_COLUMN } from "@/domain/systems/source/utils/sourceSystem.helper";

export type TAnySourceSystemRow = {
  [K in ESourceSystemType]: TSourceSystemRow<K>;
}[ESourceSystemType];

export type TSourceSystemRow<T extends ESourceSystemType = ESourceSystemType> =
  TSourceSystemGuiSchema[T][number] & { type: T };

export type TSourceSystemView = {
  data: TSourceSystemGuiSchema[ESourceSystemType];
  label: string;
  type: ESourceSystemType;
};

interface IProps {
  selectedSourceSystem: TAnySourceSystemRow;
  setSelectedSourceSystem: (system: TAnySourceSystemRow) => void;
  sourceSystems: TSourceSystemView[];
}

export const SourceSystemAddTableList = ({
  selectedSourceSystem,
  setSelectedSourceSystem,
  sourceSystems,
}: IProps) => {
  type TBaseSourceSystemRow<T extends ESourceSystemType> = TSourceSystemGuiSchema[T][number];

  const SourceSystemTableItem = <T extends ESourceSystemType>({
    system,
  }: {
    system: { data: TSourceSystemGuiSchema[T]; label: string; type: T };
  }) => {
    const { data, label, type } = system;
    const columns = SOURCE_SYSTEM_COLUMN[type];

    return (
      <div className="space-y-2">
        <p className="font-semibold">{label}</p>
        <ViewAndSelectTable<TBaseSourceSystemRow<T>>
          columns={columns}
          data={data}
          onSelectRow={(row) =>
            setSelectedSourceSystem({
              ...(row as TBaseSourceSystemRow<T>),
              type,
            } as TAnySourceSystemRow)
          }
          selectedRowId={selectedSourceSystem?.id ?? ""}
          type="single-select"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {sourceSystems.map((system) => {
        if (!Array.isArray(system.data) || system.data.length === 0) return null;
        return <SourceSystemTableItem key={system.type} system={system} />;
      })}
    </div>
  );
};
