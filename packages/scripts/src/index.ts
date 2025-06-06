import * as path from 'node:path';
import inquirer from 'inquirer';
import { ADDED_FIELDS, EDIT_FIELDS, fileInfoMap, getBaseOption, INTERFACE_PATH, LINE_BREAK_REG_STR, REMOVED_FIELDS } from './config';
import { generate, getExportDts } from './generate-page';
import { toggleRouteConfig } from './generate-route';
import { api, dts, dynamicRouteConfig, dynamicRouteList, list, listConfig, tabList, tabListConfig, treeList, treeListConfig } from './templates/index';
import { appendFile, ensureFile, getPath, pathExists, readFile, removeEmptyDir, removeFile, removeFileContent, sortDir, str2RegStr, writeFile } from './utils/index';

export * from './config';
export * from './types';
export * from './utils/index';

/** 创建文件 */
export async function createFiles(option: { isCmd?: boolean } = {}) {
    const baseOption = getBaseOption();
    /** 待创建的文件信息 */
    const filesInfo = [
        ['dts', dts],
        ['api', api],
        ...{
            list: [['list', list], ['listConfig', listConfig]],
            tabList: [['tabList', tabList], ['tabListConfig', tabListConfig]],
            dynamicList: [['dynamicRouteList', dynamicRouteList], ['dynamicRouteConfig', dynamicRouteConfig]],
            treeList: [['treeList', treeList], ['treeListConfig', treeListConfig]],
        }[baseOption.pageType],
    ];

    if (baseOption.removable) {
        removeFiles(filesInfo);
    }
    else {
        const testPath = getPath(`${fileInfoMap.list[0]}${baseOption.address}${fileInfoMap.list[1]}`);
        const existed = await pathExists(testPath);
        if (option.isCmd && existed) {
            const r = await inquirer.prompt<Record<'continue', boolean>>({
                type: 'confirm',
                name: 'continue',
                message: `当前路径(${testPath})已存在文件是否覆盖?`,
                default: false,
            });
            if (!r.continue) return;
        }
        // 声明入口文件中导出添加模块的声明
        const appendDts = async () => ensureFile(getPath(INTERFACE_PATH)).then(async () => appendFile(getPath(INTERFACE_PATH), getExportDts(baseOption), (isEdited, path) => isEdited && EDIT_FIELDS.push(path)));
        await Promise.all([
            ...filesInfo.map(async ([t, fileTemplate]) => writeFile(
                getPath(`${fileInfoMap[t][0]}${baseOption.address}${fileInfoMap[t][1]}`),
                generate(baseOption, fileTemplate),
                (isCreate, path) => (isCreate ? ADDED_FIELDS : EDIT_FIELDS).push(path),
            )),
            existed
                // 文件存在时, 检测是否已经导出相同的声明
                ? readFile(getPath(INTERFACE_PATH), 'utf-8').then(async (content) => {
                        const flag = (content as string).includes(getExportDts(baseOption).split('\n').find((v) => v.includes('export *'))!);
                        return flag || appendDts();
                    })
                : appendDts(),
        ]);
    }
    await toggleRouteConfig();
    const logs: string[] = [];
    baseOption.removable
        ? logs.push(
                '删除文件:',
                sortDir(REMOVED_FIELDS).join('\n'),
            )
        : logs.push(
                '新增文件:',
                sortDir(ADDED_FIELDS).join('\n'),
            );
    logs.push(
        '修改文件: ',
        sortDir(EDIT_FIELDS).join('\n'),
    );

    console.log(logs.join('\n'));
}

/** 删除文件 */
export async function removeFiles(filesInfo: string[][]) {
    const baseOption = getBaseOption();
    let r: Promise<void>[] = [
        removeFileContent(
            // 删除声明集合中的导入内容
            getPath(INTERFACE_PATH),
            new RegExp(`(\\/\\*.*\\*\\/(${LINE_BREAK_REG_STR}))?${str2RegStr(getExportDts(baseOption).split('\n').filter(Boolean).slice(-1)[0])}(${LINE_BREAK_REG_STR})?`),
            (isChanged, path) => isChanged && EDIT_FIELDS.push(path),
        ),
    ];
    const dirs = new Set<string>();
    filesInfo.forEach(([t]) => {
        r.push(removeFile(getPath(`${fileInfoMap[t][0]}${baseOption.address}${fileInfoMap[t][1]}`), (isRemoved, path) => isRemoved && REMOVED_FIELDS.push(path)));
        // 如果为 ts | .tsx 文件, 同时尝试删除 .tsx | .ts 的文件, 防止手动改了后缀
        if (fileInfoMap[t][1].slice(-3) === '.ts') {
            r.push(removeFile(getPath(`${fileInfoMap[t][0]}${baseOption.address}${fileInfoMap[t][1]}x`), (isRemoved, path) => isRemoved && REMOVED_FIELDS.push(path)));
        }
        else if (fileInfoMap[t][1].slice(-4) === '.tsx') {
            r.push(removeFile(getPath(`${fileInfoMap[t][0]}${baseOption.address}${fileInfoMap[t][1].slice(0, -1)}`), (isRemoved, path) => isRemoved && REMOVED_FIELDS.push(path)));
        }

        // 当路径是文件时, 需要找上一级目录
        // 当路径是文件夹时, 则不需要改动
        // 判断依据为后缀以 / 开头, 则是文件夹
        dirs.add(`${fileInfoMap[t][0]}${fileInfoMap[t][1][0] === '/' ? baseOption.address : path.join(baseOption.address, '..')}`);
    });
    await Promise.all(r);
    r = [];
    dirs.forEach((dir) => r.push(removeEmptyDir(getPath(dir), (isRemoved, path) => isRemoved && REMOVED_FIELDS.push(path))));
    await Promise.all(r);
}
