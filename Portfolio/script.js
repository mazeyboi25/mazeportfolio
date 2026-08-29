document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const hasLenis = typeof window.Lenis !== 'undefined';
const isMobileViewport = window.matchMedia('(max-width: 820px)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

function initLenis() {
  if (!hasLenis || reduceMotion) return null;

  const lenis = new Lenis({
    lerp: isMobileViewport ? 0.14 : 0.085,
    smoothWheel: true,
    anchors: true,
    wheelMultiplier: isMobileViewport ? 1 : 0.9,
  });

  if (hasGSAP) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  return lenis;
}

const lenis = initLenis();

function forceHeroVisible() {
  document.body.classList.remove('is-loading');
  document.body.classList.add('hero-live');
  const loader = document.querySelector('.loader');
  if (loader) loader.style.display = 'none';

  const visible = [
    '.site-header .brand', '.site-header .nav-link', '.site-header .availability',
    '.hero-line > span', '.hero__meta', '.eyebrow', '.hero__dek',
    '.hero__contact-strip', '.hero__map-card', '.hero__footer .kicker',
    '.hero__statement p', '.hero__footer .scroll-cue', '.hero__motion-field'
  ];
  visible.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.visibility = 'visible';
    });
  });
  document.querySelector('.site-header')?.style.setProperty('--header-line', '1');
  if (document.querySelector('.hero__footer')) document.querySelector('.hero__footer').style.borderTopColor = 'rgba(255,255,255,.11)';
  document.querySelectorAll('.ph-island').forEach(path => {
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '0';
    path.style.opacity = path.classList.contains('ph-island--mindanao') ? '1' : '.78';
  });
  lenis?.start();
}

function fallbackReveal() {
  forceHeroVisible();
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
  document.querySelectorAll('.split-reveal').forEach(el => el.style.visibility = 'visible');
  document.querySelectorAll('.quote-line > span').forEach(el => {
    el.style.transform = 'none';
    el.style.opacity = '1';
  });
  revealWorkShowcaseFallback();
}

function runIntroSequence() {
  document.body.classList.add('is-loading');
  lenis?.stop();

  const counter = { value: 0 };
  const loaderCounter = document.querySelector('.loader__counter');
  const loader = document.querySelector('.loader');

  // Establish every concealed state before the loader leaves the viewport.
  gsap.set('.site-header .brand, .site-header .nav-link, .site-header .availability', { opacity: 0, y: -14 });
  gsap.set('.site-header', { '--header-line': 0 });
  gsap.set('.hero__meta, .eyebrow, .hero__dek, .hero__contact-strip', { opacity: 0, y: 20 });
  // MAZE / BUILDS begins concealed and is revealed by this same timeline.
  // Keeping the reveal inside GSAP removes the fragile CSS-class handoff.
  gsap.set('.hero-line > span', { visibility: 'visible', opacity: 0, yPercent: 118, rotationX: 9, transformOrigin: '50% 100%', filter: 'blur(7px)' });
  gsap.set('.hero__map-card', { opacity: 0, x: 28, scale: .975 });
  gsap.set('.hero__motion-field', { opacity: 0 });
  gsap.set('.hero__footer .kicker, .hero__statement p, .hero__footer .scroll-cue', { opacity: 0, y: 18 });
  gsap.set('.hero__footer', { borderTopColor: 'rgba(255,255,255,0)' });
  gsap.set('.ph-island', { strokeDasharray: 1, strokeDashoffset: 1, opacity: .12 });

  const heroSafety = window.setTimeout(() => {
    if (document.body.classList.contains('is-loading')) forceHeroVisible();
  }, 7000);

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => window.clearTimeout(heroSafety)
  });

  tl
    .from('.loader__top', { opacity: 0, y: -10, duration: .42 })
    .from('.loader__word', { yPercent: 125, duration: .78, stagger: .10 }, '-=.14')
    .to('.loader__bar span', { width: '100%', duration: 1.0, ease: 'power2.inOut' }, '-=.48')
    .to(counter, {
      value: 100,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (loaderCounter) loaderCounter.textContent = String(Math.floor(counter.value)).padStart(3, '0');
      }
    }, '<')
    .to('.loader__word', { yPercent: -125, duration: .58, stagger: .06, ease: 'power3.in' }, '+=.04')
    .to('.loader__top, .loader__bar', { opacity: 0, duration: .30 }, '-=.34')
    .to('.loader', { yPercent: -100, duration: .86, ease: 'power4.inOut' })
    .set('.loader', { display: 'none' })
    .add(() => {
      document.body.classList.remove('is-loading');
      lenis?.start();
      if (hasGSAP) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    })
    // Header and hero now share one uninterrupted timeline. There is no
    // class toggle / CSS keyframe handoff, which removes the refresh-like jump.
    .to('.site-header', { '--header-line': 1, duration: .72, ease: 'power2.out' }, '-=.08')
    .to('.site-header .brand, .site-header .nav-link, .site-header .availability', {
      opacity: 1, y: 0, duration: .62, stagger: .065, ease: 'power3.out'
    }, '-=.62')
    .to('.hero__meta', { opacity: 1, y: 0, duration: .60 }, '-=.47')
    .to('.eyebrow', { opacity: 1, y: 0, duration: .56 }, '-=.42')
    // Hand the title reveal to one native CSS sequence. This avoids competing
    // transforms between GSAP and the stylesheet while preserving the same
    // concealed-first MAZE / BUILDS entrance.
    .add(() => document.body.classList.add('hero-live'), '-=.30')
    .to({}, { duration: 1.22 })
    .to('.hero__motion-field', { opacity: .48, duration: .9, ease: 'power2.out' }, '-=.72')
    .to('.hero__dek', { opacity: 1, y: 0, duration: .68 }, '-=.56')
    .to('.hero__contact-strip', { opacity: 1, y: 0, duration: .70 }, '-=.50')
    .to('.hero__map-card', { opacity: 1, x: 0, scale: 1, duration: .86, ease: 'power4.out' }, '-=.76')
    .to('.hero__footer', { borderTopColor: 'rgba(255,255,255,.11)', duration: .45 }, '-=.30')
    .to('.hero__footer .kicker, .hero__statement p, .hero__footer .scroll-cue', {
      opacity: 1, y: 0, duration: .65, stagger: .11, ease: 'power3.out'
    }, '-=.32')
    .to('.ph-island', {
      strokeDashoffset: 0,
      opacity: (i, target) => target.classList.contains('ph-island--mindanao') ? 1 : .78,
      duration: .85,
      stagger: .025,
      ease: 'power2.out'
    }, '-=.56')
    .add(() => {
      gsap.to('.motion-path--a', { strokeDashoffset: -120, duration: 12, ease: 'none', repeat: -1 });
      gsap.to('.motion-path--b', { strokeDashoffset: 100, duration: 15, ease: 'none', repeat: -1 });
      gsap.to('.motion-path--c', { strokeDashoffset: -80, duration: 18, ease: 'none', repeat: -1 });
    });
}
function initSplitText() {
  document.querySelectorAll('.split-reveal').forEach(el => {
    const html = el.innerHTML;
    const chunks = html.split(/(<br\s*\/?\s*>)/gi).filter(Boolean);
    el.innerHTML = chunks.map(chunk => {
      if (/^<br/i.test(chunk)) return chunk;
      return `<span class="split-line"><span>${chunk}</span></span>`;
    }).join('');
    el.style.visibility = 'visible';
  });
}

