import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-600 text-slate-100",
  success: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
  destructive: "bg-red-600/20 text-red-400 border border-red-500/30",
  info: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
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
