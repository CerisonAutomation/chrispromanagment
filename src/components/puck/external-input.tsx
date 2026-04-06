"use client";

import {isValidElement, useCallback, useEffect, useMemo, useState} from "react";
import {ExternalField} from "@/lib/canonical-puck-types";
import {Link, Search, SlidersHorizontal, Unlock} from "lucide-react";
import {Modal} from "@/components/ui/modal";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AutoField} from "@/components/fields/auto-field";
import {FieldLabel} from "@/components/fields/field-label";
import {Loader} from "@/components/ui/loader";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {cn} from "@/lib/utils";

const getClassName = getClassNameFactory("ExternalInput", styles);
const getModalClassName = getClassNameFactory("ExternalInputModal", styles);

const dataCache: Record<string, any> = {};

export type ExternalInputProps = {
  field: ExternalField;
  onChange: (value: any) => void;
  value: any;
  name?: string;
  id: string;
  readOnly?: boolean;
};

export const ExternalInput = ({
  field,
  onChange,
  value = null,
  name,
  id,
  readOnly,
}: ExternalInputProps) => {
  const {
    mapProp = (val: any) => val,
    mapRow = (val: any) => val,
    filterFields,
    placeholder = "Select from external source",
    showSearch = true,
  } = field || {};

  const { enabled: shouldCacheData = true } = field.cache ?? {};

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasFilterFields = !!filterFields;

  const [filters, setFilters] = useState(field.initialFilters || {});
  const [filtersToggled, setFiltersToggled] = useState(hasFilterFields);

  const mappedData = useMemo(() => {
    return data.map(mapRow);
  }, [data, mapRow]);

  const keys = useMemo(() => {
    const validKeys: Set<string> = new Set();

    for (const item of mappedData) {
      for (const key of Object.keys(item)) {
        if (
          typeof item[key] === "string" ||
          typeof item[key] === "number" ||
          isValidElement(item[key])
        ) {
          validKeys.add(key);
        }
      }
    }

    return Array.from(validKeys);
  }, [mappedData]);

  const [searchQuery, setSearchQuery] = useState(field.initialQuery || "");

  const search = useCallback(
    async (query: string, filterObj: object) => {
      setIsLoading(true);

      const cacheKey = `${id}-${query}-${JSON.stringify(filterObj)}`;

      let listData;

      if (shouldCacheData && dataCache[cacheKey]) {
        listData = dataCache[cacheKey];
      } else {
        listData = await field.fetchList({ query, filters: filterObj });
      }

      if (listData) {
        setData(listData);
        setIsLoading(false);

        if (shouldCacheData) {
          dataCache[cacheKey] = listData;
        }
      }
    },
    [id, field, shouldCacheData]
  );

  const Footer = useCallback(
    (props: { items: any[] }) =>
      field.renderFooter ? (
        field.renderFooter(props)
      ) : (
        <span className={getModalClassName("footer")}>
          {props.items.length} result{props.items.length === 1 ? "" : "s"}
        </span>
      ),
    [field.renderFooter]
  );

  useEffect(() => {
    search(searchQuery, filters);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelect = (item: any, index: number) => {
    onChange(mapProp(data[index]));
    handleClose();
  };

  const handleDetach = () => {
    onChange(null);
  };

  return (
    <div
      className={getClassName({
        dataSelected: !!value,
        modalVisible: isOpen,
        readOnly,
      })}
      id={id}
    >
      <div className={getClassName("actions")}>
        <button
          type="button"
          onClick={() => !readOnly && setIsOpen(true)}
          className={getClassName("button")}
          disabled={readOnly}
        >
          {value ? (
            field.getItemSummary ? (
              field.getItemSummary(value)
            ) : (
              <span>External item selected</span>
            )
          ) : (
            <>
              <Link size={16} />
              <span>{placeholder}</span>
            </>
          )}
        </button>
        {value && !readOnly && (
          <button
            type="button"
            className={getClassName("detachButton")}
            onClick={handleDetach}
            title="Remove selection"
          >
            <Unlock size={16} />
          </button>
        )}
      </div>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <form
          className={cn(
            getModalClassName({
              isLoading,
              loaded: !isLoading,
              hasData: mappedData.length > 0,
              filtersToggled,
            }),
            "external-input-modal"
          )}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            search(searchQuery, filters);
          }}
        >
          <div className={getModalClassName("masthead")}>
            {showSearch ? (
              <div className={getModalClassName("searchForm")}>
                <div className={getModalClassName("searchInputWrapper")}>
                  <Search size={18} className={getModalClassName("searchIcon")} />
                  <Input
                    name="q"
                    type="search"
                    placeholder={placeholder}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    autoComplete="off"
                    value={searchQuery}
                    className={getModalClassName("searchInput")}
                  />
                </div>
                <div className={getModalClassName("searchActions")}>
                  <Button type="submit" loading={isLoading}>
                    Search
                  </Button>
                  {hasFilterFields && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFiltersToggled(!filtersToggled)}
                      title="Toggle filters"
                    >
                      <SlidersHorizontal size={20} />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <h2 className={getModalClassName("title")}>
                {placeholder || "Select data"}
              </h2>
            )}
          </div>

          <div className={getModalClassName("grid")}>
            {hasFilterFields && filtersToggled && (
              <div className={getModalClassName("filters")}>
                {Object.keys(filterFields).map((fieldName) => {
                  const filterField = filterFields[fieldName];
                  return (
                    <div
                      className={getModalClassName("field")}
                      key={fieldName}
                    >
                      <FieldLabel label={filterField.label || fieldName}>
                        <AutoField
                          field={filterField}
                          id={`external_field_${fieldName}_filter`}
                          value={filters[fieldName]}
                          onChange={(filterValue) => {
                            setFilters((prevFilters) => {
                              const newFilters = {
                                ...prevFilters,
                                [fieldName]: filterValue,
                              };
                              search(searchQuery, newFilters);
                              return newFilters;
                            });
                          }}
                        />
                      </FieldLabel>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={getModalClassName("tableWrapper")}>
              <table className={getModalClassName("table")}>
                <thead className={getModalClassName("thead")}>
                  <tr className={getModalClassName("tr")}>
                    {keys.map((key) => (
                      <th
                        key={key}
                        className={getModalClassName("th")}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={getModalClassName("tbody")}>
                  {mappedData.map((item, i) => (
                    <tr
                      key={i}
                      className={getModalClassName("tr")}
                      onClick={() => handleSelect(item, i)}
                    >
                      {keys.map((key) => (
                        <td key={key} className={getModalClassName("td")}>
                          {item[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {isLoading && (
                <div className={getModalClassName("loadingBanner")}>
                  <Loader size={24} />
                </div>
              )}
            </div>
          </div>

          <div className={getModalClassName("footerContainer")}>
            <Footer items={mappedData} />
          </div>
        </form>
      </Modal>
    </div>
  );
};
