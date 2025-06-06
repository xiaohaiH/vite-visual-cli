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
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { visualPage } from '../vite/src/index';

// @ts-expect-error 声明有问题
const fse = _fse.default as typeof _fse;

/**
 * @file vue3 环境配置
 */
// https://vitejs.dev/config/
export default defineConfig(async () => {
    const _visualPage = process.env.NODE_ENV === 'development' ? (await import('../vite/dist/index.mjs' as '')).visualPage as typeof visualPage : null;

    return {
        base: './',
        plugins: [
            vue(),
            vueDevTools({}),
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
                name: 'vite-plugin-copy-client-bundle',
                apply: 'build',
                enforce: 'post',
                closeBundle() {
                    // copy
                    const clientFile = resolve(__dirname, './dist');

                    ['../vite/client'].forEach((dir) => {
                        fse.copySync(clientFile, resolve(__dirname, dir));
                    });
                },
            },
            // _visualPage && _visualPage({ }),
            _visualPage && _visualPage({ root: resolve(dirname(fileURLToPath(import.meta.url)), './generate-test') }),
            // _visualPage && _visualPage({ root: resolve(dirname(fileURLToPath(import.meta.url)), './generate-test/node_modules/@xiaohaih/vite-visual-cli/dist') }),

        ],
        resolve: {
        },
        esbuild: {
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
            jsxInject: `import { h } from 'vue';`,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
        },
        // build: { watch: {} },
        preview: {
            open: true,
            port: 2020,
        },
        server: {
            port: 2000,
        },
    } as UserConfig;
});
