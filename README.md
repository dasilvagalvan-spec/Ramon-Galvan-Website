# Ramon Galvan

Static site. No build step, no dependencies. Four sections plus footer.

```
index.html
css/style.css
js/main.js
img/  video/  fonts/
```

Open with the Live Server extension in VS Code.

---

## Read this first

**Every image in `/img` is a placeholder** — crops of your screenshots,
made so the layout could be rendered and checked. Low resolution, must not
ship. Replace them keeping the filenames identical and nothing else needs
changing. See `img/_PLACEHOLDERS_README.txt`.

**Still needed:** `video/red_telephone.mp4`,
`fonts/PPNeueMontrealMono-Medium.woff`, `img/favicon.png`, and a still from
the film saved as `img/film-poster.jpg` (shown while the video loads —
without it you get a black flash on slow connections).

**Placeholders to replace:** the email address, and the Bandcamp URL in
four places. All marked with comments (`BANDCAMP URL 1 of 4` and so on).

---

## If things stop working

**First check: does `<html>` have `class="js"`?** Inspect it in DevTools.
`main.js` adds that class as its first action. If it isn't there, the file
isn't running, and the wordmark won't dock, the about image won't fade in
and the menu won't flip — all three at once, because all three depend on it.

Common causes, in order of likelihood:

1. **The browser cached an old copy.** Hard reload: Cmd+Shift+R on Mac,
   Ctrl+Shift+R on Windows. Live Server usually handles this, but not always
   after a file is replaced rather than edited.
2. **`js/main.js` didn't get copied across** with the other files.
3. **A JavaScript error.** Open the Console tab in DevTools. An error in
   one place stops everything after it in the file.

The Console also warns if the wordmark file is missing or misnamed, naming
the path it tried.

**If the wordmark shows but never moves,** that's specifically
`--scroll-progress` not updating — so it's the JavaScript, not the CSS.

**If everything animates but the wordmark sits off-centre at rest,** the
SVG has no `viewBox` and can't report its own proportions. Set `--wm-ratio`
in `style.css` manually to its real height divided by width.

---

## The wordmark dock

720px wide at rest, centred. Docks to 160px, still centred, 20px from the
top, finishing over 70% of a screen height.

Verified in browser: 720px at rest and 100px docked, staying centred to
within a pixel at every point in between.

```css
--wm-start: min(720px, 86vw);   /* the min() caps it on phones —
                                   720px would overflow a 390px screen */
--wm-dock:  160px;   /* 96px on phones, see below */
--wm-pad:   20px;
```

Because the resting and docked positions are both centred, the wordmark
shrinks straight upward rather than drifting sideways. That falls out of
the maths rather than being special-cased: interpolating between two
centred positions while the width interpolates keeps it centred throughout.

**It docks once and stays docked** for the rest of the page, so it sits
small at top centre on every section below the hero, contact included.

The contact button is a normal centred element in the flow of its section.

`DOCK_OVER` in `main.js` controls how much scrolling completes the move
(currently `0.7`).

**How it works, in case you want to change it:** the wordmark is anchored
to the top-left corner and *pushed* to centre screen at rest, rather than
being centred and pulled to the corner. That way the docked position is
exactly `translate(5px, 5px) scale(220/720)` — no accumulated rounding.

`main.js` measures three things on load and on resize, so dropping in a
differently-shaped file needs no other change:

- the wordmark's own proportions, for centring
- the viewport excluding the scrollbar, which `100vw` doesn't — otherwise
  the resting wordmark sits a few pixels left of true centre on desktop
- the dock scale, as a plain number

That last one matters for compatibility. It was originally
`calc(220px / 720px)` in the stylesheet, but dividing a length by a length
is CSS Values 4 and support is uneven — Safari especially. Where it isn't
supported the entire `transform` is discarded and the wordmark never moves
at all. Measuring it in JavaScript sidesteps that.

---

## The 12 column grid

20px page margin, 20px gutters, twelve columns. Defined once in
`style.css`:

```css
--grid-margin: 20px;
--grid-gutter: 20px;
--col: calc((var(--vw) - var(--grid-margin) * 2 - var(--grid-gutter) * 11) / 12);
```

`--col` is one column's width, so anything can be placed by counting
columns. n columns wide is
`calc(var(--col) * n + var(--grid-gutter) * (n - 1))`.

