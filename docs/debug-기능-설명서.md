# Debug 기능 설명서

## 개요

Debug 기능은 에너지 시뮬레이션 분석 실행 전에 입력 데이터의 유효성을 검증하는 기능입니다.
`useCreateGuiData` 훅으로 생성된 GUI 데이터를 검사하여 필수 항목과 권장 항목으로 분류된 오류를 찾아내고, 사용자에게 개선이 필요한 부분을 체계적으로 안내합니다.

## 핵심 구조

### 1. 데이터 흐름

```tsx
// 1. GUI 데이터 생성
const { guiData } = useCreateGuiData();

// 2. 디버깅 실행
const result = executeDebugging(guiData);

// 3. 결과 처리
const existRequiredError = getExistDebugError(result.required);
const existOptionalError = getExistDebugError(result.optional);

```

### 2. 타입 구조

### 최상위 결과 타입

```tsx
type TDebugErrorRequireAndOptionalSet = {
  required: TDebugErrorSet;  // 필수 항목 (분석 실행 차단)
  optional: TDebugErrorSet;  // 권장 항목 (건너뛰기 가능)
};

```

### 오류 세트 구조

```tsx
type TDebugErrorSet = {
  common: TDebugErrorSetCommonItem;     // 공통 항목
  before: TDebugErrorSetRemodelingItem; // 리모델링 전
  after: TDebugErrorSetRemodelingItem;  // 리모델링 후
};

```

### 공통 항목 구조

```tsx
type TDebugErrorSetCommonItem = {
  buildingInfo: TErrorItem[];      // 건물 정보
  sourceSystem: TErrorItem[];      // 생산 설비
  supplySystem: TErrorItem[];      // 공급 설비
  ventilationSystem: TErrorItem[]; // 환기 설비
};

```

### 리모델링 항목 구조

```tsx
type TDebugErrorSetRemodelingItem = {
  renewableSys: TErrorItem[]; // 신재생 에너지 시스템
  shapeInfo: TErrorItem[];    // 형상 정보
};

```

### 개별 오류 항목

```tsx
type TErrorItem = {
  message: string; // 오류 메시지
  path: string;    // 해당 페이지 경로
};

```

## 주요 컴포넌트

### 1. useAnalysisButton 훅

분석 버튼의 상태와 디버깅 로직을 관리합니다.

```tsx
export const useAnalysisButton = () => {
  const { guiData } = useCreateGuiData();

  const handleDebug = useCallback(() => {
    // 1. 디버깅 실행
    const result = executeDebugging(guiData);

    // 2. 필수 오류 검사
    const existRequiredError = getExistDebugError(result.required);
    if (existRequiredError && existRequiredError.totalCount > 0) {
      setDialogData({ data: existRequiredError, status: "debug-required" });
      return;
    }

    // 3. 권장 오류 검사
    const existOptionalError = getExistDebugError(result.optional);
    if (existOptionalError && existOptionalError.totalCount > 0) {
      setDialogData({ data: existOptionalError, status: "debug-optional" });
      return;
    }

    // 4. 오류 없음 - 분석 진행
    setDialogData({ status: "save" });
  }, [guiData]);

  return {
    dialogData,
    handleClick,
    handleCloseDialog,
    isOpen,
    setDialogData,
  };
};

```

### 2. executeDebugging 함수

GUI 데이터를 검증하고 오류 목록을 생성합니다.

```tsx
export const executeDebugging = (guiData: TGuiSchema): TDebugErrorRequireAndOptionalSet => {
  const result = getInitDebugErrorRequireAndOptionalSet();

  const {
    afterBuilding: { photovoltaic_systems: afterPhotovoltaicSystems, shapeInfo: afterShapeInfo },
    beforeBuilding: { photovoltaic_systems: beforePhotovoltaicSystems, shapeInfo: beforeShapeInfo },
    buildingInfo,
    sourceSystems,
    supplySystems,
    ventilationSystems,
  } = guiData;

  // 1. 건물 정보 검증 (필수)
  const buildingInfoResult = debugBuildingInfo(buildingInfo);
  result.required.common.buildingInfo.push(...buildingInfoResult);

  // 2. 형상 정보 검증 (필수/권장)
  const beforeShapeInfoResult = debugShapeInfo(beforeShapeInfo, ERemodelingType.BEFORE);
  const afterShapeInfoResult = debugShapeInfo(afterShapeInfo, ERemodelingType.AFTER);
  result.required.before.shapeInfo.push(...beforeShapeInfoResult.required);
  result.required.after.shapeInfo.push(...afterShapeInfoResult.required);
  result.optional.before.shapeInfo.push(...beforeShapeInfoResult.optional);
  result.optional.after.shapeInfo.push(...afterShapeInfoResult.optional);

  // 3. 태양광 시스템 검증 (권장)
  const beforePhotovoltaicSystemResult = debugPhotovoltaicSystem(
    beforePhotovoltaicSystems,
    ERemodelingType.BEFORE,
  );
  const afterPhotovoltaicSystemResult = debugPhotovoltaicSystem(
    afterPhotovoltaicSystems,
    ERemodelingType.AFTER,
  );
  result.optional.before.renewableSys.push(...beforePhotovoltaicSystemResult);
  result.optional.after.renewableSys.push(...afterPhotovoltaicSystemResult);

  // 4. 설비 시스템 검증 (권장)
  const commonSourceSystemResult = debugSourceSystem(sourceSystems);
  const commonSupplySystemResult = debugSupplySystem(supplySystems);
  const commonVentilationSystemResult = debugVentilationSystem(ventilationSystems);
  result.optional.common.sourceSystem.push(...commonSourceSystemResult);
  result.optional.common.supplySystem.push(...commonSupplySystemResult);
  result.optional.common.ventilationSystem.push(...commonVentilationSystemResult);

  return result;
};
```

