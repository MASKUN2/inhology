# 4. Functional Requirements

Part of the [inhology specification](./README.md).

## 4.1 Posts (Author)
- Create a post with: title, Markdown body, optional summary, and **zero or more
  tags**. Tags are typed by name in the editor; a name that does not exist yet
  becomes a new tag on save, and existing tags are offered as suggestions. The
  **URL slug is not
  entered by the author** — it is generated automatically (see below).
- Save a post as a **draft**, **publish** it, or make it **private**. A private
  post is a finished post whose **body is kept to the author**: readers see its
  header — title, date, reading time, tags — in lists and on its page, but not
  its body, excerpt or comments ([§5.1](./policies.md#51-content-visibility)).
- **The URL slug is service-managed.** A draft has **no slug**; when a post is
  **published or made private** the
  slug is generated from the title, and any collision is resolved by appending a
  numeric suffix (`-2`, `-3`…). Editing a published post's title changes its slug
  — and thus its public URL ([§5.2](./policies.md#52-identifiers)).
- Edit any field of an existing post, including changing its publication state.
- **Change a post's publication date** from the editor. The date is stamped
  automatically on first publish; the author may then set it to any day (e.g.
  to backdate an imported post), which moves the post in the newest-first
  listings. A draft's date may be set ahead of time and is kept when the draft
  is published. Leaving the field blank leaves the date as it is
  ([§5.1](./policies.md#51-content-visibility)).
- **Autosave while writing.** The editor persists changes automatically — at most
  once a minute, and only when something changed since the last save — so
  in-progress writing survives an accidental navigation or reload. Autosave
  **never changes publication state**: it never publishes a draft (publishing is
  only ever an explicit action) and never unpublishes a post. It applies to
  **drafts and published posts alike** — for a **published** post the autosaved
  edit is saved to the live post and is visible to readers immediately, so the
  editor flags this state distinctly ("saved & live"). The editor shows the
  current autosave state ([§7.5](./ui-design.md#75-shared-ui-patterns)).
- Delete a post, **confirmed via a modal dialog** so it never fires on a stray
  click ([§7.5](./ui-design.md#75-shared-ui-patterns)). Deletion is a **soft
  delete**: the post and its comments are hidden from every surface and its slug
  is released, but the data is retained and recoverable from the database — it is
  not a permanent erase ([§5.3](./policies.md#53-relationships--integrity)).
- View a list of **all** posts — drafts included — with their current state
  clearly distinguished.
- **Jump straight from a published post's public page to its editor** while
  signed in as the author — an author-only shortcut that readers never see.
- **Insert images into the Markdown body** by pasting (e.g. a screenshot),
  dragging a file onto the editor, or choosing a file. The image is uploaded and
  a Markdown image reference is inserted automatically at the cursor. Images are
  content within the body — there is no separate cover-image field (see
  [§8](./README.md#8-out-of-scope-this-version)).
- **Toggle the body editor between edit and preview** to see the rendered
  Markdown — including uploaded images — before publishing.

## 4.2 Posts (Reader)
- Browse published posts, newest first, **through a tag** or through the
  **All** page, which lists every post — the home page itself lists tags, not
  posts ([§4.3](#43-tags)).
- Read a single published post by its slug.
- Navigate from a post to any of its tags.
- Reading time is shown when available.
- **Private posts are listed for everyone, opened by the author only.** In any
  list a private post shows its header with a **Private** badge. Its page shows
  a reader the same header and a notice that the post is private; the signed-in
  author gets the full post.

## 4.3 Tags
- A tag has a **name**, an optional **description**, and a slug (its address).
  It is created the first time a post uses it.
- The **home page lists the home tags** — the tags the author chose to show
  there — each with its name, post count and description, in the
  **author-defined order**, followed by a fixed last row, **All**, that shows the
  number of all posts and opens the list of every post. The home page has **no post list of its own**.
- The home page, the All page and every tag page carry a **tag bar**: all tags
  that have at least one listed post, each as a badge with its **post count**,
  ordered by count, **highest first** (ties by name).
- Selecting a tag shows its name, its description, and the posts carrying it,
  newest first; the tag bar stays in place with the selected tag highlighted.
- Tag counts and tag pages cover published and private posts, never drafts
  ([§5.1](./policies.md#51-content-visibility)).
- Former category, series and collection addresses redirect to the matching tag
  page (or to the All page where no tag matches).

## 4.4 Tag management (Author)
- The author can **edit a tag**: rename it, write or clear its description, and
  switch **Show on the home page** on or off. Renaming keeps the tag's address.
- A tag newly shown on the home page goes last. The author **reorders the home
  tags by drag and drop** (with move up / move down controls as the non-pointer
  alternative), and the home page follows that order at once
  ([§7.5](./ui-design.md#75-shared-ui-patterns)).
- The author can **delete a tag**, after confirming. It comes off every post
  that carried it; no post is deleted
  ([§5.3](./policies.md#53-relationships--integrity)).

## 4.5 Comments (Reader)
- Submit a comment on a published post with: name (required), comment body
  (required), email (optional).
- Optionally reply to an existing comment on the same post.
- See only **approved** comments on a post.
- Receive clear feedback that a submission was received and is awaiting review.

## 4.6 Comments (Author / Moderation)
- View comments filtered by state: pending, approved, spam.
- Approve a pending comment, mark a comment as spam, or return it to pending.
- Delete a comment.
- See which post each comment belongs to.
