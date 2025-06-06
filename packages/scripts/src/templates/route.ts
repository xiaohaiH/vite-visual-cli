/** 路由文件 */
export const routeFile = `import type { RouteRecordRaw } from 'vue-router';

/* <%= title %>相关的路由
------------------------ */

/** 固定路由 */
export const constantRoutes: RouteRecordRaw[] = [
];

/** 动态路由 */
export const dynamicRoutes: RouteRecordRaw[] = [
    <%= routes %>
];
`;

/** 原子路由 */
export const atomRoute = `{
    path: '<%= path %>',
    name: '<%= name %>',
    meta: {
        title: '<%= title %>',
        pseudoAuth: <%= pseudoAuth %>,
    },
    component: async () => import('<%= filepath %>'),
},`;
// component: async () => import(/* webpackChunkName: "<%= routeName %>" */ '<%= routeFilepath %>'),

/** 存在子路由的路由 */
export const subRoute = (() => {
    const r = atomRoute.split('\n');
    r.splice(
        -1,
        0,
        '    children: [',
        '        <%= children %>',
        '    ],',
    );
    return r.join('\n');
})();
