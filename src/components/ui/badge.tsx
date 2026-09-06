import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };