/* ═══════════════════════════════════════════════════════════════════
   main.js — Ramon Galvan

   Order matters in this file. Everything is declared before anything
   runs, because `var` hoists the declaration but not the assignment —
   a value read before its assignment line is silently undefined, and
   a `var x = 0` further down will overwrite a value measured earlier.

   Structure:
     1. Settings
     2. Element lookups
     3. State
     4. Measurement
     5. Scroll
     6. Colour flip
     7. Section reveals
     8. Film sound
     9. Film pauses off screen
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. SETTINGS ────────────────────────────────────────────────
     All in screen heights. */

  var DOCK_OVER        = 0.7;    /* scrolling to finish docking */
  var HIDE_SOUND_AFTER = 0.5;    /* scrolling before the sound button goes */
  var HEADER_BAR_AFTER = 1.0;    /* scrolling before the phone header bar shows */
  var LIGHT_BAND       = '0px 0px -88% 0px';   /* top 12% of the screen */


  /* ── 2. ELEMENT LOOKUPS ─────────────────────────────────────────── */

  var root     = document.documentElement;
  var wordmark = document.getElementById('wordmark');
  var video    = document.getElementById('film');
  var button   = document.getElementById('sound-toggle');
  var contact  = document.getElementById('contact');
  var latest   = document.getElementById('latest');
  var hero     = document.querySelector('.hero');
  var label    = button ? button.querySelector('.sound-toggle__text') : null;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Marks the page as scripted. Anything that starts hidden and is
     revealed by JavaScript is gated behind .js in the stylesheet, so
     if this file fails to load the content is simply visible rather
     than stuck at opacity 0.

     Also a quick diagnostic: inspect <html> in DevTools. If it doesn't
     say class="js", this file isn't running. */
  root.classList.add('js');


  /* ── 3. STATE ───────────────────────────────────────────────────── */

  var queued     = false;  /* a frame is already scheduled */
  var lastPast   = null;   /* null so the first run always writes */
  var lastOff    = null;
  var viewportW  = 0;
  var viewportH  = 0;
  var wantsSound = false;  /* what the visitor asked for */

  /* Resolves --wm-dock, which is a length that can change with the
     viewport. Hidden, and outside the flow. */
  var probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:absolute;top:0;left:0;height:0;visibility:hidden;pointer-events:none;width:var(--wm-dock)';


  /* ── 4. MEASUREMENT ─────────────────────────────────────────────── */

  /* clientWidth excludes the scrollbar, which 100vw does not. Using it
     means the resting wordmark is centred exactly rather than sitting
     a few pixels left of centre on desktop.

     The height is cached rather than read live. On iOS the address bar
     collapses as you scroll, which changes the viewport height mid
     gesture. Reading it every frame would change the divisor in
     updateScroll while the dock is in motion, and the wordmark would
     visibly stutter. Holding the value steady is worth more than
     tracking the bar exactly. */
  function measureViewport() {
    viewportW = root.clientWidth;
    viewportH = root.clientHeight;
    root.style.setProperty('--vw', viewportW + 'px');
    root.style.setProperty('--vh', viewportH + 'px');
  }

  /* The wordmark's own proportions, so the centring works with whatever
     file is dropped in.

     An SVG only reports naturalWidth/naturalHeight if it carries a
     viewBox or explicit width and height. If yours doesn't, this bails
     out and the --wm-ratio fallback in style.css is used instead. */
  function measureWordmark() {
    if (!wordmark || !wordmark.naturalWidth || !wordmark.naturalHeight) return;
    root.style.setProperty('--wm-ratio', wordmark.naturalHeight / wordmark.naturalWidth);
  }

  /* The dock scale, as a plain number.

     This was once calc(220px / 720px) in the stylesheet, but dividing a
     length by a length is CSS Values 4 and support is uneven — Safari
     especially. Where it isn't supported the whole transform is thrown
     out and the wordmark never moves. Measuring it here avoids that. */
  function measureDock() {
    if (!wordmark || !probe.parentNode) return;

    var start = parseFloat(getComputedStyle(wordmark).width);
    var dock  = parseFloat(getComputedStyle(probe).width);

    if (start > 0 && dock > 0) {
      root.style.setProperty('--wm-scale-end', dock / start);
    }
  }

  function measureAll() {
    measureViewport();
    measureWordmark();
    measureDock();
  }


  /* ── 5. SCROLL ──────────────────────────────────────────────────────
     Writes 0 to 1 into --scroll-progress. All the movement is done in
     CSS, so the dock can be retuned in style.css without touching this
     file.
     ─────────────────────────────────────────────────────────────────── */

  function updateScroll() {
    var y = window.scrollY;
    var h = viewportH || root.clientHeight;

    /* Docks once and stays docked for the rest of the page, so the
       wordmark sits small at top centre on every section below the
       hero, contact included. */
    var progress = Math.min(y / (h * DOCK_OVER), 1);

    root.style.setProperty('--scroll-progress', progress.toFixed(4));

    /* Only touch the DOM when the state actually changes. */
    var past = y > h * HIDE_SOUND_AFTER;
    if (past !== lastPast) {
      document.body.dataset.pastHero = past;
      lastPast = past;
    }

    /* A full screen height down, so the bar appears as the second
       section arrives rather than while the hero is still showing. */
    var off = y > h * HEADER_BAR_AFTER;
    if (off !== lastOff) {
      document.body.dataset.offHero = off;
      lastOff = off;
    }

    queued = false;
  }

  function onScroll() {
    /* requestAnimationFrame limits the work to once per frame, which is
       what keeps scrolling smooth. */
    if (!queued) {
      window.requestAnimationFrame(updateScroll);
      queued = true;
    }
  }


  /* ── 6. COLOUR FLIP ─────────────────────────────────────────────────
     Watches a thin band across the top of the screen — the strip the
     header occupies — rather than the whole viewport. So the flip
     happens when the header crosses onto white, not when the white
     section first appears at the bottom of the screen.
     ─────────────────────────────────────────────────────────────────── */

  function watchLightSection() {
    if (!latest || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      document.body.dataset.onLight = entries[0].isIntersecting;
    }, { rootMargin: LIGHT_BAND }).observe(latest);
  }


  /* ── 7. SECTION REVEALS ─────────────────────────────────────────────
     One class per section; the CSS holds all durations and delays.
     ─────────────────────────────────────────────────────────────────── */

  function watchReveals() {
    var sections = [document.getElementById('about'), contact].filter(Boolean);
    if (!sections.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      sections.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   /* reveal once */
      });
    }, { threshold: 0.15 });

    sections.forEach(function (el) { observer.observe(el); });
  }


  /* ── 8. FILM SOUND ──────────────────────────────────────────────────
     Browsers refuse to autoplay video with sound, so the film always
     starts muted. The button turns sound on.

     wantsSound is tracked separately from video.muted because the film
     is muted automatically when it scrolls away, and we need to
     remember what was actually asked for.
     ─────────────────────────────────────────────────────────────────── */

  function syncButton() {
    if (!button) return;
    button.setAttribute('aria-pressed', wantsSound);
    /* Label names the action the click will perform. */
    if (label) label.textContent = wantsSound ? 'mute' : 'sound on';
  }

  function setUpSound() {
    if (!video) return;

    if (button) {
      button.addEventListener('click', function () {
        wantsSound = !wantsSound;
        video.muted = !wantsSound;

        /* iOS sometimes needs playback nudging when unmuting. */
        if (wantsSound && video.paused) video.play().catch(function () {});
        syncButton();
      });
    }

    syncButton();

    /* If autoplay is refused outright, show controls so the film can
       still be started by hand. */
    video.play().catch(function () {
      video.setAttribute('controls', '');
    });
  }


  /* ── 9. PAUSE OFF SCREEN ────────────────────────────────────────────
     Otherwise someone who turns the sound on and scrolls to the bottom
     is left with audio from a film they can't see and a mute button
     that has faded away. Also saves decoding video nobody is looking
     at, which matters on phones.
     ─────────────────────────────────────────────────────────────────── */

  function watchFilm() {
    if (!video || !hero || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          video.muted = !wantsSound;          /* restore their choice */
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0 }).observe(hero);
  }


  /* ── WIRING ─────────────────────────────────────────────────────── */

  document.body.appendChild(probe);
  measureAll();
  updateScroll();

  if (wordmark) {
    /* An image already in the cache fires no load event. */
    if (wordmark.complete) { measureAll(); updateScroll(); }

    wordmark.addEventListener('load', function () {
      measureAll();
      updateScroll();
    });

    /* If the file is missing or misnamed, say so plainly rather than
       leaving a silent gap where the wordmark should be. */
    wordmark.addEventListener('error', function () {
      console.warn('Wordmark failed to load: ' + wordmark.getAttribute('src'));
    });
  }

  /* passive tells the browser we won't block scrolling. */
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile browsers fire resize when the address bar slides away, with
     the width unchanged. Re-measuring on those would reintroduce the
     stutter the cache exists to prevent, so only a real width change
     counts. Rotating a phone changes the width, so that still works. */
  window.addEventListener('resize', function () {
    if (root.clientWidth === viewportW) return;
    measureAll();      /* --wm-dock uses min(), so it changes with width */
    updateScroll();
  });

  watchLightSection();
  watchReveals();
  setUpSound();
  watchFilm();

})();
