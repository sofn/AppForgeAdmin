<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { listSchedulerLogs, type SchedulerLog } from "@/api/scheduler";
import type { PaginationProps } from "@pureadmin/table";
import { logColumns } from "./utils/log-columns";
import { PureTableBar } from "@/components/RePureTableBar";

const props = defineProps<{
  jobId: number;
  jobName: string;
}>();

const loading = ref(false);
const dataList = ref<SchedulerLog[]>([]);
const pagination = ref<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

let pollTimer: ReturnType<typeof setInterval> | null = null;

async function load() {
  if (loading.value) return;
  loading.value = true;
  try {
    const { code, data } = await listSchedulerLogs({
      jobId: props.jobId,
      currentPage: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    });
    if (code === 0 && data) {
      dataList.value = data.list;
      pagination.value.total = data.total;
      pagination.value.pageSize = data.pageSize;
      pagination.value.currentPage = data.currentPage;
    }
  } finally {
    loading.value = false;
  }
}

function startPolling() {
  load();
  pollTimer = setInterval(() => {
    load();
  }, 3000);
}

onMounted(startPolling);
onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});

function onPageChange(page: number) {
  pagination.value.currentPage = page;
  load();
}

function onPageSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  load();
}
</script>

<template>
  <div>
    <div class="mb-2 text-sm text-gray-600">
      任务: <span class="font-bold">{{ jobName }}</span>
    </div>
    <PureTableBar title="执行日志" :columns="logColumns" @refresh="load">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          v-loading="loading"
          row-key="id"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          adaptive
          :adaptiveConfig="{ offsetBottom: 60 }"
          @page-current-change="onPageChange"
          @page-size-change="onPageSizeChange"
        />
      </template>
    </PureTableBar>
  </div>
</template>
