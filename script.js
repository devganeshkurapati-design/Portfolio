// ============================================
// TOUCH-DEVICE DETECTION
// (used only to skip mouse-only effects like the
// custom cursor / 3D tilt / magnetic buttons —
// every entrance/scroll animation below still runs
// exactly the same on phones, tablets and desktops)
// ============================================
const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouch) {
  document.documentElement.classList.add('is-touch');
}

// CUSTOM CURSOR (desktop / mouse devices only)
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

if (!isTouch) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateCursor() {
    outlineX += (mouseX - outlineX) * 0.12;
    outlineY += (mouseY - outlineY) * 0.12;
    cursorOutline.style.left = outlineX + 'px';
    cursorOutline.style.top = outlineY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor grow on links/buttons only — NOT skill cards (handled separately)
  const hoverTargets = document.querySelectorAll('a, button, .soft-tags span, .hero-pill');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width = '12px';
      cursorDot.style.height = '12px';
      cursorOutline.style.width = '60px';
      cursorOutline.style.height = '60px';
      cursorOutline.style.borderColor = 'var(--gold-light)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width = '8px';
      cursorDot.style.height = '8px';
      cursorOutline.style.width = '36px';
      cursorOutline.style.height = '36px';
      cursorOutline.style.borderColor = 'var(--gold)';
    });
  });
}

// Click / tap particle burst — works on both mouse clicks and touch taps
window.addEventListener('click', (e) => {
  for (let i = 0; i < 8; i++) createParticle(e.clientX, e.clientY);
});

function createParticle(x, y) {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:4px; height:4px; background:var(--gold);
    border-radius:50%; pointer-events:none;
    z-index:99999; transform:translate(-50%,-50%);
  `;
  document.body.appendChild(particle);
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 80 + 30;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance;
  particle.animate([
    { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
  ], {
    duration: 600 + Math.random() * 400,
    easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards'
  }).onfinish = () => particle.remove();
}

// TYPEWRITER
const typewriterEl = document.getElementById('typewriter');
const text = "19-year-old finance mind — dissecting markets, mastering numbers, and building toward independence one skill at a time.";
let charIndex = 0;

function typeWriter() {
  if (charIndex < text.length) {
    typewriterEl.textContent += text[charIndex];
    charIndex++;
    setTimeout(typeWriter, 35);
  }
}
setTimeout(typeWriter, 1400);

// SCROLL PROGRESS
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollTop / docHeight) * 100 + '%';
});

// REVEAL ON SCROLL
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revealElements.forEach(el => revealObserver.observe(el));

// BIG STAT COUNTERS
const bigStats = document.querySelectorAll('.big-stat');
const bigStatObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      const numberEl = entry.target.querySelector('.big-stat-number');
      if (numberEl && !numberEl.dataset.done) {
        numberEl.dataset.done = true;
        const target = parseInt(numberEl.getAttribute('data-count'));
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            numberEl.textContent = target;
            clearInterval(timer);
          } else {
            numberEl.textContent = Math.floor(current);
          }
        }, 25);
      }
      bigStatObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
bigStats.forEach(stat => bigStatObserver.observe(stat));

// ============================================
// SKILL CARDS — entrance + hover pop effect
// (hover pop is mouse-only; touch devices keep
// the entrance animation but skip the 3D tilt
// so a tapped card never gets stuck "raised")
// ============================================
const skillCards = document.querySelectorAll('.skill-card');

// Set initial hidden state
skillCards.forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
});

// Entrance animation
const skillCardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      skillCardObserver.unobserve(entry.target);

      // After entrance animation done, enable hover effects
      setTimeout(() => {
        entry.target.dataset.ready = 'true';
      }, 800);
    }
  });
}, { threshold: 0.1 });
skillCards.forEach(card => skillCardObserver.observe(card));

// Hover pop effect — only after card has entered, and only on mouse devices
if (!isTouch) {
  skillCards.forEach(card => {
    const icon = card.querySelector('.skill-icon');
    const title = card.querySelector('h3');
    const ticker = card.querySelector('.skill-ticker');

    card.addEventListener('mouseenter', () => {
      if (card.dataset.ready !== 'true') return;

      card.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.transform = 'translateY(-14px) scale(1.05)';
      card.style.zIndex = '10';
      card.style.boxShadow = '0 24px 60px rgba(201,168,76,0.2), 0 0 0 1px rgba(201,168,76,0.35)';
      card.style.background = '#0d1424';
      card.style.borderBottom = '2px solid var(--gold)';

      if (icon) { icon.style.transform = 'scale(1.5) rotate(-10deg)'; icon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'; }
      if (title) { title.style.color = 'var(--gold)'; title.style.transition = 'color 0.3s ease'; }
      if (ticker) { ticker.style.color = 'var(--gold)'; }

      cursorDot.style.width = '16px';
      cursorDot.style.height = '16px';
      cursorDot.style.background = 'var(--gold-light)';
      cursorOutline.style.width = '70px';
      cursorOutline.style.height = '70px';
      cursorOutline.style.borderColor = 'var(--gold)';
    });

    card.addEventListener('mousemove', (e) => {
      if (card.dataset.ready !== 'true') return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `translateY(-14px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      if (card.dataset.ready !== 'true') return;

      card.style.transition = 'all 0.4s ease';
      card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
      card.style.zIndex = '1';
      card.style.boxShadow = 'none';
      card.style.background = 'var(--bg-primary)';
      card.style.borderBottom = '2px solid transparent';

      if (icon) { icon.style.transform = 'scale(1) rotate(0deg)'; }
      if (title) { title.style.color = 'var(--text-primary)'; }
      if (ticker) { ticker.style.color = 'var(--text-muted)'; }

      cursorDot.style.width = '8px';
      cursorDot.style.height = '8px';
      cursorDot.style.background = 'var(--gold)';
      cursorOutline.style.width = '36px';
      cursorOutline.style.height = '36px';
      cursorOutline.style.borderColor = 'var(--gold)';
    });
  });
}

