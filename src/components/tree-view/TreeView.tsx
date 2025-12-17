import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import React, { type ElementType, Fragment } from "react";

import { cn } from "@/lib/utils.ts";

const treeVariants = cva(
  "group hover:before:opacity-100 before:absolute before:transition-opacity before:left-0 before:right-0 px-2 py-3 before:opacity-0 before:bg-primary/10 before:h-9",
);
const selectedTreeVariants = cva("before:opacity-100 before:bg-primary/10 text-foreground");

interface TreeDataItem {
  actions?: React.ReactNode;
  children?: TreeDataItem[];
  icon?: unknown;
  id: string;
  name: string;
  onClick?: () => void;
  openIcon?: unknown;
  renderItemActions?: React.ReactNode;
  selectedIcon?: unknown;
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem | TreeDataItem[];
  defaultLeafIcon?: unknown;
  defaultNodeIcon?: unknown;
  depth?: number;
  expandAll?: boolean;
  handleSelectChange: (item: TreeDataItem) => void;
  selectedItemId?: string;
};

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      className,
      data,
      defaultLeafIcon,
      defaultNodeIcon,
      depth = 0,
      expandAll,
      handleSelectChange,
      selectedItemId,
      ...props
    },
    ref,
  ) => {
    const expandedItemIds = React.useMemo(() => {
      if (!selectedItemId) {
        return [] as string[];
      }

      const ids: string[] = [];

      function walkTreeItems(items: TreeDataItem | TreeDataItem[], targetId: string) {
        if (items instanceof Array) {
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id);
            if (walkTreeItems(items[i]!, targetId) && !expandAll) {
              return true;
            }
            if (!expandAll) ids.pop();
          }
        } else if (!expandAll && items.id === targetId) {
          return true;
        } else if (items.children) {
          return walkTreeItems(items.children as TreeDataItem[], targetId);
        }
      }

      walkTreeItems(data, selectedItemId);

      return ids;
    }, [data, expandAll, selectedItemId]);

    return (
      <div className={cn("relative overflow-hidden p-2", className)}>
        <TreeItem
          data={data}
          defaultLeafIcon={defaultLeafIcon}
          defaultNodeIcon={defaultNodeIcon}
          depth={depth}
          expandedItemIds={expandedItemIds}
          handleSelectChange={handleSelectChange}
          ref={ref}
          selectedItemId={selectedItemId}
          {...props}
        />
      </div>
    );
  },
);
TreeView.displayName = "TreeView";

