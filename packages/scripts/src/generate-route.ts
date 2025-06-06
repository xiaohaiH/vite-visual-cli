import { exec, spawn } from 'node:child_process';
import { join as pathJoin } from 'node:path';
import fse from 'fs-extra';
import { addRouteContent, addRouteContent2, removeRouteContent2 } from './ast';
import { ADDED_FIELDS, AUTH_CHILDREN, AUTH_NAME, AUTH_VALUE, EDIT_FIELDS, fileInfoMap, getBaseOption, LAYOUT_ROUTE_PATH, LINE_BREAK_REG, MULTIPLE_LAYOUT_ROUTE_PATH, REMOVED_FIELDS, SPACE_PLACEHOLDER } from './config';
import { atomRoute, routeFile, subRoute } from './templates/index';
import { getPath, obj2Str, recursionMap, removeEmptyDir, removeFile, str2hump, writeFile } from './utils/index';

// const baseOption = {
//     title: '菜单管理',
//     originalTitle: '系统管理/菜单管理',
//     fullTitle: '系统管理 - 菜单管理',
//     shortTitle: '菜单',
//     name: 'MenusManage',
//     shortName: 'Menus',
//     address: 'system/menus',
//     authPrefix: `:system:menus`,
//     removable: true,
// };

/** 根据配置添加或删除路由 */
export async function toggleRouteConfig() {
    const baseOption = getBaseOption();
    // 路由文件创建逻辑
    // 本项目路由文件是扁平化的
    // 只支持 routes 下的子级文件路由
    // 因此这块直接取首路径, 当首路径文件不存在时即创建
    const path = getPath(`${fileInfoMap.route[0]}${baseOption.address.split('/')[0]}.ts`);
    const isExist = await fse.pathExists(path);
    if (isExist) {
        const content = await fse.readFile(path, 'utf-8');
        await (baseOption.removable ? removeRouteConfig(path, content) : addRouteConfig(path, content));
    }
    else {
        baseOption.removable || await createRouteFile(path);
    }
}

/**
 * 添加路由
 * @param {string} path 路由文件路径
 * @param {string} content 路由文件内容
 */
export async function addRouteConfig(path: string, content: string) {
    const baseOption = getBaseOption();
    if (content.includes(`path: '/${baseOption.address}'`)) return console.log('路由已存在, 跳过');

    const paths = baseOption.address.split('/');
    let matchedPath: string;
    try {
        for (let i = paths.length - 1; i >= 0; i--) {
            matchedPath = `path: '/${paths.slice(0, i).join('/')}'`;
            if (content.includes(matchedPath)) {
                const basePath = paths.slice(0, i).join('/');
                const routeInfo = getRouteInfoArr();
                const routeStr = generateRouteContent(routeInfo.slice(i), basePath);
                const r = addRouteContent2({ content, matchPath: matchedPath.slice(7, -1), newRouteStr: routeStr });
                return await writeFile(path, r, (isCreate, path) => (isCreate ? ADDED_FIELDS : EDIT_FIELDS).push(path));
            }
        }
    }
    catch (e) {
        console.error(e, '\n完犊子, 路由生成失败');
    }
}

/**
 * 删除路由
 * @param {string} absolutePath 路由文件路径
 * @param {string} content 路由文件内容
 */
export async function removeRouteConfig(absolutePath: string, content: string) {
    const baseOption = getBaseOption();
    const matchPath = `path: '/${baseOption.address}'`;
    if (!content.includes(matchPath)) return;
    const r = removeRouteContent2({ content, matchPath: matchPath.slice(7, -1) });
    return r ? writeFile(absolutePath, r, (isCreate, path) => (isCreate ? ADDED_FIELDS : EDIT_FIELDS).push(path)) : removeFile(absolutePath, (isRemoved, path) => isRemoved && REMOVED_FIELDS.push(path));
}

/** 创建路由文件并生成相应的路由 */
async function createRouteFile(absolutePath: string) {
    const baseOption = getBaseOption();
    let r = routeFile;
    const routeInfo = getRouteInfoArr();
    const params = {
        title: baseOption.fullTitle.split(' - ')[0],
        routes: generateRouteContent(routeInfo).split(LINE_BREAK_REG).join(`\n${SPACE_PLACEHOLDER}`),
    };
    Object.keys(params).forEach((reg) => {
        r = r.replaceAll(`<%= ${reg} %>`, params[reg as keyof typeof params]);
    });
    return writeFile(absolutePath, r, (isCreate, path) => (isCreate ? ADDED_FIELDS : EDIT_FIELDS).push(path));
}

