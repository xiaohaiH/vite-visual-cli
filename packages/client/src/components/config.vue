<template>
    <div class="size-full overflow-hidden flex flex-col">
        <!-- <div class="flex-none bg-gray-2 py-2px px-10px shadow mb-8px rd-4px">
            <ElText class="before-content-[attr(label)] before-mr-4px" :type="isRemovable ? 'danger' : 'success'" label="$">
                {{ command }}
            </ElText>
        </div> -->
        <HForm
            ref="hFormRef" label-position="top"
            class="h-form w-full h-50% flex-auto overflow-hidden grid grid-rows-[auto] grid-cols-2 gap-x-10px content-start"
            :datum="option" :realtime="true" :render-btn="false" :immediate-search="true"
            :backfill="query"
            @search="queryChange" @reset="queryChange"
        />
        <div class="flex-none mt-10px">
            <div class="flex">
                <ElButton class="flex-auto w-40%" size="large" @click="reset">
                    重置
                </ElButton>
                <ElButton class="flex-auto w-40%" size="large" type="primary" @click="generate">
                    创建模块
                </ElButton>
            </div>
        </div>
    </div>
</template>

<script lang="tsx" setup>
import { Delete, Plus } from '@element-plus/icons-vue';
import type { HFormInstance } from '@xiaohaih/json-form-plus';
import { defineOption, HForm } from '@xiaohaih/json-form-plus';
import { local } from '@xiaohaih/storage';
import { ElButton, ElCheckbox, ElFormItem, ElIcon, ElInput, ElMessage, ElMessageBox, ElTag, ElText, ElTree } from 'element-plus';
import { truncate } from 'fs-extra';
import type { Ref } from 'vue';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { getViteRpcClient } from '@/ws';

/**
 * @file 配置
 */
defineOptions({
    name: 'Config',
});
// const props = defineProps<{}>();

