/** API模板 */
export const api = `import type { AxiosResponse } from 'axios';
import { formatList } from '@/api/index';
import { axiosInstance } from '@/axios/index';
import type { Response<%= moduleName %> } from '@/interface/index';
import { downLoadFile } from '@/utils/index';

/** 获取左侧树形列表 */
export async function getTreeData() {
    return Promise.resolve({
        data: {
            status: true,
            data: Array.from({ length: 10 }, (v, i) => ({ label: \`树i_\${i + 1}\`, value: \`\${i + 1}\` })),
        },
    }) as unknown as AxiosResponse<API.Response<Response<%= moduleName %>.TreeOption[]>>;
    return axiosInstance<API.Response<Response<%= moduleName %>.TreeOption[]>>({ url: '' });
}
/**
 * 获取<%= shortTitle %>列表(分页列表)
 * @param {object} params 请求参数
 */
export async function get<%= shortName %>List(params: Response<%= moduleName %>.<%= shortName %>ListParameter) {
    return Promise.resolve({
        data: {
            status: true,
            data: {
                list: Array.from({ length: 10 }, (v, i) => ({
                    prop1: \`列1-值\${~~(Math.random() * 10)}\`,
                    prop2: \`列2-值\${~~(Math.random() * 10)}\`,
                })),
                page: { pageNum: 1, pageSize: 1, countPage: 1, count: 1 },
            },
        },
    }) as unknown as AxiosResponse<API.Response<Response<%= moduleName %>.<%= shortName %>List>>;
    return axiosInstance<API.Response<Response<%= moduleName %>.<%= shortName %>List>>({ url: '', params })
        .then((res) => {
            if (res.data.status) {
                res.data.data = formatList(res.data.data, params.pageNum, params.pageSize);
            }
            return res;
        });
}
// /**
//  * 获取<%= shortTitle %>列表(不分页)
//  * @param {object} params 请求参数
//  */
// export async function get<%= shortName %>ListNoPage(params?: Response<%= moduleName %>.<%= shortName %>ListNoPageParameter) {
//     // return Promise.resolve({
//     //     data: { status: true, data: Array.from({ length: 10 }, (v, i) => ({})) },
//     // }) as unknown as AxiosResponse<API.Response<Response<%= moduleName %>.<%= shortName %>List>>;
//     return axiosInstance<API.Response<Response<%= moduleName %>.<%= shortName %>ListNoPage>>({ url: '', params });
// }

/**
 * 设置<%= shortTitle %>信息
 * @param {object} params 请求参数
 */
export async function set<%= shortName %>Info(params: Response<%= moduleName %>.<%= shortName %>InfoParameter) {
    return Promise.resolve({ data: { status: true, data: null } });
    return axiosInstance<API.Response<null>>({ url: '', params, method: 'POST' });
}

/**
 * 更新<%= shortTitle %>信息
 * @param {object} params 请求参数
 */
export async function update<%= shortName %>Info(params: Response<%= moduleName %>.<%= shortName %>InfoParameter) {
    return Promise.resolve({ data: { status: true, data: null } });
    return axiosInstance<API.Response<null>>({ url: '', params, method: 'PUT' });
}

/**
 * 获取<%= shortTitle %>详情
 * @param {string} id 详情 id
 */
export async function get<%= shortName %>Info(id: string | number) {
    return Promise.resolve({ data: { status: true, data: {} } }) as unknown as AxiosResponse<API.Response<Response<%= moduleName %>.<%= shortName %>Info>>;
    return axiosInstance<API.Response<Response<%= moduleName %>.<%= shortName %>Info>>('');
}

/**
 * 删除<%= shortTitle %>
 * @param {string} id 详情 id
 */
export async function del<%= shortName %>Info(id: string | number) {
    return Promise.resolve({ data: { status: true, data: null } });
    return axiosInstance<API.Response<null>>({ url: '', method: 'DELETE' });
}

/** 导出数据 */
export async function exportData({ pageSize, pageNum, ...params }: Record<string, any>) {
    // return Promise.resolve({ data: { status: true, data: null } }) as unknown as AxiosResponse<API.Response<Blob>>;
    return axiosInstance<API.Response<Blob>>({ url: '', params, method: 'POST', responseType: 'blob' })
        .then((res) => {
            if (res.data.status) {
                downLoadFile(res.data.data, res.data.msg);
            }
            return res;
        });
}
`;
