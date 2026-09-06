import { HTMLAttributes, memo } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = memo(function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      {...props}
    />
  );
});

export { Card };
