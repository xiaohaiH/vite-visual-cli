interface EventEmitter {
    on: (name: string, handler: (data: any) => void) => void;
    send: (name: string, ...args: any[]) => void;
}

interface ViteClientContext extends EventEmitter {
}

interface ViteDevServer {
    hot?: EventEmitter;
    ws?: EventEmitter;
}

export const VITE_MESSAGING_EVENT_KEY = 'visual-vite-messaging-event-key';
let _server: ViteDevServer;
/** 设置 vite 服务器上下文 */
export function setViteServerContext(server: ViteDevServer) {
    _server = server;
}
/** 获取 vite 服务器上下文 */
export function getViteServerContext() {
    return _server;
}

let _client: ViteClientContext;
/** 设置 vite 客户端上下文 */
export function setViteClientContext(client: ViteClientContext) {
    _client = client;
}
/** 获取 vite 客户端上下文 */
export function getViteClientContext() {
    return _client;
}
