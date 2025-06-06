import { clone } from 'radash';
import { AUTH_CHILDREN, AUTH_NAME, AUTH_VALUE, SPACE_PLACEHOLDER } from './config';
import type { BaseOption } from './types';
import { contentStr2Variable, generateExportAuthKey, obj2Str, recursion, recursionMap } from './utils/index';

const regToParamKey = {
    moduleName: 'name',
    apiAddress: 'address',
    moduleTitle: 'title',
    moduleFullTitle: 'fullTitle',
} as const;
const constantRegKey = Object.keys(regToParamKey);

/**
 * 生成模板
 * @param {object} option 传递的参数
 * @param {string} template 模板
 */
export function generate(option: BaseOption, template: string) {
    const _option = { ...clone(option), authConstantArr: '', authConstant: '' };
    _option.authConstantArr = contentStr2Variable(obj2Str(recursionMap(_option.auth, (v) => ({ [AUTH_NAME]: v.title, [AUTH_VALUE]: generateExportAuthKey(v.value, !!v.children?.length) }), AUTH_CHILDREN), 1)) || '[]';
    let authStrArr = ['', ''];
    const existedAuthKeys: string[] = [];
    recursion(_option.auth, (v) => {
        const variableKey = generateExportAuthKey(v.value, !!v.children?.length);
        if (existedAuthKeys.includes(variableKey)) return;
        existedAuthKeys.push(variableKey);
        const idx = v.children?.length ? 0 : 1;
        authStrArr[idx] && (authStrArr[idx] += '\n');
        authStrArr[idx] += `/** ${v.children?.length ? 'tab' : '按钮'}权限 - ${v.title} */\nexport const ${variableKey} = '${v.prefix}${v.value}';`;
    });
    _option.authConstant = authStrArr.filter(Boolean).join('\n');

    let r = template;
    constantRegKey.concat(Object.keys(_option)).forEach((reg) => {
        r = r.replaceAll(`<%= ${reg} %>`, (_option[regToParamKey[reg as keyof typeof regToParamKey]] || _option[reg as keyof typeof _option]) as string);
    });
    return r;
}

/**
 * 获取需在声明文件中导出的内容
 * @param {object} option 传递的参数
 */
export function getExportDts(option: BaseOption) {
    return [
        `/** ${option.fullTitle}相关接口声明 */`,
        `export * as Response${option.name} from './${option.address}';`,
        '',
    ].join('\n');
}
