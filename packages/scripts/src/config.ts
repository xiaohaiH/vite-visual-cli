import type { BaseOption } from './types';

/** 新增的文件路径 */
export const ADDED_FIELDS: string[] = [];
/** 删除的文件路径 */
export const REMOVED_FIELDS: string[] = [];
/** 修改的文件路径 */
export const EDIT_FIELDS: string[] = [];
/** 换行符 - 正则字符串 */
export const LINE_BREAK_REG_STR = '\n|\r\n|\r';
/** 换行符 - 正则 */
export const LINE_BREAK_REG = /\n|\r\n|\r/;
/** 根路径 */
const basePath = './src';
/** 声明文件的路径 */
export const INTERFACE_PATH = `${basePath}/interface/index.ts`;
/** layout 路由组件路径 */
export const LAYOUT_ROUTE_PATH = '@/views/layout/index.vue';
/** 多级路由时 layout 路由组件路径 */
export const MULTIPLE_LAYOUT_ROUTE_PATH = '@/views/layout-empty/index.vue';
/** 单个空格 */
export const SPACE_BASE = ' ';
/** 项目所用空格数量 */
export const SPACE_PLACEHOLDER = SPACE_BASE.repeat(4);
/** 权限名称 */
export const AUTH_NAME = 'menuName';
/** 权限值 */
export const AUTH_VALUE = 'path';
/** 权限子级 */
export const AUTH_CHILDREN = 'children';
/** 常用按钮名称转义 */
export const BTN_TEXT_MAP = {
    add: '新增',
    edit: '编辑',
    detail: '详情',
    enable: '启用',
    disabled: '禁用',
    locked: '锁定',
    unlock: '不锁定',
    del: '删除',
    delete: '删除',
    export: '导出',
    import: '导入',
};

/** 定义文件的相对路径(基于 src 目录下) */
export const fileInfoMap = {
    route: [`${basePath}/router/routes/`, '.ts'] as const,
    dts: [`${basePath}/interface/`, '.ts'] as const,
    api: [`${basePath}/api/`, '.ts'] as const,
    list: [`${basePath}/views/`, '/index.vue'] as const,
    listConfig: [`${basePath}/views/`, '/config.tsx'] as const,
    get tabList() { return fileInfoMap.list; },
    get tabListConfig() { return fileInfoMap.listConfig; },
    get treeList() { return fileInfoMap.list; },
    get treeListConfig() { return fileInfoMap.listConfig; },
    get dynamicRouteList() { return fileInfoMap.list; },
    get dynamicRouteConfig() { return fileInfoMap.listConfig; },
};

let baseOption: BaseOption;
/** 设置基础配置项 */
export function setBaseOption(option: BaseOption) {
    baseOption = option;
}
/** 获取基础配置项 */
export function getBaseOption() {
    return baseOption;
}
