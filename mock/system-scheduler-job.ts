// Mock scheduler-job endpoints so the UI works without a real backend.
// Mirrors the response envelope of the real backend (/admin/scheduler-job/*).
import { defineFakeRoute } from "vite-plugin-fake-server/client";

type Job = {
  id: number;
  jobName: string;
  jobGroup: string;
  description: string;
  beanName: string;
  methodName: string;
  methodParams: string;
  cron: string;
  misfirePolicy: number;
  concurrent: boolean;
  status: number; // 1=PAUSED 2=RUNNING
  createTime: string;
  updateTime: string;
};

type Log = {
  id: number;
  jobId: number;
  jobName: string;
  jobGroup: string;
  beanName: string;
  methodName: string;
  methodParams: string;
  status: number;
  errorMessage: string | null;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
};

let nextJobId = 2;
let nextLogId = 1;
const jobs: Job[] = [
  {
    id: 1,
    jobName: "demo-hello",
    jobGroup: "DEFAULT",
    description: "Demo: prints hello every 30s",
    beanName: "demoSchedulerJob",
    methodName: "helloWorld",
    methodParams: "",
    cron: "0/30 * * * * ?",
    misfirePolicy: 1,
    concurrent: false,
    status: 1,
    createTime: "2026-04-27 23:00:00",
    updateTime: "2026-04-27 23:00:00"
  }
];
const logs: Log[] = [];

function now(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export default defineFakeRoute([
  {
    url: "/admin/scheduler-job",
    method: "get",
    response: ({ query }) => {
      const jobName = String(query?.jobName ?? "");
      const status = query?.status;
      const filtered = jobs.filter(
        j =>
          (!jobName || j.jobName.includes(jobName)) &&
          (status === null ||
            status === undefined ||
            String(j.status) === String(status))
      );
      const currentPage = Number(query?.currentPage ?? 1);
      const pageSize = Number(query?.pageSize ?? 10);
      const start = (currentPage - 1) * pageSize;
      return {
        code: 0,
        message: "操作成功",
        data: {
          list: filtered.slice(start, start + pageSize),
          total: filtered.length,
          pageSize,
          currentPage
        }
      };
    }
  },
  {
    url: "/admin/scheduler-job/add",
    method: "post",
    response: ({ body }) => {
      const id = nextJobId++;
      jobs.push({
        id,
        jobName: body.jobName,
        jobGroup: body.jobGroup ?? "DEFAULT",
        description: body.description ?? "",
        beanName: body.beanName,
        methodName: body.methodName,
        methodParams: body.methodParams ?? "",
        cron: body.cron,
        misfirePolicy: body.misfirePolicy ?? 1,
        concurrent: body.concurrent ?? false,
        status: 1,
        createTime: now(),
        updateTime: now()
      });
      return { code: 0, message: "操作成功", data: id };
    }
  },
  {
    url: "/admin/scheduler-job/update/:id",
    method: "put",
    response: ({ params, body }) => {
      const id = Number(params.id);
      const idx = jobs.findIndex(j => j.id === id);
      if (idx < 0) return { code: 1, message: "not found" };
      jobs[idx] = { ...jobs[idx], ...body, updateTime: now() };
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/admin/scheduler-job/:id",
    method: "delete",
    response: ({ params }) => {
      const id = Number(params.id);
      const idx = jobs.findIndex(j => j.id === id);
      if (idx >= 0) jobs.splice(idx, 1);
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/admin/scheduler-job/pause/:id",
    method: "post",
    response: ({ params }) => {
      const id = Number(params.id);
      const j = jobs.find(j => j.id === id);
      if (j) {
        j.status = 1;
        j.updateTime = now();
      }
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/admin/scheduler-job/resume/:id",
    method: "post",
    response: ({ params }) => {
      const id = Number(params.id);
      const j = jobs.find(j => j.id === id);
      if (j) {
        j.status = 2;
        j.updateTime = now();
      }
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/admin/scheduler-job/run/:id",
    method: "post",
    response: ({ params }) => {
      const id = Number(params.id);
      const j = jobs.find(j => j.id === id);
      if (j) {
        const startedAt = now();
        logs.unshift({
          id: nextLogId++,
          jobId: j.id,
          jobName: j.jobName,
          jobGroup: j.jobGroup,
          beanName: j.beanName,
          methodName: j.methodName,
          methodParams: j.methodParams,
          status: 0,
          errorMessage: null,
          durationMs: 12,
          startedAt,
          finishedAt: startedAt
        });
      }
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/admin/scheduler-job/log",
    method: "get",
    response: ({ query }) => {
      const jobId = Number(query?.jobId);
      const filtered = logs.filter(l => l.jobId === jobId);
      const currentPage = Number(query?.currentPage ?? 1);
      const pageSize = Number(query?.pageSize ?? 10);
      const start = (currentPage - 1) * pageSize;
      return {
        code: 0,
        message: "操作成功",
        data: {
          list: filtered.slice(start, start + pageSize),
          total: filtered.length,
          pageSize,
          currentPage
        }
      };
    }
  },
  {
    url: "/admin/scheduler-job/validate-cron",
    method: "post",
    response: ({ body }) => {
      // simple heuristic: 6-7 space-separated tokens with ? or digits
      const cron = body?.cron ?? "";
      const valid =
        /^(\S+\s+){5,6}\S+$/.test(cron) && !/^[a-z\-]+$/i.test(cron);
      return { code: 0, message: "操作成功", data: valid };
    }
  }
]);
