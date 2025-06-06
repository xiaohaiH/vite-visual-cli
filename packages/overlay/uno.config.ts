import { accessSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { WebFontsProviders } from '@unocss/preset-web-fonts';
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';
import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, transformerAttributifyJsx, transformerDirectives, transformerVariantGroup } from 'unocss';
// import type { Theme } from 'unocss/preset-uno';
// import presetTheme from 'unocss-preset-theme';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

/** 将项目中的 svg-icon 全量加载 */
const icons: string[] = [];
[
    readdirSyncH(resolve(__dirname, './src/assets/icons/color')),
    readdirSyncH(resolve(__dirname, './src/assets/icons/pure')),
].forEach((o, i) => o.forEach((o, j) => {
    icons.push(`i-${i ? 'pure' : 'color'}:${o.slice(0, -4)}`);
    // 为 icon.vue 示例做的反转图标
    j || icons.push(`i-${i ? 'pure' : 'color'}:${o.slice(0, -4)}?${i ? 'bg' : 'mask'}`);
}));

const remRE = /(-?[.\d]+)rem/g;

/** 定义 unocss 配置 */
export default defineConfig({
    theme: {
        colors: {
            primary: 'var(--el-color-primary)',
            info: 'var(--el-color-info)',
            success: 'var(--el-color-success)',
            warning: 'var(--el-color-warning)',
            danger: 'var(--el-color-danger)',
            textPrimary: 'var(--el-text-color-primary)',
            textRegular: 'var(--el-text-color-regular)',
            menuBg: '#00b37a',
            pageColor: 'var(--el-bg-color)',
            pageOverlayColor: '#f2f5fa',
        },
    },
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
            prefix: 'i-',
            unit: 'em',
            collections: {
                pure: (() => {
                    const svgReg = /^<svg /;
                    const fillNoneReg = /fill="none"/g;
                    return FileSystemIconLoader(
                        './src/assets/icons/pure',
                        (svg) => svg.replace(svgReg, '<svg fill="currentColor" ').replace(fillNoneReg, ''),
                    );
                })(),
                color: (() => {
                    const currentColorReg = /currentColor/g;
                    return FileSystemIconLoader(
                        './src/assets/icons/color',
                        (svg) => svg.replace(currentColorReg, ''),
                    );
                })(),
            },
            // extraProperties: {
            //     display: 'inline-flex',
            // },
        }),
    ],
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
        // transformerAttributifyJsx(),
    ],
    rules: [
    ],
    shortcuts: [
        {
            'ellipsis': 'overflow-hidden ws-nowrap text-ellipsis',
            'center': 'flex items-center justify-center',
            'base-border-color': 'b-#333',
            'base-border-top': 'b-t-1 b-solid base-border-color',
            'base-border-bottom': 'b-b-1 b-solid base-border-color',
            'base-border-left': 'b-l-1 b-solid base-border-color',
            'base-border-right': 'b-r-1 b-solid base-border-color',
            'base-border': 'b-1 b-solid base-border-color',
            'widget-border': 'base-border',
            'no-data': 'c-black c-op-50',
        },
    ],
    safelist: icons,
    postprocess: [
        (util) => {
            util.entries.forEach((i) => {
                const value = i[1];
                // 将未带单位的值 1:1 转换成 rem
                if (value && typeof value === 'string' && !remRE.test(util.selector) && remRE.test(value)) {
                    // 还原 line-height 真实值
                    i[1] = i[0] === 'line-height' ? Number(value.slice(0, -3)) * 4 : value.replace(remRE, (_, p1) => `${p1 * 4}rem`);
                }
                // // 将未带单位的值根据设计图的百分之一进行转换(可设置 html font-size: 100vw*1/设计图大小 进行动态适应)
                // if (value && typeof value === 'string' && !remRE.test(util.selector) && remRE.test(value)) {
                //     i[1] = value.replace(remRE, (_, p1) => `${p1 * 4 / 1920 / 100}rem`);
                // }
            });
        },
    ],
});

/** 读取文件夹, 不存在时返回空数组 */
function readdirSyncH(path: string) {
    try {
        accessSync(path);
        return readdirSync(path);
    }
    catch (error) {
        return [];
    }
}
