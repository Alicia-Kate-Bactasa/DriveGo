import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <input
      className={`w-full rounded-[45px] border border-gray-200 bg-white px-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export { Input };
