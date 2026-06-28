# inhology — Product Specification

The **what** and the **why** of inhology: its purpose, the features it must
provide, and the rules that govern them. This document is intentionally free of
implementation detail — no frameworks, file paths, or code. For *how* it is
built, see [`README.md`](./README.md); for *how* it is deployed, see
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

When behaviour and this document disagree, treat it as a bug in one of them and
reconcile — this is the source of truth for intent.

---

## 1. Purpose & Vision

inhology is the personal blog of **Inho Jeong** — a single author writing as
both a developer and a person. The name plays on *inho* + *anthology*: a curated
selection of writing, code, and thought.

It is **not** a multi-tenant publishing platform. It is a focused, single-author
site optimised for: writing comfortably, publishing deliberately, organising
content meaningfully, and letting readers respond.

### Goals
- A frictionless private writing-and-publishing loop for one author.
- A clean, fast, readable public site.
- Lightweight reader engagement (comments) that stays under the author's control.
- Self-hostable on modest hardware (a home-server VM).

### Non-Goals
- Multiple authors, author accounts, or role hierarchies beyond *author* vs *reader*.
- A WYSIWYG editor (content is authored in Markdown).
- Monetisation, ads, paywalls, or newsletters.
- Social-network features (follows, likes, reader profiles).
- Real-time collaboration.

---

## 2. Actors

| Actor | Description | How they're identified |
|---|---|---|
| **Author** | Inho. The sole privileged user. Creates, edits, deletes, and publishes content; moderates comments. | Authenticates via the homelab SSO (Authentik OIDC). There is exactly one. |
| **Reader** | Anyone on the public internet. Reads published content and submits comments. | Anonymous. No accounts, no login. |

There is no registration, no reader account, and no second author. Any future
multi-author need is explicitly out of scope for this version.

---

## 3. Domain Concepts

- **Post** — the central unit of content. A Markdown article with a title, a
  URL slug, optional summary, and a publication state. The aggregate everything
  else hangs off of.
- **Category** — a broad, mutually-exclusive bucket (e.g. *개발 / 일상 / 에세이*).
  Every post belongs to **exactly one**.
- **Tag** — a cross-cutting topic label. A post may have **many**; a tag spans
  many posts.
- **Series** — an ordered collection of posts telling a longer story across
  multiple parts. A post belongs to **at most one** series and has a position
  within it. Optional.
- **Comment** — a reader's response attached to a published post. May reply to
  another comment (threaded). Always moderated.

---

## 4. Functional Requirements

### 4.1 Posts (Author)
- Create a post with: title, slug, Markdown body, category (required), optional
  summary, optional cover image, optional tags, optional series + position.
- Save a post as a **draft** or **publish** it.
- Edit any field of an existing post, including changing its publication state.
- Delete a post.
- View a list of **all** posts — drafts included — with their current state
  clearly distinguished.

### 4.2 Posts (Reader)
- Browse a list of published posts, newest first.
- Read a single published post by its slug.
- Navigate to a post's category, its tags, and its series.
- Reading time is shown when available.

### 4.3 Taxonomy
- Browse all posts within a category.
- Browse all posts carrying a tag.
- Category and tag pages list only published posts.

### 4.4 Series
- Author can create, edit, and delete a series (title, slug, optional
  description, optional cover image).
- Author can assign a post to a series and set its order.
- Readers can browse a series index and a single series page that lists its
  posts **in author-defined order**.
- A post page links to its series when it belongs to one.

### 4.5 Comments (Reader)
- Submit a comment on a published post with: name (required), comment body
  (required), email (optional).
- Optionally reply to an existing comment on the same post.
- See only **approved** comments on a post.
- Receive clear feedback that a submission was received and is awaiting review.

### 4.6 Comments (Author / Moderation)
- View comments filtered by state: pending, approved, spam.
- Approve a pending comment, mark a comment as spam, or return it to pending.
- Delete a comment.
- See which post each comment belongs to.

---

