"use client";

import {memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import {useShallow} from "zustand/react/shallow";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {Input} from "@/components/ui/input";
import {ChevronDown, ChevronRight, GripVertical, LayoutGrid, Search, Type,} from "lucide-react";
import {cn} from "@/lib/utils";

const getClassName = getClassNameFactory("ComponentList", styles);

export type ComponentCategory = {
  label: string;
  components: ComponentItem[];
};

export type ComponentItem = {
  name: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  category?: string;
};

export type ComponentsPanelProps = {
  children?: ReactNode;
  title?: string;
  searchable?: boolean;
  categories?: ComponentCategory[];
  className?: string;
};

type GroupedComponents = Record<string, ComponentItem[]>;

// Memoized component list item
const ComponentListItem = memo(function ComponentListItem({
  name,
  label,
  icon,
  description,
  isDragDisabled = false,
}: {
  name: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  isDragDisabled?: boolean;
}) {
  const canInsert = useAppStore(
    useShallow((s) =>
      s.permissions.getPermissions({ type: name }).insert
    )
  );

  const isDisabled = !canInsert || isDragDisabled;

  return (
    <div
      className={cn(
        getClassName("item"),
        isDisabled && getClassName("item", { disabled: true })
      )}
      data-component-name={name}
      draggable={canInsert && !isDragDisabled}
    >
      <div className={getClassName("itemDragHandle")}>
        <GripVertical size={14} />
      </div>
      <div className={getClassName("itemIcon")}>
        {icon || <LayoutGrid size={16} />}
      </div>
      <div className={getClassName("itemContent")}>
        <span className={getClassName("itemLabel")}>{label}</span>
        {description && (
          <span className={getClassName("itemDescription")}>{description}</span>
        )}
      </div>
    </div>
  );
});

// Memoized group header
const ComponentGroupHeader = memo(function ComponentGroupHeader({
  group,
  isExpanded,
  count,
  onToggle,
}: {
  group: string;
  isExpanded: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={getClassName("groupHeader")}
      onClick={onToggle}
    >
      <span className={getClassName("groupChevron")}>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </span>
      <span className={getClassName("groupLabel")}>{group}</span>
      <span className={getClassName("groupCount")}>{count}</span>
    </button>
  );
});

// Memoized default icon getter
const getDefaultIcon = useCallback((name: string) => {
  const textComponents = ["text", "heading", "paragraph", "typography"];
  if (textComponents.some((t) => name.toLowerCase().includes(t))) {
    return <Type size={16} />;
  }
  return <LayoutGrid size={16} />;
}, []);

export const ComponentsPanel = ({
  children,
  title,
  searchable = true,
  categories,
  className,
}: ComponentsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const config = useAppStore((s) => s.config);

  // Get all components from config - memoized
  const allComponents = useMemo(() => {
    const components: ComponentItem[] = [];
    
    if (categories) {
      categories.forEach((category) => {
        category.components.forEach((comp) => {
          components.push({
            ...comp,
            category: category.label,
          });
        });
      });
    } else {
      Object.entries(config.components).forEach(([name, component]) => {
        components.push({
          name,
          label: (component as any).label ?? name,
          description: (component as any).description,
          icon: (component as any).icon,
        });
      });
    }
    
    return components;
  }, [config.components, categories]);

  // Filter components based on search - memoized
  const filteredComponents = useMemo(() => {
    if (!debouncedQuery.trim()) return allComponents;
    
    const query = debouncedQuery.toLowerCase();
    return allComponents.filter(
      (comp) =>
        comp.label.toLowerCase().includes(query) ||
        comp.name.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query)
    );
  }, [allComponents, debouncedQuery]);

  // Group components by category - memoized
  const groupedComponents = useMemo<GroupedComponents>(() => {
    return filteredComponents.reduce((acc, comp) => {
      const category = comp.category || "Components";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(comp);
      return acc;
    }, {} as GroupedComponents);
  }, [filteredComponents]);

  // Toggle group expansion - stable callback
  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  }, []);

  // Check if group is expanded (default to true)
  const isGroupExpanded = useCallback(
    (group: string) => {
      return expandedGroups[group] !== false;
    },
    [expandedGroups]
  );

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={getClassName(null, className)}>
      {/* Title */}
      {title && <div className={getClassName("title")}>{title}</div>}

      {/* Search */}
      {searchable && (
        <div className={getClassName("search")}>
          <Search size={16} className={getClassName("searchIcon")} />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={getClassName("searchInput")}
          />
        </div>
      )}

      {/* Component list */}
      <div className={getClassName("list")}>
        {children}

        {Object.entries(groupedComponents).map(([group, components]) => (
          <div key={group} className={getClassName("group")}>
            <ComponentGroupHeader
              group={group}
              isExpanded={isGroupExpanded(group)}
              count={components.length}
              onToggle={() => toggleGroup(group)}
            />

            {isGroupExpanded(group) && (
              <div className={getClassName("groupContent")}>
                {components.map((comp) => (
                  <ComponentListItem
                    key={comp.name}
                    name={comp.name}
                    label={comp.label}
                    icon={comp.icon || getDefaultIcon(comp.name)}
                    description={comp.description}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <div className={getClassName("empty")}>
            No components found
          </div>
        )}
      </div>
    </div>
  );
};

// Export item component for custom rendering
ComponentsPanel.Item = ComponentListItem;
