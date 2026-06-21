# inhology

A general blog by **Inho Jeong** — written as both a developer and a person.
The name is a play on *inho* + *anthology*: a personal selection of writing, code, and thought.

## Stack

- **[pnpm](https://pnpm.io) workspaces** monorepo (`apps/*`, `packages/*`) with **[Turborepo](https://turborepo.com)** as the task runner.
- **`apps/web`** → `@inhology/web` — [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind v4, `src/` dir, `@/*` import alias).
- **`apps/api`** → `@inhology/api` — [NestJS 11](https://nestjs.com) (TypeScript, strict mode).
- Toolchain pinned by **[mise](https://mise.jdx.dev)** (`mise.toml`): Node 22, pnpm 11.8.0. Run `mise install` once to match versions.

## Layout

```
inhology/
├── apps/
│   ├── web/        # Next.js frontend  (@inhology/web)
│   └── api/        # NestJS backend    (@inhology/api)
├── packages/            # shared packages (tbd)
├── turbo.json           # task pipeline: build / dev / lint / test / type-check
├── tsconfig.base.json
├── pnpm-workspace.yaml  # workspace globs + pnpm supply-chain settings
├── mise.toml            # pinned toolchain (node, pnpm)
└── package.json         # root scripts proxy to turbo
```

## Local development

```bash
colima start && docker compose up -d   # start Postgres (see Commands below)
pnpm install                              # install all workspace deps
pnpm --filter @inhology/api db:seed        # seed categories/tags/sample post
pnpm dev                                   # run web + api together
```

- **web** (Next.js) → http://localhost:3000
- **api** (NestJS) → http://localhost:4000 (web reads it via `API_URL`)

## Commands

Run from the repo root — Turbo fans each task out to every workspace that defines it.

```bash
pnpm install        # install all workspace deps
pnpm dev            # run web (:3000) + api (:4000) together
pnpm build          # build all apps
pnpm lint           # lint all apps
pnpm type-check     # type-check all apps
pnpm test           # run tests
```

Target a single app with a Turbo filter:

```bash
pnpm exec turbo run dev --filter=@inhology/web
pnpm exec turbo run build --filter=@inhology/api
```

## Supply-chain hardening (pnpm)

pnpm is used partly for its security defaults. Configured in `pnpm-workspace.yaml`:

- **Install scripts blocked by default.** Only packages listed under `allowBuilds: { <pkg>: true }`
  may run `postinstall`/build scripts (currently `sharp`, `unrs-resolver` — both legitimate
  native-binary builds). When a new dependency's script is blocked, pnpm reports it; vet it,
  then `pnpm approve-builds <pkg>` to allow.
- **Strict, non-flat `node_modules`.** Code can only import packages it explicitly declares —
  no "phantom dependencies" (transitive deps are not importable). Like Gradle `implementation` scoping.
- **Content-addressed store** with integrity hashes; shared across projects (like `~/.m2`).
- **`minimumReleaseAge`** (currently disabled, see the comment in `pnpm-workspace.yaml`):
  refuses just-published versions to dodge "compromised hours ago" attacks. Off for now because
  the freshly-scaffolded toolchain pins versions younger than a useful window.

## Notes

- **Next.js 16 has breaking changes** vs earlier versions. See `apps/web/AGENTS.md` — read the relevant guide under `apps/web/node_modules/next/dist/docs/` before writing Next.js code.
- **TLS / cert troubleshooting** (this machine): if Node HTTPS fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`
  (pnpm installs, fetch, etc.), Homebrew's `openssl@3` cert link is missing. Fix it — don't disable `strict-ssl`:
  ```bash
  brew postinstall openssl@3   # recreates etc/openssl@3/cert.pem -> ../ca-certificates/cert.pem
  ```
