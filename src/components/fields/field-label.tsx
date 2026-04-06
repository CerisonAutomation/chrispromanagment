"use client";

import {ReactNode} from "react";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("FieldLabel", styles);

export type FieldLabelProps = {
  children: ReactNode;
  label?: string;
  description?: string;
  readOnly?: boolean;
  required?: boolean;
  icon?: ReactNode;
};

export const FieldLabel = ({
  children,
  label,
  description,
  readOnly,
  required,
  icon,
}: FieldLabelProps) => {
  return (
    <div className={getClassName()}>
      {label && (
        <label className={getClassName("label")}>
          {icon && <span className={getClassName("icon")}>{icon}</span>}
          <span>{label}</span>
          {required && <span className={getClassName("required")}>*</span>}
        </label>
      )}
      {description && (
        <p className={getClassName("description")}>{description}</p>
      )}
      {children}
    </div>
  );
};

export const FieldLabelInternal = ({
  children,
  description,
  readOnly,
}: {
  children: ReactNode;
  description?: string;
  readOnly?: boolean;
}) => {
  return (
    <>
      {description && (
        <p className={getClassName("description")}>{description}</p>
      )}
      {children}
    </>
  );
};
