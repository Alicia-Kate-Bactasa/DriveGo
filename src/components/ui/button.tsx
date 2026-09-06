import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", size = "md", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-accent text-white hover:bg-[#0077cc] shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} ref={ref} {...props} />;
});

export { Button };