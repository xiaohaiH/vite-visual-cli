/** 动态路由模板 */
export const dynamicRouteList = `<template>
    <div class="page-view">
        <List
            ref="listRef"
            v-bind="$attrs"
            :key="page"
            :auth="auth"
            :table-above-btn="tableAboveBtn"
            :filter-table-btn="filterTableBtn"
            :condition="listInfo.condition"
            :get-list="listInfo.getList"
            :columns="listInfo.columns"
            :auto-reset-query="true"
            :btn-attrs="setBtn"
            :operate-column-attrs="{ width: '80px' }"
            @btn-click="btnClick"
        />
    </div>
</template>

<script lang="tsx" setup>
import { useComponent } from '@xiaohaih/create-api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { PropType } from 'vue';
import { computed, defineComponent, ref, toRaw, watch } from 'vue';
import { del<%= shortName %>Info as delInfo, get<%= shortName %>Info as getInfo, get<%= shortName %>List, set<%= shortName %>Info as setInfo, update<%= shortName %>Info as updateInfo } from '@/api/<%= apiAddress %>';
import { <%= PopupType %> } from '@/components/<%= popupType %>/index';
import type { Response<%= moduleName %> } from '@/interface/index';
import type { ListInstance } from '@/views/components/list/index';
import { List } from '@/views/components/list/index';
import { AUTH_KEY_ADD, AUTH_KEY_DELETE, AUTH_KEY_DETAIL, AUTH_KEY_EDIT, columns, condition, filterTableBtn, tableAboveBtn, twoColumns, twoCondition } from './config';

type Datum = Response<%= moduleName %>.<%= shortName %>ListOption;

const pageInfoMap = {
    routeKey1: { condition, columns, getList: get<%= shortName %>List },
    routeKey2: { condition: twoCondition, columns: twoColumns, getList: get<%= shortName %>List },
};

/**
 * @file <%= moduleFullTitle %>
 */
defineOptions({
    name: '<%= moduleName %>',
});
const props = defineProps({
    page: { type: String as PropType<keyof typeof pageInfoMap>, required: true },
    auth: { type: Array as PropType<API.MenuOption[]> },
    title: { type: String },
});

const listRef = ref<ListInstance>();
const listInfo = ref(pageInfoMap.routeKey1);
const popupForm = useComponent(<%= PopupType %>);

watch(
    () => props.page,
    (val) => {
        listInfo.value = pageInfoMap[val];
    },
    { immediate: true },
);

/**
 * 按钮点击事件
 * @param {object} btnInfo 点击按钮的信息
 * @param {object | undefined} datum 点击所在列表行数据(table 上方按钮点击时, 该值为空)
 */
async function btnClick(btnInfo: API.MenuOption, datum: Datum | undefined) {
    const type = btnInfo.path;
    const title = btnInfo.menuName;
    switch (type) {
        case AUTH_KEY_ADD:
        case AUTH_KEY_EDIT: {
            // type !== AUTH_KEY_ADD && datum && popupForm().setDetail({
            //     id: datum.id,
            //     field1: datum.field1,
            //     field2: datum.field2,
            //     field3: datum.field3,
            // });
            popupForm({
                title,
                formOption,
                async submitCallback(params: Response<%= moduleName %>.<%= shortName %>InfoParameter) {
                    type === AUTH_KEY_ADD || (params.questionTypeId = datum!.questionTypeId);
                    const res = await (type === AUTH_KEY_ADD ? setInfo : updateInfo)(params);
                    return res.data.status;
                },
                onSuccess: listRef.value?.refresh,
            }).show();
            break;
        }
        case AUTH_KEY_DELETE: {
            if (!datum) return;
            try {
                await ElMessageBox.confirm(\`确认删除该数据吗?\`);
                listRef.value!.loading = true;
                const res = await delInfo(datum.questionTypeId);
                listRef.value!.loading = false;
                res.data.status && listRef.value!.detectionPageNumRefresh();
            }
            catch (error) {}
            break;
        }
        default: {
            break;
        }
    }
}
/** 设置按钮属性 */
function setBtn(item: API.MenuOption, row: Datum | undefined) {
    if (item.path === AUTH_KEY_DELETE) return { type: 'danger' } as const;
    if (!row) return { type: 'primary' } as const;
}
</script>

<style lang="scss" scoped>
@import url('/src/views/page.scss');
</style>
`;

