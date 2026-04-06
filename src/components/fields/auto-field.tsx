"use client";

import getClassNameFactory from "@/lib/get-class-name-factory";
import {AnyField, Field, FieldProps} from "@/lib/canonical-puck-types";
import {useAppStore} from "@/store/puck-editor-store";
import {useSafeId} from "@/lib/use-safe-id";
import {NestedFieldContext} from "./context";
import {useShallow} from "zustand/react/shallow";
import {getDeep} from "@/lib/data/get-deep";
import {FieldLabelInternal} from "./field-label";
import {fieldContextStore, useFieldStore, useFieldStoreApi} from "./store";
import {ReactNode, useCallback, useContext, useEffect, useMemo,} from "react";
import {DefaultField} from "./default-field";
import {SelectField} from "./select-field";
import {ExternalField} from "./external-field";
import {ArrayField} from "./array-field";
import {ObjectField} from "./object-field";
import {TextareaField} from "./textarea-field";
import {RichtextField} from "./richtext-field";
import {RadioField} from "./radio-field";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Input", styles);
const getClassNameWrapper = getClassNameFactory("InputWrapper", styles);

/** Generic indexable type */
type Indexable<T = unknown> = { [key: string]: T };

export type FieldPropsInternal<ValueType = unknown, F extends Field = Field> = FieldProps<F, ValueType> & {
  Label: React.FC<FieldLabelPropsInternal>;
  label?: string;
  labelIcon?: ReactNode;
  id: string;
  name?: string;
};

export type FieldLabelPropsInternal = {
  children: ReactNode;
  description?: string;
  readOnly?: boolean;
};

export { FieldLabel } from "./field-label";

const defaultFields: Record<string, React.ComponentType<unknown>> = {
  array: ArrayField,
  external: ExternalField,
  object: ObjectField,
  select: SelectField,
  textarea: TextareaField,
  radio: RadioField,
  text: DefaultField,
  number: DefaultField,
  richtext: RichtextField,
};

type FieldNoLabel<Props extends Indexable = Indexable> = Omit<Field<Props>, "label">;

type FieldPropsInternalOptional<ValueType = unknown, FieldType extends FieldNoLabel<ValueType> = FieldNoLabel<ValueType>> = Omit<FieldProps<FieldType, ValueType>, "value"> & {
  Label?: React.FC<FieldLabelPropsInternal>;
  value?: ValueType;
};

function AutoFieldInternal<
  ValueType = unknown,
  FieldType extends FieldNoLabel<ValueType> = FieldNoLabel<ValueType>
