import type { HTMLAttributes } from "react";

function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-white ${className}`}
      {...props}
    />
  );
}

function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-1.5 p-6 ${className}`} {...props} />
  );
}

function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-gray-500 dark:text-slate-400 ${className}`}
      {...props}
    />
  );
}

function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
