"use client";

import {memo, useCallback} from "react";
import {Input} from "@/components/ui/input";
import {FieldLabel} from "./field-label";
import {FieldLabelPropsInternal} from "./auto-field";

export type DefaultFieldProps = {
  field: any;
  name?: string;
  id: string;
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  Label?: React.FC<FieldLabelPropsInternal>;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const DefaultField = memo(function DefaultField({
  field,
  name,
  id,
  value,
  onChange,
  readOnly,
  Label,
  label,
  labelIcon,
}: DefaultFieldProps) {
  const InputComponent = field.type === "number" ? Input : Input;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <FieldLabel label={label} description={field.description} readOnly={readOnly}>
        <InputComponent
          type={field.type === "number" ? "number" : "text"}
          id={id}
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          disabled={readOnly}
          placeholder={field.type === "number" ? "0" : "Enter text..."}
        />
      </FieldLabel>
    </div>
  );
});

DefaultField.displayName = "DefaultField";
