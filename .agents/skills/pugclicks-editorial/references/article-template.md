# Article template

## Field rules

| Field | Rule |
| --- | --- |
| `title` | Human headline, 45–65 chars, no clickbait, no "Ultimate" |
| `seo_title` | Optional; <60 chars, ends with ` — Pugclicks` |
| `slug` | lowercase-hyphen, <=80 chars, stable once published |
| `excerpt` | 120–158 chars, doubles as the meta description |
| `body` | Plain text; blank line between paragraphs. `## ` for section headings |
| `category` | one of `ai`, `tech`, `automation`, `guides`, `student-tech` |
| `author` | `Pugclicks Staff` unless a real name is supplied |
| `cover_image` | Absolute https URL, or empty string |
| `image_alt` | Describes the image content, never "image of article" |
| `status` | `draft` until the user approves publication |

## Body shape

```text
One-paragraph answer to the reader's question, up front. No warm-up.

## Why this matters
Two or three sentences of concrete context.

## Step 1 — <action>
What to do, then what you should see.

## Step 2 — <action>
...

## Common mistakes
Three bullets of the failure modes people actually hit.

## What to do next
One clear next action plus a link to a related Pugclicks guide.
```

## Internal linking

Every article links to at least one other published Pugclicks article
(`/article/<slug>`) and one category page (`/category/<slug>`).

## Sources

When a claim comes from research, close the article with:

```text
## Sources
- <Publisher> — <title> — <URL>
```

Never list a source that was not actually consulted.
