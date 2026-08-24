/*
  KYLE — Sequence-driven portfolio motion system
  ------------------------------------------------
  Motion stack:
  1) Loader sequence
  2) Hero entrance timeline
  3) Lenis + ScrollTrigger synchronization
  4) Section reveal timelines
  5) Project visual choreography
  6) Interaction layer: cursor, magnetic links, parallax orb
*/

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const hasLenis = typeof window.Lenis !== 'undefined';

document.getElementById('year').textContent = new Date().getFullYear();

function initLenis() {
  if (!hasLenis || reduceMotion) return null;

  const lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    anchors: true,
    wheelMultiplier: 0.9,
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
  gsap.set('.hero__map-card', { opacity: 0, x: 28, scale: .975 });
  gsap.set('.hero__motion-field', { opacity: 0 });
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
    })
    // Header and hero now share one uninterrupted timeline. There is no
    // class toggle / CSS keyframe handoff, which removes the refresh-like jump.
    .to('.site-header', { '--header-line': 1, duration: .72, ease: 'power2.out' }, '-=.08')
    .to('.site-header .brand, .site-header .nav-link, .site-header .availability', {
      opacity: 1, y: 0, duration: .62, stagger: .065, ease: 'power3.out'
    }, '-=.62')
    .to('.hero__meta', { opacity: 1, y: 0, duration: .60 }, '-=.47')
    .to('.eyebrow', { opacity: 1, y: 0, duration: .56 }, '-=.42')
    .add(() => document.body.classList.add('hero-live'))
    .to('.hero__motion-field', { opacity: .48, duration: .9, ease: 'power2.out' }, '-=.72')
    .to('.hero__dek', { opacity: 1, y: 0, duration: .68 }, '-=.56')
    .to('.hero__contact-strip', { opacity: 1, y: 0, duration: .70 }, '-=.50')
    .to('.hero__map-card', { opacity: 1, x: 0, scale: 1, duration: .86, ease: 'power4.out' }, '-=.76')
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

  // Soft global background travel
  gsap.to('.hero__glow--one', {
    yPercent: 80,
    xPercent: -25,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
  });

  // Standard reveals
  document.querySelectorAll('.reveal').forEach(el => {
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

  // Project cards: visual enters first, internal art follows, text completes sequence.
  document.querySelectorAll('.project-card').forEach((card, index) => {
    const visual = card.querySelector('.project-card__visual');
    const info = card.querySelector('.project-card__info');
    const art = visual.querySelector('.project-screenshot-link img') || visual.firstElementChild;

    const projectTl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 78%', once: true }
    });

    projectTl
      .from(visual, {
        clipPath: index % 2 === 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
        duration: 1.05,
        ease: 'power4.inOut'
      })
      .from(art, { scale: 1.13, opacity: .35, duration: 1.25, ease: 'power3.out' }, '-=.55')
      .from(info.children, { y: 25, opacity: 0, duration: .7, stagger: .1 }, '-=.72');

    gsap.to(art, {
      yPercent: visual.classList.contains('project-card__visual--screenshot') ? 0 : (index % 2 ? -6 : 6),
      scale: 1.03,
      ease: 'none',
      scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
    });
  });

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
  if (reduceMotion || typeof window.anime !== 'function') return;

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

function initPointerLayer() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  const draw = () => {
    ringX += (mouseX - ringX) * .16;
    ringY += (mouseY - ringY) * .16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(draw);
  };
  draw();

  document.querySelectorAll('a, button, .project-card__visual').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
  });

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * .16, y: y * .22, duration: .35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1, .45)' }));
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

function initMobileMenu() {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.mobile-menu');
  if (!button || !menu) return;
  let open = false;

  const setMenu = next => {
    open = next;
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) {
      menu.style.visibility = 'visible';
      lenis?.stop();
      gsap.to(menu, { yPercent: 105, duration: 0 });
      gsap.to(menu, { yPercent: 0, duration: .7, ease: 'power4.inOut' });
      gsap.fromTo('.mobile-menu a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, delay: .27, duration: .55 });
    } else {
      gsap.to(menu, { yPercent: -105, duration: .62, ease: 'power4.inOut', onComplete: () => { menu.style.visibility = 'hidden'; lenis?.start(); } });
    }
  };

  button.addEventListener('click', () => setMenu(!open));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
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
    if (reduceMotion || !hasGSAP) {
      initPrincipleKinetic();
      fallbackReveal();
      return;
    }

    initPrincipleKinetic();
    initScrollSequences();
    initPointerLayer();
    initHeroMapPointer();
    initProjectTilt();
    initMobileMenu();
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

// Independent hero integrity guard. The title/current-focus sequence is CSS-driven
// after the loader, so it cannot be left half-hidden by a GSAP interruption.
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
}, 4300);
