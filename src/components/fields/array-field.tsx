"use client";

import {useCallback} from "react";
import {Button} from "@/components/ui/button";
import {Plus, Trash2} from "lucide-react";
import {FieldLabel} from "./field-label";
import {AutoFieldPrivate, FieldLabelPropsInternal} from "./auto-field";
import type {AnyField, ArrayField as ArrayFieldType} from "@/lib/canonical-puck-types";

/** Generic indexable type */
type Indexable<T = unknown> = { [key: string]: T };

export type ArrayFieldProps<T extends Indexable = Indexable> = {
  field: ArrayFieldType<T>;
  name?: string;
  id: string;
  value?: T[];
  onChange?: (value: T[]) => void;
  readOnly?: boolean;
  Label?: React.FC<FieldLabelPropsInternal>;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const ArrayField = <T extends Indexable = Indexable>({
  field,
  name,
  id,
  value = [],
  onChange,
  readOnly,
  Label,
  label,
  labelIcon,
}: ArrayFieldProps<T>) => {
  const itemType = field.arrayFields as Fields<T>;
  
  const handleAddItem = useCallback(() => {
    const newItem: T = {} as T;
    if (itemType) {
      Object.keys(itemType).forEach((key) => {
        const subField = itemType[key];
        newItem[key] = (subField as { defaultValue?: T[string] }).defaultValue ?? "" as T[string];
      });
    }
    onChange?.([...value, newItem] as T[]);
  }, [value, onChange, itemType]);

  const handleRemoveItem = useCallback((index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange?.(newValue as T[]);
  }, [value, onChange]);

  const handleItemChange = useCallback((index: number, fieldName: string, fieldValue: unknown) => {
    const newValue = value.map((item, i) => {
      if (i === index) {
        return { ...item, [fieldName]: fieldValue } as T;
      }
      return item;
    });
    onChange?.(newValue);
  }, [value, onChange]);

  return (
    <div>
      <FieldLabel label={label} description={field.description} readOnly={readOnly}>
        <div className="space-y-3">
          {value.map((item, index) => (
            <div
              key={index}
              className="p-3 border border-[var(--puck-color-border)] rounded-md bg-[var(--puck-color-grey-2)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--puck-color-secondary)]">
                  Item {index + 1}
                </span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {itemType && Object.entries(itemType).map(([fieldName, subField]) => (
                  <AutoFieldPrivate
                    key={fieldName}
                    field={subField as AnyField}
                    name={`${name}[${index}].${fieldName}`}
                    id={`${id}-${index}-${fieldName}`}
                    value={(item as Indexable)[fieldName]}
                    onChange={(newValue) => handleItemChange(index, fieldName, newValue)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus size={14} />
              Add Item
            </Button>
          )}
        </div>
      </FieldLabel>
    </div>
  );
};
