import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 当前文件路径 */
export const __filename = fileURLToPath(import.meta.url);
/** 当前文件目录 */
export const __dirname = dirname(__filename);
