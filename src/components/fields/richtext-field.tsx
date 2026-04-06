"use client";

import {Editor3} from "@/components/ui/editor3";
import {FieldLabel} from "./field-label";
import {FieldLabelPropsInternal} from "./auto-field";

export type RichtextFieldProps = {
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

export const RichtextField = ({
  field,
  name,
  id,
  value,
  onChange,
  readOnly,
  Label,
  label,
  labelIcon,
}: RichtextFieldProps) => {
  return (
    <div>
      <FieldLabel label={label} description={field.description} readOnly={readOnly}>
        <Editor3
          content={value}
          onChange={onChange}
          editable={!readOnly}
          placeholder={field.placeholder || "Start typing..."}
        />
      </FieldLabel>
    </div>
  );
};