## 5. Policies & Business Rules

These are the non-negotiable rules. They hold regardless of how the system is built.

### 5.1 Content visibility
- **Drafts are private.** A post that is not published must never be readable,
  listed, or discoverable through any public surface — not on lists, not by
  direct slug, not via category/tag/series pages. Draft protection is a security
  requirement, not a convenience.
- Only the author, authenticated, may see drafts.
- Public listings are ordered newest-first by publication date.

### 5.2 Identifiers
- Every post, category, tag, and series has a **unique, URL-safe slug**.
- Slugs may contain non-ASCII characters (e.g. Hangul). The system must handle
  them correctly end-to-end in URLs.
- Attempting to reuse an existing slug is rejected.

### 5.3 Relationships & integrity
- A post must always have exactly one category.
- A post's series membership is optional and may be detached without deleting the post.
- Deleting a post deletes its comments.
- Deleting a comment deletes its replies.
- A reply may only attach to a comment **on the same post**.

### 5.4 Comments
- Comments may only be submitted on **published** posts.
- Every new comment starts in the **pending** state and is invisible to the
  public until the author approves it. There is no auto-approval.
- A commenter's **email is never exposed publicly** — it exists only for the
  author's moderation and notification purposes.
- Comment body and name have length limits to bound abuse (body and name are
  capped; email, when given, must be a valid address).

### 5.5 Authorisation
- All create/edit/delete/moderate actions are restricted to the **author**.
- The author authenticates through the **homelab single sign-on (Authentik OIDC)**.
  The web app gates the admin area on a valid SSO session; calls from web to the
  API carry an **internal shared token** (web↔api only, on the cluster's private
  network — the API is not publicly exposed). Both credentials are kept out of
  version control. (See `homelab/sso.md`.)
- Reading published content and submitting a (pending) comment are the only
  actions available without authentication.

### 5.6 Data ownership
- All content and data are self-hosted and owned by the author. No third-party
  service is required to read or write content.

---

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Public pages should render quickly on modest hardware; the public read path is the priority. |
| **Hosting** | Must be self-hostable on a single home-server VM with limited resources. |
| **Security** | Secrets never committed; drafts never leak; reader email never exposed; admin actions gated by the shared secret. |
| **Backup** | Content lives in a database that can be backed up and restored. Loss of the host must not mean loss of writing. |
| **Accessibility & readability** | Clean typography, dark-mode support, mobile-friendly layout. |
| **Internationalisation** | Korean-first content and UI; must not break on non-ASCII titles, slugs, or comments. |
| **Maintainability** | A single author should be able to operate and update the whole system unaided. |

---

## 7. UI & Visual Design

The visual language is part of the product, so it lives here. This section is
deliberately at the *intent* altitude — it defines tokens, structure, and shared
patterns, not class names or markup. When a screen needs a new pattern, add it
here first so the site stays consistent.

### 7.1 Design principles
- **Reading-first, content over chrome.** The article is the interface; UI
  recedes. No sidebars, carousels, or decorative imagery competing with text.
- **Minimal and quiet.** A single neutral palette, one accent only where meaning
  requires it (success/error feedback). Restraint over richness.
- **Calm by default.** Generous whitespace and vertical rhythm; nothing blinks,
  slides, or demands attention.

### 7.2 Layout & structure
- **One centred column** of comfortable reading width (~672px max) with
  consistent horizontal padding; the same column governs every public page.
- **Generous vertical rhythm** — large top/bottom breathing room around the
  article; clear separation between meta, body, and comments.
- **A persistent site header** on every page: the brand wordmark (links home)
  plus a small primary nav (currently *홈*, *시리즈*).
- **Mobile-first and responsive.** The single-column layout collapses cleanly;
  multi-field rows (e.g. the comment form) stack on narrow viewports.

### 7.3 Colour & theme
- **Two themes, light and dark**, selected automatically from the OS preference.
  There is **no manual theme toggle** — the system setting is honoured.
