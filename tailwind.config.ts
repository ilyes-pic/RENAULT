/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom color palette for ZORRAGA
        primary: {
          light: "#27AE60", // Fresh green for light mode
          dark: "#2ECC71", // Vibrant green for dark mode
          DEFAULT: "#27AE60",
        },
        accent: {
          light: "#00B16A", // Cooler green for interactive elements (light)
          dark: "#00D084", // Bright green glow for hover/focus (dark)
          DEFAULT: "#00B16A",
        },
        background: {
          light: "#FFFFFF", // Clean white
          dark: "#121212", // Deep black
          DEFAULT: "#FFFFFF",
        },
        surface: {
          light: "#F9F9F9", // Slightly off-white for cards
          dark: "#1E1E1E", // Slightly lighter black for cards/containers
          DEFAULT: "#F9F9F9",
        },
        text: {
          primary: {
            light: "#1A1A1A", // Deep black for strong contrast
            dark: "#F5F5F5", // Near-white for main text
            DEFAULT: "#1A1A1A",
          },
          secondary: {
            light: "#555555", // Dark gray for subtler text
            dark: "#CCCCCC", // Muted gray for supporting text
            DEFAULT: "#555555",
          },
        },
        border: {
          light: "#E0E0E0", // Light gray lines
          dark: "#2A2A2A", // Subtle contrast between components
          DEFAULT: "#E0E0E0",
        },
        // Shadcn/ui color system
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #2ECC71" },
          "100%": { boxShadow: "0 0 20px #2ECC71, 0 0 30px #2ECC71" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};