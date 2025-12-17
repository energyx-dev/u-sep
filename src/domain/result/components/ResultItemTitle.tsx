type TProps = {
  title: string;
  unit: string;
  unitLabel?: string;
};

export const ResultItemTitle = ({ title, unit, unitLabel = "단위" }: TProps) => {
  return (
    <div className="border-primary text-neutral800 flex flex-col gap-0.5 border-l-4 pl-2">
      <p className="text-[18px] leading-[21px] font-semibold">{title}</p>
      {unit && (
        <p className="text-2xs">
          {unitLabel}: {unit}
        </p>
      )}
    </div>
  );
};
