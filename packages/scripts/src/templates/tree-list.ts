/** 树形列表模板 */
export const treeList = `<template>
    <div class="page-view">
        <TreeList
            ref="treeListRef"
            v-bind="$attrs"
            :filter-tree-props="filterTreeProps"
            :auth="auth"
            :table-above-btn="tableAboveBtn"
            :condition="condition"
            :get-tree="getTree"
            :get-list="getList"
            tree-field="questionTypeId"
            :columns="columns"
            :btn-attrs="setBtn"
            :operate-column-attrs="{ width: '80px' }"
            @btn-click="btnClick"
            @node-click="nodeClick"
        />
    </div>
</template>

<script lang="tsx" setup>
import { useComponent } from '@xiaohaih/create-api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { PropType } from 'vue';
import { computed, defineComponent, ref, toRaw, watch } from 'vue';
import { del<%= shortName %>Info as delInfo, get<%= shortName %>Info as getInfo, get<%= shortName %>List as getList, getSideTree as getTree, set<%= shortName %>Info as setInfo, update<%= shortName %>Info as updateInfo } from '@/api/<%= apiAddress %>';
import { <%= PopupType %> } from '@/components/<%= popupType %>/index';
import type { Response<%= moduleName %> } from '@/interface/index';
import type { TreeListInstance } from '@/views/components/tree-list/index';
import { TreeList } from '@/views/components/tree-list/index';
import { AUTH_KEY_ADD, AUTH_KEY_DELETE, AUTH_KEY_DETAIL, AUTH_KEY_EDIT, columns, condition, filterTableBtn, formOption, tableAboveBtn } from './config';

type TreeDatum = Response<%= moduleName %>.TreeOption;
type Datum = Response<%= moduleName %>.<%= shortName %>ListOption;

/**
 * @file <%= moduleFullTitle %>
 */
defineOptions({
    name: '<%= moduleName %>',
});
const props = defineProps({
    auth: { type: Array as PropType<API.MenuOption[]> },
    title: { type: String },
});

const treeListRef = ref<TreeListInstance>();
const treeActiveId = ref('');
const filterTreeProps = {
    nodeKey: 'value' as const,
    highlightCurrent: true,
    // props: { children: 'children', label: 'label' },
    placeholder: '输入关键字搜索',
};
/** 树节点点击事件 */
function nodeClick(data: TreeDatum) {
    treeActiveId.value = data.questionTypeId;
}

const popupForm = useComponent(<%= PopupType %>);
// const writeableComponent = useComponent(Writeable);

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
                    const res = await (type === AUTH_KEY_ADD ? setInfo : updateInfo)(params);
                    return res.data.status;
                },
                onSuccess: treeListRef.value?.listRef?.refresh,
            }).show();
            break;
        }
        case AUTH_KEY_DELETE: {
            if (!datum) return;
            try {
                await ElMessageBox.confirm(\`确认删除该数据吗?\`);
                treeListRef.value!.listRef!.loading = true;
                const res = await delInfo(datum.id);
                treeListRef.value!.listRef!.loading = false;
                res.data.status && treeListRef.value!.listRef!.detectionPageNumRefresh();
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

/** 树形列表配置项模板 */
export { listConfig as treeListConfig } from './list';
