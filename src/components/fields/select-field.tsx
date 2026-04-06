"use client";

import type {SelectField as SelectFieldType} from "@/lib/canonical-puck-types";

type Indexable<T = unknown> = { [key: string]: T };

export type SelectFieldProps = {
  field: SelectFieldType;
  name?: string;
  id: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const SelectField = ({
  field,
  value,
  onChange,
  readOnly,
  id,
  label,
}: SelectFieldProps) => {
  const options = field.options;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-neutral-400">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value as string || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className="w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-cpm-accent focus:outline-none"
      >
        {field.placeholder && (
          <option value="" disabled>
            {field.placeholder}
          </option>
        )}
        {options.map((option: { value: string | number | boolean | null | undefined; label: string }, index: number) => {
          const optionValue = typeof option.value === 'boolean' 
            ? String(option.value) 
            : String(option.value ?? '');
          return (
            <option key={index} value={optionValue}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};