- Colour is expressed as **role tokens**, not raw values, so both themes derive
  from the same set:

  | Token | Role | Light | Dark |
  |---|---|---|---|
  | `background` | Page surface | near-white | near-black |
  | `foreground` | Primary text | near-black | off-white |
  | `muted` | Secondary text, meta, timestamps | mid grey | mid grey |
  | `subtle` | Chip / card / code backgrounds | faint grey wash | faint light wash |
  | `border` | Hairline dividers, rules, field borders | light grey | dark grey |
  | `strong` | Primary button surface (inverts on theme) | foreground | foreground |

- **Accent colour is reserved for feedback only**: success (green) and error
  (red) flash messages. It is never used decoratively.

### 7.4 Typography
- **Sans-serif for UI and body; monospace for code** (inline and blocks).
- A small, fixed type scale: *page title* (largest, bold, tight tracking) →
  *list/section title* → *body* → *meta* (smallest, muted). Headings inside
  rendered Markdown step down within the body.
- **Korean-first.** Type, line-height, and wrapping must read well for Hangul;
  nothing may break on non-ASCII titles, slugs, or comment text.

### 7.5 Shared UI patterns
These are the recurring building blocks; reuse them rather than inventing new ones.

- **Meta row** — a small, muted line carrying *category · publish date · reading
  time (N분)*. Reading time and tags appear only when present.
- **Category chip** — a pill-shaped, subtle-background link; a post has exactly one.
- **Tag** — an inline `#name` link in muted text; zero or more, wrap freely.
- **Series banner** — a bordered card on a post that belongs to a series, naming
  the series and the post's position (*N편*), linking to the series page.
- **Primary button** — solid `strong` surface with inverted text; one per form.
- **Form field** — bordered input/textarea with placeholder; fields stack on
  mobile, may sit in a row on wider screens.
- **Back link** — a quiet "← 목록으로" affordance returning to the list.
- **Empty state** — a single muted sentence, never a blank screen (e.g. a post
  list with nothing to show still says so).
- **Flash message** — a coloured, dismissible-feeling banner confirming an action
  (success) or reporting a problem (error), shown after a form submission.

### 7.6 Copy & microcopy
- **All reader-facing copy is Korean**, in a polite, personal register (존댓말).
- **Dates** render in long Korean form (`YYYY년 M월 D일`); reading time as *N분*.
- Microcopy is reassuring and specific. Required, fixed strings:
  - Empty post list → *"아직 발행된 글이 없습니다."*
  - No comments yet → *"첫 댓글을 남겨보세요."*
  - Comment accepted → *"댓글이 등록되었습니다. 검토 후 공개됩니다."* (reflects the
    moderation policy in §5.4 — every comment is pending until approved).
  - Comment rejected → *"등록에 실패했습니다. 입력값을 확인해 주세요."*
- The email field is always labelled as **optional and private**, reinforcing §5.4.

### 7.7 Accessibility
- Meet the readability bar in §6: sufficient contrast in both themes, legible
  type sizes, and a layout usable down to small mobile widths.
- Time values carry machine-readable timestamps; links are real links;
  interactive controls are keyboard-reachable with a visible focus state.

---

## 8. Out of Scope (this version)

- Reader accounts, authentication, or profiles.
- Multiple authors or granular roles.
- Full-text search, related-posts, recommendations.
- Email delivery / notifications / newsletters.
- Analytics beyond a simple view count.
- Media library / image upload management (cover images are referenced, not hosted-and-managed).
- Scheduled publishing.
- RSS/Atom feeds *(candidate for a future version)*.

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **Draft** | A post that has been saved but not published; private to the author. |
| **Published** | A post visible to readers, with a publication timestamp. |
| **Slug** | The URL-safe identifier for a post, category, tag, or series. |
| **Pending** | A submitted comment awaiting the author's moderation. |
| **Series order** | A post's integer position within its series. |
| **Author** | The single privileged user (Inho). |
| **Reader** | Any anonymous public visitor. |
