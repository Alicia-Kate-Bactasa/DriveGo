import { HTMLAttributes, memo } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

const Badge = memo(function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

export { Badge };
