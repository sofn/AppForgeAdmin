import dayjs from "dayjs";
import editForm from "../form.vue";
import logView from "../log.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import {
  listSchedulerJobs,
  addSchedulerJob,
  updateSchedulerJob,
  deleteSchedulerJob,
  pauseSchedulerJob,
  resumeSchedulerJob,
  runSchedulerJob,
  type SchedulerJob
} from "@/api/scheduler";
import type { SchedulerFormItemProps } from "./types";
import { reactive, ref, onMounted, h } from "vue";

const STATUS_PAUSED = 1;
const STATUS_RUNNING = 2;

export function useSchedulerJob() {
  const form = reactive({
    jobName: "",
    status: undefined as number | undefined
  });
  const formRef = ref();
  const dataList = ref<SchedulerJob[]>([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    { label: "ID", prop: "id", width: 20 },
    { label: "任务名称", prop: "jobName", minWidth: 100 },
    { label: "分组", prop: "jobGroup", width: 80 },
    { label: "Bean", prop: "beanName", minWidth: 120 },
    { label: "方法", prop: "methodName", minWidth: 110 },
    { label: "Cron", prop: "cron", minWidth: 120 },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row }) =>
        row.status === STATUS_RUNNING ? (
          <el-tag type="success">RUNNING</el-tag>
        ) : (
          <el-tag type="info">PAUSED</el-tag>
        )
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 165,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 520,
      slot: "operation"
    }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { code, data } = await listSchedulerJobs({
        jobName: form.jobName,
        status: form.status,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize
      });
      if (code === 0 && data) {
        dataList.value = data.list;
        pagination.total = data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  function resetForm(formEl: any) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  function openDialog(title: "新增" | "编辑" = "新增", row?: SchedulerJob) {
    addDialog({
      title: `${title}定时任务`,
      props: {
        formInline: {
          id: row?.id,
          jobName: row?.jobName ?? "",
          jobGroup: row?.jobGroup ?? "DEFAULT",
          description: row?.description ?? "",
          beanName: row?.beanName ?? "",
          methodName: row?.methodName ?? "",
          methodParams: row?.methodParams ?? "",
          cron: row?.cron ?? "",
          misfirePolicy: row?.misfirePolicy ?? 1,
          concurrent: row?.concurrent ?? false
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as SchedulerFormItemProps;
        FormRef.validate(async (valid: boolean) => {
          if (!valid) return;
          if (title === "新增") {
            const resp = await addSchedulerJob(curData);
            if (resp.code === 0) {
              message(`已新增定时任务 ${curData.jobName}`, { type: "success" });
              done();
              onSearch();
            }
          } else {
            const resp = await updateSchedulerJob(row!.id, curData);
            if (resp.code === 0) {
              message(`已更新定时任务 ${curData.jobName}`, { type: "success" });
              done();
              onSearch();
            }
          }
        });
      }
    });
  }

  async function handleDelete(row: SchedulerJob) {
    await ElMessageBox.confirm(
      `确认要删除定时任务 <strong>${row.jobName}</strong> 吗？`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    );
    const { code } = await deleteSchedulerJob(row.id);
    if (code === 0) {
      message(`已删除 ${row.jobName}`, { type: "success" });
      onSearch();
    }
  }

  async function handlePause(row: SchedulerJob) {
    const { code } = await pauseSchedulerJob(row.id);
    if (code === 0) {
      message(`已暂停 ${row.jobName}`, { type: "success" });
      onSearch();
    }
  }

  async function handleResume(row: SchedulerJob) {
    const { code } = await resumeSchedulerJob(row.id);
    if (code === 0) {
      message(`已恢复 ${row.jobName}`, { type: "success" });
      onSearch();
    }
  }

  async function handleRun(row: SchedulerJob) {
    const { code } = await runSchedulerJob(row.id);
    if (code === 0) {
      message(`已触发 ${row.jobName}`, { type: "success" });
    }
  }

  function handleViewLog(row: SchedulerJob) {
    addDialog({
      title: `执行日志: ${row.jobName}`,
      width: "70%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      hideFooter: true,
      contentRenderer: () =>
        h(logView, {
          key: `${row.id}-${Date.now()}`,
          jobId: row.id,
          jobName: row.jobName
        } as any)
    });
  }

  function handleSizeChange(size: number) {
    pagination.pageSize = size;
    onSearch();
  }

  function handleCurrentChange(page: number) {
    pagination.currentPage = page;
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
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
    STATUS_PAUSED,
    STATUS_RUNNING
  };
}
