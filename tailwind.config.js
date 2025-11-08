// cspell:ignore shadcn
import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
    "./components/ui/**/*.{ts,tsx,js,jsx}",
  ],
  safelist: [
    // keep core brand utilities from purging even before usage
    "bg-primary",
    "text-primary-foreground",
    "glass",
    "glass-card",
    "brand-gradient",
    "brand-radial",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(161 94% 30%)',
  				foreground: 'hsl(0 0% 100%)'
  			},
  			border: 'hsl(var(--border, 0 0% 18%))',
  			input: 'hsl(var(--input, 0 0% 18%))',
  			ring: 'hsl(var(--ring, 161 94% 30%))',
  			background: 'hsl(var(--background, 0 0% 100%))',
  			foreground: 'hsl(var(--foreground, 222.2 84% 4.9%))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted, 210 40% 96.1%))',
  				foreground: 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card, 0 0% 100%))',
  				foreground: 'hsl(var(--card-foreground, 222.2 84% 4.9%))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover, 0 0% 100%))',
  				foreground: 'hsl(var(--popover-foreground, 222.2 84% 4.9%))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary, 210 40% 96.1%))',
  				foreground: 'hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive, 0 72% 51%))',
  				foreground: 'hsl(var(--destructive-foreground, 0 0% 98%))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius, 0.75rem)',
  			md: 'calc(var(--radius, 0.75rem) - 2px)',
  			sm: 'calc(var(--radius, 0.75rem) - 4px)'
  		},
  		boxShadow: {
  			glass: '0 1px 0 0 rgba(255,255,255,.08) inset, 0 1px 12px rgba(0,0,0,.20)'
  		},
  		backgroundImage: {
  			'brand-gradient': 'linear-gradient(135deg, hsl(161 94% 35%) 0%, hsl(200 90% 45%) 45%, hsl(260 85% 55%) 100%)',
  			'brand-radial': 'radial-gradient(1200px 600px at 80% -10%, rgba(16,185,129,.25), transparent), radial-gradient(900px 400px at -10% 120%, rgba(59,130,246,.22), transparent)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },

  plugins: [
    animate,
  ],
};
export default config;