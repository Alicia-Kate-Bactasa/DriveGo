import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export { Input };