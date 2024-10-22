import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        'thumbnail': "url('/bg-connect.svg')",
        'header': "url('/bg_header.png')"
      },
      colors: {
        'main-bg': '#0f0f0f',
        'sub1': '#1b1b1b',
        'sub2': '#292929',
        'main-yellow': '#d9b432',
        'sub-yellow': '#E5B842',
        'sub2-yellow': '#A49A80',
        'sub3-yellow': '#e5b7431a'
      }
    },
  },
  plugins: [],
};
export default config;
