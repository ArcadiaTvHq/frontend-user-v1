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
  safelist: [
    'min-h-fit',
    'min-h-full',
    'min-h-screen',
    'h-fit',
    'h-full',
    'h-screen',
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
        borderinput: '#B0B0B0',
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
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        13: "52px",
        14: "56px",
        15: "60px",
        16: "64px",
        17: "68px",
        18: "72px",
        19: "76px",
        20: "80px",
        21: "84px",
        22: "88px",
        23: "92px",
        24: "96px",
        25: "100px",
        26: "104px",
        27: "108px",
        28: "112px",
        29: "116px",
        30: "120px",
      },
      maxWidth: {
        ...Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`${i + 1}`, `${(i + 1) * 4}px`])
        ),
      },
      width: {
        ...Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`${i + 1}`, `${(i + 1) * 4}px`])
        ),
      },
      height: {
        ...Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`${i + 1}`, `${(i + 1) * 4}px`])
        ),
      },
      minHeight: {
        ...Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`${i + 1}`, `${(i + 1) * 4}px`])
        ),
      },
    },
  },
  plugins: [],
};
