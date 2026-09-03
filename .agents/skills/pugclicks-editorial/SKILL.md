---
name: pugclicks-editorial
description: Write, research and publish Pugclicks AI/tech articles and manage the /admin panel. Use when creating or editing blog posts, seeding research-backed guides, changing article fields, or working on admin dashboard screens (posts, users, comments) for this site.
---

# Pugclicks editorial + admin

Pugclicks is a "Premium Minimal Tech" publication about AI, tech, automation,
guides and student tech. Audience: students and everyday users. Voice: calm,
practical, no hype, no invented facts.

## Non-negotiables

1. **Never invent facts.** No fake statistics, reviews, testimonials, prices,
   benchmarks, dates or company claims. If a number is needed, research it and
   cite the source inline (`Source: <publisher>, <URL>`), or omit it.
2. **Never invent people or partnerships.** No fake team members or authors.
   Author defaults to `Pugclicks Staff` unless the user gives a real name.
3. Publishing is **admin-only**. Readers can sign up, follow, like, comment and
   share — they cannot publish. Never add a policy that lets non-admins insert
   or update `articles`.
4. Security is in the database, not the UI. Hiding an admin link is not
   security — role checks go through `user_roles` + `private.has_role`.

## Writing a research blog

Read `references/article-template.md` for the exact section shape and field
values, then:

1. Pick the search intent and one category slug: `ai`, `tech`, `automation`,
   `guides`, `student-tech`.
2. Research with web search before writing anything factual. Prefer primary
   sources (official docs, vendor changelogs, standards bodies).
3. Write 900–1,600 words, short paragraphs, plain English, one clear takeaway
   per section, and a "What to do next" close.
4. Fill every field: `title`, `seo_title`, `slug`, `excerpt` (<160 chars),
   `body`, `category`, `author`, `cover_image`, `image_alt`.
5. Insert as `status: 'draft'` unless the user explicitly asks to publish.

## Admin panel

Read `references/admin-panel.md` for routes, schema and the patterns to follow
when extending the dashboard.
