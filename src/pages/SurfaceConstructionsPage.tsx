import { useShallow } from "zustand/shallow";

import { HeadingWithRequired, PAGE_TITLES } from "@/components/custom/HeadingWithRequired";
import { NewTemplateLayout } from "@/components/layout/NewTemplateLayout";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MaterialTableSection } from "@/domain/material/components/MaterialTableSection";
import { useMaterialStore } from "@/domain/material/stores/material.store";
import { SurfaceConstructionTableSection } from "@/domain/surface-constructions/components/SurfaceConstructionTableSection";
import { useSurfaceConstructionStore } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

const SurfaceConstructionsPage = () => {
  const {
    handleChangeMode: handleChangeModeMaterial,
    isEdit: isEditMaterial,
    mode: modeMaterial,
  } = useTableSectionViewMode();

  const { surface_constructions } = useSurfaceConstructionStore(
    useShallow((state) => ({
      surface_constructions: state.surface_constructions,
    })),
  );

  const { materials } = useMaterialStore(
    useShallow((state) => ({
      materials: state.materials,
    })),
  );

  return (
    <NewTemplateLayout>
      <ResizablePanelGroup className="flex min-h-dvh flex-col" direction="vertical">
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <SurfaceConstructionTableSection
            materials={materials}
            surface_constructions={surface_constructions}
          />
        </ResizablePanel>
        <ResizableHandle className="my-5" withHandle />
        <ResizablePanel className="container-page h-1/2 !overflow-y-auto">
          <div className="mb-10">
            <HeadingWithRequired heading={PAGE_TITLES.MATERIAL} isEdit={isEditMaterial} />
          </div>
          <MaterialTableSection
            handleChangeMode={handleChangeModeMaterial}
            isEdit={isEditMaterial}
            materials={materials}
            mode={modeMaterial}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </NewTemplateLayout>
  );
};

export default SurfaceConstructionsPage;
