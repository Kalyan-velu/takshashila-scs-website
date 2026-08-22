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
- **`script-src`** — `'self'` + `'unsafe-inline'` + `challenges.cloudflare.com` + `code.iconify.design` + `www.googletagmanager.com` + `www.clarity.ms`. The GTM/Clarity origins are needed even though those scripts load inside the Partytown web worker: Partytown fetches the actual script bytes through the main thread's network stack (via its sandboxed proxy), so the browser still enforces `script-src` against the real script origin.
- **Note on `'unsafe-inline'`**: When explicit `'sha256-...'` hashes are present in `script-src`, W3C CSP Level 2/3 specifications require browser engines to ignore `'unsafe-inline'` completely. To ensure runtime inline tags injected by Partytown and dynamic Astro hydration work across all browsers without CSP blocks, explicit script hashes are omitted in favor of `'unsafe-inline'` combined with strict origin directives.

- **Note on `'unsafe-eval'`**: deliberately *not* added to `script-src`. Zod v4
  (used client-side by `src/lib/heroLeadForm.ts` for the hero form) probes for
  eval support via `Function("")` to decide whether to JIT-compile schema
  parsers; that probe trips this CSP even though Zod catches the resulting
  error and falls back gracefully — the browser still reports the blocked
  `eval` to the console. Rather than weaken the policy, `heroLeadForm.ts`
  calls `z.config({ jitless: true })` before defining its schema, which skips
  the probe entirely. Any other zod schema shipped to the client needs the
  same treatment (or a shared setup module) instead of adding `'unsafe-eval'`.

- **`style-src 'self' 'unsafe-inline'`** — kept permissive because Vue's
  dynamic `:style` bindings and Tailwind's inline styles depend on it.
- **`img-src 'self' https: data: blob:`** — permissive because post and media images come from WordPress/CRM content and from Blogger (`blogger.googleusercontent.com`).
- **`font-src 'self' data:`** — fonts are self-hosted via Astro's `fontProviders.fontsource()`.
- **`connect-src`** — `'self'` + Cloudflare + Iconify API endpoints (`api.iconify.design`, `api.simplesvg.com`, `api.unisvg.com`) + GTM/GA/Clarity beacon endpoints (`www.googletagmanager.com`, `www.google-analytics.com`, `region1.google-analytics.com`, `www.clarity.ms`, `c.clarity.ms`). Blog posts are fetched from Blogger's public JSON feed (`src/lib/blogger.ts`), but only from Astro frontmatter at build/request time on the server — never from browser JS — so `blogs.takshashilascs.com` doesn't need to be listed here.
- **`frame-src`** — `'self'` + Turnstile challenge iframe + `www.googletagmanager.com` (GTM's `<noscript>` fallback iframe, `src/lib/GTag/GoogleTagManagerNoscript.astro`).
- **`worker-src 'self' blob:`** — Partytown runs offloaded scripts (GTM, Microsoft Clarity — see `src/lib/GTag/GoogleTagManager.astro`) in a web worker instead of the main thread.
- **`object-src 'none'`** — no plugin/Flash content.
- **`base-uri 'self'`** — blocks `<base>` tag injection.
- **`form-action 'self'`** — form submissions post to `/api/create_lead`.
- **`frame-ancestors 'self'`** — prevents framing on third-party sites.
- **`upgrade-insecure-requests`** — safety net for HTTPS enforcement.

## Regenerating the script hashes

`scripts/csp-hashes.mjs` scans a built `dist/` output and prints the `sha256-` source for every inline, browser-executed `<script>`.

```bash
pnpm build
node scripts/csp-hashes.mjs dist
```

Paste the printed hashes into the `script-src` value in `vercel.json` and update this document (`docs/csp.md`).
