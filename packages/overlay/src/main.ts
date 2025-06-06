import { createApp } from 'vue';
import App from './App.vue';
// import '@unocss/reset/tailwind-compat.css';
import 'element-plus/theme-chalk/base.css';
import 'uno.css';
import './style.scss';

const CONTAINER_ID = '__visual-client-container__';
const el = document.createElement('div');
el.setAttribute('id', CONTAINER_ID);
el.setAttribute('data-v-inspector-ignore', 'true');
document.getElementsByTagName('body')[0].appendChild(el);

const app = createApp(App);
app.mount(el);

/** 支持 tabindex 元素空格触发点击事件 */
document.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (!ev.target) return;
    if ((ev.keyCode === 32 || ev.code?.toLowerCase() === 'space') && (ev.target as HTMLElement).tabIndex > -1 && (ev.target as HTMLElement).tagName.toLocaleUpperCase() !== 'INPUT') {
        if (!isVisualElement(ev.target as HTMLElement)) return;
        ev.stopImmediatePropagation();
        (ev.target as HTMLElement).click();
    }
}, { capture: true });

function isVisualElement(element: HTMLElement | null): boolean {
    if (!element) return false;
    const flag = element.classList.contains('visual-client');
    return flag || isVisualElement(element.parentElement);
}
