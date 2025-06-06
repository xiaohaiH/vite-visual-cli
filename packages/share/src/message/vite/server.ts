import SuperJSON from 'superjson';
import { getViteServerContext, VITE_MESSAGING_EVENT_KEY } from './context';

export function createViteServerChannel() {
    const viteServer = getViteServerContext();
    // `server.hot` (Vite 5.1+) > `server.ws`
    const ws = viteServer.hot ?? viteServer.ws;

    return {
        post: (data: any) => ws?.send(VITE_MESSAGING_EVENT_KEY, SuperJSON.stringify(data)),
        on: (handler: (arg: Record<string, any>) => void) => ws?.on(VITE_MESSAGING_EVENT_KEY, (event) => {
            handler(SuperJSON.parse(event));
        }),
    };
}
