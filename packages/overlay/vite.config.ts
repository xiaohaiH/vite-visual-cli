import { dirname, relative, resolve } from 'node:path';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import * as _fse from 'fs-extra';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// @ts-expect-error 声明有问题
const fse = _fse.default as typeof _fse;

/**
 * @file vue3 环境配置
 */
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        vueJsx(),
        UnoCSS({ hmrTopLevelAwait: false }),
        tsconfigPaths({ configNames: ['tsconfig.app.json'] }),
        AutoImport({
            resolvers: [
                ElementPlusResolver({ exclude: /^(ElMessage|ElMessageBox|ElNotification|ElLoading)$/i }),
            ],
            imports: ['vue', 'vue-router'],
            eslintrc: { enabled: true },
        }),
        Components({
            dirs: [],
            resolvers: [
                ElementPlusResolver(),
            ],
        }),
        {
            name: 'vite-plugin-copy-overlay-bundle',
            apply: 'build',
            enforce: 'post',
            closeBundle() {
                // copy
                const files = resolve(__dirname, './dist');

                ['../vite/overlay'].forEach((dir) => {
                    fse.copySync(files, resolve(__dirname, dir));
                });
            },
        },
    ],
    resolve: {
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'visualClientOverlay',
            fileName: () => 'index.js',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                assetFileNames: 'index.[ext]',
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});
