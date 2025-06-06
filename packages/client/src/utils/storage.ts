type StorageType = 'localStorage' | 'sessionStorage';

/**
 * 添加存储内容到指定的类型
 * @param {string} key 添加的键
 * @param {any} value 添加的值
 * @param {StorageType} type 存储的类型
 */
export function setStorage(key: string | number, value: any, type: StorageType = 'localStorage'): void {
    window[type].setItem(key.toString(), JSON.stringify(value));
}

/**
 * 获取指定的存储内容
 * @param {string | number} key 添加的键
 * @param {StorageType} [type] 存储的类型
 * @param {any} [defaultValue] 默认值
 */
export function getStorage<T = unknown>(key: string | number, type: StorageType = 'localStorage', defaultValue?: T): T | null {
    try {
        const result = window[type].getItem(key.toString());
        return result ? JSON.parse(result) : null;
    }
    catch (error) {
        // console.log('error: 读取本地数据失败 ', key);
        return defaultValue || null;
    }
}

/**
 * 删除指定类型中存储的值
 * @param {string | number} key 删除的键
 * @param {StorageType} type 存储的类型
 */
export function removeStorage(key: string | number, type: StorageType = 'localStorage'): void {
    window[type].removeItem(key.toString());
}

/**
 * 添加存储内容到 sessionStorage 中
 * @param {string} key 添加的键
 * @param {any} value 添加的值
 */
export function setSessionStorage(key: string | number, value: any) {
    return setStorage(key, value, 'sessionStorage');
}

/**
 * 获取 sessionStorage 中的值
 * @param {string} key 获取的键
 * @param {any} [defaultValue] 默认值
 */
export function getSessionStorage<T = unknown>(key: string | number, defaultValue?: T): T | null {
    return getStorage<T>(key, 'sessionStorage', defaultValue);
}

/**
 * 删除 sessionStorage 中的值
 * @param {string} key 删除的键
 */
export function removeSessionStorage(key: string | number) {
    return removeStorage(key, 'sessionStorage');
}

/**
 * 添加存储内容到 localStorage 中
 * @param {string} key 添加的键
 * @param {any} value 添加的值
 */
export function setLocalStorage(key: string | number, value: any) {
    return setStorage(key, value, 'localStorage');
}

/**
 * 获取 localStorage 中的值
 * @param {string} key 获取的键
 * @param {any} [defaultValue] 默认值
 */
export function getLocalStorage<T = unknown>(key: string | number, defaultValue?: T): T | null {
    return getStorage<T>(key, 'localStorage', defaultValue);
}

/**
 * 删除 localStorage 中的值
 * @param {string} key 删除的键
 */
export function removeLocalStorage(key: string | number) {
    return removeStorage(key, 'localStorage');
}
