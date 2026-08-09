# Ramon Galvan — artist site

Static one-page artist site. No build step, no dependencies. Built to sit unmaintained between releases.

Purpose: a gateway to Bandcamp for industry, radio, and press. Low key by design. The job is to show a prospective A&R, sync agent, radio programmer, or journalist that Ramon is a real working artist, then send them to Bandcamp to listen. Bandcamp is the discography; the site does not duplicate it.

## Coordinates

- **Live**: https://ramongalvanmusic.com
- **Repo**: `dasilvagalvan-spec/Ramon-Galvan-Website` (private during build)
- **Hosting**: Cloudflare Pages
- **Domain**: `ramongalvanmusic.com`, Cloudflare Registrar, free plan, DNS setup Full
- **Cloudflare account**: Ramon's (`Dasilva.galvan@gmail.com`)
- **Bandcamp**: https://ramongalvan.bandcamp.com

## Roles

- **Ramon Galvan** — artist, site owner. Owns the GitHub account, the Cloudflare account, and the domain. Not technical. Takes over all maintenance at handover.
- **Dylan (`Qualiaboy`)** — building the site. Repo collaborator, Cloudflare Super Administrator. Role ends at launch.
- **Jak** — designed and built the site. Preparing final web-ready assets.

## Stack

Nothing. Hand-written HTML, CSS, and vanilla JavaScript.

```
index.html
css/style.css
js/main.js
img/  video/  fonts/
```

No framework, no bundler, no package manager, no lockfile, no `node_modules`. Open `index.html` with Live Server in VS Code to work on it. Push to deploy.

This is deliberate — see Decisions below.

## Structure

One page, four sections plus footer:

1. **Hero** — fullscreen video, muted autoplay, unmute button
2. **About** — fullscreen image, bio copy sliding in from the right
3. **Latest** — the only light section. Album cover, release notes, Bandcamp link.
4. **Contact** — fullscreen image, mailto button

Fixed header throughout: Bandcamp mark left, wordmark centre, CONTACT right.

**Jak's `README.md` in the repo root is the technical documentation.** It covers the wordmark dock, the 12-column and 5-column grids, the colour flip, the reveals, the phone header bar, the stacking order, and every measured verification. Read it before changing anything. It also lists known weak points and traps already hit during the build.

## Current state

**Done:**
- Repo created, cloned to `~/Projects/Ramon/Ramon-Galvan-Website`
- `main` and `dev` branches pushed

**Blocked:**
- Cloudflare Pages project not yet created. The Cloudflare Workers and Pages GitHub App needs installing on `dasilvagalvan-spec`, which only Ramon can do — it's a personal account, not an org, so collaborators can't install apps on it.

**To do:**
- Strip the Astro scaffold, commit Jak's site in its place
- Replace every placeholder image (see below)
- Final video encode
- Final fonts, correctly licensed
- Real Bandcamp URLs and email address

## Build and preview gate

- `main` → `ramongalvanmusic.com` → public placeholder during the build ("Ramon Galvan, new site coming. Listen: bandcamp link"). No gate; the URL isn't shared yet and the placeholder is harmless.
- `dev` → `*.pages.dev` preview → Cloudflare Access, email OTP, Ramon's address and Dylan's. Where Ramon reviews progress.
- Launch = merge `dev` into `main`.

Cloudflare Pages settings, to be applied once the GitHub App is installed:

- Framework preset: **None**
- Build command: **leave empty**
- Build output directory: `/`
- Production branch: `main`
- No environment variables needed

Nothing compiles. Cloudflare serves the repo contents directly.

## Assets

### Images

**Every image currently in `/img` is a placeholder** — low-resolution crops of screenshots, made so the layout could be rendered and checked. They must not ship. Replace them keeping filenames identical and nothing else needs changing.

Specs for Jak:

| Asset | Dimensions | Format | Target size |
|---|---|---|---|
| Album cover | 1200×1200 | WebP | 150–200KB |
| Press photo | 2000px longest side | WebP | 250–400KB |
| Contact image | 2400×1200 | WebP | 250–400KB |
| Hero poster | 1920×1080 | JPG | ~150KB |
| OG image | 1200×630 | JPG | ~150KB |
| Favicon | — | SVG | — |

Keep the existing filenames from `index.html` unless the extension changes, in which case update the markup to match. sRGB on everything.

No build-time image processing exists, so whatever is committed is what ships at that exact size. Export carefully.

### Video

Static MP4 in `video/`, served from the Pages CDN.

```bash
ffmpeg -i SOURCE.mov \
  -c:v libx264 -profile:v high -preset slow -crf 24 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -vf "scale=1920:1080" \
  hero.mp4
```

Target under 12MB. Poster frame at 1920×1080, ~150KB.

Playback: `muted autoplay loop playsinline preload="metadata"`, with the unmute button Jak built. The audio is the point — this is a music video clip, not background texture. The film pauses when it scrolls off screen and remembers the sound choice.

**Which clip ships is still open.** Jak's site currently references `video/red_telephone.mp4`. Confirm before encoding.

### Fonts

Self-hosted in `fonts/`. Currently **PP Neue Montreal Mono** (Pangram Pangram) for body text and **Sathonay** for the wordmark.

