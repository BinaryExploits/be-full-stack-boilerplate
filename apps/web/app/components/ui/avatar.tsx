import type { ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials =
    fallback ??
    (alt
      ? alt
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?");

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-slate-600 font-medium text-slate-200 ${className}`}
      aria-label={alt}
    >
      {initials}
    </span>
  );
}

export { Avatar };
