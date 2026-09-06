import { HTMLAttributes } from "react";

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
};

function Progress({ value = 0, max = 100, className = "", ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`w-full rounded-full bg-gray-100 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-2.5 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
