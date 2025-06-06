import * as path from 'node:path';
import fse from 'fs-extra';
import { __dirname } from './dir';

/**
 * 判断路径是否存在
 * @param {string} path 路径
 */
export async function pathExists(path: string) {
    return fse.pathExists(getPath(path));
}

/**
 * 确保文件在指定目录中存在(不存在时创建该文件)
 * @param {string} path 文件路径
 */
export async function ensureFile(path: string) {
    return fse.ensureFile(getPath(path));
}

/** 获取文件内容 */
export async function readFile(path: string, options?: {
    encoding?: BufferEncoding;
    flag?: string | undefined;
} | BufferEncoding) {
    return fse.readFile(path, options);
}

/**
 * 为文件添加内容, 不存在时自动创建
 * @param {string} path 文件路径
 * @param {string} content 文件内容
 * @param {Function} callback 回调函数
 */
export async function writeFile(path: string, content: string, callback: ((isCreate: boolean, path: string) => void) | null) {
    const exist = await fse.pathExists(path);
    if (!exist) await fse.createFile(path);
    await fse.writeFile(path, content);
    callback?.(!exist, path);
}

/**
 * 为已存在文件写入内容
 * @param {string} path 文件路径
 * @param {string} content 文件内容
 * @param {Function} callback 回调函数
 */
export async function appendFile(path: string, content: string, callback: ((isEdited: boolean, path: string) => void) | null) {
    const existed = await fse.pathExists(path);
    existed ? (await fse.appendFile(path, content)) : console.log(`路径不存在, 无法写入 -> ${path}`);
    callback?.(!existed, path);
}

/**
 * 删除已存在文件中的指定内容
 * @param {string} path 文件路径
 * @param {string | RegExp} content 需要删除的内容
 * @param {Function} callback 回调函数
 */
export async function removeFileContent(path: string, content: string | RegExp, callback: ((isChanged: boolean, path: string) => void) | null) {
    const existed = await fse.pathExists(path);
    if (!existed) return callback?.(false, path);
    const text = await fse.readFile(path, 'utf-8');
    const r = text.replace(content, '');
    if (r !== text) {
        await fse.writeFile(path, r);
        callback?.(true, path);
    }
    else { callback?.(false, path); }
}

/**
 * 删除文件
 * @param {string} filepath 文件路径
 * @param {Function} callback 回调函数
 * @param {boolean} [recursion] 文件删除后, 如果是空目录时, 是否递归删除父级目录
 */
export async function removeFile(filepath: string, callback: ((isRemoved: boolean, path: string) => void) | null, recursion?: boolean) {
    const existed = await fse.pathExists(filepath);
    if (!existed) return callback?.(false, filepath);
    await fse.remove(filepath);
    callback?.(true, filepath);
    if (recursion) removeEmptyDir(path.join(filepath, '..'), callback, true);
}

/**
 * 移除空文件夹
 * @param {string} filepath 路径
 * @param {Function} callback 回调函数
 * @param {boolean} [recursion] 文件删除后, 如果是空目录时, 是否递归删除父级目录
 */
export async function removeEmptyDir(filepath: string, callback: ((isRemoved: boolean, path: string) => void) | null, recursion?: boolean) {
    if (!(await fse.pathExists(filepath))) return callback?.(false, filepath);
    const files = await fse.readdir(filepath);
    if (files.length) return;
    await fse.remove(filepath);
    callback?.(true, filepath);
    if (recursion) return removeEmptyDir(path.join(filepath, '..'), callback, true);
}

/** 根路径 */
let basePath = toProjectRoot(import.meta.url);
/** 转换路径为绝对路径 */
export function getPath(...paths: string[]) {
    return path.resolve(basePath, ...paths);
}

/** 设置根路径 */
export function setRootPath(path: string) {
    basePath = toProjectRoot(path);
}

/** 将提供的路径定位到项目根目录 */
function toProjectRoot(_path: string) {
    const pathArr = _path.split(path.sep);
    const idx = pathArr.indexOf('node_modules');
    return idx === -1 ? _path : pathArr.slice(0, idx).join(path.sep);
}