// ============================================
// PROJECT CARDS — entrance only, no GSAP
// ============================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(40px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
});

const projectCardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';

      // Enable hover after entrance (mouse devices only)
      setTimeout(() => {
        entry.target.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease';
        if (!isTouch) {
          entry.target.addEventListener('mouseenter', () => {
            entry.target.style.transform = 'translateY(-8px)';
            entry.target.style.boxShadow = '0 20px 50px rgba(201,168,76,0.1)';
          });
          entry.target.addEventListener('mouseleave', () => {
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.boxShadow = 'none';
          });
        }
      }, 800);

      projectCardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
projectCards.forEach(card => projectCardObserver.observe(card));

// SKILL BAR ANIMATION
const skillBars = document.querySelectorAll('.skill-bar-fill');
skillBars.forEach(bar => {
  bar.style.width = '0%';
});

const skillBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetWidth = entry.target.getAttribute('data-width');
      setTimeout(() => {
        entry.target.style.width = targetWidth;
        entry.target.style.transition = 'width 1.2s ease';
      }, 400);
      skillBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
skillBars.forEach(bar => skillBarObserver.observe(bar));

// GSAP — Hero only, NO skill/project animations
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.navbar', {
    y: -80, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out'
  });

  gsap.to('.hero-bg-text', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 200, ease: 'none'
  });

  gsap.to('.floating-symbols', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 150, ease: 'none'
  });

  gsap.from('.timeline-item', {
    scrollTrigger: { trigger: '.timeline', start: 'top 85%' },
    x: -60, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out'
  });

  gsap.from('.about-market-bar', {
    scrollTrigger: { trigger: '.about-market-bar', start: 'top 90%' },
    y: 30, opacity: 0, duration: 0.8, ease: 'power2.out'
  });

  gsap.from('.contact-title', {
    scrollTrigger: { trigger: '.contact', start: 'top 85%' },
    y: 60, opacity: 0, duration: 1, ease: 'power3.out'
  });

  // Recalculate ScrollTrigger positions after layout settles
  // (prevents stale trigger points caused by mobile address-bar resize / late web-font load)
  window.addEventListener('load', () => ScrollTrigger.refresh());
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}

// MAGNETIC BUTTONS (mouse devices only — avoids odd offset stuck on tap)
if (!isTouch) {
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s ease';
    });
  });
}

// ACTIVE NAV
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 150) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) link.style.color = 'var(--gold)';
  });
});

// PAGE LOAD
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 100);
});