/**
 * 生成路由
 * @param {[string, string][]} routeInfo 文件路径
 * @param {string} [basePath] 存在基础路径时提供
 */
function generateRouteContent(routeInfo: [path: string, title: string, pseudoAuth?: string][], basePath?: string) {
    let _basePath = (basePath && `${basePath}/`) || '';
    let r = '';
    // const spaceNum = _basePath.split('/').filter(Boolean).length;
    const spaceNum = 0;
    routeInfo.forEach((item, index) => {
        _basePath += index ? `/${item[0]}` : item[0];
        const params = {
            path: _basePath,
            title: item[1],
            pseudoAuth: item[2],
            isSubmenu: index !== routeInfo.length - 1,
            isLayoutRoute: !basePath && index === 0,
        };
        const aa = generateAtomRouteContent(params).split(LINE_BREAK_REG);
        r = r
            ? r.replace(`<%= children %>`, aa.join(`\n${SPACE_PLACEHOLDER.repeat(spaceNum + (index * 2 || 1))}`))
            : aa.join(`\n${SPACE_PLACEHOLDER.repeat(spaceNum + index)}`);
    });
    return r;
}

/**
 * 生成原子路由
 * @param {object} option 配置项
 * @param {string} option.path 路由地址
 * @param {string} option.title 路由标题
 * @param {string} [option.pseudoAuth] 需要伪造的路由权限
 * @param {string} [option.name] 路由名称
 * @param {boolean} [option.isSubmenu] 是否存在子菜单
 * @param {boolean} [option.isLayoutRoute] 存在子菜单时, 本身是否为布局路由
 */
function generateAtomRouteContent(option: {
    path: string;
    title: string;
    pseudoAuth?: string;
    name?: string;
    isSubmenu?: boolean;
    isLayoutRoute?: boolean;
}) {
    const baseOption = getBaseOption();
    // const constantRegKey = Object.keys(regToParamKey);
    const params = {
        path: `/${option.path}`,
        title: option.title,
        name: option.name || option.path.split('/').map(str2hump).join(''),
        pseudoAuth: option.pseudoAuth || '[]',
        // 存在子级菜单
        //      是布局路由应用 LAYOUT_ROUTE_PATH
        //      不是布局路由应用 MULTIPLE_LAYOUT_ROUTE_PATH
        // 不存在子级
        //      使用自身路径
        filepath: option.isSubmenu
            ? option.isLayoutRoute
                ? LAYOUT_ROUTE_PATH
                : MULTIPLE_LAYOUT_ROUTE_PATH
            : `@/views/${option.path}${fileInfoMap.list[1]}`,
    };
    let r = option.isSubmenu ? subRoute : atomRoute;
    Object.keys(params).forEach((reg) => {
        r = r.replaceAll(`<%= ${reg} %>`, params[reg as keyof typeof params]);
    });
    // 删除根路径的 component
    if (params.filepath === LAYOUT_ROUTE_PATH && !baseOption.layout) {
        r = r.replace(`\n    component: async () => import('${params.filepath}'),`, '');
    }
    return r;
}

/** 获取要生成的路由信息 */
function getRouteInfoArr() {
    const baseOption = getBaseOption();
    const routeInfo: [string, string, pseudoAuth?: string][] = [];
    baseOption.address.split('/').forEach((item, index) => {
        routeInfo.push([item, '']);
    });
    baseOption.fullTitle.split(' - ').reverse().forEach((item, index) => {
        routeInfo[routeInfo.length - 1 - index].splice(1, 1, item);
    });

    const authArr = obj2Str(recursionMap(baseOption.auth, (v) => ({ [AUTH_NAME]: v.title, [AUTH_VALUE]: `${v.prefix}${v.value}` }), AUTH_CHILDREN), routeInfo.length);
    baseOption.authApplyRoute && authArr && routeInfo[routeInfo.length - 1].push(authArr);
    return routeInfo;
}

/**
 * 美化代码
 * @param {string} path 文件路径
 */
export function beautifyCode(path: string) {
    const args = ['eslint', 'H:/seven/project-self/vite/vite_templ/src/router/routes/system.ts', '--fix'];

    // exec('pnpm eslint ./src/router/routes/system.ts --fix', {});
    spawn('pnpm', args, { stdio: ['inherit', 'inherit', 'inherit'] });
}
