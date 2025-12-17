export const PropertyTestPage = () => {
  return (
    <div className="bg-muted flex flex-1">
      <div className="bg-background fixed h-full w-[250px] truncate overflow-auto border-r pb-12">
        <div className="p-4 pb-2">
          <p className="text-gray py-1 text-sm">건물 속성 레이어</p>
        </div>
      </div>

      {/* FIXME 선택된 형상 정보 */}
      <div className="ml-[250px] flex flex-1">
        <div className="bg-background w-[428px] border-r p-6">
          <div className="h-full w-full rounded-md border">
            <p className="text-gray flex h-full items-center justify-center py-1 text-center text-sm">
              선택된 형상 정보
            </p>
          </div>
        </div>

        {/* FIXME 선택된 형상 정보에 맞는 속성정보 */}
        <div className="flex-1 p-6">
          <div className="h-full w-full rounded-md border">
            <p className="text-gray flex h-full items-center justify-center py-1 text-center text-sm">
              속성 정보 입력창
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
