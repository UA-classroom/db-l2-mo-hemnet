/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                green: {
                    900: '#0f3d3c',
                    700: '#1e605b',
                    500: '#2c8b82',
                },
                gold: '#d7b46d',
                cream: '#f6f5f1',
                muted: '#61726f',
            },
        },
    },
    plugins: [],
}