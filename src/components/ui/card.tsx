import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`} {...props} />
  );
}

export { Card };