"use client";

import {cn} from "@/lib/utils";

export type LoaderProps = {
  size?: number;
  className?: string;
};

export const Loader = ({size = 24, className}: LoaderProps) => {
  return (
    <div
        className={cn("animate-spin", className)}
        style={{width: size, height: size}}
    >
      <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="animate-spin"
      >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="10"
            opacity="0.25"
        />
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="62.832"
            className="opacity-75"
        />
      </svg>
    </div>
  );
};
