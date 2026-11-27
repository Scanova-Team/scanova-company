/* ==========================================================================
   SCANOVA MOTION SYSTEM
   Vanilla JavaScript + GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13
   Premium 60fps motion architecture for cybersecurity landing page.
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONFIGURATION & TUNING CONSTANTS
     Tweak durations, easings, and offsets here to calibrate feel.
     ========================================================================== */
  const CONFIG = {
    // Easing definitions
    easeIntro: 'expo.out',
    easeReveal: 'power3.out',
    easeHeroRise: 'back.out(1.2)',
    easeSpread: 'elastic.out(1, 0.6)',
    easeReturn: 'power3.out',
    easeTilt: 'power2.out',
    easeMagnetic: 'elastic.out(1, 0.4)',

    // Durations (in seconds)
    durIntro: 1.1,
    durReveal: 0.8,
    durSpread: 0.8,
    durReturn: 0.6,
    durMagnetic: 0.7,

    // Hero 3D Parallax Tilt Intensities (pointer move over .stage)
    tiltIntensity: {
      left:  { rotX: 9,  rotY: 11, x: 16, y: 12 },
      mid:   { rotX: 7,  rotY: 9,  x: 12, y: 10 },
      right: { rotX: 11, rotY: 13, x: 18, y: 14 }
    },

    // Hero Phones Spread Offsets (hover or tap) - upward fan spread & separation
    spreadOffsets: {
      left:  { x: -85, y: -36, rot: -9, scale: 1.02 },
      mid:   { x: 0,   y: -48, rot: 0,  scale: 1.08 },
      right: { x: 85,  y: -32, rot: 9,  scale: 1.02 }
    },

    // Hero Phones Scroll Scrub Drift (ScrollTrigger scrub: 1)
    heroScrollDrift: {
      left:  { y: -70, rot: -4 },
      mid:   { y: -35, rot: 0 },
      right: { y: -90, rot: 5 }
    },

    // Staggers
    staggerCards: 0.08,
    staggerWords: 0.035,
    staggerStrip: 0.08
  };

  /* ==========================================================================
     2. CLIPBOARD COPY BUTTON LOGIC
     Always functional regardless of animation or motion state.
     ========================================================================== */
  function initCopyButtons() {
    const buttons = document.querySelectorAll('[data-copy]');
    buttons.forEach((btn) => {
      const label = btn.querySelector('span');
      btn.addEventListener('click', () => {
        const reset = () => setTimeout(() => {
          if (label) label.textContent = 'Copy';
        }, 1800);

        const selectText = () => {
          const targetId = btn.getAttribute('data-target');
          const el = document.getElementById(targetId);
          if (el) {
            const r = document.createRange();
            r.selectNodeContents(el);
            const s = window.getSelection();
            s.removeAllRanges();
            s.addRange(r);
          }
          if (label) label.textContent = 'Selected';
          reset();
        };

        const text = btn.getAttribute('data-copy');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(() => {
              if (label) label.textContent = 'Copied';
              reset();
            })
            .catch(selectText);
        } else {
          selectText();
        }
      });
    });
  }

  // Ensure copy buttons run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }

  /* ==========================================================================
     3. SAFETY CHECKS & ENVIRONMENT DETECTION
     ========================================================================== */
  // If GSAP or ScrollTrigger failed to load from CDN, leave content 100% visible.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const isTouch = window.matchMedia('(pointer: coarse)').matches ||
                  ('ontouchstart' in window) ||
                  navigator.maxTouchPoints > 0;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Signal that JS motion is ready so JS-only dynamic styles can apply
  document.documentElement.classList.add('js-motion-ready');

  /* ==========================================================================
     4. PREFERS-REDUCED-MOTION CONFIGURATION
     Allows micro-interactions (spread & hover) while disabling continuous scrub.
     ========================================================================== */
  const stageEl = document.querySelector('.stage');
  if (stageEl) {
    stageEl.addEventListener('click', () => stageEl.classList.toggle('spread'));
    ['pointerenter', 'mouseenter'].forEach(ev => stageEl.addEventListener(ev, () => stageEl.classList.add('spread')));
    ['pointerleave', 'mouseleave'].forEach(ev => stageEl.addEventListener(ev, (e) => {
      if (e.relatedTarget && stageEl.contains(e.relatedTarget)) return;
      stageEl.classList.remove('spread');
    }));
  }

  /* ==========================================================================
     5. LENIS SMOOTH SCROLL INTEGRATION
     Disabled on touch devices to keep native momentum scrolling.
     ========================================================================== */
  let lenis = null;
  if (!isTouch && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Connect Lenis to GSAP Ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable lag smoothing to prevent visual stutter during heavy scrolls
    gsap.ticker.lagSmoothing(0);
  }

  /* ==========================================================================
     6. TEXT SPLITTER UTILITY (LIGHTWEIGHT, ACCESSIBLE, NO PAID PLUGINS)
     ========================================================================== */
  function splitIntoWords(element) {
    if (!element || element.dataset.split) return [];
    element.dataset.split = 'true';
    const rawText = element.textContent.trim();
    element.setAttribute('aria-label', rawText);

    const words = rawText.split(/\s+/);
    element.innerHTML = '';

    const wordInners = [];
    words.forEach((w, i) => {
      const mask = document.createElement('span');
      mask.className = 'word-mask';
      mask.setAttribute('aria-hidden', 'true');

      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = w;

      mask.appendChild(inner);
      element.appendChild(mask);
      wordInners.push(inner);

      if (i < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });

    return wordInners;
  }

  /* ==========================================================================
     7. INITIAL STATES (APPLIED VIA GSAP TO PREVENT CLS AND AVOID HIDDEN CONTENT)
     ========================================================================== */
  const revealTargets = document.querySelectorAll(
    '.sec-head, .card, .feat article, .step, .strip figure, .member, .panel, .cover, .foot-note, .about > div:first-child'
  );

  gsap.set(revealTargets, {
    opacity: 0,
    y: 40,
    filter: 'blur(4px)'
  });

  const h1El = document.querySelector('h1');
  const h1Words = h1El ? splitIntoWords(h1El) : [];
  if (h1Words.length) {
    gsap.set(h1Words, { yPercent: 120, opacity: 0 });
  }

  const h2Elements = document.querySelectorAll('h2');
  const h2Map = new Map();
  h2Elements.forEach((h2) => {
    const words = splitIntoWords(h2);
    if (words.length) {
      gsap.set(words, { yPercent: 115, opacity: 0 });
      h2Map.set(h2, words);
    }
  });

  /* ==========================================================================
     8. PAGE INTRO TIMELINE (< 1.6s TOTAL)
     ========================================================================== */
  const introTl = gsap.timeline({
    defaults: { ease: CONFIG.easeIntro }
  });

  introTl
    .from('.brand, .nav a', {
      y: -22,
      opacity: 0,
      stagger: 0.04,
      duration: 0.7
    }, 0)
    .from('.eyebrow', {
      y: 16,
      opacity: 0,
      duration: 0.6
    }, 0.08);

  if (h1Words.length) {
    introTl.to(h1Words, {
      yPercent: 0,
      opacity: 1,
      stagger: CONFIG.staggerWords,
      duration: 0.85
    }, 0.12);
  }

  introTl
    .from('.lede', {
      y: 20,
      opacity: 0,
      duration: 0.7
    }, 0.32)
    .from('.links .link, .links .split', {
      y: 24,
      opacity: 0,
      stagger: 0.08,
      duration: 0.75
    }, 0.42)
    .from('.stage', {
      y: 75,
      opacity: 0,
      duration: 1.15,
      ease: CONFIG.easeHeroRise
    }, 0.28)
    .from('.stage-note', {
      opacity: 0,
      duration: 0.6
    }, 0.75);

  /* ==========================================================================
     9. HERO PHONES COMPOSITE PHYSICS SYSTEM
     Coordinates idle float, 3D parallax tilt (quickTo), hover spread, and scroll.
     ========================================================================== */
  const stage = document.querySelector('.stage');
  const pLeft = document.querySelector('.stage .p-left');
  const pMid = document.querySelector('.stage .p-mid');
  const pRight = document.querySelector('.stage .p-right');

  if (stage && pLeft && pMid && pRight) {
    const phoneData = [
      {
        el: pLeft,
        baseRot: -6,
        idle: { y: 0, rot: 0 },
        tilt: { x: 0, y: 0, rotX: 0, rotY: 0 },
        spread: { x: 0, y: 0, rot: 0, scale: 1 },
        scroll: { x: 0, y: 0, rot: 0 },
        hoverBoost: { scale: 1, y: 0 },
        cfg: {
          tilt: CONFIG.tiltIntensity.left,
          spread: CONFIG.spreadOffsets.left,
          drift: CONFIG.heroScrollDrift.left
        }
      },
      {
        el: pMid,
        baseRot: 0,
        idle: { y: 0, rot: 0 },
        tilt: { x: 0, y: 0, rotX: 0, rotY: 0 },
        spread: { x: 0, y: 0, rot: 0, scale: 1 },
        scroll: { x: 0, y: 0, rot: 0 },
        hoverBoost: { scale: 1, y: 0 },
        cfg: {
          tilt: CONFIG.tiltIntensity.mid,
          spread: CONFIG.spreadOffsets.mid,
          drift: CONFIG.heroScrollDrift.mid
        }
      },
      {
        el: pRight,
        baseRot: 6,
        idle: { y: 0, rot: 0 },
        tilt: { x: 0, y: 0, rotX: 0, rotY: 0 },
        spread: { x: 0, y: 0, rot: 0, scale: 1 },
        scroll: { x: 0, y: 0, rot: 0 },
        hoverBoost: { scale: 1, y: 0 },
        cfg: {
          tilt: CONFIG.tiltIntensity.right,
          spread: CONFIG.spreadOffsets.right,
          drift: CONFIG.heroScrollDrift.right
        }
      }
    ];

    // Initialize quickTo setters for 3D parallax tilt
    phoneData.forEach((p) => {
      p.qTiltX = gsap.quickTo(p.tilt, 'x', { duration: 0.45, ease: CONFIG.easeTilt });
      p.qTiltY = gsap.quickTo(p.tilt, 'y', { duration: 0.45, ease: CONFIG.easeTilt });
      p.qRotX  = gsap.quickTo(p.tilt, 'rotX', { duration: 0.45, ease: CONFIG.easeTilt });
      p.qRotY  = gsap.quickTo(p.tilt, 'rotY', { duration: 0.45, ease: CONFIG.easeTilt });
    });

    // Idle physical floating animation (sine waves with phase differences)
    gsap.to(phoneData[0].idle, {
      y: -11,
      rot: -0.6,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
    gsap.to(phoneData[1].idle, {
      y: -15,
      duration: 2.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.35
    });
    gsap.to(phoneData[2].idle, {
      y: -12,
      rot: 0.8,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.7
    });

    // Pointer move over .stage for 3D tilt
    if (!isTouch) {
      stage.addEventListener('pointermove', (e) => {
        const rect = stage.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        phoneData.forEach((p) => {
          p.qTiltX(nx * p.cfg.tilt.x);
          p.qTiltY(ny * p.cfg.tilt.y);
          p.qRotX(-ny * p.cfg.tilt.rotX);
          p.qRotY(nx * p.cfg.tilt.rotY);
        });
      });

      stage.addEventListener('pointerleave', () => {
        phoneData.forEach((p) => {
          p.qTiltX(0);
          p.qTiltY(0);
          p.qRotX(0);
          p.qRotY(0);
        });
      });
    }

    // Hover / tap spread animation
    let isSpread = false;
    function triggerSpread(active) {
      isSpread = active;
      phoneData.forEach((p, idx) => {
        gsap.to(p.spread, {
          x: active ? p.cfg.spread.x : 0,
          y: active ? p.cfg.spread.y : 0,
          rot: active ? p.cfg.spread.rot : 0,
          scale: active ? p.cfg.spread.scale : 1,
          duration: active ? CONFIG.durSpread : CONFIG.durReturn,
          ease: active ? CONFIG.easeSpread : CONFIG.easeReturn,
          overwrite: 'auto'
        });

        if (!active) {
          gsap.to(p.hoverBoost, {
            scale: 1,
            y: 0,
            duration: CONFIG.durReturn,
            ease: CONFIG.easeReturn,
            overwrite: 'auto'
          });
          p.el.style.zIndex = idx === 1 ? '2' : '1';
        }
      });
    }

    // Trigger upward spread on stage hover
    ['pointerenter', 'mouseenter'].forEach((ev) => {
      stage.addEventListener(ev, () => {
        stage.classList.add('spread');
        triggerSpread(true);
      });
    });

    ['pointerleave', 'mouseleave'].forEach((ev) => {
      stage.addEventListener(ev, (e) => {
        if (e.relatedTarget && stage.contains(e.relatedTarget)) return;
        stage.classList.remove('spread');
        triggerSpread(false);
      });
    });

    // Individual phone hover focus boost while spread
    phoneData.forEach((p, idx) => {
      ['pointerenter', 'mouseenter'].forEach((ev) => {
        p.el.addEventListener(ev, () => {
          triggerSpread(true);
          gsap.to(p.hoverBoost, {
            scale: 1.05,
            y: -10,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          p.el.style.zIndex = '10';
        });
      });

      ['pointerleave', 'mouseleave'].forEach((ev) => {
        p.el.addEventListener(ev, (e) => {
          gsap.to(p.hoverBoost, {
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: 'auto'
          });
          p.el.style.zIndex = idx === 1 ? '2' : '1';
        });
      });
    });

    stage.addEventListener('click', () => {
      triggerSpread(!isSpread);
    });

    // Scroll scrub: phones separate and drift upward
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const prog = self.progress;
        phoneData.forEach((p) => {
          p.scroll.y = prog * p.cfg.drift.y;
          p.scroll.rot = prog * p.cfg.drift.rot;
        });
      }
    });

    // Composite 60fps render tick
    gsap.ticker.add(() => {
      phoneData.forEach((p) => {
        const totalX = p.tilt.x + p.spread.x + p.scroll.x;
        const totalY = p.idle.y + p.tilt.y + p.spread.y + p.scroll.y + p.hoverBoost.y;
        const totalRot = p.baseRot + p.idle.rot + (p.tilt.rotY * 0.15) + p.spread.rot + p.scroll.rot;
        const totalScale = p.spread.scale * p.hoverBoost.scale;

        gsap.set(p.el, {
          x: totalX,
          y: totalY,
          rotationX: p.tilt.rotX,
          rotationY: p.tilt.rotY,
          rotation: totalRot,
          scale: totalScale,
          force3D: true
        });
      });
    });
  }

  /* ==========================================================================
     10. CURSOR-FOLLOW GLOW (GLOBAL ACROSS ALL SECTIONS & SCROLLING)
     ========================================================================== */
  const cursorGlow = document.querySelector('.cursor-glow') || document.querySelector('.hero-glow');
  if (cursorGlow) {
    const qGlowX = gsap.quickTo(cursorGlow, 'x', { duration: 0.45, ease: 'power3' });
    const qGlowY = gsap.quickTo(cursorGlow, 'y', { duration: 0.45, ease: 'power3' });

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      qGlowX(e.clientX);
      qGlowY(e.clientY);
      gsap.to(cursorGlow, { opacity: 1, duration: 0.3, overwrite: 'auto' });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });

    document.addEventListener('mouseleave', () => {
      gsap.to(cursorGlow, { opacity: 0, duration: 0.35, overwrite: 'auto' });
    });
  }

  /* ==========================================================================
     11. SCROLL PROGRESS BAR (DRIVEN BY SCROLLTRIGGER SCRUB)
     ========================================================================== */
  const progressBar = document.querySelector('.progress i');
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15
      }
    });
  }

  /* ==========================================================================
     12. SCROLL REVEALS VIA SCROLLTRIGGER.BATCH (PERFORMANCE OPTIMIZED)
     ========================================================================== */
  ScrollTrigger.batch(revealTargets, {
    interval: 0.08,
    batchMax: 4,
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: CONFIG.staggerCards,
        duration: CONFIG.durReveal,
        ease: CONFIG.easeReveal,
        clearProps: 'filter,willChange'
      });
    }
  });

  /* ==========================================================================
     13. WORD-BY-WORD HEADING (H2) REVEALS ON SCROLL
     ========================================================================== */
  h2Map.forEach((words, h2) => {
    ScrollTrigger.create({
      trigger: h2,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          stagger: CONFIG.staggerWords,
          duration: CONFIG.durReveal,
          ease: CONFIG.easeReveal
        });
      }
    });
  });

  /* ==========================================================================
     14. WEB COVER ZOOM & CLIP-PATH MASKED REVEAL
     ========================================================================== */
  const coverImg = document.querySelector('.cover img');
  if (coverImg) {
    gsap.fromTo(coverImg,
      {
        scale: 1.08,
        clipPath: 'inset(10% 6% round 16px)'
      },
      {
        scale: 1,
        clipPath: 'inset(0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.cover',
          start: 'top 85%',
          end: 'top 25%',
          scrub: 1
        }
      }
    );
  }

  /* ==========================================================================
     15. "HOW IT WORKS" (#how) SEQUENTIAL SCRUB & PARALLAX
     Desktop vs Mobile responsive via gsap.matchMedia.
     ========================================================================== */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    // Desktop: Steps animate in sequence with scrub and column parallax
    const stepPhones = document.querySelectorAll('.step img');
    if (stepPhones.length === 3) {
      // Step 1: gentle float up
      gsap.fromTo(stepPhones[0],
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 70%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );

      // Step 2: medium float up
      gsap.fromTo(stepPhones[1],
        { yPercent: 18 },
        {
          yPercent: -22,
          ease: 'none',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 70%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );

      // Step 3: higher float up
      gsap.fromTo(stepPhones[2],
        { yPercent: 24 },
        {
          yPercent: -32,
          ease: 'none',
          scrollTrigger: {
            trigger: '#how',
            start: 'top 70%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );
    }
  });

  mm.add('(max-width: 899px)', () => {
    // Mobile: Soft parallax per card without pinning
    const stepPhones = document.querySelectorAll('.step img');
    stepPhones.forEach((img) => {
      gsap.fromTo(img,
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 0.6
          }
        }
      );
    });
  });

  /* ==========================================================================
     16. PREMIUM STRIP FAN-OUT
     Phones stagger in with rotation and spread, settling flat.
     ========================================================================== */
  const premiumStrip = document.querySelector('#premium .strip');
  const premiumFigures = document.querySelectorAll('#premium .strip figure');

  if (premiumStrip && premiumFigures.length) {
    ScrollTrigger.create({
      trigger: premiumStrip,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const fanOffsets = [-36, -14, 14, 36];
        const fanRotations = [-7, -2.5, 2.5, 7];

        premiumFigures.forEach((fig, i) => {
          const spreadX = fanOffsets[i] !== undefined ? fanOffsets[i] : 0;
          const rot = fanRotations[i] !== undefined ? fanRotations[i] : 0;

          gsap.fromTo(fig,
            {
              x: spreadX,
              rotation: rot,
              y: 35,
              opacity: 0
            },
            {
              x: 0,
              rotation: 0,
              y: 0,
              opacity: 1,
              duration: CONFIG.durReveal,
              delay: i * CONFIG.staggerStrip,
              ease: CONFIG.easeReveal,
              clearProps: 'transform'
            }
          );
        });
      }
    });
  }

  /* ==========================================================================
     17. CONTACT PANEL & MAGNETIC HOVER BUTTONS
     Pointer devices only for magnetic effect.
     ========================================================================== */
  if (!isTouch && window.matchMedia('(pointer: fine)').matches) {
    const magneticItems = document.querySelectorAll('#contact .panel .link, #contact .panel .copy');
    magneticItems.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        const pull = 0.22;

        gsap.to(btn, {
          x: relX * pull,
          y: relY * pull,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: CONFIG.durMagnetic,
          ease: CONFIG.easeMagnetic,
          overwrite: 'auto'
        });
      });
    });
  }

  /* ==========================================================================
     18. NAV LINKS SMOOTH SCROLL (LENIS WITH NATIVE FALLBACK)
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = targetId === '#top' ? document.body : document.querySelector(targetId);
      if (!targetEl) return;

      if (lenis) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -24,
          duration: 1.15
        });
      }
    });
  });

  /* ==========================================================================
     19. ALL SCREENS INTERACTIVE HOVER LIFT
     Every screen lifts up slightly on hover and returns smoothly on leave.
     ========================================================================== */
  function attachScreenLift(container, img, liftAmount) {
    if (!img) return;
    const lift = liftAmount !== undefined ? liftAmount : -12;
    let isLifted = false;

    const liftUp = () => {
      if (isLifted) return;
      isLifted = true;
      gsap.to(img, {
        y: lift,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const dropDown = (e) => {
      if (!isLifted) return;
      if (e && container && e.relatedTarget && container.contains(e.relatedTarget)) {
        return;
      }
      isLifted = false;
      gsap.to(img, {
        y: 0,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    };

    const eventsEnter = ['pointerenter', 'mouseenter'];
    const eventsLeave = ['pointerleave', 'mouseleave'];

    if (container && container !== img) {
      eventsEnter.forEach(ev => container.addEventListener(ev, liftUp));
      eventsLeave.forEach(ev => container.addEventListener(ev, dropDown));
    }
    eventsEnter.forEach(ev => img.addEventListener(ev, liftUp));
    eventsLeave.forEach(ev => img.addEventListener(ev, dropDown));
  }

  function initScreenLifts() {
    const coverEl = document.querySelector('.cover');
    const coverImgEl = document.querySelector('.cover img');
    if (coverEl && coverImgEl) {
      attachScreenLift(coverEl, coverImgEl, -10);
    }

    document.querySelectorAll('.step').forEach((step) => {
      const img = step.querySelector('img');
      attachScreenLift(step, img, -14);
    });

    document.querySelectorAll('#how .strip figure').forEach((fig) => {
      const img = fig.querySelector('img');
      attachScreenLift(fig, img, -12);
    });

    document.querySelectorAll('#premium .strip figure').forEach((fig) => {
      const img = fig.querySelector('img');
      attachScreenLift(fig, img, -12);
    });
  }

  /* ==========================================================================
     20. TEAM MEMBER CARDS DYNAMIC ILLUMINATION & GLOW
     ========================================================================== */
  function initMemberGlow() {
    const memberCards = document.querySelectorAll('.member');
    memberCards.forEach((card) => {
      const updateGlow = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      };
      card.addEventListener('pointermove', updateGlow);
      card.addEventListener('mousemove', updateGlow);
    });
  }

  initScreenLifts();
  initMemberGlow();

})();
