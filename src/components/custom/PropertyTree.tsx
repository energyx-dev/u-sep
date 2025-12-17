import { useLocation, useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { STEP_PATH } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const PROPERTIES = [
  {
    items: [
      STEP_PATH.RENEWABLE_SYSTEMS,
      STEP_PATH.LIGHTNING,
      STEP_PATH.SOURCE_SUPPLY_SYSTEMS,
      STEP_PATH.VENTILATION_SYSTEMS,
    ],
    label: "설비",
  },
  {
    items: [STEP_PATH.SURFACE_CONSTRUCTIONS, STEP_PATH.FENESTRATION],
    label: "건축 요소",
  },
] as const;

export const PropertyTree = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="rounded-[4px] border bg-white p-3">
      <Accordion type="multiple">
        {PROPERTIES.map((properties) => (
          <AccordionItem key={properties.label} value={properties.label}>
            <div className="w-fit py-1">
              <AccordionTrigger className="cursor-pointer flex-row-reverse items-center gap-1 p-0">
                <div className="flex items-center gap-2">
                  <Label className={cn("text-neutral640 cursor-pointer text-sm")}>
                    {properties.label}
                  </Label>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="ml-5 p-0">
              {properties.items.map(({ label, path }) => (
                <div className="flex w-fit items-center gap-1 py-1" key={label}>
                  <Label
                    className={cn(
                      "text-neutral640 cursor-pointer text-sm hover:underline",
                      location.pathname === path && "text-primary",
                    )}
                    onClick={() => handleItemClick(path)}
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
