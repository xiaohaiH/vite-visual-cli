// import { viteRpcFunctions as serRpcFunction } from '@xiaohaih/vite-visual-cli';
import { getViteRpcClient as rcpClient } from 'workspace-share';

/** 客户端声明 */
export const viteRpcFunctions = {
    generate(json: string) {
    },
};

/** 获取客户端实例 */
export function getViteRpcClient() {
    return rcpClient<{
        /** 创建模块 */
        generate: (option: {
            pageType?: string;
            title: string;
            path: string;
            removable?: boolean;
            layout?: boolean;
            popupType: string;
            PopupType: string;
            authPrefix: string;
            forceWriteDts?: boolean;
            auth: Record<'title' | 'value', string>[];
            authApplyRoute?: boolean;
        }) => string;
    }, typeof viteRpcFunctions>();
}
