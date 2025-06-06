import { AUTH_CHILDREN, BTN_TEXT_MAP } from '../config';
import type { AuthOption } from '../types';

/**
 * 格式化权限
 * @param {string | string[]} _auth 存在的权限
 */
export function parseAuth(_auth: string | string[] | AuthOption[], prefix: string): AuthOption[] {
    if (!_auth) return [];
    const auth: any[] = typeof _auth === 'string' ? [_auth] : _auth;
    return auth.map((v) => typeof v === 'object' ? ({ ...v, prefix, ...(v.children ? { [AUTH_CHILDREN]: parseAuth(v.children, prefix) } : {}) }) : ({ title: BTN_TEXT_MAP[v as keyof typeof BTN_TEXT_MAP] || v, value: v, prefix }));
}
