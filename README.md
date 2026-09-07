# ArchForgeAdmin

English | [中文](./README.zh-CN.md)

[![CI](https://github.com/sofn/ArchForgeAdmin/actions/workflows/linter.yml/badge.svg)](https://github.com/sofn/ArchForgeAdmin/actions/workflows/linter.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

ArchForge **admin UI** (not a stock vue-pure-admin template). It talks to **`server-admin` on port 8080** with **sa-token** (`Authorization: Bearer <token>`).

The shell is [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 7.x (Vue 3.5 + Vite 8 + Element Plus + Pinia + Vue Router 5). APIs and permissions are wired to ArchForge.

Docs: [https://archforge.lesofn.com](https://archforge.lesofn.com)

## Five-repo map

```
archforge/
├── ArchForge/          # backend + contracts :8080 / :8081
│   └── spec/           # openapi.yaml · enums.yaml
├── ArchForgeAdmin/     # this repo :8848 → :8080
└── ArchForgeWeb/       # C-end :3000 → :8081
```

| Item | Value |
|------|-------|
| This repo | Admin UI, dev port **8848** |
| Backend | `../ArchForge` → `archforge-server-admin` **:8080** |
| Dev proxy | Vite `/api` → `http://localhost:8080` |
| Auth | sa-token; cookie `authorized-token` |
| Success body | `{ code, message, data }` (`code === 0`) |
| Contract | `../ArchForge/spec/openapi.yaml` |

Do not point this app at `server-web` :8081. The C-end client is `ArchForgeWeb`.

## Architecture

```mermaid
flowchart LR
  U(["B-end operators"]) --> B["Browser<br/>Vue 3 + Element Plus"]
  subgraph admin["ArchForgeAdmin — this repo :8848"]
    VIEWS["views/* pages<br/>system · monitor · meta-table"]
    HTTP["utils/http — axios PureHttp<br/>ApiResponse<T> · token refresh queue"]
  end
  SA["server-admin :8080<br/>sa-token · {code,message,data}"]
  SPEC["ArchForge/spec/<br/>openapi.yaml · enums.yaml"]

  B --> VIEWS --> HTTP -->|"/api (vite proxy)"| SA
  SPEC -.|"gen:api → schema.d.ts"| HTTP
  SPEC -.|"enums.generated.ts"| VIEWS
```

## Contract-first types & tests

API and enum types are **generated, never hand-written**:

```bash
pnpm gen:api   # src/types/schema.d.ts from ../ArchForge/spec/openapi.yaml
```

- `src/types/schema.d.ts` — request/response shapes from the OpenAPI contract
- `src/types/enums.generated.ts` — shared enums + labels from `enums.yaml`
- `src/utils/http/types.d.ts` — unified `ApiResponse<T>` envelope; every api module reuses it instead of re-declaring `{code,message,data}`
- CI regenerates both files and fails on drift (`sdk-sync`)

Frontend tests run on **vitest + happy-dom + MSW**:

```bash
pnpm test   # menuType utils, v-perms directive, httpClient error mapping
```

Test data comes from `src/test/factories/userFactory.ts` — valid-by-default payloads, override only what you assert on.

## Quick start

```bash
# Backend (ArchForge repo)
./gradlew :archforge-server-admin:bootRun   # :8080

# This repo
pnpm install
pnpm dev          # http://localhost:8848
```

Node.js >= 22, pnpm >= 9. Default login `admin / admin123` (captcha on in `dev`).

## Scripts

```bash
pnpm dev              # Dev (8848)
pnpm build            # Production build
pnpm build:staging    # Staging build
pnpm typecheck        # TypeScript
pnpm lint             # ESLint + Prettier + Stylelint
pnpm preview          # Preview production build
```

## Layout

```
src/api/           # HTTP (baseURL: /api)
src/views/         # Pages (system / monitor / meta-table / …)
src/store/modules/ # Pinia
src/utils/http/    # Axios + sa-token refresh
src/directives/    # v-perms
```

Agent notes: [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md).

## Docker

```bash
docker build -t archforge-admin .
docker run -dp 8080:80 --name archforge-admin archforge-admin
```

Nginx in the image listens on container port 80; that is not the backend :8080.

## License

MIT. UI skeleton from vue-pure-admin (MIT).
