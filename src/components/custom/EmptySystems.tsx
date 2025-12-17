interface IProps {
  emptyText: string;
}

export const EmptyText = ({ emptyText }: IProps) => {
  return <p className="text-neutral480 text-sm">{emptyText}</p>;
};
