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
                    900: '#0085c9',
                    700: '#0077b6',
                    500: '#4bb3e3',
                },
                gold: '#d7b46d',
                cream: '#ffffff',
                muted: '#5d6065',
            },
        },
    },
    plugins: [],
}