function initScrollSequences() {
  gsap.registerPlugin(ScrollTrigger);
  initSplitText();

  // Scroll progress
  gsap.to('.scroll-progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: .15 }
  });

  // Soft global background travel. Skip this scrub on phones to reduce
  // continuous compositing while the user is touch-scrolling.
  if (!isMobileViewport) {
    gsap.to('.hero__glow--one', {
      yPercent: 80,
      xPercent: -25,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
  }

  // Standard reveals. Small Builds use their own staged reveal below.
  document.querySelectorAll('.reveal:not(.small-project)').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: .85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // Decorative motion system: original graphics inspired by modern interaction
  // libraries and component galleries, kept subtle so the portfolio stays professional.
  gsap.fromTo('.work__graphic .ui-card',
    { y: 26, rotateZ: (i) => i === 0 ? -16 : i === 1 ? 13 : -7, opacity: 0 },
    {
      y: 0, rotateZ: (i) => i === 0 ? -9 : i === 1 ? 7 : -2, opacity: 1,
      duration: .9, stagger: .1, ease: 'power4.out',
      scrollTrigger: { trigger: '.work__graphic', start: 'top 84%', once: true }
    }
  );

  gsap.fromTo('.capability-graphic',
    { scale: .78, rotate: -8, opacity: 0 },
    {
      scale: 1, rotate: 0, opacity: 1, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: '.capability-graphic', start: 'top 86%', once: true }
    }
  );

  const processPath = document.querySelector('.process-graphic path');
  if (processPath) {
    const length = processPath.getTotalLength();
    gsap.set(processPath, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(processPath, {
      strokeDashoffset: 0, duration: 1.45, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.process-graphic', start: 'top 85%', once: true }
    });
    gsap.from('.process-graphic circle', {
      scale: 0, transformOrigin: 'center', duration: .45, stagger: .18, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.process-graphic', start: 'top 82%', once: true }
    });
  }

  gsap.fromTo('.profile-signal',
    { x: 22, opacity: 0 },
    {
      x: 0, opacity: 1, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.profile-signal', start: 'top 88%', once: true }
    }
  );

  // Text lines: each heading gets a sequence, not a single fade.
  document.querySelectorAll('.split-reveal').forEach(el => {
    const lines = el.querySelectorAll('.split-line > span');
    gsap.set(lines, { yPercent: 115, display: 'block' });
    gsap.to(lines, {
      yPercent: 0,
      duration: .95,
      stagger: .09,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  });

  // Intro counters are tied to the same visibility sequence.
  document.querySelectorAll('.stat__value').forEach(el => {
    const target = Number(el.dataset.count);
    const state = { n: 0 };
    gsap.to(state, {
      n: target,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => el.textContent = String(Math.round(state.n)).padStart(2, '0'),
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  // Flagship and Small Builds use the dedicated cinematic work-motion system.

  // Capability rows cascade as a group when the system comes into view.
  gsap.fromTo('.capability-row',
    { x: 36, opacity: 0 },
    {
      x: 0, opacity: 1, duration: .72, stagger: .09, ease: 'power3.out',
      scrollTrigger: { trigger: '.capability-list', start: 'top 80%', once: true }
    }
  );

  // Quote sequence fills the viewport like a scene transition.
  const quoteTl = gsap.timeline({
    scrollTrigger: { trigger: '.principle', start: 'top 55%', once: true }
  });
  quoteTl
    .from('.quote-line > span', { yPercent: 115, opacity: 0, duration: 1, stagger: .11, ease: 'power4.out', immediateRender: false })
    .from('.principle__note', { opacity: 0, y: 20, duration: .65, immediateRender: false }, '-=.35');

  // Contact orb and heading drift at different rates for depth.
  gsap.fromTo('.contact__orb',
    { xPercent: 18, scale: .8, opacity: .15 },
    {
      xPercent: -5, scale: 1.12, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: 1.2 }
    }
  );
}


function initPrincipleKinetic() {
  const grid = document.querySelector('.principle-kinetic__dots');
  if (!grid) return;

  const columns = Number(grid.dataset.columns || 9);
  const rows = Number(grid.dataset.rows || 7);
  if (!grid.children.length) {
    for (let i = 0; i < columns * rows; i += 1) {
      const dot = document.createElement('i');
      dot.className = 'principle-kinetic__dot';
      grid.appendChild(dot);
    }
  }

  // Anime.js enhancement. The composition stays complete without the library;
  // when it is available the dot field ripples from the center in a staggered loop.
  if (reduceMotion || isMobileViewport || typeof window.anime !== 'function') return;

  window.anime({
    targets: '.principle-kinetic__dot',
    scale: [0.55, 1.35],
    opacity: [0.16, 0.86],
    delay: window.anime.stagger(42, { grid: [columns, rows], from: 'center' }),
    duration: 1120,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  });

  window.anime({
    targets: '.principle-kinetic__core',
    translateY: [-5, 6],
    rotate: [-1.2, 1.2],
    duration: 2600,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine'
  });

  window.anime({
    targets: '.principle-kinetic__chip',
    translateY: (el, i) => i % 2 ? [0, -7] : [0, 6],
    delay: window.anime.stagger(160),
    duration: 2200,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
  });
}


/* ============================================================
   WORK SHOWCASE MOTION
   Cinematic reveals for Flagship Systems + Small Builds.
   Desktop gets depth / directional movement; mobile keeps the
   same sequencing with lighter transforms for smooth scrolling.
   ============================================================ */
function initWorkShowcaseMotion() {
  if (!hasGSAP || reduceMotion) return;

  const flagshipCards = [...document.querySelectorAll('.project-list .project-card')];
  const smallCards = [...document.querySelectorAll('.small-builds__grid .small-project')];

  const playFlagship = (card, index) => {
    if (card.dataset.workAnimated === 'true') return;
    card.dataset.workAnimated = 'true';

    const info = card.querySelector('.project-card__info');
    const visual = card.querySelector('.project-card__visual');
    const screen = visual?.querySelector('.project-screenshot-link');
    const browserBar = visual?.querySelector('.project-browser-bar');
    const number = visual?.querySelector('.project-number');
    const badge = visual?.querySelector('.project-live-badge');
    const link = info?.querySelector('.project-link');

    if (!info || !visual || !screen) {
      card.classList.add('is-work-live');
      return;
    }

    card.classList.add('has-work-motion');

    let motionLayer = visual.querySelector('.project-motion-layer');
    if (!motionLayer) {
      motionLayer = document.createElement('span');
      motionLayer.className = 'project-motion-layer';
      motionLayer.setAttribute('aria-hidden', 'true');
      motionLayer.innerHTML = `
        <i class="project-motion-wipe"></i>
        <i class="project-motion-scan"></i>
        <i class="project-motion-corner project-motion-corner--tl"></i>
        <i class="project-motion-corner project-motion-corner--tr"></i>
        <i class="project-motion-corner project-motion-corner--bl"></i>
        <i class="project-motion-corner project-motion-corner--br"></i>
      `;
      visual.appendChild(motionLayer);
    }

    const wipe = motionLayer.querySelector('.project-motion-wipe');
    const scan = motionLayer.querySelector('.project-motion-scan');
    const corners = [...motionLayer.querySelectorAll('.project-motion-corner')];
    const infoChildren = [...info.children];
    const direction = index % 2 === 0 ? 1 : -1;

    gsap.set(infoChildren, { opacity: 0, y: isMobileViewport ? 18 : 24 });
    gsap.set(visual, {
      opacity: 0,
      x: isMobileViewport ? 0 : 34 * direction,
      y: isMobileViewport ? 24 : 0,
      scale: .985
    });
    gsap.set(screen, { y: 8, scale: .992 });

    if (browserBar) gsap.set(browserBar, { opacity: 0, y: -6 });
    if (number) gsap.set(number, { opacity: 0, scale: .8 });
    if (badge) gsap.set(badge, { opacity: 0, y: 7 });
    if (link) gsap.set(link, { '--project-link-progress': 0 });
    gsap.set(corners, { opacity: 0, scale: .8 });

    if (wipe) {
      gsap.set(wipe, {
        scaleX: 1,
        transformOrigin: direction > 0 ? '100% 50%' : '0% 50%'
      });
    }

    if (scan) gsap.set(scan, { xPercent: -170, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        card.classList.add('is-work-live');
        gsap.set([...infoChildren, visual, screen], { clearProps: 'willChange' });
      }
    });

    tl
      .to(infoChildren, {
        opacity: 1,
        y: 0,
        duration: .5,
        stagger: .055
      })
      .to(visual, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: .64,
        ease: 'power4.out'
      }, '-=.25')
      .to(screen, {
        y: 0,
        scale: 1,
        duration: .5
      }, '-=.4');

    if (wipe) {
      tl.to(wipe, {
        scaleX: 0,
        duration: .58,
        ease: 'power4.inOut'
      }, '-=.48');
    }

    tl.to(corners, {
      opacity: 1,
      scale: 1,
      duration: .25,
      stagger: .025
    }, '-=.34');

    if (browserBar) tl.to(browserBar, { opacity: 1, y: 0, duration: .26 }, '-=.28');
    if (number) tl.to(number, { opacity: 1, scale: 1, duration: .28 }, '-=.24');
    if (badge) tl.to(badge, { opacity: 1, y: 0, duration: .28 }, '-=.22');
    if (link) tl.to(link, { '--project-link-progress': 1, duration: .34 }, '-=.24');

    if (scan) {
      tl.to(scan, { opacity: .58, duration: .04 }, '-=.12')
        .to(scan, {
          xPercent: 650,
          opacity: 0,
          duration: .52,
          ease: 'power2.inOut'
        }, '<');
    }
  };

  const playSmall = (card) => {
    if (card.dataset.workAnimated === 'true') return;
    card.dataset.workAnimated = 'true';

    const preview = card.querySelector('.small-project__preview');
    const screen = card.querySelector('.small-project__screen');
    const top = card.querySelector('.small-project__top');
    const visit = card.querySelector('.small-project__visit');
    const content = card.querySelector('.small-project__content');
    const tags = [...card.querySelectorAll('.small-project__tags span')];

    if (!preview || !screen || !content) {
      card.classList.add('is-work-live');
      return;
    }

    gsap.set(card, { opacity: 1, y: 0 });
    card.classList.add('has-work-motion');

    let scan = preview.querySelector('.small-project__scan-beam');
    if (!scan) {
      scan = document.createElement('span');
      scan.className = 'small-project__scan-beam';
      scan.setAttribute('aria-hidden', 'true');
      preview.appendChild(scan);
    }

    const contentParts = [...content.children].filter(
      el => !el.classList.contains('small-project__tags')
    );

    gsap.set(preview, {
      opacity: 0,
      y: isMobileViewport ? 22 : 34,
      scale: .985
    });
    gsap.set(screen, { opacity: .68, scale: .994 });
    if (top) gsap.set(top, { opacity: 0, y: -7 });
    if (visit) gsap.set(visit, { opacity: 0, y: 7 });
    gsap.set(contentParts, { opacity: 0, y: 16 });
    gsap.set(tags, { opacity: 0, y: 7 });
    gsap.set(scan, { xPercent: -210, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        card.classList.add('is-work-live');
        gsap.set([preview, screen, ...contentParts, ...tags], { clearProps: 'willChange' });
      }
    });

    tl
      .to(preview, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: .56,
        ease: 'power4.out'
      })
      .to(screen, {
        opacity: 1,
        scale: 1,
        duration: .4
      }, '-=.34');

    if (top) tl.to(top, { opacity: 1, y: 0, duration: .24 }, '-=.28');
    if (visit) tl.to(visit, { opacity: 1, y: 0, duration: .24 }, '-=.24');

    tl
      .to(scan, { opacity: .46, duration: .04 }, '-=.2')
      .to(scan, {
        xPercent: 610,
        opacity: 0,
        duration: .48,
        ease: 'power2.inOut'
      }, '<')
      .to(contentParts, {
        opacity: 1,
        y: 0,
        duration: .38,
        stagger: .045
      }, '-=.34')
      .to(tags, {
        opacity: 1,
        y: 0,
        duration: .26,
        stagger: .025
      }, '-=.18');
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;
          const flagshipIndex = flagshipCards.indexOf(card);

          if (flagshipIndex >= 0) {
            playFlagship(card, flagshipIndex);
          } else {
            playSmall(card);
          }

          observer.unobserve(card);
        });
      },
      {
        threshold: isMobileViewport ? .08 : .12,
        rootMargin: '8% 0px -6% 0px'
      }
    );

    [...flagshipCards, ...smallCards].forEach(card => observer.observe(card));
  } else {
    flagshipCards.forEach(playFlagship);
    smallCards.forEach(playSmall);
  }
}

