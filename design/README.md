# design/

The design surface for inhology — the durable, human-readable expression of what
the product is and how it behaves, kept diffable and reviewable independently of
the implementation. Where a fact is also encoded in code (the Prisma schema, the
NestJS controllers, the Next.js pages), the artifacts here are **derived from**
that code and cite it.

## Contents

| Artifact | What it is |
|---|---|
| [`spec/`](./spec/) | **Product specification** — purpose, actors, functional requirements, policies, non-functional requirements, and the visual-design system. Split across a few grouped files; [`spec/README.md`](./spec/README.md) is the entry point. **This is the source of truth for intent** (it supersedes the former root `SPEC.md`). |
| [`glossary.csv`](./glossary.csv) | **Glossary** — the canonical, machine-readable list of domain terms (`term,korean,category,definition`). |
| [`domain-model/`](./domain-model/) | **Domain model** — Mermaid ER diagrams: a full overview plus one file per aggregate root (Post, Category, Tag, Series, Comment). Derived from `apps/api/prisma/schema.prisma`. |
| [`openapi.yaml`](./openapi.yaml) | **API contract** — OpenAPI 3.1 description of all HTTP endpoints, auth, request/response schemas, and error codes. Derived from `apps/api` (controllers, DTOs, services). |
| [`ui-design/`](./ui-design/) | **UI mockups** — one standalone HTML file per user-facing screen (12 total) plus an [`index.html`](./ui-design/index.html). Deliberately **bare wireframes**: minimal inline CSS (a single hairline border, system font, one foreground/background pair, auto light/dark), no color/hover/shadow — structure and copy only, with an explanation block on each screen. Derived from the Next.js pages. |
| [`validate.py`](./validate.py) | **Consistency linter** — checks the artifacts against each other and the Prisma schema, in dependency order (glossary → domain-model → openapi + ui-design). Stdlib only. |

## Validation

Run the linter to check the artifacts stay consistent with each other and with
the code (`apps/api/prisma/schema.prisma` is the ground truth):

```bash
python3 design/validate.py        # full report
python3 design/validate.py -q     # failures + summary only
```

It verifies, layer by layer: the glossary parses and its domain terms match the
aggregate roots; the domain-model ER diagrams and enums match the Prisma schema;
the OpenAPI spec is 3.1, exposes every resource/aggregate, has unique
operationIds, no dangling `$ref`s, and enums that match the schema; and the UI
mockups all exist, link to the index, avoid `<footer>`, and pull no external
assets. Exit code is non-zero on any error, so it drops into CI easily.

## Conventions

- **Spec is intent, not implementation.** No framework names or file paths inside
  `spec/` prose — those belong in the repo [`README.md`](../README.md).
- **Derived artifacts cite their source.** The domain model and API contract track
  `apps/api`; the UI mockups track `apps/web`. When the code changes, update these.
- **Diagrams are Mermaid** (`erDiagram`) so they render on GitHub and in most
  Markdown viewers.
- **Mockups are self-contained.** No external assets, fonts, or network requests —
  open any file directly in a browser.
