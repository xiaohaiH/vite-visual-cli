<template>
    <div class="size-full flex flex-col overflow-auto p-10px">
        <Config />
    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import Config from './components/config.vue';

defineOptions({
    name: 'App',
});
</script>

<style scoped></style>
