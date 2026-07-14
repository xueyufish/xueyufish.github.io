# AGENTS.md

## Project

Jekyll 4.4.1 static blog (Chinese-language). Hosted via Cloudflare Pages at `www.yuxiumin.com`. Pure Ruby/Bundler — no npm/Node.

## Commands

- **Install deps:** `bundle install`
- **Local dev server:** `bundle exec jekyll serve`
- **Production build:** `bundle exec jekyll build`

## Architecture

```
_posts/          Blog posts (YYYY-MM-DD-slug.md)
_drafts/         Unpublished drafts
_layouts/        default.html → page.html → post.html
_includes/       head.html, footer.html
_plugins/        reading_time.rb, search_index.rb
assets/css/      12 source files → main.min.css (bundled)
assets/js/       7 source files → main.min.js (bundled); jquery.min.js loaded separately
search/          Generated into _site/search/index.json at build time
```

## Post front matter

**Required:** `layout: post`, `title`, `date` (YYYY-MM-DD), `author`, `keyword`, `tags`

**Optional:**
- `description` — SEO meta description
- `og-image` — custom Open Graph image
- `edit-date` — revision date (displays "修订于" in post header, used in JSON-LD `dateModified`)
- `noindex` — set `true` to exclude from search engine indexing
- `exclude_from_search` — set `true` to skip from site search index

## Plugins

- **reading_time.rb** — Counts Chinese characters + English words (strips code blocks first), calculates reading time at 300 words/min. Injects `word_count` and `reading_time` into each post.
- **search_index.rb** — Generates `search/index.json` into `_site/` via `:post_write` hook (after build completes). Auto-generated — never edit manually. If search is stale, delete `_site/search/index.json` and rebuild.

## Key conventions

- **Cache busting:** `version` field in `_config.yml` is appended as `?v=…` on `main.min.css`. Update it after CSS/JS changes, then rebuild.
- **CSS/JS:** Source files live individually in `assets/css/` and `assets/js/`; `main.min.css` and `main.min.js` are the bundled outputs.
- **CDN:** Font Awesome from `cdn.staticfile.org`; MathJax from `cdn.bootcss.com`; FastClick from `cdn.bootcss.com`.
- **Markdown:** kramdown with GFM input; syntax highlighting via rouge.
- **Dark mode:** `data-theme` attribute on `<html>`, toggled by `theme-toggle.js` via localStorage. An inline script in `<head>` prevents flash of wrong theme.
- **CI (`.github/workflows/ci.yml`):** Builds with Ruby 3.4, `bundle exec jekyll build`. Runs on push to any branch and PRs to `main`.
- **Excluded from build:** `scripts/` dir, `*.gemspec`, `node_modules/`, `README.md` (via `_config.yml` `exclude`).
- **`.gitignore` excludes:** `*.sh` files, `.omo/`, `.playwright-mcp/`.
- **No test suite — static site.**
