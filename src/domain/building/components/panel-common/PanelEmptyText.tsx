interface IProps {
  message?: string;
}

export const PanelEmptyText = ({ message = "데이터가 없습니다." }: IProps) => (
  <div className="flex-1 items-center justify-center">
    <p className="text-bk7 text-sm">{message}</p>
  </div>
);
