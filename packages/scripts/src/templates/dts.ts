
/** 接口声明模板 */
export const dts = `/** 树形列表 */
export interface TreeOption {
    label: string;
    value: string;
    children?: TreeOption[];
}
/** <%= moduleTitle %>列表 - 请求参数 */
export interface <%= shortName %>ListParameter extends API.PageInfo {
}
/** <%= moduleTitle %>列表 - 请求返回值 */
export type <%= shortName %>List = API.ListType<<%= shortName %>ListOption>;
/** <%= moduleTitle %>列表项 */
export interface <%= shortName %>ListOption {
    /**  */
    id: string;
}

/** <%= moduleTitle %>列表(无分页) - 请求参数 */
export interface <%= shortName %>ListNoPageParameter extends <%= shortName %>ListParameter {}
/** <%= moduleTitle %>列表(无分页) - 请求返回值 */
export type <%= shortName %>ListNoPage = <%= shortName %>ListOption[];

/** <%= moduleTitle %>详情 -> (新增/修改)的参数 */
export interface <%= shortName %>InfoParameter {
}
/** <%= moduleTitle %>详情 - 返回值 */
export interface <%= shortName %>Info extends <%= shortName %>ListOption {
}
`;
