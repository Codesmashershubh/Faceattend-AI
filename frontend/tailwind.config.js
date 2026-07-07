/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B", // near-black panels, sidebar, primary text on light
        cream: "#F4F1E8", // light text on dark surfaces
        canvas: "#E4E4E4", // page background
        sky: "#75C5DE", // signature accent - AI "scan" blue
        muted: "#9A9590", // secondary text
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
