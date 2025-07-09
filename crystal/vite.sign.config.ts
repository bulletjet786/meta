import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                sign: resolve(__dirname, 'pages/user/auth/sign.html'),
                callback: resolve(__dirname, 'pages/user/auth/callback.html'),
            },
        },
    },
})
