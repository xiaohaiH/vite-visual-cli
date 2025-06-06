import _generate from '@babel/generator';
import parser from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import _traverse from '@babel/traverse';
import type * as t from '@babel/types';
import { LINE_BREAK_REG, SPACE_BASE, SPACE_PLACEHOLDER } from './config';

const traverse = ((_traverse as any).default as typeof _traverse) || _traverse;
const generate = ((_generate as any).default as typeof _generate) || _generate;

/**
 * 将提供的代码转为 ast 并添加路由后返回新的代码
 * 注意: 返回的代码是未格式化的, 需要手动格式化
 */
export function addRouteContent(option: {
    /** 路由文件内容 */
    content: string;
    /** 匹配的路径 */
    matchPath: string;
    /** 要增加的路由信息 */
    newRouteStr: string;
}) {
    const ast = content2ast(option.content);

    traverse(ast, {
        ObjectExpression(path) {
            const r = path.node.properties.find((v) => v.type === 'ObjectProperty' && (v.key as t.Identifier)?.name === 'path' && (v.value as t.StringLiteral).value === option.matchPath);
            const rr = (path.node.properties.find((v) => v.type === 'ObjectProperty' && (v.key as t.Identifier)?.name === 'children')) as t.ObjectProperty | undefined;
            if (r && rr && rr.type === 'ObjectProperty' && rr.value.type === 'ArrayExpression') {
                rr.value.elements.push(str2astType<t.ObjectExpression>(option.newRouteStr));
                path.skip();
            }
        },
    });
    return generate(ast).code;
}

/**
 * 将提供的代码转为 ast 并添加路由后返回新的代码
 * 直接在原有代码中插入, 因此无须格式化
 */
export function addRouteContent2(option: {
    /** 路由文件内容 */
    content: string;
    /** 匹配的路径 */
    matchPath: string;
    /** 要增加的路由信息 */
    newRouteStr: string;
}) {
    const ast = content2ast(option.content);
    let result = '';

    traverse(ast, {
        ObjectExpression(path) {
            const r = path.node.properties.find((v) => v.type === 'ObjectProperty' && (v.key as t.Identifier)?.name === 'path' && (v.value as t.StringLiteral).value === option.matchPath);
            const rr = (path.node.properties.find((v) => v.type === 'ObjectProperty' && (v.key as t.Identifier)?.name === 'children')) as t.ObjectProperty | undefined;
            if (r && rr && rr.type === 'ObjectProperty' && rr.value.type === 'ArrayExpression') {
                const contentArr = option.content.split(LINE_BREAK_REG);
                // 无数据时且数组在同行
                if (rr.loc!.start.line === rr.loc!.end.line) {
                    // 获取父级 children 的行数
                    const lineIdx = rr.loc!.start.line - 1;
                    // 获取父级 children 的起始坐标
                    const childrenIdx = contentArr[lineIdx].indexOf('children');
                    // 获取父级 children 前的空格数量
                    const space = SPACE_BASE.repeat(childrenIdx) + SPACE_PLACEHOLDER;
                    // 获取数组方括号([)的起始坐标
                    const arrStrIndex = contentArr[lineIdx].indexOf('[');
                    result = `${
                        // 由于 rr.start 是基于字符串的, 因此需要减去 children 前的数量
                        option.content.slice(0, rr.start! + arrStrIndex - childrenIdx + 1)
                    }\n${space}${option.newRouteStr.split('\n').join(`\n${space}`)}\n${
                        space.slice(0, -1 * SPACE_PLACEHOLDER.length)
                    }${
                        // 由于 rr.start 是基于字符串的, 因此需要减去 children 前的数量
                        option.content.slice(rr.start! - childrenIdx + contentArr[lineIdx].indexOf(']'))
                    }`;
                }
                else {
                    const lineIdx = rr.loc!.end.line - 1;
                    const prefixContent = contentArr.slice(0, lineIdx).join('\n');
                    const suffixContent = contentArr.slice(lineIdx).join('\n');
                    const space = SPACE_BASE.repeat(contentArr[lineIdx].indexOf(']')) + SPACE_PLACEHOLDER;
                    result = `${prefixContent}\n${space}${option.newRouteStr.split('\n').join(`\n${space}`)}\n${suffixContent}`;
                }
                path.skip();
            }
        },
    });
    return result;
}

/**
 * 删除指定的路由并返回新的文件内容
 */
export function removeRouteContent2(option: {
    /** 路由文件内容 */
    content: string;
    /** 匹配的路径 */
    matchPath: string;
}) {
    const ast = content2ast(option.content);
    let result = '';

    traverse(ast, {
        ObjectExpression(path) {
            const r = path.node.properties.find((v) => v.type === 'ObjectProperty' && (v.key as t.Identifier)?.name === 'path' && (v.value as t.StringLiteral).value === option.matchPath);
            if (r) {
                result = recursionRemoveParentAtOnlyChildren(path);
                path.skip();
            }
        },
    });
    /** 递归删除父级(父级存在其它路由时不做删除)后返回新的路由内容 */
    function recursionRemoveParentAtOnlyChildren(path: NodePath<t.ObjectExpression>) {
        if ((path.parent as t.ArrayExpression).elements.length === 1) {
            const r = path.findParent((v) => v.type === 'ObjectExpression');
            if (r) return recursionRemoveParentAtOnlyChildren(r as NodePath<t.ObjectExpression>);
            // 先记录坐标, 防止删除后导致坐标错误
            const beginIdx = (path.parent as t.ArrayExpression).start! + 1;
            const endIdx = path.node.end! + 1;
            path.remove();

            // 删除后自检一遍, 看是否有导出的路由数组, 且数组是否为空
            let hasChild = false;
            traverse(ast, {
                ExportNamedDeclaration(path) {
                    if (hasChild) return;
                    hasChild = !!((path.node.declaration as t.VariableDeclaration)?.declarations[0]?.init as t.ArrayExpression)?.elements?.length;
                },
            });
            return hasChild ? `${option.content.slice(0, beginIdx)}${option.content.slice(endIdx)}` : '';
        }
        else {
            // 上一个节点存在, 以上一个节点最后一位开始删除
            // 否则以父级的花括号([)开始删除
            const prev = path.getPrevSibling().node;
            const beginIdx = prev ? prev.end! + 1 : (path.parent as t.ArrayExpression).start! + 1;
            const endIdx = path.node.end! + 1;
            return `${option.content.slice(0, beginIdx)}${option.content.slice(endIdx)}`;
        }
    }
    return result;
}

/** 将代码转为 traverse 可操作的 ast 值 */
export function str2astType<T>(code: string): T {
    const ast = content2ast(`const a = [${code}]`);
    let r: T;
    traverse(ast, {
        ArrayExpression(path) {
            if (path.node.type === 'ArrayExpression') {
                r = path.node.elements[0] as T;
                path.skip();
            }
        },
    });
    return r!;
}

/** 将代码转为 ast */
export function content2ast(code: string) {
    return parser.parse(code, {
        plugins: ['typescript', 'jsx'],
        sourceType: 'module',
    });
}
