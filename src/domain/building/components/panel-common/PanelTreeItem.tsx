import { ReactNode } from "react";

import { AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Radio from "@/components/ui/radio";
import { cn } from "@/lib/utils";

const ITEM_LABEL_CLASSNAME = "text-neutral640 text-sm font-medium";
const ITEM_WRAPPER_CLASSNAME = "flex items-center gap-1 py-1 px-0.5";

interface IBaseTreeItemProps {
  hasChildren?: boolean;
  label: ReactNode;
  uniqueId: string;
}

interface IInteractiveTreeItemProps extends IBaseTreeItemProps {
  checked: boolean;
  disabled?: boolean;
  shapeId: string;
  toggleShapeId: (shapeId: string) => void;
}

interface IPanelTreeItemRootProps {
  children: ReactNode;
  className?: string;
}

// 합성 컴포넌트의 루트 컴포넌트
const PanelTreeItemRoot = ({ children, className }: IPanelTreeItemRootProps) => {
  return <div className={cn(ITEM_WRAPPER_CLASSNAME, className)}>{children}</div>;
};

// 라디오 버튼 아이템
const TreeItemRadio = ({
  checked,
  disabled = false,
  hasChildren,
  label,
  shapeId,
  toggleShapeId,
  uniqueId,
}: IInteractiveTreeItemProps) => {
  return (
    <PanelTreeItemRoot>
      {hasChildren && <AccordionTrigger className="cursor-pointer p-0" />}
      <label
        className={cn(ITEM_LABEL_CLASSNAME, ITEM_WRAPPER_CLASSNAME, "cursor-pointer p-0")}
        htmlFor={uniqueId}
      >
        <Radio
          checked={checked}
          disabled={disabled}
          id={uniqueId}
          onChange={() => toggleShapeId(shapeId)}
          value={uniqueId}
        />
        {label}
      </label>
    </PanelTreeItemRoot>
  );
};

// 체크박스 아이템
interface ITreeItemCheckboxProps extends IInteractiveTreeItemProps {
  disabled?: boolean;
}

const TreeItemCheckbox = ({
  checked,
  disabled,
  hasChildren,
  label,
  shapeId,
  toggleShapeId,
  uniqueId,
}: ITreeItemCheckboxProps) => {
  return (
    <PanelTreeItemRoot>
      {hasChildren && <AccordionTrigger className="cursor-pointer p-0" />}
      <Checkbox
        checked={checked}
        className="disabled:bg-neutral080 disabled:border-neutral240"
        disabled={disabled}
        id={uniqueId}
        onCheckedChange={() => toggleShapeId(shapeId)}
        value={shapeId}
      />
      <label className={cn(ITEM_LABEL_CLASSNAME, disabled && "opacity-50")} htmlFor={uniqueId}>
        {label}
      </label>
    </PanelTreeItemRoot>
  );
};

// 층 트리 아이템 (라디오/체크박스 없음)
const FloorTreeItem = ({ hasChildren, label, uniqueId }: IBaseTreeItemProps) => {
  if (hasChildren) {
    return (
      <AccordionTrigger
        className={cn(
          ITEM_WRAPPER_CLASSNAME,
          "flex-none cursor-pointer flex-row-reverse hover:no-underline",
        )}
        value={uniqueId}
      >
        <span className={ITEM_LABEL_CLASSNAME}>{label}</span>
      </AccordionTrigger>
    );
  }

  return <span className={ITEM_LABEL_CLASSNAME}>{label}</span>;
};

// 합성 컴포넌트 export
export const PanelTreeItem = {
  Checkbox: TreeItemCheckbox,
  Floor: FloorTreeItem,
  Radio: TreeItemRadio,
};
