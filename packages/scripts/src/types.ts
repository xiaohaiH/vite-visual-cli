import type { AUTH_CHILDREN } from './config';


/** 模块生成所需的参数 */
export interface BaseOption {
    /**
     * 页面类型
     * @default list
     */
    pageType: 'list' | 'tabList' | 'treeList' | 'dynamicList';
    /**
     * 自身模块标题(去除父级模块标题)
     * @example 菜单管理
     */
    title: string;
    /**
     * 模块标题(以` - `分隔, 包含父级名称, 如果存在的话)
     * @example 系统管理 - 菜单管理
     */
    fullTitle: string;
    /**
     * 模块标题(简短) - 去除了特定文字, 比如管理等
     * @example 菜单管理 - 菜单
     */
    shortTitle: string;
    /**
     * 模块名称(名称会转为大驼峰命名)
     * @example system-manage/menus -> SystemManageMenus
     */
    name: string;
    /**
     * 模块名称(简短) - 去除了特定字母, 比如(Manage, List)结尾
     * @example system-manage/menus -> SystemMenus
     */
    shortName: string;
    /**
     * 模块路径(驼峰命名会转为短横线命名)
     * @example systemMenus -> system/menus
     */
    address: string;
    /** 是否移除模块 */
    removable?: boolean;
    /** 根路由是否设置 component(需要布局文件) */
    layout?: boolean;
    /**
     * 弹窗类型(小写串烧)
     * @example dialog-form
     */
    popupType: string;
    /**
     * 弹窗类型(大驼峰)
     * @example DialogForm
     */
    PopupType: string;
    /**
     * 按钮权限的前缀
     * @default 根据路径进行转换 system/menus -> :system:menus:
     */
    authPrefix: string;
    /**
     * 是否强制写入声明
     */
    forceWriteDts?: boolean;
    /** 所拥有的权限 */
    auth: AuthOption[];
    /**
     * 是否将权限应用到路由上
     * @default true
     */
    authApplyRoute: boolean;
}

export interface AuthOption {
    /** 按钮名称 */
    title: string;
    /** 按钮权限 */
    value: string;
    /** 按钮权限前缀 */
    prefix: string;
    /** 子级 */
    [AUTH_CHILDREN]?: AuthOption[];
}
