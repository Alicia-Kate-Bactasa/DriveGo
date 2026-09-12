import config from "tailwindcss";

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "20px",
        sm: "12px",
        md: "20px",
        lg: "30px",
        xl: "38px",
        "2xl": "45px",
        "3xl": "45px",
        "4xl": "45px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