function revealWorkShowcaseFallback() {
  document.querySelectorAll('.project-list .project-card').forEach(card => {
    card.classList.add('is-work-live');
    card.querySelectorAll('.project-card__info > *, .project-card__visual, .project-screenshot-link, .project-browser-bar, .project-number, .project-live-badge').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.visibility = 'visible';
    });
  });

  document.querySelectorAll('.small-builds__grid .small-project').forEach(card => {
    card.classList.add('has-work-motion', 'is-work-live');
    card.style.opacity = '1';
    card.style.transform = 'none';
    card.querySelectorAll('.small-project__preview, .small-project__screen, .small-project__top, .small-project__visit, .small-project__content > *, .small-project__tags span').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.visibility = 'visible';
    });
  });
}

function initPointerLayer() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let cursorFrame = 0;

  const draw = () => {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;

    ringX += dx * .2;
    ringY += dy * .2;

    ring.style.transform =
      `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    if (Math.abs(dx) > .12 || Math.abs(dy) > .12) {
      cursorFrame = requestAnimationFrame(draw);
    } else {
      cursorFrame = 0;
    }
  };

  window.addEventListener(
    'mousemove',
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      dot.style.transform =
        `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      if (!cursorFrame) {
        cursorFrame = requestAnimationFrame(draw);
      }
    },
    { passive: true }
  );

  document.querySelectorAll('a, button, .project-card__visual').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
  });

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', event => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * .13,
        y: y * .17,
        duration: .24,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: .38,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  });
}

