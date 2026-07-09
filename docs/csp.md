# Content Security Policy

Internal notes on the security headers in `vercel.json`. Not part of the public
site — this lives outside `public/` and `src/pages/` so Astro never serves it.

## Where it lives

All headers are set in `vercel.json`, under `headers` → the entry with
`"source": "/(.*)"` (applies to every route). Vercel serves these directly at
the edge; Astro/the app code has no involvement at request time.

## Headers set

| Header                    | Value                                      | Purpose                                                                     |
|---------------------------|--------------------------------------------|-----------------------------------------------------------------------------|
| `Content-Security-Policy` | see below                                  | Blocks injected/unauthorized scripts, framing, plugins                      |
| `X-Content-Type-Options`  | `nosniff`                                  | Stops browsers from MIME-sniffing responses into executable types           |
| `X-Frame-Options`         | `SAMEORIGIN`                               | Legacy clickjacking protection (belt-and-suspenders with `frame-ancestors`) |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`          | Avoids leaking full URLs (with query strings) to third-party origins        |
| `Permissions-Policy`      | `geolocation=(), camera=(), microphone=()` | Site doesn't use these APIs; explicitly disabled                            |

## CSP directives, and why each is what it is

- **`default-src 'self'`** — fallback for any directive not listed explicitly.
- **`script-src`** — `'self'` + `googletagmanager.com` + `challenges.cloudflare.com`
  (Turnstile) + six `'sha256-…'` hashes. **No `'unsafe-inline'`.** This is the
  directive that actually matters for "no one can inject": arbitrary
  `<script>` tags smuggled in — e.g. via stored XSS in WordPress blog content,
  which is rendered with `set:html` in `src/pages/[slug].astro` — will not
  execute, because they won't match any of the allowed hashes.
- **The six hashes** cover every inline script the site itself legitimately
  produces (verified by scanning the full 43-page build — see
  `scripts/csp-hashes.mjs` below):
    1. The GTM bootstrap snippet (`Layout.astro` → `GoogleTagManager.astro`).
    2. Partytown's loader snippet (injected by the `@astrojs/partytown` integration).
       3–5. Astro's built-in hydration runtime for `client:load` / `client:only`
       directives (framework-injected, not our code).
    6. The course-tab toggle script in `CoursesWrapper.astro` (only appears on
       the homepage).
- **`style-src 'self' 'unsafe-inline'`** — kept permissive because Vue's
  dynamic `:style` bindings (e.g. `MobileMenu.vue`'s accordion animation) and
  Tailwind's inline styles depend on it. Style injection isn't a code-execution
  vector the way script injection is, so this is a deliberate, lower-risk
  trade-off.
- **`img-src 'self' https: data: blob:`** — permissive because blog post
  images come from WordPress/CRM content we don't fully control the domains
  of. Loading an image from an arbitrary host isn't an XSS vector.
- **`font-src 'self' data:`** — fonts are self-hosted via Astro's
  `fontProviders.fontsource()`, no external font CDN in use.
- **`connect-src`** — `'self'` (all app API calls go through same-origin
  `/api/*` routes) + GTM/Cloudflare + the commonly-documented Google Analytics
  beacon endpoints (`google-analytics.com`, `analytics.google.com`,
  `stats.g.doubleclick.net`).
- **`frame-src`** — GTM's noscript iframe + Turnstile's challenge iframe. No
  other iframes exist anywhere in the current build (checked all 43 pages).
- **`worker-src 'self' blob:`** — Partytown runs GTM in a web worker.
- **`object-src 'none'`** — no plugin/Flash content, always safe to disable.
- **`base-uri 'self'`** — blocks `<base>` tag injection attacks.
- **`form-action 'self'`** — the only form on the site posts to
  `/api/create_lead` (same origin).
- **`frame-ancestors 'self'`** — the modern, CSP-level equivalent of
  `X-Frame-Options`; prevents this site from being iframed elsewhere.
- **`upgrade-insecure-requests`** — the site is HTTPS-only anyway; this is a
  no-op safety net.

## Known gaps / things to watch after deploy

- **GTM's actual tag configuration is invisible to this codebase.** The GTM
  container (`GTM-KZ2WJKG7`) can have any number of tags configured through
  Google's web UI — Meta Pixel, Hotjar, additional analytics, etc. — and this
  CSP only allowlists what was discoverable from the code (GTM itself + the
  standard GA endpoints). If the container has other tags, they'll be
  **silently blocked** until their domains are added to `connect-src` /
  `script-src`. Check the browser console for CSP violation warnings after
  deploying, or after editing the GTM container.
- **`frame-src` only covers what's used today.** If a future blog post embeds
  a YouTube video, Google Form, or Google Map, that iframe will be blocked
  until its origin is added to `frame-src`.
- **The policy is enforced, not report-only.** There's no
  `Content-Security-Policy-Report-Only` header collecting violations — if
  something breaks, it breaks silently in production rather than just
  logging. Worth adding a `report-to`/`report-uri` endpoint if this needs
  tighter monitoring.

## Regenerating the script hashes

`scripts/csp-hashes.mjs` scans a built `dist/client` output and prints the
`sha256-` source for every genuinely inline, browser-executed `<script>`
(it skips `type="application/ld+json"` and `type="text/partytown"`, which
browsers never execute, and anything with a `src=`, which is already covered
by origin rules).

```bash
pnpm build
node ../scripts/csp-hashes.mjs ../dist/client
```

Paste the printed hashes into the `script-src` value in `vercel.json`.

**Re-run this whenever:**

- Astro is upgraded (its hydration runtime snippets can change byte-for-byte).
- `@astrojs/partytown` is upgraded (same reason — the loader snippet is
  version-stamped).
- The GTM container ID (`PUBLIC_GTM_CONTAINER` in `.env`) changes.
- `CoursesWrapper.astro`'s inline `<script>` is edited.
- A new `client:visible` / `client:idle` directive is introduced anywhere
  (only `client:load` and `client:only` are in use today — a new directive
  type ships its own hydration snippet with its own hash).

If a hash goes stale, the affected script doesn't error visibly — it just
stops running. GTM would silently stop firing, or the course tabs would stop
switching, with no console error beyond a CSP violation notice.
