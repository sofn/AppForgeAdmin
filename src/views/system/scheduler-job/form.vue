<script setup lang="ts">
import { ref, reactive } from "vue";
import { message } from "@/utils/message";
import { validateCron } from "@/api/scheduler";
import type { FormRules } from "element-plus";
import type { SchedulerFormProps } from "./utils/types";

const props = withDefaults(defineProps<SchedulerFormProps>(), {
  formInline: () => ({
    jobName: "",
    jobGroup: "DEFAULT",
    description: "",
    beanName: "",
    methodName: "",
    methodParams: "",
    cron: "",
    misfirePolicy: 1,
    concurrent: false
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const cronChecking = ref(false);

const formRules = reactive<FormRules>({
  jobName: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  jobGroup: [{ required: true, message: "请输入任务分组", trigger: "blur" }],
  beanName: [
    { required: true, message: "请输入 Spring Bean 名称", trigger: "blur" }
  ],
  methodName: [
    { required: true, message: "请输入要调用的方法名", trigger: "blur" }
  ],
  cron: [{ required: true, message: "请输入 Cron 表达式", trigger: "blur" }]
});

async function checkCron() {
  if (!newFormInline.value.cron) {
    message("请先输入 Cron 表达式", { type: "warning" });
    return;
  }
  cronChecking.value = true;
  try {
    const { code, data } = await validateCron(newFormInline.value.cron);
    if (code === 0 && data) {
      message("Cron 表达式合法", { type: "success" });
    } else {
      message("Cron 表达式不合法", { type: "error" });
    }
  } finally {
    cronChecking.value = false;
  }
}

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="任务名称" prop="jobName">
      <el-input
        v-model="newFormInline.jobName"
        clearable
        placeholder="例如: demo-hello"
      />
    </el-form-item>

    <el-form-item label="任务分组" prop="jobGroup">
      <el-input
        v-model="newFormInline.jobGroup"
        clearable
        placeholder="DEFAULT"
      />
    </el-form-item>

    <el-form-item label="描述">
      <el-input
        v-model="newFormInline.description"
        clearable
        placeholder="任务用途说明"
      />
    </el-form-item>

    <el-form-item label="Bean 名称" prop="beanName">
      <el-input
        v-model="newFormInline.beanName"
        clearable
        placeholder="Spring Bean 名称（如 demoSchedulerJob）"
      />
    </el-form-item>

    <el-form-item label="方法名" prop="methodName">
      <el-input
        v-model="newFormInline.methodName"
        clearable
        placeholder="目标方法名（如 helloWorld）"
      />
    </el-form-item>

    <el-form-item label="方法参数">
      <el-input
        v-model="newFormInline.methodParams"
        type="textarea"
        :rows="2"
        placeholder='JSON 数组，例如: ["foo", 42, true]，无参留空'
      />
    </el-form-item>

    <el-form-item label="Cron 表达式" prop="cron">
      <div class="flex w-full gap-2">
        <el-input
          v-model="newFormInline.cron"
          clearable
          placeholder="0/30 * * * * ?"
          class="flex-1"
        />
        <el-button :loading="cronChecking" @click="checkCron">校验</el-button>
      </div>
    </el-form-item>

    <el-form-item label="错过策略">
      <el-select v-model="newFormInline.misfirePolicy">
        <el-option :value="1" label="DoNothing（默认）" />
        <el-option :value="2" label="FireAndProceed（立即补偿）" />
        <el-option :value="3" label="IgnoreMisfires（忽略）" />
      </el-select>
    </el-form-item>

    <el-form-item label="并发执行">
      <el-switch v-model="newFormInline.concurrent" />
    </el-form-item>
  </el-form>
</template>
