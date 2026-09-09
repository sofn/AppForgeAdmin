<script setup lang="ts">
import { useSchedulerJob } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import VideoPlay from "~icons/ep/video-play";
import VideoPause from "~icons/ep/video-pause";
import Promotion from "~icons/ep/promotion";
import Document from "~icons/ep/document";

defineOptions({
  name: "SystemSchedulerJob"
});

const {
  form,
  loading,
  dataList,
  columns,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handlePause,
  handleResume,
  handleRun,
  handleViewLog,
  handleSizeChange,
  handleCurrentChange,
  STATUS_RUNNING
} = useSchedulerJob();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="任务名称：" prop="jobName">
        <el-input
          v-model="form.jobName"
          placeholder="请输入任务名称"
          clearable
          class="w-50!"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          class="w-40!"
        >
          <el-option label="运行中" :value="STATUS_RUNNING" />
          <el-option label="已暂停" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm($refs.formRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="定时任务列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          新增任务
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          row-key="id"
          adaptive
          :adaptiveConfig="{ offsetBottom: 110 }"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Promotion)"
              @click="handleRun(row)"
            >
              立即执行
            </el-button>
            <el-button
              v-if="row.status === STATUS_RUNNING"
              link
              type="warning"
              :size="size"
              :icon="useRenderIcon(VideoPause)"
              @click="handlePause(row)"
            >
              暂停
            </el-button>
            <el-button
              v-else
              link
              type="success"
              :size="size"
              :icon="useRenderIcon(VideoPlay)"
              @click="handleResume(row)"
            >
              恢复
            </el-button>
            <el-button
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑', row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="info"
              :size="size"
              :icon="useRenderIcon(Document)"
              @click="handleViewLog(row)"
            >
              日志
            </el-button>
            <el-button
              link
              type="danger"
              :size="size"
              :icon="useRenderIcon(Delete)"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
