import mri from 'mri';
import { camel, dash } from 'radash';
import { AUTH_CHILDREN, BTN_TEXT_MAP, setBaseOption } from './config';
import type { AuthOption, BaseOption } from './types';
import { parseAuth } from './utils/assist';
import { str2hump, upperFirst } from './utils/index';
import { createFiles } from './index';

/* eslint-disable node/prefer-global/process */
// @ts-expected-error 未装@types/node
const args = mri<Option>(process.argv.slice(2).filter((o) => o !== '--'), {
    alias: {
        tabList: ['tab', 'tab-list'],
        dynamicList: ['dynamic', 'dynamic-list'],
        treeList: ['tree-list'],
        filepath: ['f', 'path'],
        title: [],
        forceWriteDts: ['force'],
        popupIsDialog: ['dialog'],
        auth: [],
        authauthPrefix: [],
        authApplyRoute: [],
    },
    string: ['authPrefix', 'auth'],
    boolean: ['tabList', 'dynamicList', 'treeList', 'layout', 'popupIsDialog', 'authApplyRoute'],
    default: { layout: true, popupIsDialog: true, auth: ['add', 'edit', 'detail', 'delete'], authApplyRoute: true },
});

// 对路径转为短横线命名以及去除开头的斜杠(如果有)
args.filepath = args.filepath.split('/').filter(Boolean).map(dash).join('/');
const name = str2hump(args.filepath.split('/').join('-'));
if (args.remove && !args.title) args.title = '';
// 去除开头斜杠
args.title = args.title.split('/').filter(Boolean).join('/');
const title = args.title.split('/').slice(-1)[0];
const fullTitle = args.title.split('/').join(' - ');
const authPrefix = args.authPrefix !== undefined ? args.authPrefix : `:${args.filepath.split('/').join(':')}:`;

/** 格式化脚本入参后的配置项 */
const baseOption: BaseOption = {
    pageType: args.tabList ? 'tabList' : args.treeList ? 'treeList' : args.dynamicList ? 'dynamicList' : 'list',
    title,
    fullTitle,
    shortTitle: title.replace(/管理|列表$/, ''),
    name,
    shortName: name.replace(/Manage|List$/, ''),
    address: args.filepath,
    removable: args.remove,
    layout: args.layout,
    popupType: args.popupIsDialog ? 'dialog-form' : 'drawer-form',
    PopupType: args.popupIsDialog ? 'DialogForm' : 'DrawerForm',
    authPrefix,
    auth: parseAuth(parse(args.auth), authPrefix),
    authApplyRoute: args.authApplyRoute,
};

setBaseOption(baseOption);
createFiles({ isCmd: true });

/** 对字符串解析 */
function parse(value: any) {
    try {
        // eslint-disable-next-line no-eval
        return eval(value);
    }
    catch (error) {
        return value;
    }
}

/** 脚本参数 */
interface Option {
    /**
     * 需生成的文件相对路径(主模块+自身模块)
     * @example system/menus
     */
    filepath: string;
    /**
     * 模块名称
     * @example 系统管理/菜单管理
     */
    title: string;
    /** 树形列表 */
    treeList?: boolean;
    /** 标签页列表 */
    tabList?: boolean;
    /** 动态路由列表 */
    dynamicList?: boolean;
    /** 在模块重复后, 选择了覆盖文件后是否继续写入声明 */
    forceWriteDts?: boolean;
    /** 卸载模块 - 仅需传递 filepath */
    remove?: boolean;
    /** 根路由是否设置 component(需要布局文件) @default true */
    layout?: boolean;
    /** 弹窗是否用 dialog(true: dialog, false: drawer) @default true */
    popupIsDialog?: boolean;
    /**
     * 权限前缀(默认根据路径生成)
     */
    authPrefix?: string;
    /**
     * 所拥有的权限按钮
     * @example
     * ```bash
     * # 多个权限
     * --auth="['add', 'edit', { title: '详情', value: 'detail' }]"
     * # 单个权限
     * --auth="add";
     * # 带名称权限
     * --auth="[{ title: '新增', value: 'add' }, { title: '编辑', value: 'edit' }]";
     * # tab 页权限(带子权限)
     * --auth="[{ title: '民警页', value: 'police', children: [{ title: '新增', value: 'add' }] }]";
     * # tab 页权限(带子权限)
     * --auth="[{ title: '民警页', value: 'police', children: ['add', 'edit'] }]";
     * ```
     */
    auth?: string | string[];
    /**
     * 是否将权限应用到路由上
     * @default true
     */
    authApplyRoute: boolean;
}
