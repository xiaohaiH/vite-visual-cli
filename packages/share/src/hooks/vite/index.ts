import type { BirpcGroup, BirpcReturn } from 'birpc';
import { createBirpc, createBirpcGroup } from 'birpc';
import { createViteClientChannel, createViteServerChannel } from '../../message/vite/index';

let client: BirpcReturn<any, any>;
/** 获取客户端调用 */
export function getViteRpcClient<R extends object = Record<string, never>, L extends object = Record<string, never>>(): BirpcReturn<R, L> {
    return client as BirpcReturn<R, L>;
}
/** 设置客户端调用 */
export function setViteRpcClient<R extends object = Record<string, never>, L extends object = Record<string, never>>(rpc: BirpcReturn<R, L>) {
    client = rpc as BirpcReturn<any, any>;
}
/** 创建客户端调用 */
export function createViteRpcClient<R extends object = Record<string, never>, L extends object = Record<string, never>>(functions: L) {
    const rpcClient = createBirpc<R, typeof functions>(functions, createViteClientChannel());
    setViteRpcClient(rpcClient);
}

let server: BirpcGroup<any, any>;
/** 获取服务端调用 */
export function getViteRpcServer<R extends object = Record<string, never>, L extends object = Record<string, never>>(): BirpcGroup<R, L> {
    return server;
}
/** 设置服务端调用 */
export function setViteRpcServer<R extends object = Record<string, never>, L extends object = Record<string, never>>(rpc: BirpcGroup<R, L>) {
    server = rpc;
}
/** 创建服务端调用 */
export function createViteRpcServer<R extends object = Record<string, never>, L extends object = Record<string, never>>(functions: L) {
    const channel = createViteServerChannel();
    const rpcServer = getViteRpcServer();
    if (!rpcServer) {
        const group = createBirpcGroup<R, L>(functions, [channel], { timeout: -1 });
        setViteRpcServer(group);
    }
    else {
        rpcServer.updateChannels((channels) => {
            channels.push(channel);
        });
    }
}
