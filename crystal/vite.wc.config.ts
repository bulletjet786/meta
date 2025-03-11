import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"

export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin({
            injectCode: (cssCode: string) => {
                return `window.__crystal_styles = ${cssCode}`;
            },
        })
    ],
    build: {
        lib: {
            entry: 'src/plugin/Crystal.tsx', // 指定入口文件
            name: 'Crystal',
            fileName: (format) => `crystal.${format}.js`, // 输出文件名
            formats: ['es'],
        },
        outDir: "build",
        sourcemap: false,
        minify: false
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
    }
});