// eslint-disable-next-line ts/consistent-type-definitions
type Option = {
    path: { value: string; options: null };
    title: { value: string; options: null };
    pageType: { value: string; options: Record<'label' | 'value', string> };
    removable: { value: boolean; options: null };
    forceWriteDts: { value: boolean; options: null };
    layout: { value: boolean; options: null };
    authPrefix: { value: string; options: null };
    removeAuthPrefix: { value: string | number | boolean; options: null };
    popupType: { value: string; options: { label: string; value: string } };
    authApplyRoute: { value: string; options: null };
    auth: { value: Record<'title' | 'value', string>[]; options: null };
};
const option = defineOption<Option>({
    pageType: {
        t: 'radio-group',
        label: '页面类型',
        defaultValue: 'list',
        options: [
            { label: '纯列表', value: 'list' },
            { label: 'tab页', value: 'tabList' },
            { label: '树+列表', value: 'treeList' },
            { label: '动态路由', value: 'dynamicList' },
        ],
        formItemDynamicProps: (props) => ({
            rules: props.query.removable ? [] : [{ required: true, message: '不能为空' }],
        }),
    },
    title: {
        t: 'input',
        label: '模块名称',
        placeholder: 'eg: 系统管理/菜单管理',
        formItemDynamicProps: (props) => ({
            rules: props.query.removable ? [] : [{ required: true, message: '不能为空' }],
        }),
    },
    path: {
        t: 'input',
        label: '模块路径',
        placeholder: 'eg: system/menus',
        rules: [
            { required: true, message: '不能为空' },
        ],
    },
    removable: {
        t: 'checkbox',
        label: '移除模块',
        staticProps: { label: '是否移除模块' },
        initialValue: false,
    },
    forceWriteDts: {
        t: 'checkbox',
        label: '覆盖声明',
        staticProps: { label: '声明冲突时, 是否继续写入' },
        initialValue: false,
    },
    layout: {
        t: 'checkbox',
        label: 'layout布局页面',
        staticProps: { label: '上级路由中是否引入布局文件(eg: 是否需要左侧菜单和顶部导航)' },
        initialValue: true,
    },
    popupType: {
        t: 'radio-group',
        label: '表单弹窗类型',
        defaultValue: 'dialog',
        options: [
            { label: 'dialog-form', value: 'dialog' },
            { label: 'drawer-form', value: 'drawer' },
        ],
    },
    authPrefix: {
        t: 'input',
        label: '权限前缀',
        placeholder: 'eg: :system:menus:',
        depend: true,
        dependFields: ['path'],
        getOptions: (cb, query, option) => {
            cb([]);
            const prefix = query.path?.split('/').filter(Boolean).join(':');
            option.search(prefix ? `:${prefix}:` : '');
        },
        itemSlots: {
            append: (options) => {
                return (
                    <ElCheckbox
                        modelValue={options.getProps().query.removeAuthPrefix}
                        onChange={(value) => options.getProps().query.removeAuthPrefix = value}
                    >
                        不需要前缀
                    </ElCheckbox>
                );
            },
        },
    },
    authApplyRoute: {
        t: 'checkbox',
        label: '权限是否注入路由',
        staticProps: { label: '将权限按钮路由文件中定义, 用来模拟权限' },
        initialValue: '--authApplyRoute=true',
        trueValue: '--authApplyRoute=true',
        falseValue: '',
    },
    auth: {
        t: 'custom-render',
        defaultValue: () => ([{ id: 1, title: '', value: '' }]),
        renderFormItem: false,
        render({ plain, getProps }) {
            const checked = plain.checked as Ref<{ title: string; value: string }[]>;
            function change(key: 'title' | 'value', item: typeof checked.value[number]) {
                return (value: string) => {
                    item[key] = value;
                    plain.change(checked.value);
                };
            };
            /** 新增空白选项 */
            function add(idx: number) {
                checked.value.splice(idx + 1, 0, { title: '', value: '' });
                plain.change(checked.value);
            }
            /** 新增内置选项 */
            function addInsetOption(item: typeof checked.value[number]) {
                const _item = { ...item };
                const last = checked.value[checked.value.length - 1];
                last && !last.title && !last.value ? checked.value.splice(checked.value.length - 1, 1, _item) : checked.value.push(_item);
                plain.change(checked.value);
            }
            /** 删除选项 */
            function remove(idx: number) {
                checked.value.splice(idx, 1);
                plain.change(checked.value);
            }
            const tags = [
                { title: '新增', value: 'add' },
                { title: '编辑', value: 'edit' },
                { title: '详情', value: 'detail' },
                { title: '启用', value: 'enable' },
                { title: '禁用', value: 'disabled' },
                { title: '锁定', value: 'locked' },
                { title: '不锁定', value: 'unlock' },
                { title: '删除', value: 'del' },
                { title: '导出', value: 'export' },
                { title: '导入', value: 'import' },
            ];
            return () => {
                return (
                    <div class="w-full flex flex-col overflow-hidden self-stretch col-span-2">
                        <div class="mb-10px flex flex-none">
                            <span class="c-text-regular text-14px flex-none font-bold">按钮权限</span>
                            <div class="ml-10px mb--10px flex flex-wrap">
                                {tags.map((item) => {
                                    return (
                                        <ElTag
                                            class="mr-4px mb-10px"
                                            size="small"
                                            // @ts-expect-error 忽视tabindex报错
                                            tabindex="0"
                                            onClick={() => addInsetOption(item)}
                                        >
                                            {item.title}
                                        </ElTag>
                                    );
                                })}
                            </div>
                        </div>
                        <ElTree
                            style="--el-tree-node-content-height: 50px"
                            data={checked.value}
                            node-key="id"
                            default-expand-all
                            expand-on-click-node={false}
                        >
                            {{
                                default: ({ data: item, index }: any) => {
                                    return (
                                        <div class="flex w-full">
                                            <ElFormItem label-position="right" label-width="46px" class="w-20% flex-auto" label="名称: ">
                                                <ElInput modelValue={item.title} placeholder="eg: 新增" onUpdate:modelValue={change('title', item)} />
                                            </ElFormItem>
                                            <ElFormItem label-position="right" label-width="46px" class="w-20% flex-auto ml-10px" label="值: ">
                                                <ElInput modelValue={item.value} placeholder="eg: add" onUpdate:modelValue={change('value', item)} />
                                            </ElFormItem>
                                            <div class="w-36px flex-none flex items-center mb-20px ml-8px">
                                                <ElIcon
                                                    class="hover:c-primary"
                                                    // @ts-expect-error 忽视tabindex报错
                                                    tabindex="0"
                                                    onClick={() => add(index)}
                                                >
                                                    <Plus />
                                                </ElIcon>
                                                <ElIcon
                                                    class={['ml-4px hover:c-primary', checked.value.length === 1 ? 'hidden' : '']}
                                                    // @ts-expect-error 忽视tabindex报错
                                                    tabindex="0"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Delete />
                                                </ElIcon>
                                            </div>
                                        </div>
                                    );
                                },
                            }}
                        </ElTree>
                        {/* <div class="min-h-30vh overflow-y-auto flex flex-col">
                            {checked.value.map((item, index) => {
                                return (
                                    <div class="flex w-full">
                                        <ElFormItem label-position="right" label-width="46px" class="w-20% flex-auto" label="名称: ">
                                            <ElInput modelValue={item.title} placeholder="eg: 新增" onUpdate:modelValue={change('title', item)} />
                                        </ElFormItem>
                                        <ElFormItem label-position="right" label-width="46px" class="w-20% flex-auto ml-10px" label="值: ">
                                            <ElInput modelValue={item.value} placeholder="eg: add" onUpdate:modelValue={change('value', item)} />
                                        </ElFormItem>
                                        <div class="w-36px flex-none flex items-center mb-20px ml-8px">
                                            <ElIcon
                                                class="hover:c-primary"
                                                // @ts-expect-error 忽视tabindex报错
                                                tabindex="0"
                                                onClick={() => add(index)}
                                            >
                                                <Plus />
                                            </ElIcon>
                                            <ElIcon
                                                class={['ml-4px hover:c-primary', checked.value.length === 1 ? 'hidden' : '']}
                                                // @ts-expect-error 忽视tabindex报错
                                                tabindex="0"
                                                onClick={() => remove(index)}
                                            >
                                                <Delete />
                                            </ElIcon>
                                        </div>
                                    </div>
                                );
                            })}
                        </div> */}
                    </div>
                );
            };
        },
    },
});

