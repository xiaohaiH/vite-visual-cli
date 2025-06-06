import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
    ],
    noExternal: ['rfdc'],
    clean: true,
    format: ['esm', 'cjs'],
    dts: true,
    shims: true,
});
