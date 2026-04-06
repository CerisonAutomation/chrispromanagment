"use client";

import type {TextareaField as TextareaFieldType} from "@/lib/canonical-puck-types";

export type TextareaFieldProps = {
  field: TextareaFieldType;
  name?: string;
  id: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  label?: string;
  labelIcon?: React.ReactNode;
};

export const TextareaField = ({
  field,
  value,
  onChange,
  readOnly,
  id,
  label,
}: TextareaFieldProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-neutral-400">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value as string || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        placeholder={field.placeholder}
        className="w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-cpm-accent focus:outline-none"
        rows={4}
      />
    </div>
  );
};
