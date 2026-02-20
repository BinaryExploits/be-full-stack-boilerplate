import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-100",
  success:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-600/20 dark:text-amber-400 dark:border-amber-500/30",
  destructive:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-600/20 dark:text-red-400 dark:border-red-500/30",
  info: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeVariant };
