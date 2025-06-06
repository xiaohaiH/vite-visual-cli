import * as fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { bold, cyan, dim, green, yellow } from 'kolorist';
import sirv from 'sirv';
import type { Plugin, ResolvedConfig, WebSocket } from 'vite';
import { normalizePath } from 'vite';
import { setRootPath } from 'workspace-scripts';
import { createViteRpcServer, setViteServerContext } from 'workspace-share';
import { DIR_CLIENT, DIR_OVERLAY } from './dir';
import { getViteRpcFunctions } from './ws';

interface PluginOption {
    /** 项目根目录 */
    root?: string;
    appendTo?: string | RegExp;
    componentInspector?: boolean;
}
const devtoolsNextResourceSymbol = '?__vue-visual-client__';
const toggleComboKeysMap = {
    option: process.platform === 'darwin' ? 'Option(⌥)' : 'Alt(⌥)',
    meta: 'Command(⌘)',
    shift: 'Shift(⇧)',
};
function getVueDevtoolsPath() {
    return dirname(fileURLToPath(import.meta.url));
    // const pluginPath = normalizePath(dirname(fileURLToPath(import.meta.url)));
    // return pluginPath.replace(/\/dist$/, '/\/src');
}
function removeUrlQuery(url: string): string {
    return url.replace(/\?.*$/, '');
}
function normalizeComboKeyPrint(toggleComboKey: string) {
    return toggleComboKey.split('-').map((key) => toggleComboKeysMap[key as keyof typeof toggleComboKeysMap] || key[0].toUpperCase() + key.slice(1)).join(dim('+'));
}
const PAGE_PREFIX = '__visual-page__';

export function visualPage(pluginOptions: PluginOption = {}): Plugin {
    const vueDevtoolsPath = getVueDevtoolsPath();
    const devtoolsOptionsImportee = 'virtual:overlay';
    const resolvedDevtoolsOptions = `\0${devtoolsOptionsImportee}`;
    let config: ResolvedConfig;
    pluginOptions.root && setRootPath(pluginOptions.root);
    // let disableHotUpdate = false;

    return {
        name: 'vite-plugin-visual-cli',
        // transform(code, id) {
        //     console.log(code, id);
        // },
        enforce: 'pre',
        apply: 'serve',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        configureServer(server) {
            const base = (server.config.base) || '/';
            server.middlewares.use(`${base}${PAGE_PREFIX}`, sirv(DIR_CLIENT, {
                single: true,
                dev: true,
                setHeaders(response) {
                    if (config.server.headers == null) return;
                    Object.entries(config.server.headers).forEach(([key, value]) => {
                        if (value == null) return;
                        response.setHeader(key, value);
                    });
                },
            }));

            setViteServerContext(server);
            createViteRpcServer(getViteRpcFunctions({
                // generateBefore() {
                //     disableHotUpdate = true;
                // },
                // generateAfter() {
                //     disableHotUpdate = false;
                // },
            }));

            // // eslint-disable-next-line ts/unbound-method
            // const _printUrls = server.printUrls;
            // const colorUrl = (url: string) =>
            //     cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`));
            // server.printUrls = () => {
            //     const urls = server.resolvedUrls!;
            //     const keys = normalizeComboKeyPrint('option-shift-d');
            //     _printUrls();
            //     for (const url of urls.local) {
            //         const devtoolsUrl = `${url}${url.endsWith('/') ? '' : '/'}${PAGE_PREFIX}/`;
            //         console.log(`  ${green('➜')}  ${bold('Vue DevTools')}: ${green(`Open ${colorUrl(`${devtoolsUrl}`)} as a separate window`)}`);
            //     }
            // };
        },
        // handleHotUpdate(ctx) {
        //     const invalidatedModules = new Set<typeof ctx.modules[number]>();
        //     for (const mod of ctx.modules) {
        //         ctx.server.moduleGraph.invalidateModule(
        //             mod,
        //             invalidatedModules,
        //             ctx.timestamp,
        //             true,
        //         );
        //     }
        //     return [];
        // },
        async resolveId(importee: string) {
            if (importee === devtoolsOptionsImportee) {
                return resolvedDevtoolsOptions;
            }
            // Why use query instead of vite virtual module on devtools resource?
            // Devtools resource will import `@vue/devtools-core` and other packages, which vite cannot analysis correctly on virtual module.
            // So we should use absolute path + `query` to mark the resource as devtools resource.
            else if (importee.startsWith(`${devtoolsOptionsImportee}:`)) {
                const resolved = importee.replace(`${devtoolsOptionsImportee}:`, `${resolve(`${vueDevtoolsPath}`, '../')}/`);
                return `${resolved}${devtoolsNextResourceSymbol}`;
            }
        },
        async load(id) {
            if (id === resolvedDevtoolsOptions) {
                return `export default ${JSON.stringify({ base: config.base, componentInspector: pluginOptions.componentInspector })}`;
            }
            else if (id.endsWith(devtoolsNextResourceSymbol)) {
                const filename = removeUrlQuery(id);
                // read file ourselves to avoid getting shut out by vite's fs.allow check
                return fs.promises.readFile(filename, 'utf-8');
            }
        },
        // transform(code, id, options) {
        //     if (options?.ssr) return;

        //     const { appendTo } = pluginOptions;
        //     const [filename] = id.split('?', 2);

        //     if (appendTo
        //         && (
        //             (typeof appendTo === 'string' && filename.endsWith(appendTo))
        //             || (appendTo instanceof RegExp && appendTo.test(filename)))) {
        //         code = `import 'virtual:overlay:index.js';\n${code}`;
        //     }

        //     return code;
        // },
        transformIndexHtml(html) {
            if (pluginOptions.appendTo) return;

            return {
                html,
                tags: [
                    {
                        tag: 'link',
                        injectTo: 'head-prepend',
                        attrs: { rel: 'stylesheet', crossorigin: 'crossorigin', href: `${config.base || '/'}@id/virtual:overlay:overlay/index.css?${Date.now()}` },
                    },
                    {
                        tag: 'script',
                        injectTo: 'head-prepend',
                        attrs: { type: 'text/javascript' },
                        children: `window.iframeUrl = '${PAGE_PREFIX}/'`,
                    },
                    {
                        tag: 'script',
                        injectTo: 'head-prepend',
                        attrs: { type: 'module', src: `${config.base || '/'}@id/virtual:overlay:overlay/index.js?${Date.now()}` },
                    },
                ],
            };
        },
    };
}
