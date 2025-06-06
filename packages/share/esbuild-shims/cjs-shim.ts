import { createRequire } from 'node:module';
import { importMetaUrl } from 'tsup/assets/cjs_shims';

globalThis.require = createRequire(importMetaUrl);
