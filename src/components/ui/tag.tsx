import { HTMLAttributes, memo } from "react";

type TagProps = HTMLAttributes<HTMLSpanElement>;

const Tag = memo(function Tag({ className = "", children, ...props }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

export { Tag };
