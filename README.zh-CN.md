# ArchForgeAdmin

[English](./README.md) | 中文

[![CI](https://github.com/sofn/ArchForgeAdmin/actions/workflows/linter.yml/badge.svg)](https://github.com/sofn/ArchForgeAdmin/actions/workflows/linter.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

ArchForge 的 **管理端 UI**（不是裸的 vue-pure-admin 模板）。对接后端 **`server-admin`（端口 8080）**，认证为 **sa-token**（`Authorization: Bearer <token>`）。

界面基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 7.x（Vue 3.5 + Vite 8 + Element Plus + Pinia + Vue Router 5），业务接口与权限已接到 ArchForge。

文档：[https://archforge.lesofn.com](https://archforge.lesofn.com)

## 五仓地图

```
archforge/
├── ArchForge/          # 后端 + 契约 :8080 / :8081
│   └── spec/           # openapi.yaml · enums.yaml
├── ArchForgeAdmin/     # 本仓库 :8848 → :8080
└── ArchForgeWeb/       # C 端 :3000 → :8081
```

| 项 | 值 |
| --- | --- |
| 本仓库 | 管理端前端，开发端口 **8848** |
| 后端 | `../ArchForge` → `archforge-server-admin` **:8080** |
| 开发代理 | Vite `/api` → `http://localhost:8080` |
| 认证 | sa-token；Cookie `authorized-token` |
| 成功响应 | `{ code, message, data }`，`code === 0` 为成功 |
| 契约 | `../ArchForge/spec/openapi.yaml` |

不要把本仓库指到 `server-web` :8081。C 端在 `ArchForgeWeb`。

## 架构

```mermaid
flowchart LR
  U(["B 端运营人员"]) --> B["浏览器<br/>Vue 3 + Element Plus"]
  subgraph admin["ArchForgeAdmin —— 本仓库 :8848"]
    VIEWS["views/* 页面<br/>system · monitor · meta-table"]
    HTTP["utils/http —— axios PureHttp<br/>ApiResponse<T> · token 刷新队列"]
  end
  SA["server-admin :8080<br/>sa-token · {code,message,data}"]
  SPEC["ArchForge/spec/<br/>openapi.yaml · enums.yaml"]

  B --> VIEWS --> HTTP -->|"/api（vite 代理）"| SA
  SPEC -.|"gen:api → schema.d.ts"| HTTP
  SPEC -.|"enums.generated.ts"| VIEWS
```

## 契约先行：生成类型与测试

API 与枚举类型**全部生成，不手写**：

```bash
pnpm gen:api   # src/types/schema.d.ts，来自 ../ArchForge/spec/openapi.yaml
```

- `src/types/schema.d.ts` —— OpenAPI 契约中的请求/响应结构
- `src/types/enums.generated.ts` —— 共享枚举与文案（enums.yaml）
- `src/utils/http/types.d.ts` —— 统一 `ApiResponse<T>` envelope；所有 api 模块复用它，不再重复声明 `{code,message,data}`
- CI 重新生成两个文件并校验漂移（`sdk-sync`）

前端测试跑在 **vitest + happy-dom + MSW** 上：

```bash
pnpm test   # menuType 工具、v-perms 指令、httpClient 错误映射
```

测试数据来自 `src/test/factories/userFactory.ts` —— 默认值即可用的载荷，只覆盖断言需要的字段。

## 快速开始

```bash
# 后端（ArchForge 仓库）
./gradlew :archforge-server-admin:bootRun   # :8080

# 本仓库
pnpm install
pnpm dev          # http://localhost:8848
```

Node.js >= 22，pnpm >= 9。默认登录 `admin / admin123`（`dev` 开验证码）。

## 常用脚本

```bash
pnpm dev              # 开发（8848）
pnpm build            # 生产构建
pnpm build:staging    # 预发构建
pnpm typecheck        # TypeScript
pnpm lint             # ESLint + Prettier + Stylelint
pnpm preview          # 预览生产包
```

## 目录

```
src/api/           # 接口（baseURL: /api）
src/views/         # 页面（system / monitor / meta-table / …）
src/store/modules/ # Pinia
src/utils/http/    # Axios + sa-token 刷新
src/directives/    # v-perms 等
```

更细的 agent 说明见 [AGENTS.md](AGENTS.md) 与 [CLAUDE.md](CLAUDE.md)。

## Docker

```bash
docker build -t archforge-admin .
docker run -dp 8080:80 --name archforge-admin archforge-admin
```

镜像里的 Nginx 仍监听容器 80 端口；这与后端 8080 不是一回事。

## 许可证

MIT。UI 骨架来自 vue-pure-admin（MIT）。
