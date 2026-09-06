import { HTMLAttributes } from "react";

type TagProps = HTMLAttributes<HTMLSpanElement>;

function Tag({ className = "", children, ...props }: TagProps) {
  return (
    <span className={`inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 ${className}`} {...props}>
      {children}
    </span>
  );
}

export { Tag };