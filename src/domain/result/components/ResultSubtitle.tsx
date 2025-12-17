export const ResultSubtitle = ({
  children,
  description = "",
}: {
  children: React.ReactNode;
  description?: string;
}) => {
  return (
    <div className="border-primary flex items-center gap-2 border-t-2 border-b-2 px-1 py-2">
      <h2 className="text-primary text-[22px] leading-[26px] font-extrabold">{children}</h2>
      {description && <p className="text-2xs text-neutral480">{description}</p>}
    </div>
  );
};