type PickValue<T extends Record<string, { value: any }>> = {
    [K in keyof T]: T[K]['value'];
};
const query = ref<Partial<PickValue<Option>>>({});
const r = local.getItem('config-query');
r && setTimeout(() => (query.value = r));
function queryChange(value: typeof query.value) {
    query.value = value;
    local.setItem('config-query', value);
}
const commandArgs = computed(() => {
    const { authPrefix, removeAuthPrefix, auth, popupType, ...args } = query.value;
    const params = {
        ...args,
        authPrefix: removeAuthPrefix ? '' : authPrefix,
        popupType: popupType === 'dialog' ? 'dialog-form' : 'drawer-form',
        PopupType: popupType === 'dialog' ? 'DialogForm' : 'DrawerForm',
        auth: auth?.filter((o) => o.title && o.value) || [],
    };
    return params;
});
// const isRemovable = computed(() => commandArgs.value.removable);

const hFormRef = useTemplateRef<HFormInstance>('hFormRef');
async function generate() {
    const _hFormRef = hFormRef.value;
    if (!_hFormRef) return ElMessage.info('获取表单实例失败, 请刷新页面后重试');
    try {
        await _hFormRef.validate();
    }
    catch (error) { return; }
    try {
        const result = await getViteRpcClient().generate(commandArgs.value);
        console.log(result, '成功了');
    }
    catch (error) {
        console.log(error, '生成报错, 111');
    }
}
function reset() {
    const _hFormRef = hFormRef.value;
    if (!_hFormRef) return ElMessage.info('获取表单实例失败, 请刷新页面后重试');
    ElMessageBox.confirm('确定重置表单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        _hFormRef.reset();
        setTimeout(_hFormRef.clearValidate);
    }).catch(() => {});
}
</script>

<style lang="scss" scoped>
.h-form {
}
.h-form :global(.el-form-item) {
    // --uno: ;
    // width: calc(50% - 10px);
}
.h-form :global(.el-form-item:nth-child(even)) {
    // --uno: ml-10px;
}
</style>
