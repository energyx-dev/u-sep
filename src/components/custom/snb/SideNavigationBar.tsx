import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { PropertyTree } from "@/components/custom/PropertyTree";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { STEP_PATH } from "@/constants/routes";
import { ResultActionButton } from "@/domain/result/components/ResultActionButton";
import { AddShapeDialog } from "@/domain/shape-info/components/AddShapeDialog";
import { ShapeSnbMenu } from "@/domain/shape-info/components/snb/ShapeSnbMenu";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { cn } from "@/lib/utils";

type TMenu = {
  component?: ReactNode;
  disabled?: boolean;
  id: string;
  items?: TMenu[];
  label: string;
  path?: string;
};

const menus: TMenu[] = [
  {
    id: "building-info",
    label: "기본 정보",
    path: STEP_PATH.BASIC_INFO.path,
  },
  {
    component: <ShapeSnbMenu />,
    id: "shape-info",
    label: "형상 정보",
  },
  {
    component: <PropertyTree />,
    id: "property-info",
    label: "속성 정보",
  },
  // {
  //   disabled: true,
  //   id: "profile",
  //   label: "용도 프로필",
  //   path: STEP_PATH.DAY_SCHEDULE.path,
  // },
];

/**
 * SideNavigationBar 에서 형상 속성 관리 버튼을 렌더링합니다.
 */
const ManageButton = () => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [remodelingType, setRemodelingType] = useState<ERemodelingType>(ERemodelingType.BEFORE);

  const items = [
    { id: ERemodelingType.BEFORE, label: "리모델링 전" },
    { id: ERemodelingType.AFTER, label: "리모델링 후" },
  ];

  const handleClickItem = (type: ERemodelingType) => {
    setRemodelingType(type);
    setIsOpenDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="s">관리</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => handleClickItem(item.id)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddShapeDialog
        onOpenChange={(open) => setIsOpenDialog(open)}
        open={isOpenDialog}
        remodelingType={remodelingType}
      />
    </>
  );
};

/**
 * 사이드 네비게이션 바를 렌더링합니다.
 */
export const SideNavigationBar = () => {
  const { pathname } = useLocation();

  return (
    <>
      <aside className="pb-12">
        {menus.map(({ component, disabled, id, items, label, path }, idx) => {
          const isParentActive =
            pathname === path ||
            items?.some((child) => child.path && pathname.startsWith(child.path));

          return (
            <div key={id}>
              <section className="flex flex-col gap-2.5 py-6">
                {/* label 렌더링 */}
                {id === "shape-info" ? (
                  <div className="flex items-center justify-between px-5">
                    <h3
                      className={cn(
                        "text-[17px] leading-none font-bold transition-colors",
                        pathname.includes("/shape-info") || pathname.includes("/building-overview")
                          ? "text-primary"
                          : "text-neutral720",
                        disabled && "text-neutral160 pointer-events-none",
                      )}
                    >
                      {label}
                    </h3>
                    <ManageButton />
                  </div>
                ) : id === "property-info" ? (
                  <div className="flex items-center justify-between px-5">
                    <h3
                      className={cn(
                        "text-[17px] leading-none font-bold transition-colors",
                        pathname.includes("systems") ||
                          pathname.includes("/lightning") ||
                          pathname.includes("surface-constructions") ||
                          pathname.includes("/fenestration")
                          ? "text-primary"
                          : "text-neutral720",
                        disabled && "text-neutral160 pointer-events-none",
                      )}
                    >
                      {label}
                    </h3>
                  </div>
                ) : path && !disabled ? (
                  <Link
                    className={cn(
                      "px-5 text-[17px] leading-none font-bold transition-colors",
                      isParentActive ? "text-primary" : "text-neutral720",
                      disabled && "text-neutral160 pointer-events-none",
                    )}
                    to={path}
                  >
                    {label}
                  </Link>
                ) : (
                  <h3
                    className={cn(
                      "px-5 text-[17px] leading-none font-bold transition-colors",
                      isParentActive ? "text-primary" : "text-neutral720",
                      disabled && "text-neutral160 pointer-events-none",
                    )}
                  >
                    {label}
                  </h3>
                )}

                {/* component 렌더링 */}
                {component && <div className="px-5">{component}</div>}

                {/* items 렌더링 */}
                {items && (
                  <ul>
                    {items.map((item) => {
                      const isActive = pathname.startsWith(item.path ?? "");
                      return (
                        <li key={item.id}>
                          {item.path ? (
                            <Link
                              className={cn(
                                "block px-5 py-2 text-[15px] leading-none font-medium transition-colors",
                                isActive
                                  ? "text-neutral640 font-semibold"
                                  : "text-neutral480 hover:text-neutral640",
                              )}
                              to={item.path}
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <div>{item.label}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* 구분선 */}
              {idx !== menus.length - 1 && <Separator />}
            </div>
          );
        })}
      </aside>

      {/* 분석 결과 */}
      <div className="fixed bottom-0 left-0 h-12 w-[260px]">
        <ResultActionButton />
      </div>
    </>
  );
};