function initHeroMapPointer() {
  const card = document.querySelector('.hero__map-card');
  const map = document.querySelector('.philippines-map');
  if (!card || !map || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - .5;
    const ny = (e.clientY - r.top) / r.height - .5;
    gsap.to(map, {
      x: nx * 7,
      y: ny * 5,
      rotateZ: nx * .35,
      duration: .9,
      ease: 'power3.out'
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(map, { x: 0, y: 0, rotateZ: 0, duration: 1.1, ease: 'power3.out' });
  });
}

function initProjectTilt() {
  if (window.matchMedia('(pointer: coarse)').matches || reduceMotion) return;

  document.querySelectorAll('.project-card__visual').forEach((visual, index) => {
    const screen = visual.querySelector('.project-screenshot-link');

    // Screenshot projects behave like physical display panels: they keep a
    // permanent perspective angle, then subtly track the pointer around it.
    if (screen) {
      const baseY = index % 2 === 0 ? -5 : 5;
      const baseX = 2.5;

      visual.addEventListener('mousemove', e => {
        const r = visual.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5;
        const ny = (e.clientY - r.top) / r.height - .5;
        gsap.to(screen, {
          rotateY: baseY + nx * 5.5,
          rotateX: baseX - ny * 4.5,
          z: 24,
          duration: .5,
          transformPerspective: 1500,
          transformOrigin: '50% 50%',
          ease: 'power2.out'
        });
      });

      visual.addEventListener('mouseleave', () => {
        gsap.to(screen, {
          rotateY: baseY,
          rotateX: baseX,
          z: 16,
          duration: .85,
          transformPerspective: 1500,
          ease: 'power3.out'
        });
      });
      return;
    }

    visual.addEventListener('mousemove', e => {
      const r = visual.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      gsap.to(visual, { rotateY: nx * 2.5, rotateX: ny * -2.5, duration: .55, transformPerspective: 900, ease: 'power2.out' });
    });
    visual.addEventListener('mouseleave', () => gsap.to(visual, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }));
  });
}

function initSystemDemos() {
  const demos = [...document.querySelectorAll('[data-system-demo]')];
  if (!demos.length) return;

  const animateCounters = (demo) => {
    demo.querySelectorAll('[data-demo-count]').forEach(el => {
      const target = Number(el.dataset.demoCount || 0);
      if (!Number.isFinite(target) || el.dataset.demoCounted === 'true') return;
      el.dataset.demoCounted = 'true';
      if (reduceMotion || target === 0) {
        el.textContent = String(target);
        return;
      }
      const started = performance.now();
      const duration = 1100 + Math.min(target, 240) * 1.4;
      const tick = (now) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  const activate = (demo) => {
    if (demo.classList.contains('is-active')) return;
    demo.classList.add('is-active');
    animateCounters(demo);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        activate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '18% 0px 18% 0px' });
    demos.forEach(demo => observer.observe(demo));

    // Short-viewport safety: if an oversized project panel never satisfies the
    // observer threshold, activate it as soon as any meaningful part is visible.
    const visibilityCheck = () => {
      demos.forEach(demo => {
        if (demo.classList.contains('is-active')) return;
        const rect = demo.getBoundingClientRect();
        const visibleY = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibleX = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
        if (visibleY > Math.min(90, rect.height * .08) && visibleX > Math.min(120, rect.width * .08)) activate(demo);
      });
    };
    visibilityCheck();
    window.addEventListener('scroll', visibilityCheck, { passive: true });
    window.addEventListener('resize', visibilityCheck, { passive: true });
  } else {
    demos.forEach(activate);
  }

  if (!window.matchMedia('(pointer: fine)').matches || reduceMotion) return;
  demos.forEach(demo => {
    demo.addEventListener('pointermove', event => {
      const rect = demo.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      demo.style.setProperty('--mx', `${Math.max(0, Math.min(100, x))}%`);
      demo.style.setProperty('--my', `${Math.max(0, Math.min(100, y))}%`);
    });
    demo.addEventListener('pointerleave', () => {
      demo.style.setProperty('--mx', '50%');
      demo.style.setProperty('--my', '40%');
    });
  });
}

function initCopyActions() {
  const toast = document.querySelector('.copy-toast');
  let toastTimer = null;

  const fallbackCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    area.style.pointerEvents = 'none';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, area.value.length);
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return fallbackCopy(text);
    } catch (error) {
      return fallbackCopy(text);
    }
  };

  document.querySelectorAll('.copy-trigger').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy || '';
      if (!value) return;
      const ok = await copyText(value);
      const state = button.querySelector('.copy-state');
      const original = state?.dataset.original || state?.textContent || 'COPY';
      if (state && !state.dataset.original) state.dataset.original = original;

      if (state) state.textContent = ok ? 'COPIED' : 'SELECT';
      button.classList.toggle('is-copied', ok);

      if (toast) {
        const label = button.dataset.copyLabel || 'Text';
        toast.textContent = ok ? `${label} copied to clipboard` : `Unable to copy ${label.toLowerCase()}`;
        toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1700);
      }

      window.setTimeout(() => {
        if (state) state.textContent = original;
        button.classList.remove('is-copied');
      }, 1700);
    });
  });
}

