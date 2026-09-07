# AGENTS.md

## Git Commit Rules

- Do NOT append `Co-Authored-By` lines to commit messages.

## Project Context

This repository is the **ArchForge admin UI** (three independent Git repositories, cloned side by side, no submodules). For the machine-readable project map, read `../ArchForge/repos.yaml` first.

```
archforge/
├── ArchForge/          # backend + contracts (server-admin :8080 + server-web :8081)
│   └── spec/           # openapi.yaml, enums.yaml, schemas/ — the API contract
├── ArchForgeWeb/       # C-end web client (Next.js) — consumes server-web :8081
└── ArchForgeAdmin/     # admin client (this repo) — consumes server-admin :8080
```

- This repo is the **admin client**, based on `vue-pure-admin` 7.x (Vue 3.5 + Vite 8 + Element Plus + Pinia + vue-router 5). It is the ArchForge console, not an unmodified template.
- Backend: `../ArchForge` → `server-admin` (port **8080**). Do **not** modify backend source from this repository.
- Auth: **sa-token** (`Authorization: Bearer <token>`). Cookie `authorized-token`, localStorage `user-info`.
- Contracts are owned by `../ArchForge` (`spec/openapi.yaml` OpenAPI 3.1). If an API does not fit, raise the change there — do not hack around it here.
- Scope of this repository (`can_modify` in `repos.yaml`): admin-ui only.
- Never introduce Git submodules.

## Build commands

Requires Node.js >= 22 and pnpm >= 9.

| Command | What |
|---------|------|
| `pnpm dev` | Vite dev server — **http://localhost:8848** |
| `pnpm build` | Production build |
| `pnpm build:staging` | Staging build |
| `pnpm typecheck` | `vue-tsc --noEmit` |
| `pnpm lint` | ESLint + Prettier + Stylelint |
| `pnpm preview` | Preview production build |

## Directory

```
src/api/              # Axios wrappers (user.ts, system.ts, dict.ts, …)
src/views/            # Pages: system/, monitor/, meta-table/, login/, …
src/components/       # ReDialog, ReIcon, RePureTableBar, …
src/store/modules/    # Pinia: user, permission, app, …
src/utils/http/       # Axios instance, token refresh
src/utils/auth.ts     # sa-token cookie helpers
src/router/
src/layout/
src/directives/       # v-perms, …
locales/
mock/                 # vite-plugin-fake-server (dev only)
```

New feature: `src/views/<feature>/` + `src/api/<feature>.ts`.

## API base

- Client `baseURL`: **`/api`**
- Vite proxy: `/api` → `http://localhost:8080` (rewrites the prefix away)
- Live admin paths: `/admin/*`, `/auth/*`. Leftover `/system/dict` is migration backlog. Do not call deleted `/system/menu` or `/system/role`.

## Response format

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {}
}
```

- `code === 0` is success.
- Paginated `data`: `{ list, total, pageSize, currentPage }`.
- Auth failures may be RFC 9457 ProblemDetail (`401` / `403`). That is not the success envelope.

See `CLAUDE.md` for stack details.
