/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#08090a",
                foreground: "#ffffff",
                primary: {
                    DEFAULT: "#f59e0b",
                    hover: "#d97706",
                    glow: "rgba(245, 158, 11, 0.5)"
                },
                secondary: "#121417",
                accent: "#f43f5e",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'fire-gradient': 'linear-gradient(to right, #f59e0b, #f43f5e)',
            },
            dropShadow: {
                'fire': '0 0 20px rgba(245, 158, 11, 0.3)',
            }
        },
    },
    plugins: [],
}