**Licence status is a launch blocker.**

Neue Montreal Mono is covered by a Pangram Pangram Font Starter Pack subscription, which does include a web licence — but:

- It is a **subscription**, not perpetual. If it lapses, the site serves unlicensed fonts.
- It is **capped by pageviews** (5,000/month on the entry tier, 10,000 on the top tier).
- It is registered to **Dylan, not Ramon**, so it does not transfer at handover.

For a site meant to run unattended for years under Ramon's ownership, this needs resolving before launch. Cleanest fix: Ramon buys a perpetual webfont licence for Neue Montreal Mono in his own name (individual licences start at $40). Alternative: swap to an open-source mono, which removes the problem entirely at the cost of the exact typeface.

The wordmark is a separate matter. If `RG_white.svg` ships with its **type outlined**, no font licence applies — it's just vector paths. Confirm Jak is exporting it that way. It also needs a `viewBox`: without one, `main.js` can't read its proportions and three things break silently at once (resting position off-centre vertically, header band the wrong height, phone bar the wrong depth).

Prefer `.woff2` over `.woff` — roughly 30% smaller. The commented line in `style.css` shows where it goes.

## Placeholders still to replace

- Every image in `/img`
- The email address in `index.html`
- The Bandcamp URLs — three places in `index.html`, all marked with comments
- The real licensed font files in `fonts/`
- The favicon
- The hero video and its poster frame

## Longevity

What breaks if nobody touches this for years:

- **Domain renewal**. Annual, Cloudflare Registrar. Auto-renew must be on. If it lapses, the site is gone. Single highest-risk item.
- **Font licence**. See above. Currently the second-highest risk.
- **Cloudflare Pages**. CF gives 6–12 months notice before deprecating anything; emails go to the account owner. A no-build static site is about the least likely thing to be affected.
- **Bandcamp URLs**. If Ramon restructures his Bandcamp, the links break. Nothing automated will catch it.

Notably absent: dependency updates, security advisories, Node versions, framework migrations. There are none, by design.

## Notifications

- **Cloudflare** → Ramon's account email. Domain renewal warnings and Pages deprecations. This is the one that matters.
- **Dependabot** → not applicable. No dependencies.
- **Yearly check** (Ramon's calendar, ~10 min): does the site load, do the Bandcamp links still work, is the domain renewal going through.

## Before handing over

- Replace every placeholder image
- Set the real Bandcamp URLs and email address
- Resolve the font licence in Ramon's name
- Throttle to Slow 4G in DevTools and check how long the film takes to start
- Test on a real iPhone — Safari is where video autoplay usually breaks, and the site has only been tested in headless Chromium
- Run Lighthouse
- Confirm domain auto-renew is on

---

## Decisions and rationale

**Static, no build step.** The site was originally scaffolded with Astro on the assumption of a three-page structure with a discography page driven off a data file. Once it was settled that the site is one page and Bandcamp *is* the discography, Astro's justification disappeared: no repeated markup to componentise, no catalogue to loop over, one album cover to optimise. What remained was a build step and a dependency for no benefit. A site with no `package.json` cannot fail to install in 2028, has no major version to migrate, and has no security advisories. For something explicitly meant to sit unmaintained, that is the stronger artefact.

**Porting to Astro remains available.** If Ramon later wants a real discography page with all four albums, the CSS and JavaScript carry across essentially intact — they're framework-agnostic. Doing it then costs about a day. Building the framework now for a page that may never exist is the wrong order.

**Static MP4 rather than Cloudflare Stream or a YouTube/Vimeo embed.** For one short clip under 12MB the static file on the Pages CDN is the simplest fast path. Stream is built for long-form adaptive bitrate and costs money. Third-party embeds add iframes, branding, and tracking, which defeats the purpose of a site whose entire job is pointing at Bandcamp.

**ffmpeg specs.** 1080p is sharp on most screens without 4K's fourfold file size. H.264 has universal browser support, unlike H.265 (patchy) or AV1 (slow to encode, partial support). CRF 24 balances quality against size. `+faststart` moves metadata to the front of the file so playback begins before the download completes; without it the browser buffers the whole thing first.

**Self-hosted fonts rather than Google Fonts.** Removes an external DNS request, a third-party dependency, and any privacy or cookie-banner obligation. The chosen typefaces aren't on Google Fonts anyway.

**No mailing list, no contact form, no tour dates.** Each pulls in a service with its own maintenance and failure modes. Bandcamp already handles list signups. A mailto covers contact. Tour dates go stale, and the site is meant to sit unattended between releases.

**Public placeholder rather than a bare 404 during the build.** The site's purpose is pointing at Bandcamp; the placeholder may as well do that job. Costs nothing.

**Gate via `dev` branch and Cloudflare Access rather than a hand-written password gate.** Uses a built-in Pages feature. Email OTP beats a shared password, and the Cloudflare-branded login screen doesn't matter on a preview URL only Ramon visits.

**Repo on Ramon's personal GitHub account.** His asset, his ownership, matching the handover model. The cost is that account-level permissions (GitHub App installs) route through him, since collaborators can't act at account level on a personal account. Converting to an organisation would fix it but would lock him out of his only GitHub login, so it's off the table.