function initMobileMenu() {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.mobile-menu');
  if (!button || !menu) return;

  const links = Array.from(menu.querySelectorAll('a[href^="#"]'));

  const setMenu = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.classList.toggle('is-open', open);

    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);

    if (open) {
      lenis?.stop();
      const firstLink = links[0];
      if (firstLink) window.setTimeout(() => firstLink.focus({ preventScroll: true }), 180);
    } else {
      lenis?.start();
    }
  };

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  links.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      button.focus();
    }
  });

  // If the viewport grows back to desktop size, never leave the overlay open.
  const desktopMq = window.matchMedia('(min-width: 1041px)');
  const closeOnDesktop = (event) => {
    if (event.matches) setMenu(false);
  };
  if (desktopMq.addEventListener) desktopMq.addEventListener('change', closeOnDesktop);
  else desktopMq.addListener(closeOnDesktop);
}

async function bootPortfolio() {
  // Finish font metrics while the loader is still covering the page. This
  // prevents the layout shift that can feel like a page refresh at reveal.
  if (document.fonts && document.fonts.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => window.setTimeout(resolve, 1400))
    ]);
  }

  try {
    initCopyActions();
    initSystemDemos();
    initMobileMenu();
    if (reduceMotion || !hasGSAP) {
      initPrincipleKinetic();
      fallbackReveal();
      return;
    }

    initPrincipleKinetic();
    initScrollSequences();
    initWorkShowcaseMotion();
    initPointerLayer();
    initHeroMapPointer();
    runIntroSequence();
  } catch (error) {
    console.error('Portfolio animation fallback:', error);
    fallbackReveal();
  }
}

bootPortfolio();

// Final safety guard only intervenes if the loader is genuinely stuck.
window.setTimeout(() => {
  if (document.body.classList.contains('is-loading')) forceHeroVisible();
}, 7600);

// Independent hero integrity guard: if a browser interrupts the intro timeline,
// restore the title and current-focus content without reopening the loader.
window.setTimeout(() => {
  if (reduceMotion || document.body.classList.contains('is-loading')) return;
  document.body.classList.add('hero-live');

  const lines = [...document.querySelectorAll('.hero-line > span')];
  const offscreen = lines.some(el => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return Number(style.opacity) < .5 || rect.height === 0 || rect.bottom < 0;
  });
  if (offscreen) {
    lines.forEach(el => {
      el.style.transform = 'translate3d(0,0,0) rotateX(0deg)';
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.visibility = 'visible';
    });
  }

  document.querySelectorAll('.hero__footer .kicker, .hero__statement p, .hero__footer .scroll-cue').forEach(el => {
    if (Number(getComputedStyle(el).opacity) < .5) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });
  const footer = document.querySelector('.hero__footer');
  if (footer) footer.style.borderTopColor = 'rgba(255,255,255,.11)';
}, 5200);

/* Real screenshots stay intact; one project-specific graphic accumulates in
   layers as the user scrolls through each case study. */
function initProjectAccumulation() {
  const graphics = [...document.querySelectorAll('[data-accum-graphic]')];
  if (!graphics.length || reduceMotion || !hasGSAP) return;

  graphics.forEach((graphic, graphicIndex) => {
    const card = graphic.closest('.project-card');
    const pieces = [...graphic.querySelectorAll('.accum-piece')];
    const image = card?.querySelector('.system-shot > img');
    if (!card || !pieces.length) return;

    pieces.forEach((piece, i) => {
      gsap.set(piece, {
        x: Number(piece.dataset.x || 0),
        y: Number(piece.dataset.y || 0),
        rotation: Number(piece.dataset.r || 0),
        scale: Number(piece.dataset.s || .6),
        opacity: 0,
        transformOrigin: '50% 50%'
      });
    });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        end: 'center 42%',
        scrub: 0.85,
        invalidateOnRefresh: true
      }
    });

    if (image) {
      tl.fromTo(image,
        { scale: 1.055, filter: 'saturate(.72) brightness(.76) contrast(1.04)' },
        { scale: 1.002, filter: 'saturate(.92) brightness(.93) contrast(1.02)', duration: 1.15 },
        0
      );
    }

    pieces.forEach((piece, i) => {
      tl.to(piece, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: .8
      }, .14 + i * .13);
    });

    // Once assembled, retain a very subtle depth drift rather than replacing
    // the screenshot with another interface.
    gsap.to(graphic, {
      y: graphicIndex % 2 ? -10 : 10,
      rotation: graphicIndex % 2 ? -.7 : .7,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'center 50%',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  });
}

/* Certificate carousel — based on the MZA carousel supplied by Kyle.
   Adapted to coexist with the portfolio's vertical scroll and support
   multiple credentials with keyboard, drag, pagination, and auto-cycle. */
