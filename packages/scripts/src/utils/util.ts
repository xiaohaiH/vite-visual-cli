import { inspect } from 'node:util';
import { camel } from 'radash';
import { SPACE_PLACEHOLDER } from '../config';

/** 对给定的目录路径进行排序 */
export function sortDir(pathArr: string[]) {
    // 保证 .vue 排在最后一位
    // 为后续二次排序时 .vue 在 config.tsx 前做准备
    const r = pathArr.sort((a, b) => a.slice(-4) === '.vue' ? 1 : (a.length - b.length));
    /* eslint-disable no-labels */
    outerFor: for (let index = 0; index < r.length; index++) {
        let j = -1;
        insetFor: for (let idx = 0; idx < index; idx++) {
            // // .vue 排在第一位时, 导致长路径在前
            // // 短路径在后, 所以位置需要替换
            // if (r[idx].includes(r[index])) {
            //     const [a] = r.splice(idx, 1);
            //     r.splice(index, 1, a);
            //     continue outerFor;
            // }
            if (r[index].includes(r[idx])) {
                j = idx;
            }
        }
        // 需要对整个路径检索后完成后再做处理
        // 防止存在爷孙路径(e.g 孙路径插到父路径前了)
        if (j !== -1) {
            const [d] = r.splice(index, 1);
            r.splice(j + 1, 0, d);
        }
    }
    /* eslint-enable no-labels */
    return r;
}

/** 首字母大写 */
export function upperFirst(val: string) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

/** 将字符串中对正则产出影响的部分添加反斜杠 */
export function str2RegStr(str: string) {
    return str.replace(/([*/.])/g, '\\$1');
}

/** 将字符串转为大驼峰 */
export function str2hump(str: string) {
    return upperFirst(camel(str));
}

/**
 * 广度递归, 执行回调并返回新数组
 * @param {Array} data 数据源
 * @param {Function} callback 执行的回调
 * @param {string} [childrenKey] 子级键, 默认 children
 */
export function recursionMap<T extends Record<string, any>, V extends Record<string, any>, K extends keyof T = 'children'>(
    data: T[],
    callback: (v: T, idx: number, p: T[]) => V,
    childrenKey: K = 'children' as K,
) {
    return data.map((v, idx) => {
        const r = callback(v, idx, data) as AddChildrenKey<V, K>;
        if (v[childrenKey] && v[childrenKey].length) {
            // @ts-expect-error 忽视返回值增加的属性报错
            r[childrenKey] = recursionMap(v[childrenKey], callback, childrenKey);
        }
        return r;
    });
}

/** 增加可选的子级 */
type AddChildrenKey<T extends Record<string, any>, K extends string | number | symbol> = {
    [P in keyof T]: T[P];
} & { [P in K]?: AddChildrenKey<T, K>[] };

/**
 * 广度递归, 并执行回调
 * @param {Array} data 数据源
 * @param {Function} callback 执行的回调
 * @param {string} [childrenKey] 子级键, 默认 children
 */
export function recursion<T extends Record<string, any>, K extends keyof T>(
    data: T[],
    callback: (v: T, idx: number, p: T[]) => void,
    childrenKey: K = 'children' as any,
) {
    const queue: { node: T; idx: number; parent: T[] }[] = data.map((v, idx) => ({ node: v, idx, parent: data }));
    while (queue.length) {
        const { node, idx, parent } = queue.shift()!;
        callback(node, idx, parent);
        if (node[childrenKey] && node[childrenKey].length) queue.push(...node[childrenKey].map((node: any, idx: any) => ({ node, idx, parent: node[childrenKey] })));
    }
}

/**
 * 将对象转为字符串
 * @param {object} obj 待转换的对象
 * @param {number} level 距离左侧的距离(增加缩进), 默认为 0(即靠近最左侧)
 */
export function obj2Str(obj: Record<string, any>, level?: number) {
    let r = inspect(obj, { depth: null }).replace(/ {2}/g, SPACE_PLACEHOLDER);
    if (level) {
        r = r.split('\n').join(`\n${SPACE_PLACEHOLDER.repeat(level)}`);
    }
    return r;
}

/** 生成权限按钮变量名称 - 作为变量使用 */
export function generateExportAuthKey(value: string, isTab?: boolean) {
    return `${isTab ? 'TAB_AUTH_KEY' : 'AUTH_KEY'}_${value.toUpperCase()}`;
}

const authPrefixReg = /'((?:TAB_AUTH_KEY|AUTH_KEY).+)'/g;
/** 将权限按钮变量从字符串转为变量(体现在文件中) */
export function contentStr2Variable(str: string) {
    return str.replace(authPrefixReg, '$1');
}