type TreeItemProps = TreeProps & {
  defaultLeafIcon?: unknown;
  defaultNodeIcon?: unknown;
  depth?: number;
  expandedItemIds: string[];
  handleSelectChange: (item: TreeDataItem) => void;
  renderItemActions?: React.ReactNode;
  selectedItemId?: string;
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      defaultLeafIcon,
      defaultNodeIcon,
      depth = 0,
      expandedItemIds,
      handleSelectChange,
      selectedItemId,
      ...props
    },
    ref,
  ) => {
    if (!(data instanceof Array)) {
      data = [data];
    }
    return (
      <div className={className} ref={ref} role="tree" {...props}>
        <ul>
          {data.map((item) => (
            <Fragment key={item.id}>
              <li className="flex items-start justify-between">
                {item.children ? (
                  <TreeNode
                    defaultLeafIcon={defaultLeafIcon}
                    defaultNodeIcon={defaultNodeIcon}
                    depth={depth + 1}
                    expandedItemIds={expandedItemIds}
                    handleSelectChange={handleSelectChange}
                    item={item}
                    selectedItemId={selectedItemId}
                  />
                ) : (
                  <TreeLeaf
                    defaultLeafIcon={defaultLeafIcon}
                    depth={depth + 1}
                    handleSelectChange={handleSelectChange}
                    item={item}
                    selectedItemId={selectedItemId}
                  />
                )}
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    );
  },
);
TreeItem.displayName = "TreeItem";

const TreeNode = ({
  defaultLeafIcon,
  defaultNodeIcon,
  depth = 0,
  expandedItemIds,
  handleSelectChange,
  item,
  renderItemActions,
  selectedItemId,
}: {
  defaultLeafIcon?: unknown;
  defaultNodeIcon?: unknown;
  depth?: number;
  expandedItemIds: string[];
  handleSelectChange: (item: TreeDataItem) => void;
  item: TreeDataItem;
  renderItemActions?: React.ReactNode;
  selectedItemId?: string;
}) => {
  const [value, setValue] = React.useState(expandedItemIds.includes(item.id) ? [item.id] : []);

  const isRoot = depth === 1;

  return (
    <AccordionPrimitive.Root
      className="w-full"
      onValueChange={(s) => setValue(s)}
      type="multiple"
      value={value}
    >
      <AccordionPrimitive.Item value={item.id}>
        <div className={cn("rounded-md", !isRoot && "border-border border")}>
          <TreeIcon
            default={defaultNodeIcon}
            isOpen={value.includes(item.id)}
            isSelected={selectedItemId === item.id}
            item={item}
          />

          <AccordionTrigger
            className={cn(treeVariants(), selectedItemId === item.id && selectedTreeVariants())}
            onClick={() => {
              handleSelectChange(item);
              item.onClick?.();
            }}
          >
            <span className="truncate text-sm font-semibold">{item.name}</span>
            {item.renderItemActions && (
              <div
                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {item.renderItemActions}
              </div>
            )}
          </AccordionTrigger>
          <TreeActions isSelected={selectedItemId === item.id}>{item.actions}</TreeActions>
          <AccordionContent className="ml-0">
            <TreeItem
              data={item.children ? (item.children as TreeDataItem[]) : (item as TreeDataItem)}
              defaultLeafIcon={defaultLeafIcon}
              defaultNodeIcon={defaultNodeIcon}
              depth={depth + 1}
              expandedItemIds={expandedItemIds}
              handleSelectChange={handleSelectChange}
              renderItemActions={renderItemActions}
              selectedItemId={selectedItemId}
            />
          </AccordionContent>
        </div>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

const TreeLeaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultLeafIcon?: unknown;
    depth?: number;
    handleSelectChange: (item: TreeDataItem) => void;
    item: TreeDataItem;
    selectedItemId?: string;
  }
>(({ className, defaultLeafIcon, handleSelectChange, item, selectedItemId, ...props }, ref) => {
  return (
    <div
      className={cn(
        "relative ml-7 flex w-full cursor-pointer items-center py-2 text-left before:right-1",
        treeVariants(),
        className,
        selectedItemId === item.id && selectedTreeVariants(),
      )}
      onClick={() => {
        handleSelectChange(item);
        item.onClick?.();
      }}
      ref={ref}
      {...props}
    >
      <TreeIcon default={defaultLeafIcon} isSelected={selectedItemId === item.id} item={item} />
      <span className="flex-grow truncate text-sm font-semibold">{item.name}</span>
      {item.renderItemActions && (
        <div
          className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {item.renderItemActions}
        </div>
      )}
      <TreeActions isSelected={selectedItemId === item.id}>{item.actions}</TreeActions>
    </div>
  );
});
TreeLeaf.displayName = "TreeLeaf";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ children, className, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      className={cn(
        "group relative flex w-full items-center px-3 py-3 first:[&[data-state=open]>div>svg]:rotate-90",
        className,
      )}
      ref={ref}
      {...props}
      asChild
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <ChevronRight className="text-foreground h-4 w-4 shrink-0 transition-transform duration-200" />
          <div className="truncate">{children}</div>
        </div>
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, className, ...props }, ref) => (
  <AccordionPrimitive.Content
    className={cn(
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all",
      className,
    )}
    ref={ref}
    {...props}
  >
    <div className="pt-0 pb-1">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const TreeIcon = ({
  default: defaultIcon,
  isOpen,
  isSelected,
  item,
}: {
  default?: unknown;
  isOpen?: boolean;
  isSelected?: boolean;
  item: TreeDataItem;
}) => {
  let Icon: ElementType | undefined = defaultIcon as ElementType;
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon as ElementType;
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon as ElementType;
  } else if (item.icon) {
    Icon = item.icon as ElementType;
  }
  return Icon ? <Icon className="text-foreground mr-2 h-4 w-4 shrink-0" /> : null;
};

const TreeActions = ({
  children,
  isSelected,
}: {
  children: React.ReactNode;
  isSelected: boolean;
}) => {
  return (
    <div className={cn(isSelected ? "block" : "hidden", "absolute right-3 group-hover:block")}>
      {children}
    </div>
  );
};

export { TreeView, type TreeDataItem };