class MzaCarousel {
  constructor(root, opts = {}) {
    if (!root) return;
    this.root = root;
    this.viewport = root.querySelector('.mzaCarousel-viewport');
    this.track = root.querySelector('.mzaCarousel-track');
    this.slides = Array.from(root.querySelectorAll('.mzaCarousel-slide'));
    this.prevBtn = root.querySelector('.mzaCarousel-prev');
    this.nextBtn = root.querySelector('.mzaCarousel-next');
    this.pagination = root.querySelector('.mzaCarousel-pagination');
    this.progressBar = root.querySelector('.mzaCarousel-progressBar');
    this.isFF = typeof InstallTrigger !== 'undefined';
    this.n = this.slides.length;
    if (!this.viewport || !this.track || !this.n) return;

    this.state = {
      index: 0, pos: 0, width: 0, height: 0, gap: 28,
      dragging: false, pointerId: null, x0: 0, v: 0, t0: 0,
      animating: false, hovering: false, startTime: 0, pausedAt: 0, rafId: 0
    };
    this.opts = Object.assign({
      gap: 28, peek: .15, rotateY: 34, zDepth: 150, scaleDrop: .09,
      blurMax: 2, activeLeftBias: .12, interval: 4500, transitionMs: 900,
      keyboard: true,
      breakpoints: [
        { mq: '(max-width: 1200px)', gap: 24, peek: .12, rotateY: 28, zDepth: 120, scaleDrop: .08, activeLeftBias: .1 },
        { mq: '(max-width: 1000px)', gap: 18, peek: .09, rotateY: 22, zDepth: 90, scaleDrop: .07, activeLeftBias: .09 },
        { mq: '(max-width: 768px)', gap: 14, peek: .06, rotateY: 16, zDepth: 70, scaleDrop: .06, activeLeftBias: .08 },
        { mq: '(max-width: 560px)', gap: 12, peek: .05, rotateY: 12, zDepth: 60, scaleDrop: .05, activeLeftBias: .07 }
      ]
    }, opts);

    if (this.isFF) {
      this.opts.rotateY = 10;
      this.opts.zDepth = 0;
      this.opts.blurMax = 0;
    }
    this._init();
  }

  _init() {
    this._setupDots();
    this._bind();
    this._preloadImages();
    this._measure();
    this.goTo(0, false);
    if (this.n > 1) {
      this._startCycle();
      this._loop();
    } else {
      this.root.dataset.single = 'true';
      if (this.prevBtn) this.prevBtn.disabled = true;
      if (this.nextBtn) this.nextBtn.disabled = true;
      this._render(true);
    }
  }

  _preloadImages() {
    this.slides.forEach(sl => {
      const card = sl.querySelector('.mzaCard');
      if (!card) return;
      const bg = getComputedStyle(card).getPropertyValue('--mzaCard-bg');
      const m = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(bg);
      if (m?.[1]) { const img = new Image(); img.src = m[1]; }
    });
  }