### 3. DebugFloatingWindow 컴포넌트

디버깅 결과를 표시하는 플로팅 윈도우입니다.

```tsx
export const DebugFloatingWindow = ({
  debugResult,
  isMinimized,
  isOpen,
  onClose,
  setDialogData,
  setIsMinimized,
  type, // "debug-required" | "debug-optional"
}: IProps) => {
  const isRequired = type === "debug-required";
  const title = isRequired ? "필수 항목" : "권장 항목";
  const description = isRequired
    ? "분석을 위해 다음 항목의 입력이 필요합니다."
    : "최적의 분석을 위해 다음 항목의 입력을 권장합니다.";

  // 각 섹션별 오류 존재 여부 확인
  const isExistCommon = /* 공통 오류 있는지 확인 */;
  const isExistBefore = /* 리모델링 전 오류 있는지 확인 */;
  const isExistAfter = /* 리모델링 후 오류 있는지 확인 */;

  // 렌더링할 아코디언 섹션들 구성
  const renderItems = useMemo(() => {
    const items = [];

    if (isExistCommon) {
      items.push({
        component: (
          <DebugCommonAccordion
            debugList={debugResult.common}
            type={type === "debug-required" ? "required" : "optional"}
          />
        ),
        id: "common",
      });
    }

    if (isExistBefore) {
      items.push({
        component: (
          <DebugRemodelingAccordion
            debugListByRemodelingType={debugResult.before}
            remodelingType={ERemodelingType.BEFORE}
            type={type === "debug-required" ? "required" : "optional"}
          />
        ),
        id: "before",
      });
    }

    if (isExistAfter) {
      items.push({
        component: (
          <DebugRemodelingAccordion
            debugListByRemodelingType={debugResult.after}
            remodelingType={ERemodelingType.AFTER}
            type={type === "debug-required" ? "required" : "optional"}
          />
        ),
        id: "after",
      });
    }

    return items;
  }, [/* 의존성 배열 */]);

  return (
    <FloatingWindow>
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <p className="text-neutral560 text-sm">{description}</p>
        <p className="text-neutral640 text-sm font-semibold">
          {`총 ${debugResult.totalCount}개 항목`}
        </p>
      </div>

      {/* 아코디언 섹션들 */}
      {renderItems.map((item, index) => (
        <div className="flex flex-col gap-4" key={item.id}>
          {item.component}
          {index < renderItems.length - 1 && <Separator />}
        </div>
      ))}

      {/* 버튼 영역 */}
      <div className="flex items-center justify-end gap-2">
        <Button onClick={handleClose} variant="secondary">취소</Button>
        <Button onClick={handleClickNext}>
          {isRequired ? "다음" : "건너뛰기"}
        </Button>
      </div>
    </FloatingWindow>
  );
};

```

## UI 구조

### 1. 아코디언 계층 구조

```
DebugFloatingWindow
├── DebugCommonAccordion (공통 항목)
│   └── DebugAccordionItem (건물 정보, 생산 설비, 공급 설비, 환기 설비)
├── DebugRemodelingAccordion (리모델링 전)
│   └── DebugAccordionItem (신재생, 형상 정보)
└── DebugRemodelingAccordion (리모델링 후)
    └── DebugAccordionItem (신재생, 형상 정보)

```

### 2. DebugAccordionItem 구조

각 아코디언 항목은 다음과 같이 구성됩니다:

```tsx
export const DebugAccordionItem = ({ debugList, label, type, value }: IProps) => {
  const navigate = useNavigate();
  const isRequired = type === "required";

  return (
    <Accordion defaultValue={[value]} type="multiple">
      <AccordionItem className="rounded-[4px] border p-2" value={value}>
        <AccordionTrigger className="flex-row-reverse items-center justify-end gap-1">
          <div className="flex flex-1 items-center justify-between">
            <p>{label}</p>
            <p className={cn(
              "rounded-[4px] px-2 py-1 text-[13px] font-medium text-white",
              isRequired ? "bg-negative" : "bg-pantone377-c"
            )}>
              {debugList.length}개 {isRequired ? "위치" : "항목"}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col py-1">
            {debugList.map((item, index) => (
              <button
                className="hover:bg-bk3 cursor-pointer rounded-xs px-2 py-1 text-start text-xs"
                onClick={() => navigate(item.path)}
                key={`${index}-${item.message}`}
              >
                {item.message}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

```
