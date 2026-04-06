"use client";

import {AutoFieldPrivate, FieldLabelPropsInternal} from "./auto-field";
import {FieldLabel} from "./field-label";
import type {AnyField, ObjectField as ObjectFieldType} from "@/lib/canonical-puck-types";

/** Generic indexable type */
type Indexable<T = unknown> = { [key: string]: T };

export type ObjectFieldProps<T extends Indexable = Indexable> = {
  field: ObjectFieldType<T>;
  name?: string;
  id: string;
  value?: T;
  onChange?: (value: T) => void;
  readOnly?: boolean;
  Label?: React.FC<FieldLabelPropsInternal>;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const ObjectField = <T extends Indexable = Indexable>({
  field,
  name,
  id,
  value = {} as T,
  onChange,
  readOnly,
  Label,
  label,
  labelIcon,
}: ObjectFieldProps<T>) => {
  const objectFields = (field.objectFields || {}) as Fields<T>;

  const handleFieldChange = (fieldName: string, fieldValue: unknown) => {
    onChange?.({
      ...value,
      [fieldName]: fieldValue,
    } as T);
  };

  return (
    <div>
      <FieldLabel label={label} description={field.description} readOnly={readOnly}>
        <div className="space-y-3 pl-3 border-l-2 border-[var(--puck-color-border)]">
          {Object.entries(objectFields).map(([fieldName, subField]) => (
            <AutoFieldPrivate
              key={fieldName}
              field={subField as AnyField}
              name={`${name}.${fieldName}`}
              id={`${id}-${fieldName}`}
              value={(value as Indexable)[fieldName]}
              onChange={(newValue) => handleFieldChange(fieldName, newValue)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </FieldLabel>
    </div>
  );
};
