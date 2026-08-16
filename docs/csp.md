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
- **`script-src`** — `'self'` + `'unsafe-inline'` + `googletagmanager.com` + `challenges.cloudflare.com` + `code.iconify.design` + `googleads.g.doubleclick.net` + `googleadservices.com` + `google.com`.
- **Note on `'unsafe-inline'`**: When explicit `'sha256-...'` hashes are present in `script-src`, W3C CSP Level 2/3 specifications require browser engines to ignore `'unsafe-inline'` completely. To ensure runtime inline tags injected by Google Tag Manager, Partytown, and dynamic Astro hydration work across all browsers without CSP blocks, explicit script hashes are omitted in favor of `'unsafe-inline'` combined with strict origin directives.

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
- **`img-src 'self' https: data: blob:`** — permissive because post and media images come from WordPress/CRM content.
- **`font-src 'self' data:`** — fonts are self-hosted via Astro's `fontProviders.fontsource()`.
- **`connect-src`** — `'self'` + GTM / Cloudflare / Google Analytics / DoubleClick (`ad.doubleclick.net`, `googleads.g.doubleclick.net`, `pagead2.googlesyndication.com`, `googleadservices.com`, `google.com`) + `crm.takshashilascs.com` + Iconify API endpoints (`api.iconify.design`, `api.simplesvg.com`, `api.unisvg.com`).
  - `pagead2.googlesyndication.com` is required for the Google Ads (`gtag`) conversion-measurement `collect` beacon fired alongside `AW-` conversion IDs; without it, Chrome blocks the beacon with a CSP `connect-src` violation.
- **`frame-src`** — `'self'` + GTM noscript iframe + Turnstile challenge iframe + `google.com` + `googleads.g.doubleclick.net`.
- **`worker-src 'self' blob:`** — Partytown runs GTM in a web worker.
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
