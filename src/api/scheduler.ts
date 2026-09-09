import { http } from "@/utils/http";

type Result<T = any> = {
  code: number;
  message: string;
  data?: T;
};

type ResultPage<T = any> = {
  code: number;
  message: string;
  data?: {
    list: T[];
    total: number;
    pageSize: number;
    currentPage: number;
  };
};

export type SchedulerJob = {
  id: number;
  jobName: string;
  jobGroup: string;
  description?: string;
  beanName: string;
  methodName: string;
  methodParams?: string;
  cron: string;
  misfirePolicy: number;
  concurrent: boolean;
  status: number; // 1=PAUSED 2=RUNNING
  createTime: string;
  updateTime: string;
};

export type SchedulerLog = {
  id: number;
  jobId: number;
  jobName: string;
  jobGroup: string;
  beanName: string;
  methodName: string;
  methodParams?: string;
  status: number; // 0=success 1=failure
  errorMessage?: string;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
};

/** 查询定时任务列表（分页） */
export const listSchedulerJobs = (data: object) =>
  http.request<ResultPage<SchedulerJob>>("get", "/admin/scheduler-job", {
    params: data
  });

/** 新增定时任务 */
export const addSchedulerJob = (data: object) =>
  http.request<Result<number>>("post", "/admin/scheduler-job/add", { data });

/** 更新定时任务 */
export const updateSchedulerJob = (id: number, data: object) =>
  http.request<Result>("put", `/admin/scheduler-job/update/${id}`, { data });

/** 删除定时任务（软删除 + 取消调度） */
export const deleteSchedulerJob = (id: number) =>
  http.request<Result>("delete", `/admin/scheduler-job/${id}`);

/** 暂停定时任务 */
export const pauseSchedulerJob = (id: number) =>
  http.request<Result>("post", `/admin/scheduler-job/pause/${id}`);

/** 恢复定时任务 */
export const resumeSchedulerJob = (id: number) =>
  http.request<Result>("post", `/admin/scheduler-job/resume/${id}`);

/** 立即触发一次定时任务 */
export const runSchedulerJob = (id: number) =>
  http.request<Result>("post", `/admin/scheduler-job/run/${id}`);

/** 查询任务执行日志 */
export const listSchedulerLogs = (data: object) =>
  http.request<ResultPage<SchedulerLog>>("get", "/admin/scheduler-job/log", {
    params: data
  });

/** 校验 cron 表达式 */
export const validateCron = (cron: string) =>
  http.request<Result<boolean>>("post", "/admin/scheduler-job/validate-cron", {
    data: { cron }
  });
