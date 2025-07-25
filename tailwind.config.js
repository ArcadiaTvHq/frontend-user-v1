/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        cod: "#0B0B0B",
        gold: "#FFD005",
        darkgold: "#7F6527",
        textprimary: "#fff",
        grayish: "#5E5E5E",
        cardgray: "#3D3D3D",
        darkgray: "#424242",
        body: "#0B0B0B",
        inputb: "#5B5B5B",
        minputb: "#888888",
        hover: "#CE8F00",
        link: "#FEFCE8",
        borderinput: '#b0b0b0',
        "btn-normal": "#FFD005",
        "btn-hover": "#CE8F00",
        "btn-disabled": "#FFF487",
      },
      fontFamily: {
        orbitron: ["orbitron", "sans-serif"],
        inter: ["inter", "sans-serif"],
        mont: ["mont", "sans-serif"],
        martel: ["martel", "sans-serif"],
      },
      fontSize: {
        smallest: "12px",
        tiny: "10.21px",
        type: "14px",
        normal: "24px",
        small: "16px",
        big: "64px",
        medium: "48px",
        smedium: "44px",
        h6: "31.64px",
        seemore: "20px",
      },
      
      maxWidth: {
        ...Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [i + 1, `${(i + 1) * 4}px`])
        ),
      },
      height: {
        49: "196px",
        50: "200px",
      },
      // Removed custom maxWidth to use Tailwind's default spacing scale
    },
  },
  plugins: [],
};
