(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const progressBar = document.getElementById('scroll-progress-bar');
  const menuToggle = document.getElementById('menu-toggle');
  const navigation = document.getElementById('site-nav');
  const heroVisual = document.getElementById('hero-visual');
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  revealItems.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    item.style.setProperty('--delay', String(Math.min(Math.max(delay, 0), 5)));
  });
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  let scrollTicking = false;
  const updateScrollState = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', scrollTop > 8);
    progressBar.style.width = (scrollRange > 0 ? (scrollTop / scrollRange) * 100 : 0) + '%';
    if (heroVisual && !reducedMotion.matches) {
      heroVisual.style.setProperty('--scroll-offset', (Math.min(scrollTop, 500) * 0.035).toFixed(1) + 'px');
    }
    scrollTicking = false;
  };
  const onScroll = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollState);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScrollState();

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 741px)').matches) closeMenu();
    });
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = navigation && navigation.querySelector('a[href="#' + entry.target.id + '"]');
        if (link) {
          navigation.querySelectorAll('a').forEach((item) => item.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'location');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }

  if (heroVisual && !reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const portrait = heroVisual.querySelector('.portrait-card');
    heroVisual.addEventListener('pointermove', (event) => {
      if (!portrait || window.innerWidth < 741) return;
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      portrait.style.transform = 'perspective(900px) rotate(-1deg) rotateX(' + (y * -1.6).toFixed(2) + 'deg) rotateY(' + (x * 1.6).toFixed(2) + 'deg) translateY(-2px)';
    });
    heroVisual.addEventListener('pointerleave', () => {
      if (portrait) portrait.style.transform = '';
    });
  }

  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      const subject = encodeURIComponent('Portfolio inquiry from ' + name);
      const body = encodeURIComponent('Hi Kundan,\n\n' + message + '\n\nRegards,\n' + name + '\n' + email);
      if (formStatus) formStatus.textContent = 'Your email app should open with the message ready to send.';
      window.location.href = 'mailto:itsme.kundan.prasad.yadav@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
})();
