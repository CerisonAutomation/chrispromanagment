"use client";

import type {RadioField as RadioFieldType} from "@/lib/canonical-puck-types";

export type RadioFieldProps = {
  field: RadioFieldType;
  name?: string;
  id: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const RadioField = ({
  field,
  value,
  onChange,
  readOnly,
  id,
  label,
}: RadioFieldProps) => {
  const options = field.options;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-neutral-400">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option: { value: string | number | boolean | null | undefined; label: string }, index: number) => {
          const optionValue = typeof option.value === 'boolean' 
            ? String(option.value) 
            : String(option.value ?? '');
          const optionId = `${id}-${index}`;
          
          return (
            <label
              key={index}
              htmlFor={optionId}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                id={optionId}
                name={id}
                value={optionValue}
                checked={value === optionValue}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={readOnly}
                className="h-4 w-4 text-cpm-accent focus:ring-cpm-accent"
              />
              <span className="text-sm text-neutral-300">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
