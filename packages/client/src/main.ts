import { getViteClient } from 'vite-hot-client';
import { createApp } from 'vue';
import { createViteRpcClient, setViteClientContext } from 'workspace-share';
import App from './App.vue';
import { viteRpcFunctions } from './ws';
import 'element-plus/dist/index.css';
import '@unocss/reset/tailwind-compat.css';
import 'uno.css';
import './style.scss';

const app = createApp(App);
app.mount('#app');

async function getViteHotContext() {
    const viteClient = await getViteClient(`${location.pathname.split('/__visual-page__')[0] || ''}/`.replace(/\/\//g, '/'), false);
    return viteClient?.createHotContext('/ssss');
}
async function initViteClientHotContext() {
    const context = await getViteHotContext();
    context && setViteClientContext(context);
    return context;
}
initViteClientHotContext().then((ctx) => {
    if (ctx) {
        ctx.send('vite-visual-cli:test');
        createViteRpcClient(viteRpcFunctions);
    }
});

/** 支持 tabindex 元素空格触发点击事件 */
document.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (!ev.target) return;
    if ((ev.keyCode === 32 || ev.code?.toLowerCase() === 'space') && (ev.target as HTMLElement).tabIndex > -1 && (ev.target as HTMLElement).tagName.toLocaleUpperCase() !== 'INPUT') {
        (ev.target as HTMLElement).click();
    }
});