  _setupDots() {
    if (!this.pagination) return;
    this.pagination.innerHTML = '';
    this.dots = this.slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mzaCarousel-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Go to certificate ${i + 1}`);
      b.addEventListener('click', () => this.goTo(i));
      this.pagination.appendChild(b);
      return b;
    });
  }

  _bind() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    if (this.opts.keyboard) {
      this.root.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }

    const pe = this.viewport;
    if (!isCoarsePointer) {
      pe.addEventListener('pointerdown', e => this._onDragStart(e));
      pe.addEventListener('pointermove', e => this._onDragMove(e));
      pe.addEventListener('pointerup', e => this._onDragEnd(e));
      pe.addEventListener('pointercancel', e => this._onDragEnd(e));
      pe.addEventListener('pointermove', e => this._onTilt(e));
    }

    this.root.addEventListener('mouseenter', () => {
      this.state.hovering = true;
      this.state.pausedAt = performance.now();
    });
    this.root.addEventListener('mouseleave', () => {
      if (this.state.pausedAt) {
        this.state.startTime += performance.now() - this.state.pausedAt;
        this.state.pausedAt = 0;
      }
      this.state.hovering = false;
      this.root.style.setProperty('--mzaTiltX', '0');
      this.root.style.setProperty('--mzaTiltY', '0');
      this._render();
    });

    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(() => this._measure());
      this.ro.observe(this.viewport);
    } else {
      window.addEventListener('resize', () => this._measure());
    }

    this.opts.breakpoints.forEach(bp => {
      const m = window.matchMedia(bp.mq);
      const apply = () => {
        if (!m.matches) return;
        Object.keys(bp).forEach(k => { if (k !== 'mq') this.opts[k] = bp[k]; });
        this._measure();
        this._render();
      };
      m.addEventListener?.('change', apply);
      if (!m.addEventListener) m.addListener?.(apply);
      if (m.matches) apply();
    });
  }

  _measure() {
    const viewRect = this.viewport.getBoundingClientRect();
    this.state.width = viewRect.width;
    this.state.height = viewRect.height;
    this.state.gap = this.opts.gap;
    this.slideW = Math.min(940, Math.max(280, this.state.width * (1 - this.opts.peek * 2)));
    this._render();
  }

  _onTilt(e) {
    const r = this.viewport.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const mx = (e.clientX - r.left) / r.width - .5;
    const my = (e.clientY - r.top) / r.height - .5;
    this.root.style.setProperty('--mzaTiltX', (my * -6).toFixed(3));
    this.root.style.setProperty('--mzaTiltY', (mx * 6).toFixed(3));
    this._render();
  }

  _onDragStart(e) {
    if (this.n <= 1) return;
    if (e.target.closest('a, button, input, textarea, select')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    this.state.dragging = true;
    this.state.pointerId = e.pointerId;
    this.viewport.setPointerCapture?.(e.pointerId);
    this.state.x0 = e.clientX;
    this.state.t0 = performance.now();
    this.state.v = 0;
    this.state.pausedAt = performance.now();
  }

  _onDragMove(e) {
    if (!this.state.dragging || e.pointerId !== this.state.pointerId) return;
    const dx = e.clientX - this.state.x0;
    const dt = Math.max(16, performance.now() - this.state.t0);
    this.state.v = dx / dt;
    const slideSpan = this.slideW + this.state.gap;
    this.state.pos = this._mod(this.state.index - dx / slideSpan, this.n);
    this._render();
  }

  _onDragEnd(e) {
    if (!this.state.dragging || (e && e.pointerId !== this.state.pointerId)) return;
    this.state.dragging = false;
    try { if (this.state.pointerId != null) this.viewport.releasePointerCapture?.(this.state.pointerId); } catch {}
    this.state.pointerId = null;
    if (this.state.pausedAt) {
      this.state.startTime += performance.now() - this.state.pausedAt;
      this.state.pausedAt = 0;
    }
    const threshold = .18;
    const v = this.state.v;
    let target = Math.round(this.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? .5 : 0));
    this.goTo(this._mod(target, this.n));
  }

  _startCycle() {
    this.state.startTime = performance.now();
    this._renderProgress(0);
  }

  _loop() {
    const step = t => {
      if (!this.state.dragging && !this.state.hovering && !this.state.animating) {
        const elapsed = t - this.state.startTime;
        const p = Math.min(1, elapsed / this.opts.interval);
        this._renderProgress(p);
        if (elapsed >= this.opts.interval) this.next();
      }
      this.state.rafId = requestAnimationFrame(step);
    };
    this.state.rafId = requestAnimationFrame(step);
  }

  _renderProgress(p) { if (this.progressBar) this.progressBar.style.transform = `scaleX(${p})`; }
  prev() { if (this.n > 1) this.goTo(this._mod(this.state.index - 1, this.n)); }
  next() { if (this.n > 1) this.goTo(this._mod(this.state.index + 1, this.n)); }

  goTo(i, animate = true) {
    if (this.n <= 1) {
      this.state.index = this.state.pos = 0;
      this.state.animating = false;
      this._render(true);
      return;
    }
    const start = this.state.pos || this.state.index;
    const end = this._nearest(start, i);
    const dur = animate ? this.opts.transitionMs : 0;
    const t0 = performance.now();
    const ease = x => 1 - Math.pow(1 - x, 4);
    this.state.animating = true;
    const step = now => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1;
      const p = dur ? ease(t) : 1;
      this.state.pos = start + (end - start) * p;
      this._render();
      if (t < 1) requestAnimationFrame(step); else this._afterSnap(i);
    };
    requestAnimationFrame(step);
  }

  _afterSnap(i) {
    this.state.index = this._mod(Math.round(this.state.pos), this.n);
    this.state.pos = this.state.index;
    this.state.animating = false;
    this._render(true);
    this._startCycle();
  }

  _nearest(from, target) {
    let d = target - Math.round(from);
    if (d > this.n / 2) d -= this.n;
    if (d < -this.n / 2) d += this.n;
    return Math.round(from) + d;
  }
  _mod(i, n) { return ((i % n) + n) % n; }

  _render(markActive = false) {
    if (!this.slideW) return;
    const span = this.slideW + this.state.gap;
    const tiltX = parseFloat(this.root.style.getPropertyValue('--mzaTiltX') || 0);
    const tiltY = parseFloat(this.root.style.getPropertyValue('--mzaTiltY') || 0);

    for (let i = 0; i < this.n; i++) {
      let d = i - this.state.pos;
      if (d > this.n / 2) d -= this.n;
      if (d < -this.n / 2) d += this.n;
      const weight = Math.max(0, 1 - Math.abs(d) * 2);
      const biasActive = this.n > 1 ? -this.slideW * this.opts.activeLeftBias * weight : 0;
      const tx = d * span + biasActive - this.slideW / 2;
      const depth = -Math.abs(d) * this.opts.zDepth;
      const rot = -d * this.opts.rotateY + (this.n === 1 ? tiltY * .25 : 0);
      const rotX = this.n === 1 ? tiltX * .2 : 0;
      const scale = 1 - Math.min(Math.abs(d) * this.opts.scaleDrop, .42);
      const blur = Math.min(Math.abs(d) * this.opts.blurMax, this.opts.blurMax);
      const s = this.slides[i];

      if (this.isFF) {
        s.style.transform = `translate(${tx}px,-50%) scale(${scale})`;
        s.style.filter = 'none';
      } else {
        s.style.transform = `translate3d(${tx}px,-50%,${depth}px) rotateX(${rotX}deg) rotateY(${rot}deg) scale(${scale})`;
        s.style.filter = `blur(${blur}px)`;
      }
      s.style.zIndex = Math.round(1000 - Math.abs(d) * 10);
      if (markActive) s.dataset.state = Math.round(this.state.index) === i ? 'active' : 'rest';

      const card = s.querySelector('.mzaCard');
      if (!card) continue;
      const parBase = Math.max(-1, Math.min(1, -d));
      const parX = parBase * 48 + tiltY * 2;
      const parY = tiltX * -1.5;
      const bgX = parBase * -64 + tiltY * -2.4;
      card.style.setProperty('--mzaParX', `${parX.toFixed(2)}px`);
      card.style.setProperty('--mzaParY', `${parY.toFixed(2)}px`);
      card.style.setProperty('--mzaParBgX', `${bgX.toFixed(2)}px`);
      card.style.setProperty('--mzaParBgY', `${(parY * .35).toFixed(2)}px`);
    }

    const active = this._mod(Math.round(this.state.pos), this.n);
    this.dots?.forEach((d, i) => d.setAttribute('aria-selected', i === active ? 'true' : 'false'));
  }
}

const certificateCarousel = document.getElementById('mzaCarousel');
if (certificateCarousel) new MzaCarousel(certificateCarousel, { transitionMs: 900 });

/* =========================================
   PORTFOLIO COMMEND
========================================= */

const SUPABASE_URL = "https://uqqcfaxtnsfpclyxobtn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k7L7JDe-W6VZvWH2F5bGZQ_DMM0kwaw";

const commendButton = document.getElementById("commendButton");
const commendCount = document.getElementById("commendCount");
const commendStatus = document.getElementById("commendStatus");

const hasCommended =
  localStorage.getItem("maze_portfolio_commended") === "true";


async function loadCommendCount() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_commends?id=eq.1&select=count`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data?.[0]?.count !== undefined) {
      commendCount.textContent = data[0].count;
    }

  } catch (error) {
    console.error("Unable to load commend count:", error);
  }
}


function showAlreadyCommended() {
  commendButton.classList.add("is-commended");

  commendButton.querySelector(
    ".commend-copy strong"
  ).textContent = "COMMENDED";

  commendButton.querySelector(
    ".commend-copy small"
  ).textContent = "Thanks for the support";

  commendStatus.textContent =
    "YOU'VE ALREADY COMMENDED THIS PORTFOLIO";
}


