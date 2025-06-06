<template>
    <transition name="el-zoom-in-center">
        <div v-if="isRenderIframe && isInit" v-show="isShow">
            <ElCard
                style="--el-card-padding: 10px"
                header="创建模块" body-class="h-full"
                class="visual-client absolute bottom-10px w-1020px h-800px left-50% translate-x--50% z-9999 flex flex-col"
            >
                <div class="absolute right-10px top-10px" tabindex="0" title="关闭" @click="hide">
                    <ElIcon class="hover:rotate-180deg transition-transform">
                        <Close />
                    </ElIcon>
                </div>
                <iframe :src="url" class="size-full b-none" />
            </ElCard>
        </div>
    </transition>
</template>

<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue';
import { local } from '@xiaohaih/storage';
import { ElCard, ElIcon } from 'element-plus';
import { onMounted, ref } from 'vue';

defineOptions({
    name: 'App',
});

const isRenderIframe = (window as any).disabledRenderVisualClientIframe !== true;
Object.assign(window, { disabledRenderVisualClientIframe: true });
const url = `/${(window as any).iframeUrl}`;
const isInit = ref(false);
onMounted(() => isInit.value = true);

const storagePrefixKey = '__visual-client__';
const isShow = ref(local.getItem(`${storagePrefixKey}show__`, true));

function show() {
    toggle(true);
}
function hide() {
    toggle(false);
}
function toggle(value = !isShow.value) {
    isShow.value = value;
    updateShowStorage();
}
function updateShowStorage() {
    local.setItem(`${storagePrefixKey}show__`, isShow.value);
}
Object.assign(window, {
    showOverlay: show,
    hideOverlay: hide,
    toggleOverlay: toggle,
});
</script>

<style scoped></style>
