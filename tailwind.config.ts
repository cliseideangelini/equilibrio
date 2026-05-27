import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
                // Luxury Palette
                obsidian: {
                    DEFAULT: '#060A09', // Extremely dark teal/black
                    500: '#141E1C',
                    600: '#101816',
                    700: '#0B1210',
                    800: '#080D0C',
                    900: '#060A09',
                    950: '#030504',
                },
                emeraldGlow: {
                    DEFAULT: '#059669', // Strong emerald
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    800: '#065F46',
                },
                champagne: {
                    DEFAULT: '#F3EAC0', // Soft gold/champagne
                    300: '#FDE68A',
                    400: '#FCD34D',
                    500: '#FBBF24',
                }
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
                '2xl': '1.5rem',
                '3xl': '2rem',
                '4xl': '3rem',
    		},
            fontFamily: {
                sans: ['var(--font-jakarta)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
            },
            boxShadow: {
                'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                'dark-glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                'dark-glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.6)',
                'glow': '0 0 40px -10px rgba(16, 185, 129, 0.3)',
                'glow-strong': '0 0 60px -15px rgba(16, 185, 129, 0.5)',
            },
            backgroundImage: {
                'aurora': 'radial-gradient(ellipse at 50% -20%, rgba(16, 185, 129, 0.15), transparent 60%), radial-gradient(ellipse at bottom right, rgba(251, 191, 36, 0.05), transparent 40%)',
            },
            animation: {
                'spin-slow': 'spin 15s linear infinite',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
    	}
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