async function commendPortfolio() {

  if (
    localStorage.getItem("maze_portfolio_commended") === "true"
  ) {
    showAlreadyCommended();
    return;
  }

  commendButton.disabled = true;

  commendStatus.textContent = "ADDING COMMEND...";

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/increment_portfolio_commend`,
      {
        method: "POST",

        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        },

        body: "{}"
      }
    );

    if (!response.ok) {
      throw new Error("Commend request failed");
    }

    const newCount = await response.json();

    commendCount.textContent = newCount;

    localStorage.setItem(
      "maze_portfolio_commended",
      "true"
    );

    commendButton.classList.add("is-commended");

    commendCount.classList.remove("commend-pop");

    void commendCount.offsetWidth;

    commendCount.classList.add("commend-pop");

    commendButton.querySelector(
      ".commend-copy strong"
    ).textContent = "COMMENDED";

    commendButton.querySelector(
      ".commend-copy small"
    ).textContent = "Thanks for the support";

    commendStatus.textContent =
      "COMMEND ADDED ✦";

  } catch (error) {

    console.error(error);

    commendStatus.textContent =
      "COULDN'T ADD COMMEND — TRY AGAIN";

    commendButton.disabled = false;

  }
}


if (commendButton) {

  loadCommendCount();

  if (hasCommended) {
    showAlreadyCommended();
  }

  commendButton.addEventListener(
    "click",
    commendPortfolio
  );
}

/* =========================================
   NAVIGATION SCROLL ALIGNMENT
========================================= */

const navigationLinks = document.querySelectorAll(
  '.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]'
);

navigationLinks.forEach((link) => {

  link.addEventListener("click", (event) => {

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();


    /* Header offset */
    const header = document.querySelector(".site-header");

    const headerHeight =
      header ? header.offsetHeight : 70;

    const offset =
      -(headerHeight + 28);


    /*
     * Use Lenis if your portfolio
     * already initialized it.
     */
    if (
      typeof lenis !== "undefined" &&
      lenis
    ) {

      lenis.scrollTo(target, {
        offset: offset,
        duration: 1.15
      });

    }

    /*
     * Browser fallback
     */
    else {

      const position =
        target.getBoundingClientRect().top +
        window.scrollY +
        offset;

      window.scrollTo({
        top: position,
        behavior: "smooth"
      });

    }

  });

});

/* =========================================
   SMALL BUILD CARDS
   Cursor spotlight + subtle 3D response
========================================= */

const experimentCards =
  document.querySelectorAll(
    "[data-experiment-card]"
  );

/*
 * Small Builds now use CSS-only hover feedback.
 * This avoids layout reads and transform writes on every pointermove.
 */
experimentCards.forEach((card) => {
  const preview =
    card.querySelector(
      ".small-project__preview"
    );

  if (!preview) return;

  preview.style.setProperty(
    "--pointer-x",
    "50%"
  );

  preview.style.setProperty(
    "--pointer-y",
    "50%"
  );
});

/* ============================================================
   CAPABILITIES — SCROLL-DRIVEN RIGHT-SIDE SEQUENCE
   The original left-side heading/graphic is never modified.
   ============================================================ */

(() => {
  const section =
    document.querySelector(
      ".capabilities--sequence"
    );

  if (!section) {
    return;
  }

  const title =
    section.querySelector(
      "#capability-title"
    );

  const description =
    section.querySelector(
      "#capability-description"
    );

  const tags =
    section.querySelector(
      "#capability-tags"
    );

  const number =
    section.querySelector(
      "#capability-number"
    );

  const progress =
    section.querySelector(
      "#capability-progress"
    );

  const progressLabel =
    section.querySelector(
      "#capability-progress-label"
    );

  const indicators =
    [
      ...section.querySelectorAll(
        "[data-step-indicator]"
      )
    ];


  const capabilities = [
    {
      number: "01",
      title: "Front-end<br>Development",
      description: "Responsive interfaces, interaction systems, and performance-minded builds designed to work cleanly across desktop and mobile.",
      tags: ["HTML", "CSS", "JavaScript", "Responsive UI"]
    },

    {
      number: "02",
      title: "UI / UX<br>Design",
      description: "Clear user flows, visual systems, and component-driven interface design focused on making complex interactions easier to understand.",
      tags: ["User Flows", "Visual Systems", "Mobile UI", "Interaction Design"]
    },

    {
      number: "03",
      title: "Information<br>Systems",
      description: "Practical systems for records, workflows, internal operations, databases, reporting, and everyday organizational processes.",
      tags: ["Supabase", "PostgreSQL", "Databases", "Workflow Systems"]
    },

    {
      number: "04",
      title: "Motion &amp;<br>Prototyping",
      description: "Sequence-driven animation, interaction studies, scroll behavior, and polished prototypes that give interfaces a stronger sense of response.",
      tags: ["GSAP", "Anime.js", "Scroll Motion", "Prototyping"]
    }
  ];


  let activeIndex = 0;
  let pendingIndex = 0;
  let changing = false;


  function renderTags(values) {
    tags.innerHTML = "";

    values.forEach(
      (value) => {
        const item =
          document.createElement(
            "span"
          );

        item.textContent =
          value;

        tags.appendChild(
          item
        );
      }
    );
  }


  function updateIndicators(index) {
    indicators.forEach(
      (indicator, indicatorIndex) => {
        indicator.classList.toggle(
          "is-active",
          indicatorIndex === index
        );
      }
    );
  }


  function changeCapability(nextIndex) {
    if (
      nextIndex === activeIndex
      ||
      changing
    ) {
      return;
    }

    changing = true;

    section.classList.add(
      "is-changing"
    );

    window.setTimeout(
      () => {
        const item =
          capabilities[nextIndex];

        title.innerHTML =
          item.title;

        description.textContent =
          item.description;

        number.textContent =
          item.number;

        progressLabel.textContent =
          `${item.number} — 04`;

        renderTags(
          item.tags
        );

        updateIndicators(
          nextIndex
        );

        activeIndex =
          nextIndex;

        section.classList.remove(
          "is-changing"
        );

        window.setTimeout(
          () => {
            changing = false;

            if (
              pendingIndex !== activeIndex
            ) {
              changeCapability(
                pendingIndex
              );
            }
          },
          420
        );
      },
      220
    );
  }


  function updateSequence() {
    const rect =
      section.getBoundingClientRect();

    const scrollDistance =
      Math.max(
        1,
        section.offsetHeight -
        window.innerHeight
      );

    let sectionProgress =
      -rect.top /
      scrollDistance;

    sectionProgress =
      Math.max(
        0,
        Math.min(
          1,
          sectionProgress
        )
      );

    progress.style.width =
      `${sectionProgress * 100}%`;

    const nextIndex =
      Math.min(
        capabilities.length - 1,
        Math.floor(
          sectionProgress *
          capabilities.length
        )
      );

    pendingIndex =
      nextIndex;

    if (
      nextIndex !== activeIndex
    ) {
      changeCapability(
        nextIndex
      );
    }
  }


  let frameRequested =
    false;


  function requestSequenceUpdate() {
    if (frameRequested) {
      return;
    }

    frameRequested =
      true;

    window.requestAnimationFrame(
      () => {
        updateSequence();

        frameRequested =
          false;
      }
    );
  }


  window.addEventListener(
    "scroll",
    requestSequenceUpdate,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    requestSequenceUpdate
  );


  renderTags(
    capabilities[0].tags
  );

  updateIndicators(0);
  updateSequence();
})();
