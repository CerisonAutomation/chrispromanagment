"use client";

import * as React from "react";
import {cn} from "@/lib/utils";
import {Loader} from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant = "default", size = "default", loading, icon, children, disabled, ...props}, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    // Variants
                    variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
                    variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
                    variant === "outline" && "border border-gray-300 bg-white hover:bg-gray-100 focus-visible:ring-gray-400",
                    variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400",
                    variant === "ghost" && "hover:bg-gray-100 focus-visible:ring-gray-400",
                    variant === "link" && "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
                    // Sizes
                    size === "default" && "h-10 px-4 py-2",
                    size === "sm" && "h-8 px-3 text-xs",
                    size === "lg" && "h-12 px-8 text-base",
                    size === "icon" && "h-10 w-10",
                    className
                )}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader size={16} className="animate-spin"/>}
                {!loading && icon}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

// IconButton for icon-only buttons
export const IconButton = React.forwardRef<
    HTMLButtonElement,
    ButtonProps
>(({className, size = "icon", children, ...props}, ref) => {
  return (
      <Button
          ref={ref}
          size={size}
          className={cn("p-0", className)}
          {...props}
      >
          {children}
      </Button>
  );
});
IconButton.displayName = "IconButton";

export const buttonVariants = ({
                                   variant = "default",
                                   size = "default"
                               }: {
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
}) => {
    return cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        variant === "outline" && "border border-gray-300 bg-white hover:bg-gray-100 focus-visible:ring-gray-400",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400",
        variant === "ghost" && "hover:bg-gray-100 focus-visible:ring-gray-400",
        variant === "link" && "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3 text-xs",
        size === "lg" && "h-12 px-8 text-base",
        size === "icon" && "h-10 w-10"
    );
};

export {Button};