It reads `--vw` rather than `100vw`, so the grid measures the visible page
rather than overshooting by the width of the scrollbar.

**The about copy sits on columns 10 to 11**, which keeps it clear of the
CONTACT link in column 12 as it scrolls past. Verified at 1440px: left edge
lands at 1085.02px against 1085.00 expected, right edge at 1301.67 exactly,
leaving 44px of clearance.

### On phones: 5 columns

Twelve columns is far too fine for a phone, so below 768px the grid
becomes five, and **all content sits on columns 2 to 4**. Derived from
your reference by proportion, so it holds at any width:

| | Proportion | At 390px |
|---|---|---|
| Margin | 1.5% | 6px |
| Gutter | 5.2% | 20px |
| Column | 15.5% | 60px |

Two helper variables do the placing:

```css
--content-left:  calc(var(--grid-margin) + var(--col) + var(--grid-gutter));
--content-width: calc(var(--col) * 3 + var(--grid-gutter) * 2);
```

Anything that should sit in the middle three columns uses those. Currently
the about copy, the album cover and the release notes all do.

Verified against your reference target of 22.14% left, 56.96% wide:

| Width | Left | Width |
|---|---|---|
| 390px | 21.95% | 56.10% |
| 360px | 22.11% | 55.78% |
| 320px | 22.37% | 55.25% |

"LISTEN ON BANDCAMP" is left aligned on phones rather than centred under
the cover, matching the reference.

**The header keeps its 20px inset.** `--gutter` is pinned back to 20px
inside the mobile query, so only the content grid changes — otherwise
Bandcamp and CONTACT would jump in to 6px.

## The header

Bandcamp left, wordmark centre, "CONTACT" right, all sharing a top edge
20px down. `--wm-pad` controls that top inset; `--grid-margin` controls
the sides.

**Centred on each other.** The header is given a height equal to the
docked wordmark, making it a band the wordmark exactly fills, and its
contents are centred inside that. So all three share a middle line.

Measured at 1440px: box centres within 1.1px, ink centres within 2px.

The 2px is CONTACT sitting fractionally high, because capitals with no
descenders put their ink above the line box's middle. If it reads as off
once your real font is in, `position: relative; top: 2px` on
`.site-nav a` settles it.

### Optical alignment

Aligning the boxes is exact and the CSS does it. Aligning what you *see*
isn't the same thing — padding inside an SVG offsets the artwork while its
box stays where it was put.

Measured from your header screenshot, `RG_white.svg` sits high and left of
where its box is:

| | |
|---|---|
| Vertical | wordmark ink 7.5px above Bandcamp and CONTACT |
| Horizontal | wordmark ink 16px left of the header's centre |

Both were taken as a proportion of the wordmark's own width, so they hold
whatever zoom the capture was at. Scaled to a 160px dock, that's about 6px
down and 13px right — which is what these are set to:

```css
--wm-dock-nudge:  6px;   /* positive moves it down */
--wm-dock-shift: 13px;   /* positive moves it right */
```

They apply only to the docked position, so the full-size wordmark on the
hero is untouched and stays truly centred.

**These are a workaround.** The real fix is re-exporting `RG_white.svg`
with a tight, symmetrical crop, at which point both go back to 0. In Figma:
select the outlined type, then Export with no surrounding frame — a frame
with padding is usually what causes this. Correcting it in the file means
the asset is right everywhere, rather than right only where this one rule
happens to apply.

Fine-tune by eye: screenshot the header, zoom in, adjust by a pixel at a
time.

### On phones

Three items across a narrow screen is tight. At 160px the wordmark nearly
touches the Bandcamp mark at 390px and overlaps it at 320px, so below
768px the dock drops to 96px and Bandcamp to 76px. Verified clearances:

| Width | Wordmark | Gaps |
|---|---|---|
| 1440px | 160px | 516 / 545 |
| 390px | 96px | 51 / 52 |
| 320px | 96px | 16 / 17 |

The shift is a fraction of the dock width rather than a fixed pixel
value, so it scales with the wordmark — 12.8px at the 160px desktop dock,
7.7px at the 96px phone dock. A fixed value would have been
proportionally almost twice as strong on a phone.

## The colour flip

