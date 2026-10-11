# 5. Policies & Business Rules

Part of the [inhology specification](./README.md).

These are the non-negotiable rules. They hold regardless of how the system is built.

## 5.1 Content visibility
- **Drafts are hidden.** A draft must never be readable,
  listed, or discoverable through any public surface — not on lists, not by
  direct slug, not via tag pages, tag counts, collection pages or collection
  counts. Draft protection is a security
  requirement, not a convenience.
- Only the author, authenticated, may see drafts.
- **A private post's body is the author's alone.** Readers may see a private
  post's **header only** — title, publication date, reading time and tags — in
  lists, in tag and collection counts, and on its page. Its **body, excerpt and
  comments are never sent to a reader**: the server leaves them out, it is not
  merely hidden by the page. Only the authenticated author receives them.
  Protecting a private body is the same security requirement as draft
  protection.
- Public listings are ordered newest-first by publication date.
- The **publication date is author-editable** and is a label only — it never
  affects visibility. A published post with a future date is still public, and
  a date on a draft does not make it public.

## 5.2 Identifiers
- Every tag has a **unique, URL-safe slug**, derived from its name. A post's slug
  is **service-managed**: it is **absent while the post is a draft**, generated
  from the title when the post is **published**, and **de-duplicated with a
  numeric suffix** (`-2`, `-3`…) on collision.
- Slugs may contain non-ASCII characters (e.g. Hangul). The system must handle
  them correctly end-to-end in URLs.
- A post's slug **can change when its title changes** (URL stability across edits
  is not guaranteed for now). A **tag** is matched by name (case-insensitively)
  or slug when typed on a post, so the same label never becomes two tags;
  creating a tag with an existing slug directly is **rejected**. A **collection's**
  slug is derived from its title and must be unique; a clash is **rejected**.

## 5.3 Relationships & integrity
- A post has **zero or more tags**; none is required. Tags are the only grouping
  — there is no category and no series, and posts under a tag are ordered by
  publication date, not by an author-set position.
- Collections have one **author-defined order**, shared by every surface that
  lists them. Reordering changes nothing but that order.
- A **collection** is a saved filter, not a container: it lists the published
  posts carrying **every** one of its rule tags, and **all** published posts when
  it has no rules. Deleting a collection deletes no post and no tag; deleting a
  tag removes the rules that named it.
- Removing a tag from a post never deletes the tag's other links; a tag left
  with no published posts simply stops being shown.
- Deleting a post is a **soft delete**: the post and its comments are hidden from
  every public and admin surface and retained in the database (recoverable
  there), and the post's slug is **released for reuse** ([§5.2](#52-identifiers)).
  It is not a permanent erase.
- Deleting a comment deletes its replies.
- A reply may only attach to a comment **on the same post**.

## 5.4 Comments
- Comments may only be submitted on **published** posts (not on drafts or
  private posts).
- Every new comment starts in the **pending** state and is invisible to the
  public until the author approves it. There is no auto-approval.
- A commenter's **email is never exposed publicly** — it exists only for the
  author's moderation and notification purposes.
- Comment body and name have length limits to bound abuse (body and name are
  capped; email, when given, must be a valid address).

## 5.5 Authorisation
- All create/edit/delete/moderate actions are restricted to the **author**.
- The author authenticates through the **homelab single sign-on (Authentik OIDC)**.
  The web app gates the admin area on a valid SSO session; calls from web to the
  API carry an **internal shared token** (web↔api only, on the cluster's private
  network — the API is not publicly exposed). Both credentials are kept out of
  version control. (See `../../../homelab/sso.md`.)
- **A valid SSO session is necessary but not sufficient.** The IdP additionally
  authorises the caller *as the author*: access to the inhology application is
  restricted at the IdP to members of the author group. A merely-registered SSO
  account — e.g. one created through a future social-login source — is **denied
  at the IdP** and never receives an inhology session, so it cannot reach the
  admin area at all.
- Reading published content and submitting a (pending) comment are the only
  actions available without authentication.

## 5.6 Data ownership
- All content and data are self-hosted and owned by the author. No third-party
  service is required to read or write content.

## 5.7 Images
- Uploaded images are stored in the author-owned object storage and served
  **under the site's own domain**, never exposing the storage backend's address
  or a third-party URL. To a reader an image looks like part of the site.
- Only raster image types are accepted (**PNG, JPEG, WebP, GIF**); **SVG is
  rejected** (script-injection risk). Each upload is bounded by a size cap to
  limit abuse.
- Uploading an image is an **author-only** action, gated by the same
  authorisation as other writes ([§5.5](#55-authorisation)).
- Images are embedded by reference in Markdown; they are **not** separately
  catalogued or managed (see [§8](./README.md#8-out-of-scope-this-version)).
  Deleting a post does not chase down its images.

---

# 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Public pages should render quickly on modest hardware; the public read path is the priority. |
| **Hosting** | Must be self-hostable on a single home-server VM with limited resources. |
| **Security** | Secrets never committed; drafts never leak; reader email never exposed; admin actions gated by the shared secret. |
| **Backup** | Content lives in a database that can be backed up and restored. Loss of the host must not mean loss of writing. |
| **Accessibility & readability** | Clean typography, dark-mode support, mobile-friendly layout. |
| **Internationalisation** | **English UI**; content, comments, and identifiers may be non-ASCII (e.g. Korean) and must work end-to-end (URLs, storage, rendering). |
| **Maintainability** | A single author should be able to operate and update the whole system unaided. |
