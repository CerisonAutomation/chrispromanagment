"use client";

import {ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type ControlProps = {
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export const Control = ({
  isActive = false,
  isDisabled = false,
  onClick,
  className,
  children,
}: ControlProps & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      disabled={isDisabled}
      className={cn(
        "p-1.5 rounded hover:bg-gray-100 transition-colors",
        isActive && "bg-blue-100 text-blue-600 hover:bg-blue-100",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};
