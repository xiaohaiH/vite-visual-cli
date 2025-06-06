import SuperJSON from 'superjson';
import { getViteClientContext, VITE_MESSAGING_EVENT_KEY } from './context';

export function createViteClientChannel() {
    const client = getViteClientContext();
    return {
        post: (data: any) => {
            client?.send(VITE_MESSAGING_EVENT_KEY, SuperJSON.stringify(data));
        },
        on: (handler: (arg: Record<string, any>) => void) => {
            client?.on(VITE_MESSAGING_EVENT_KEY, (event) => {
                handler(SuperJSON.parse(event));
            });
        },
    };
}