The **menu and Bandcamp** go black when "latest" is under them. The
**wordmark deliberately does not** — it stays white throughout and
disappears against the white section, as asked.

Bandcamp is a white SVG, so left alone it would vanish too. It flips with
the menu rather than staying with the wordmark, on the assumption that a
disappearing link reads as a fault while a disappearing logo reads as a
choice. One line in `style.css` if you'd rather it stayed white:

```css
body[data-on-light="true"] .bandcamp { filter: invert(1); }   /* delete */
```

Detection watches a thin band across the top 12% of the screen — the strip
the header actually occupies — rather than the whole viewport. So the flip
happens when the header crosses onto white, not when the white section
first appears at the bottom of the screen.

Bandcamp inverts rather than taking a colour, because an SVG loaded through
an `<img>` tag is an opaque image to CSS — you can't reach inside to set a
`fill`. If the inverted black looks wrong, paste me the contents of
`Bandcamp_white.svg` and I'll inline it so the fill becomes a real value
you can set.

Now that "contact" is full height there's enough page to scroll it under
the header, so the flip reverses on the way down. Measured on a 1440x900
window: black from y=1692, back to white from y=2700 — exactly the top and
bottom edges of the white section.

---

## The reveals

| | Starts | Fades over | Motion |
|---|---|---|---|
| About image | 0.5s | 2.4s | out of black |
| About copy | 0.7s | 0.9s | slides in from the right |
| Contact image | immediately | 0.5s | out of black |

All timing lives in the CSS transitions, so retiming needs no JavaScript
changes. The last number in each is the delay:

```css
.js .about__image   { transition: opacity 2.4s var(--ease) 0.5s; }
.js .about__text    { transition: opacity 0.9s var(--ease) 0.7s,
                                  transform 0.9s var(--ease) 0.7s; }
.js .contact__image { transition: opacity 0.5s var(--ease); }
```

The copy starts 4rem to the right and slides left into place. `overflow-x`
is hidden on `body`, so that off-screen start can't produce a horizontal
scrollbar.

Note the copy now finishes well before the image does — it lands around
1.6s while the image is still fading until 2.9s. That's what you asked for,
but if you'd rather the image led, either shorten it or push the copy's
delay out past 2s.

Each section reveals once and stops being watched. Delete the `unobserve`
line in `main.js` if you want them to replay on every pass.

---

## The phone header bar

On phones only, a black bar sits behind the header from the second
section onward, so content scrolls underneath it rather than colliding
with the wordmark and menu. The hero is left uncovered.

Its height is derived, not fixed:

```css
height: calc(var(--wm-pad) + var(--wm-dock-nudge)
             + var(--wm-dock) * var(--wm-ratio) + var(--wm-pad));
```

Top inset, plus the docked wordmark's own height, plus its nudge, plus
the same inset again below. So it keeps fitting if you change the dock
size or swap in an SVG with different proportions. Measured 69px at
390px wide, against a wordmark whose lower edge is at 64px.

`HEADER_BAR_AFTER` in `main.js` controls when it appears — currently one
full screen height, so it arrives with the second section.

**The colour flip is switched off on phones.** With a black bar behind
them the header elements stay white the whole way down, including over
the white section. Desktop still flips as before.

## Why the light section sits above the wordmark

`.latest` carries `z-index: 45` — above the wordmark (40), below the nav
(60). Its black type therefore paints *over* the wordmark rather than
under it.

Without this the white wordmark punched holes through the black type as
it scrolled past. Measured in the header band: 174 black pixels with the
wordmark on top, 216 with it behind — the wordmark was eating about a
fifth of the type, in the 300–500px scroll window where the release
notes cross the header.

**The alternative was fading the wordmark to zero over this section.**
Stacking is better here for one specific reason: the wordmark is white
and the section background is opaque white, so the occlusion is
*invisible*. Nothing appears to change. A fade would need to start and
finish at exactly the right scroll positions, and it would hang off a JS
flag firing on an observer band — one more thing to mistime, and one more
thing that stops working if the script doesn't load. Stacking is
geometric: correct at every scroll position by construction, with no
timing at all.

It also means the wordmark reappears on contact for free, since that
section stays below it. Verified.

**On phones the z-index goes back to `auto`.** The black header bar does
this job there, and content has to stay underneath the bar rather than
over it. If it were raised, the bar would vanish behind the white section
and the white nav would be invisible on it.

