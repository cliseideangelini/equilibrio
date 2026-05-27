import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Colour tokens (map to CSS vars in globals.css) ── */
      colors: {
        background:  "hsl(var(--background))",
        surface:     "hsl(var(--surface))",
        elevated:    "hsl(var(--elevated))",
        foreground:  "hsl(var(--foreground))",
        border:      "hsl(var(--border))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--muted-fg))",
        },
        accent: {
          DEFAULT:    "hsl(var(--elevated))",
          foreground: "hsl(var(--foreground))",
        },
        warm:          "hsl(var(--warm))",
        card: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--elevated))",
          foreground: "hsl(var(--muted-fg))",
        },
        destructive: {
          DEFAULT:    "hsl(0 72% 51%)",
          foreground: "hsl(var(--foreground))",
        },
        input:  "hsl(var(--border))",
        ring:   "hsl(var(--primary))",
      },

      /* ── Typography ── */
      fontFamily: {
        sans:  ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },

      /* ── Border radius ── */
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "3rem",
      },

      /* ── Spacing extras ── */
      maxWidth: {
        "8xl": "88rem",
      },

      /* ── Shadows ── */
      boxShadow: {
        "dim":      "0 4px 24px rgba(0,0,0,0.5)",
        "dim-lg":   "0 8px 48px rgba(0,0,0,0.6)",
        "glow":     "0 0 40px -8px rgba(29,184,127,0.35)",
        "glow-lg":  "0 0 60px -12px rgba(29,184,127,0.5)",
        "warm-glow":"0 0 40px -8px rgba(237,216,154,0.25)",
      },

      /* ── Animation keyframes (referenced from globals.css) ── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
