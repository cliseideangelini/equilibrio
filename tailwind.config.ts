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
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sage: {
    				'50': '#f7f9f8',
    				'100': '#ebf1ef',
    				'200': '#d5e2dd',
    				'300': '#b4cac3',
    				'400': '#8ebaa8',
    				'500': '#6b9282',
    				'600': '#527265',
    				'700': '#435c52',
    				'800': '#374b43',
    				'900': '#2f3f39',
    				'950': '#192420'
    			},
    			teal: {
    				'950': '#091c1b'
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
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.03)',
                'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.07)',
                'floating': '0 20px 40px -15px rgba(0,0,0,0.05)',
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(158, 20%, 90%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(20, 20%, 95%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(158, 15%, 95%, 1) 0px, transparent 50%)',
            }
    	}
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
