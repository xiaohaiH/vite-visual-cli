import { dash } from 'radash';
import SuperJSON from 'superjson';
import type { BaseOption } from 'workspace-scripts';
import { createFiles, parseAuth, setBaseOption, str2hump } from 'workspace-scripts';
import { getViteRpcServer } from 'workspace-share';

/** 服务器端声明 */
export function getViteRpcFunctions(config?: {
    generateBefore?: () => void;
    generateAfter?: () => void;
}) {
    return {
        /** 创建模块 */
        async generate(_option: Omit<BaseOption, 'fullTitle' | 'shortTitle' | 'name' | 'shortName' | 'address'> & { path: string }) {
            const name = str2hump(_option.path.split('/').join('-'));
            const title = _option.title.split('/').filter(Boolean).join('/');
            const option: BaseOption = {
                ..._option,
                title,
                fullTitle: title.split('/').join(' - '),
                shortTitle: title.replace(/管理|列表$/, ''),
                name,
                shortName: name.replace(/Manage|List$/, ''),
                address: _option.path.split('/').filter(Boolean).map(dash).join('/'),
                auth: parseAuth(_option.auth, _option.authPrefix),
            };
            setBaseOption(option);
            config?.generateBefore?.();
            return createFiles().finally(() => config?.generateAfter?.());
        },
    };
}
