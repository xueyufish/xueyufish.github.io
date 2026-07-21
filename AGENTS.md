# AGENTS.md

## Project

Jekyll 4.4.1 static blog (Chinese-language). Hosted via Cloudflare Pages at `www.yuxiumin.com`. Pure Ruby/Bundler — no npm/Node toolchain in use (leftover `package.json` / `Gruntfile.js` references are excluded from build and gitignored).

## Commands

- **Install deps:** `bundle install`
- **Local dev server:** `bundle exec jekyll serve`
- **Production build:** `bundle exec jekyll build`
- No test suite — static site. CI green build is the only gate.

## Ruby / Jekyll gotchas

- **Keep `bigdecimal` in the Gemfile.** Ruby 3.4 dropped it from the default gems; CI runs on Ruby 3.4, so removing it breaks `jekyll build`.
- **Incremental builds are ON** (`incremental: true` in `_config.yml`). If output looks stale after an edit — especially layout, `_includes/`, or search-index changes — delete `_site/` and `.jekyll-cache/` and rebuild before assuming a bug.

## Architecture

```
_posts/          Blog posts (YYYY-MM-DD-slug.md)
_drafts/         Unpublished drafts
_layouts/        Inheritance chain: post.html ↳ page.html ↳ default.html
_includes/       head.html, footer.html
_plugins/        Local (non-gem) plugins: reading_time.rb, search_index.rb
assets/css/      Source CSS bundled into main.min.css
assets/js/       Source JS bundled into main.min.js; jquery.min.js + bootstrap.min.js are vendor, loaded separately
_site/           Build output (gitignored) — never hand-edit
search/          Auto-generated into _site/search/index.json at build time
```

Only gem plugin: `jekyll-paginate`. The two `_plugins/*.rb` files are auto-loaded by Jekyll's plugin manager — no registration needed.

## Plugins

- **reading_time.rb** — Counts Chinese characters + English words (strips code blocks first), calculates reading time at 300 words/min. Injects `word_count` and `reading_time` into each post.
- **search_index.rb** — Generates `_site/search/index.json` via a `site :post_write` hook (runs after the build finishes writing). If the search index is stale, delete `_site/search/index.json` and rebuild.

## Post front matter

**Required:** `layout: post`, `title`, `date` (YYYY-MM-DD), `author`, `keyword`, `tags`

**Optional:**
- `description` — SEO meta description
- `og-image` — custom Open Graph image
- `edit-date` — revision date (renders "修订于" in post header; feeds JSON-LD `dateModified`)
- `noindex` — `true` excludes from search-engine indexing
- `exclude_from_search` — `true` skips this post in the site search index

## Key conventions

- **Cache busting:** Bump the `version` field in `_config.yml` after CSS/JS changes — it's appended as `?v=…` on `main.min.css`.
- **Markdown:** kramdown with GFM input; syntax highlighting via rouge (no line numbers).
- **Dark mode:** `data-theme` attribute on `<html>`, toggled by `assets/js/theme-toggle.js` via localStorage. An inline script in `<head>` prevents flash of wrong theme — keep it.
- **HTML compression:** `compress_html` is enabled in `_config.yml`.
- **CDN vendors:** Font Awesome (`cdn.staticfile.org`), MathJax and FastClick (`cdn.bootcss.com`).

## Build & repo excludes

`_config.yml` `exclude` omits from the build: `less`, `node_modules`, `Gruntfile.js`, `package.json`, `README.md`, `scripts`, `*.gemspec`, `.playwright-mcp`.

`.gitignore` additionally excludes: `_site/`, `.jekyll-metadata`, `.sass-cache/`, `.backup/`, `package.json`, `Gruntfile.js`, `*.sh`, `.omo/`, `.playwright-mcp/`.

## CI

`.github/workflows/ci.yml` — single job: Ruby 3.4 + `bundle exec jekyll build` (with `bundler-cache: true`). Runs on every push (all branches) and PRs to `main`.