## Other behaviour

**Nav is now permanently sticky**, reversing the earlier fade-away. The
colour flip is what makes that safe over the white section.

**The sound button still fades** past the hero, because the film pauses
when it scrolls off screen and there's nothing left to control. Threshold
is `HIDE_SOUND_AFTER` in `main.js`.

**Sound has to start off.** Browsers refuse to autoplay video with audio,
so the film always begins muted. The button turns it on, then reads
"mute". The label always names what the click will do.

**The film pauses off screen** and remembers the sound choice, so scrolling
back up resumes it as it was. Without this, anyone who turned the sound on
and scrolled down would be stuck with audio they can't see or stop.

**"latest" is now full height**, which pushes contact down as asked.

**Text links fade rather than underline.** Hovering drops them to 70%
opacity; the sliding underline is gone.

**The footer line** is 10px, uppercase, weight 500, with 5px of
letter-spacing. It also carries `text-indent: 5px` — letter-spacing is
added after every character including the last, so a centred line sits
half a space left of true centre. The indent should always match the
letter-spacing; measured offset is currently 0.5px.

---

## Still open

**`RG.svg` needs its type outlined.** If the file still references Sathonay
by name rather than as paths, it will render in a fallback font on any
machine without that font installed. In Figma: select the type, outline it,
then export.

Also make sure it carries a `viewBox`. `main.js` reads the file's own
proportions to centre it, and an SVG without a viewBox reports no intrinsic
size. There's a fallback (`--wm-ratio` in `style.css`) if it comes to it,
but the automatic version is better.

**Mobile is my guess, not your design.** Checked at 390×844: the dock
lands correctly and doesn't collide with the nav. But the proportions are
my choices. Send the mobile design and I'll match it.

**Font licence.** PP Neue Montreal Mono is Pangram Pangram; Sathonay is
also commercial. Both need a *webfont* licence, separate from a desktop
one. Worth confirming before launch rather than after.

**`.woff2` if you can get it** — about 30% smaller. Commented line in
`style.css` shows where it goes.

---

## Before handing over

- Replace every placeholder image
- Set the real Bandcamp URLs and email address
- Throttle to Slow 4G in DevTools and check how long the film takes
- Test on a real iPhone — Safari is where video autoplay usually breaks
- Run Lighthouse


---

## Known weak points

Written down so they're not surprises later.

**The whole layout depends on JavaScript.** `--vw` drives the grid and the
wordmark centring; the reveals, colour flip and header bar are all
JS-driven. The fallbacks are deliberate — content stays visible, the grid
falls back to `100vw` — but without the script the layout shifts by the
scrollbar's width and nothing moves. For a site this simple that's a
larger dependency than ideal.

**`--wm-ratio` is read from the SVG, and three things depend on it.** If
`RG_white.svg` ships without a `viewBox`, the ratio silently falls back to
0.4 and the resting wordmark sits off-centre vertically, the header band
is the wrong height so the three elements stop centring, and the phone
bar is the wrong depth. One missing attribute, three symptoms, no error.
Once you confirm the real file's dimensions, hardcoding the ratio would
remove the risk entirely.

**Only tested in headless Chromium.** Never opened in Safari or on a real
device. The likely divergences are `100svh`, video autoplay on iOS, and
font rendering shifting the letter-spaced items.

**Stacking depends on the section backgrounds staying opaque.** The
wordmark is hidden on "latest" because that section's white background
covers it. Give the section any transparency and a white wordmark
reappears through the middle of the black type.

**Alignment properties survive a `display` change.** The desktop `.latest`
rule sets `place-items: center`; switching to `display: block` on mobile
did not clear it, and the child got centred *and* given a margin, landing
43px out. It's fixed, but the same trap exists anywhere a breakpoint
changes `display` on a container that sets alignment.

**Two hoisting bugs happened during the build.** `main.js` is now ordered
settings, lookups, state, functions, wiring — deliberately, because `var`
hoists declarations but not assignments, and a `var x = 0` below a
function that already set `x` will silently wipe it. Keep new code in the
right section rather than appending to the end.

**The placeholder images are still in `/img`.** Low-resolution crops of
screenshots. This is the most likely thing to actually go wrong.
