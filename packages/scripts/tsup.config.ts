import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
    ],
    target: 'es2020',
    external: ['inquirer'],
    noExternal: ['superjson'],
    clean: true,
    format: ['esm', 'cjs'],
    // See: https://github.com/evanw/esbuild/issues/1921
    inject: ['./esbuild-shims/cjs-shim.ts'],
    dts: true,
    shims: true,
});
