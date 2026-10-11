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
- Browse published posts, newest first, **through a collection or a tag** — the
  home page itself lists collections and tags, not posts. The author keeps a
  rule-less collection (e.g. *All*) for the full list
  ([§4.4](#44-collections)).
- Read a single published post by its slug.
- Navigate from a post to any of its tags.
- Reading time is shown when available.
- **Private posts are listed for everyone, opened by the author only.** In any
  list a private post shows its header with a **Private** badge. Its page shows
  a reader the same header and a notice that the post is private; the signed-in
  author gets the full post.

## 4.3 Tags
- The home page and every tag page carry a **tag bar**: all tags that have at least one
  published post, each as a badge with its **post count**, ordered by count,
  **highest first** (ties by name).
- Selecting a tag shows the published posts carrying it, newest first; the tag
  bar stays in place with the selected tag highlighted.
- Tag counts and tag pages consider **published posts only**.
- Former category addresses redirect to the matching tag page.

## 4.4 Collections
- The **home page lists the collections** — each with its title, description, and
  the number of posts it currently shows — above the tag bar. The home page has
  **no post list of its own**; a collection with no rules (e.g. *All*) is the way
  to every post.
- Selecting a collection opens its page: title, description, its rules, and the
  **list of published posts that satisfy them**, newest first.
- A collection has a **title**, an optional **description**, and **zero or more
  tag rules**. Each rule names a tag the post must carry. With several rules a
  post must satisfy **all** of them; with **no rules the collection shows every
  post**.
- A collection never stores posts: a post enters or leaves it only by gaining or
  losing tags ([§5.3](./policies.md#53-relationships--integrity)).
- Author can create, edit (title, description, rules), and delete collections.
  Rule tags are typed by name, like a post's tags.
- Collections appear in an **author-defined order**. A new collection goes last;
  the author **reorders them by drag and drop** in the admin (with move up / move
  down controls as the non-pointer alternative), and the home page follows that
  order at once ([§7.5](./ui-design.md#75-shared-ui-patterns)).
- Former series addresses redirect to the collection of the same name.

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