>(
  props: FieldPropsInternalOptional<ValueType, FieldType> & {
    Label?: React.FC<FieldLabelPropsInternal>;
  }
) {
  const dispatch = useAppStore((s) => s.dispatch);
  const overrides = useAppStore((s) => s.overrides);
  const readOnly = useAppStore(useShallow((s) => s.selectedItem?.readOnly));
  const nestedFieldContext = useContext(NestedFieldContext);

  const { id, Label = FieldLabelInternal } = props;

  const field = props.field as Field<ValueType>;
  const label = field.label;
  const labelIcon = field.labelIcon;

  const defaultId = useSafeId();
  const resolvedId = id || defaultId;

  const render = useMemo(
    () => ({
      ...overrides.fieldTypes,
      custom: overrides.fieldTypes?.custom,
      array: overrides.fieldTypes?.array || defaultFields.array,
      external: overrides.fieldTypes?.external || defaultFields.external,
      object: overrides.fieldTypes?.object || defaultFields.object,
      select: overrides.fieldTypes?.select || defaultFields.select,
      textarea: overrides.fieldTypes?.textarea || defaultFields.textarea,
      radio: overrides.fieldTypes?.radio || defaultFields.radio,
      text: overrides.fieldTypes?.text || defaultFields.text,
      number: overrides.fieldTypes?.number || defaultFields.number,
      richtext: overrides.fieldTypes?.richtext || defaultFields.richtext,
    }),
    [overrides]
  );

  const fieldValue = useFieldStore((s) => {
    if (field.type === "custom" || overrides.fieldTypes?.[field.type]) {
      return getDeep(s, props.name ?? resolvedId);
    }
  });

  const mergedProps = useMemo(
    () => ({
      ...props,
      field,
      label,
      labelIcon,
      Label,
      id: resolvedId,
      value: fieldValue,
    }),
    [props, field, label, labelIcon, Label, resolvedId, fieldValue]
  );

  const onFocus = useCallback(
    (e: React.FocusEvent) => {
      if (
        mergedProps.name &&
        (e.target.nodeName === "INPUT" || e.target.nodeName === "TEXTAREA")
      ) {
        e.stopPropagation();

        dispatch({
          type: "setUi",
          ui: {
            field: { focus: mergedProps.name },
          },
        });
      }
    },
    [mergedProps.name]
  );

  const onBlur = useCallback((e: React.FocusEvent) => {
    if ("name" in e.target) {
      dispatch({
        type: "setUi",
        ui: {
          field: { focus: null },
        },
      });
    }
  }, []);

  let Children = useMemo(() => {
    if (field.type !== "custom" && field.type !== "slot") {
      return defaultFields[field.type];
    }

    return () => null;
  }, [field.type]);

  const fieldKey = field.type === "custom" ? (field as { key?: string }).key : undefined;

  let FieldComponent: React.ComponentType<FieldProps<AnyField, unknown>> | null = useMemo(() => {
    if (field.type === "custom" && !render[field.type]) {
      if (!(field as { render?: unknown }).render) {
        return null;
      }
      return (field as { render: React.ComponentType<FieldProps<AnyField, unknown>> }).render;
    } else if (field.type !== "slot") {
      return render[field.type] as React.ComponentType<FieldProps<AnyField, unknown>>;
    }
    return null;
  }, [field.type, fieldKey, render]);

  const { visible = true } = props.field;

  if (!visible) {
    return null;
  }

  if (field.type === "slot") {
    return null;
  }

  if (!FieldComponent) {
    throw new Error(`Field type for ${field.type} did not exist.`);
  }

  return (
    <NestedFieldContext.Provider
      value={{
        readOnlyFields: nestedFieldContext.readOnlyFields || readOnly || {},
        localName: nestedFieldContext.localName ?? mergedProps.name,
      }}
    >
      <div
        className={getClassNameWrapper()}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FieldComponent {...mergedProps as FieldProps<AnyField, unknown>}>
          <Children {...(mergedProps as Indexable)} />
        </FieldComponent>
      </div>
    </NestedFieldContext.Provider>
  );
}

export function AutoFieldPrivate<
  ValueType = unknown,
  FieldType extends FieldNoLabel<ValueType> = FieldNoLabel<ValueType>
>(
  props: Omit<FieldPropsInternalOptional<ValueType, FieldType>, "value"> & {
    Label?: React.FC<FieldLabelPropsInternal>;
    value?: ValueType;
  }
) {
  return <AutoFieldInternal<ValueType, FieldType> {...props} />;
}

function AutoFieldPublicInternal<
  ValueType = unknown,
  FieldType extends FieldNoLabel<ValueType> = FieldNoLabel<ValueType>
>({ value, ...props }: FieldProps<FieldType, ValueType> & { value?: ValueType }) {
  const DefaultLabel = useMemo(() => {
    const DefaultLabel = (labelProps: { className?: string }) => (
      <div
        {...labelProps}
        className={getClassName({ readOnly: props.readOnly })}
      />
    );

    return DefaultLabel;
  }, [props.readOnly]);

  const fieldStore = useFieldStoreApi();

  const onChange = useCallback(
    (newValue: ValueType) => {
      if (!props.id) return;

      fieldStore.setState({ [props.id]: newValue } as Indexable);

      props.onChange?.(newValue);
    },
    [fieldStore, props.onChange, props.id]
  );

  useEffect(() => {
    if (!props.id) return;

    fieldStore.setState({ [props.id]: value } as Indexable);
  }, [props.id, value, fieldStore]);

  return (
    <AutoFieldInternal<ValueType, FieldType>
      {...props}
      onChange={onChange}
      Label={DefaultLabel}
    />
  );
}

export function AutoField<
  ValueType = unknown,
  FieldType extends FieldNoLabel<ValueType> = FieldNoLabel<ValueType>
>(props: FieldProps<FieldType, ValueType> & { value?: ValueType }) {
  const id = useSafeId();

  if (props.field.type === "slot") {
    return null;
  }

  return (
    <fieldContextStore.Provider value={{ [id]: props.value } as Indexable}>
      <AutoFieldPublicInternal<ValueType, FieldType> {...props} id={id} />
    </fieldContextStore.Provider>
  );
}
