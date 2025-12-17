import { useShallow } from "zustand/shallow";

import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { NewTemplateLayout } from "@/components/layout/NewTemplateLayout.tsx";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FenestrationTableSection } from "@/domain/fenestration/components/FenestrationTableSection";
import { useFenestrationStore } from "@/domain/fenestration/stores/fenestration.store";
import { FenestrationConstructionTableSection } from "@/domain/fenestrationConstruction/components/FenestrationConstructionTableSection";
import { useFenestrationConstructionStore } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

const FenestrationPage = () => {
  const {
    handleChangeMode: handleChangeModeFenestration,
    isEdit: isEditFenestration,
    mode: modeFenestration,
  } = useTableSectionViewMode();
  const {
    handleChangeMode: handleChangeModeFenestrationConstruction,
    isEdit: isEditFenestrationConstruction,
    mode: modeFenestrationConstruction,
  } = useTableSectionViewMode();

  const { fenestrations } = useFenestrationStore(
    useShallow((state) => ({
      fenestrations: state.fenestrations,
    })),
  );

  const { fenestration_constructions } = useFenestrationConstructionStore(
    useShallow((state) => ({
      fenestration_constructions: state.fenestration_constructions,
    })),
  );

  return (
    <NewTemplateLayout>
      <ResizablePanelGroup className="flex min-h-dvh flex-col" direction="vertical">
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <div className="mb-10">
            <HeadingWithRequired heading={PAGE_TITLES.FENESTRATION} isEdit={isEditFenestration} />
          </div>
          <FenestrationTableSection
            fenestration_constructions={fenestration_constructions}
            fenestrations={fenestrations}
            handleChangeMode={handleChangeModeFenestration}
            isEdit={isEditFenestration}
            mode={modeFenestration}
          />
        </ResizablePanel>
        <ResizableHandle className="my-5" withHandle />
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <div className="mb-10">
            <HeadingWithRequired
              heading={PAGE_TITLES.FENESTRATION_CONSTRUCTION}
              isEdit={isEditFenestrationConstruction}
            />
          </div>
          <FenestrationConstructionTableSection
            fenestration_constructions={fenestration_constructions}
            handleChangeMode={handleChangeModeFenestrationConstruction}
            isEdit={isEditFenestrationConstruction}
            mode={modeFenestrationConstruction}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </NewTemplateLayout>
  );
};

export default FenestrationPage;
