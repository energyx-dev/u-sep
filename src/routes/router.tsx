import { ReactNode } from "react";
import { createBrowserRouter, createHashRouter, Navigate } from "react-router-dom";

import { AnalysisLayout } from "@/components/layout/AnalysisLayout";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { SIMULATION_BEFORE_AFTER_STEP_PATH, STEP_PATH } from "@/constants/routes";
import { ERemodelingType } from "@/enums/ERemodelingType";
import BasicInfoPage from "@/pages/BuildingInfoPage";
import BuildingOverviewPage from "@/pages/BuildingOverviewPage";
import FenestrationPage from "@/pages/FenestrationPage";
import FloorPage from "@/pages/FloorPage";
import LandingPage from "@/pages/LandingPage";
import LightningPage from "@/pages/LightningPage";
import NewSourceSupplySystemPage from "@/pages/NewSourceSupplySystemPage";
import RenewableSystemPage from "@/pages/RenewableSystemPage";
import SurfaceConstructionsPage from "@/pages/SurfaceConstructionsPage";
import SurfacePage from "@/pages/SurfacePage";
import VentilationSystemPage from "@/pages/VentilationSystemPage";
import ZonePage from "@/pages/ZonePage";
import { RefreshPreventionWrapper } from "@/routes/RefreshPreventionWrapper";
import { RemodelingProtectedRoute } from "@/routes/RemodelingProtectedRoute";

const createRouter = import.meta.env.MODE === "electron" ? createHashRouter : createBrowserRouter;

type TRoute = {
  element: ReactNode;
  label?: string;
  path: string;
};

// 리모델링전/후 각각 필요
const SIMULATION_BEFORE_AFTER_STEP_ROUTES = [
  {
    element: <ZonePage />,
    label: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.label,
    path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path,
  },
  {
    element: <FloorPage />,
    label: SIMULATION_BEFORE_AFTER_STEP_PATH.FLOOR.label,
    path: SIMULATION_BEFORE_AFTER_STEP_PATH.FLOOR.path,
  },
  {
    element: <SurfacePage />,
    label: SIMULATION_BEFORE_AFTER_STEP_PATH.SURFACE.label,
    path: SIMULATION_BEFORE_AFTER_STEP_PATH.SURFACE.path,
  },
  {
    element: <BuildingOverviewPage />,
    label: SIMULATION_BEFORE_AFTER_STEP_PATH.BUILDING_OVERVIEW.label,
    path: SIMULATION_BEFORE_AFTER_STEP_PATH.BUILDING_OVERVIEW.path,
  },
];

// 공통
const SIMULATION_COMMON_STEP_ROUTES: TRoute[] = [
  {
    element: <BasicInfoPage />,
    label: STEP_PATH.BASIC_INFO.label,
    path: STEP_PATH.BASIC_INFO.path,
  },
  {
    element: <NewSourceSupplySystemPage />,
    label: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.label,
    path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
  },
  {
    element: <LightningPage />,
    label: STEP_PATH.LIGHTNING.label,
    path: STEP_PATH.LIGHTNING.path,
  },
  {
    element: <VentilationSystemPage />,
    label: STEP_PATH.VENTILATION_SYSTEMS.label,
    path: STEP_PATH.VENTILATION_SYSTEMS.path,
  },
  {
    element: <SurfaceConstructionsPage />,
    label: STEP_PATH.SURFACE_CONSTRUCTIONS.label,
    path: STEP_PATH.SURFACE_CONSTRUCTIONS.path,
  },
  {
    element: <FenestrationPage />,
    label: STEP_PATH.FENESTRATION.label,
    path: STEP_PATH.FENESTRATION.path,
  },
  {
    element: <RenewableSystemPage />,
    label: STEP_PATH.RENEWABLE_SYSTEMS.label,
    path: STEP_PATH.RENEWABLE_SYSTEMS.path,
  },
];

export const router = createRouter([
  {
    children: [
      {
        element: <LandingPage />,
        index: true,
      },
      {
        children: [
          {
            children: SIMULATION_COMMON_STEP_ROUTES.map((route) => ({
              element: route.element,
              path: route.path,
            })),
          },
          {
            children: [
              {
                children: SIMULATION_BEFORE_AFTER_STEP_ROUTES.map((route) => ({
                  element: route.element,
                  path: route.path(ERemodelingType.BEFORE),
                })),
              },
              {
                children: SIMULATION_BEFORE_AFTER_STEP_ROUTES.map((route) => ({
                  element: route.element,
                  path: route.path(ERemodelingType.AFTER),
                })),
              },
            ],
            element: <RemodelingProtectedRoute />,
          },
        ],
        element: <AnalysisLayout />,
      },
    ],
    element: (
      <RefreshPreventionWrapper>
        <GlobalLayout />
      </RefreshPreventionWrapper>
    ),
    errorElement: <div>Error Page</div>,
    path: "/",
  },
  {
    element: <Navigate to={"/"} />,
    path: "*",
  },
]);