/** 动态路由配置项模板 */
export const dynamicRouteConfig = `import { defineOption } from '@xiaohaih/json-form-plus';
import { getDict, getOrgTree } from '@/api/common';
import type { Response<%= moduleName %> } from '@/interface/index';

/**
 * @file <%= moduleFullTitle %>
 */

/** 组件所在的路径 */
export const PAGE_PATH = '/<%= apiAddress %>';

/** 组件所拥有的权限 */
<%= authConstant %>

/** 模拟权限 */
export function pseudoAuth() {
    return <%= authConstantArr %>;
}

type Datum = Response<%= moduleName %>.<%= shortName %>ListOption;

/** 展示在 table 上方的权限 */
export const tableAboveBtn = [AUTH_KEY_ADD];
/** 过滤表格中显示的按钮 */
export function filterTableBtn(auth: API.MenuOption[], row: Datum) {
    return auth;
    // const blacklist: string[] = [];
    // blacklist.push(row.status === '0' ? AUTH_KEY_ENABLE : AUTH_KEY_DISABLED);
    // return auth.filter((v) => !blacklist.includes(v.path));
}

/** 条件 */
export function condition() {
    return defineOption({
        name: {
            t: 'input',
            // label: '名称',
            placeholder: '名称搜索',
        },
        sel: {
            t: 'select',
            // label: '功能类型',
            placeholder: '请选择功能类型',
            labelKey: 'dictLabel',
            valueKey: 'dictValue',
            // options: [] as ResponseCommon.DictOption[],
            async getOptions(cb) {
                cb([{ dictLabel: '字典1', dictValue: '1' }, { dictLabel: '字典2', dictValue: '2' }]);
                // const res = await getDict('role_state');
                // cb(res.data.status ? res.data.data : []);
            },
        },
        deptId: {
            t: 'cascader',
            // label: '所属部门',
            placeholder: '请选择所属部门',
            showAllLevels: false,
            props: { value: 'organizationId', label: 'organizationName', checkStrictly: true },
            // options: [],
            async getOptions(cb) {
                const res = await getOrgTree();
                cb(res.data.status ? res.data.data : []);
            },
        },
        c: {
            t: 'date-picker',
            // label: '创建时间',
            type: 'daterange',
            fields: ['createStartTime', 'createEndTime'],
            startPlaceholder: '创建时间',
            endPlaceholder: '创建时间',
        },
    });
}
/** 表格项 */
export function columns(): ColumnOption[] {
    return [
        { label: '列1', prop: 'prop1', align: 'center' },
        { label: '列2', prop: 'prop2', align: 'center' },
        { label: '', prop: '', align: 'center' },
    ];
}

/** 第二项 - 条件 */
export function twoCondition() {
    return defineOption({
        a: {
            t: 'input',
            label: '名称',
            placeholder: '名称搜索',
        },
    });
}
/** 第二项 - 表格项 */
export function twoColumns(): ColumnOption[] {
    return [
        { label: '列1', prop: 'prop1', align: 'center' },
        { label: '列2', prop: 'prop2', align: 'center' },
        { label: '列3', prop: 'prop3', align: 'center' },
        { label: '列4', prop: 'prop4', align: 'center' },
        { label: '', prop: '', align: 'center' },
    ];
}

/** 编辑修改的表单配置 */
export function formOption() {
    return defineOption({
        name: {
            t: 'input',
            label: '名称',
            placeholder: '请输入名称',
            maxlength: 100,
            rules: [
                { required: true, message: '不能为空' },
            ],
        },
        dic: {
            t: 'select',
            label: '类型',
            placeholder: '请选择类型',
            labelKey: 'dictLabel',
            valueKey: 'dictValue',
            // options: [] as ResponseCommon.DictOption[],
            async getOptions(cb) {
                cb([{ dictLabel: '字典1', dictValue: '1' }, { dictLabel: '字典2', dictValue: '2' }]);
                // const res = await getDict('role_state');
                // cb(res.data.status ? res.data.data : []);
            },
            rules: [
                { required: true, message: '不能为空' },
            ],
        },
        cas: {
            t: 'cascader',
            label: '所属机构',
            placeholder: '请选择所属机构',
            showAllLevels: false,
            props: { value: 'organizationId', label: 'organizationName', checkStrictly: true },
            // options: [],
            async getOptions(cb) {
                const res = await getOrgTree();
                cb(res.data.status ? res.data.data : []);
            },
            rules: [
                { required: true, message: '不能为空' },
            ],
        },
        c: {
            t: 'date-picker',
            label: '过期时间',
            type: 'daterange',
            fields: ['createStartTime', 'createEndTime'],
            startPlaceholder: '过期时间',
            endPlaceholder: '过期时间',
            rules: [
                { required: true, message: '不能为空' },
            ],
        },
    });
}
`;
