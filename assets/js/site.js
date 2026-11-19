/* Центр 10/64 — shared site script. Each block runs only if its markup is on the page. */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  /* ============ HEADER ============ */
  const header = $('#header');
  const burger = header && $('.burger', header);
  const menu = $('#mobile-menu');
  // Pages without a dark hero keep the light bar from the start
  const solidHeader = document.body.classList.contains('page-light');

  if (header) {
    /* Light glass bar after the hero starts scrolling.
       Phones/tablets: smart sticky — hides on scroll down, comes back on scroll up. Desktop: always visible. */
    const mobile = window.matchMedia('(max-width: 899px)');
    let lastY = window.scrollY;
    const setHidden = (h) => {
      header.classList.toggle('is-hidden', h);
      document.documentElement.classList.toggle('hdr-hidden', h);
    };
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      header.classList.toggle('is-scrolled', solidHeader || y > 40);
      if (!mobile.matches || y < 120 || header.classList.contains('menu-open')) setHidden(false);
      else if (y > lastY + 6) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      if (Math.abs(y - lastY) > 6) lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    header.addEventListener('focusin', () => setHidden(false));
    onScroll();
  }

  /* ============ MOBILE MENU ============ */
  if (header && burger && menu) {
    const setMenu = (open) => {
      header.classList.toggle('menu-open', open);
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
    $$('.mnav__trigger', menu).forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.parentElement.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ============ DESKTOP SERVICES DROPDOWN ============ */
  $$('[data-drop]').forEach(item => {
    const trigger = $('.nav__trigger', item);
    let t;
    const set = (open) => {
      clearTimeout(t);
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };
    if (window.matchMedia('(hover: hover)').matches) {
      item.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(() => set(true), 80); });
      item.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => set(false), 220); });
    }
    trigger.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { set(false); trigger.focus(); }
      if (e.key === 'ArrowDown' && e.target === trigger) { e.preventDefault(); set(true); $('.drop a', item).focus(); }
    });
    document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
    window.addEventListener('scroll', () => { if (window.scrollY > 600) set(false); }, { passive: true });
  });

  /* ============ HERO VIDEO ============ */
  const video = $('.hero__video');
  if (video) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.removeAttribute('autoplay'); video.pause(); }
    else new IntersectionObserver(([e]) => { e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }, { threshold: 0.05 }).observe($('.hero'));
  }

  /* ============ REVEAL ON SCROLL ============ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-reveal]').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 5) * 0.08}s`);
    io.observe(el);
  });

  /* ============ STATEMENT: words light up as you scroll ============ */
  const st = $('[data-words]');
  if (st) {
    const wrap = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/([ \t\n\r]+)/).forEach(part => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(st);
    const words = $$('.w', st);
    const paint = () => {
      const r = st.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = p * words.length * 1.15;
      words.forEach((w, i) => w.style.setProperty('--o', i < lit ? 1 : 0.18));
    };
    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* ============ ACCORDIONS (FAQ) ============ */
  $$('[data-accordion]').forEach(group => {
    $$('button[aria-controls]', group).forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const open = !item.classList.contains('is-open');
        $$('.is-open', group).forEach(o => {
          o.classList.remove('is-open');
          $('button', o).setAttribute('aria-expanded', 'false');
        });
        if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  });

  /* ============ SEO TEXT: "Детальніше" ============ */
  const seoText = $('.seo__text');
  if (seoText) {
    const seoBtn = $('.seo__toggle', seoText);
    seoBtn.addEventListener('click', () => {
      const open = seoText.classList.toggle('is-open');
      seoBtn.setAttribute('aria-expanded', String(open));
      $('[data-label]', seoBtn).textContent = open ? 'Згорнути' : 'Детальніше';
      if (!open && seoText.getBoundingClientRect().top < 0) seoText.closest('section').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ============ TESTIMONIALS SLIDER ============ */
  const slides = $$('.quote__slide');
  const dots = $('.dots');
  if (slides.length && dots) {
    let cur = 0, timer, auto = true;
    const go = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === cur));
      [...dots.children].forEach((d, k) => { d.classList.toggle('is-active', k === cur); d.setAttribute('aria-selected', String(k === cur)); });
      clearInterval(timer);
      if (auto) timer = setInterval(() => go(cur + 1), 7000);
    };
    const manual = (i) => { auto = false; go(i); }; // stop autoplay once the visitor takes control
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Відгук ${i + 1}`);
      b.addEventListener('click', () => manual(i));
      dots.appendChild(b);
    });
    $('[data-prev]')?.addEventListener('click', () => manual(cur - 1));
    $('[data-next]')?.addEventListener('click', () => manual(cur + 1));
    const track = $('.quote__slides');
    let sx = 0, sy = 0;
    track.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) manual(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    go(0);
  }

  /* ============ CONTACT FORM (backend to be connected) ============ */
  const form = $('#contact-form');
  if (form) {
    const file = $('input[type=file]', form);
    const fileLabel = $('[data-file-label]', form);
    file.addEventListener('change', () => {
      fileLabel.textContent = file.files.length ? `Фото: ${file.files.length} шт.` : 'Прикріпити фото';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.website.value) return; // honeypot filled → bot
      const ok = form.name.value.trim().length > 1 && form.phone.value.replace(/\D/g, '').length >= 9;
      [form.name, form.phone].forEach(f => f.setAttribute('aria-invalid', String(!f.value.trim())));
      if (!ok) { (form.name.value.trim() ? form.phone : form.name).focus(); return; }
      form.classList.add('is-sent');
      form.reset();
      fileLabel.textContent = 'Прикріпити фото';
    });
  }

  /* ============ RESULTS PAGE: category filters + masonry ============ */
  const gallery = $('[data-results]');
  const filters = $('[data-filters]');
  if (gallery) {
    const items = $$('.result', gallery);
    items.forEach((it, i) => { it.dataset.i = i; }); // original order, kept for the lightbox
    const empty = $('[data-results-empty]');
    let cols = 0, active = 'all';

    // Masonry without cropping: each photo goes into the currently shortest column, keeping left-to-right order
    const layout = (force) => {
      const n = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 600 ? 2 : 1;
      if (n === cols && !force) return;
      cols = n;
      const columns = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'results__col'; return c; });
      const heights = new Array(n).fill(0);
      items.forEach(it => {
        if (it.hidden) { gallery.appendChild(it); return; }
        const img = $('img', it);
        const ratio = img.height / img.width;
        const k = heights.indexOf(Math.min(...heights));
        columns[k].appendChild(it);
        heights[k] += ratio + 0.18; // + caption
      });
      $$('.results__col', gallery).forEach(c => c.remove());
      columns.forEach(c => gallery.appendChild(c));
      gallery.classList.add('is-js');
    };

    const apply = (cat, push) => {
      active = cat;
      let shown = 0;
      items.forEach(it => {
        const on = cat === 'all' || it.dataset.cat === cat;
        it.hidden = !on; if (on) shown++;
      });
      if (filters) $$('[data-filter]', filters).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      if (empty) {
        empty.hidden = shown > 0;
        const label = filters && $(`[data-filter="${cat}"]`, filters);
        if (label) $('[data-empty-cat]', empty).textContent = label.dataset.name || '';
      }
      layout(true);
      if (push) history.replaceState(null, '', cat === 'all' ? location.pathname : `#${cat}`);
    };

    if (filters) {
      $$('[data-filter]', filters).forEach(b => b.addEventListener('click', () => {
        apply(b.dataset.filter, true);
        b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        const top = gallery.closest('section').getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }));
    }
    const fromHash = location.hash.slice(1);
    apply(filters && $(`[data-filter="${fromHash}"]`, filters) ? fromHash : 'all', false);
    window.addEventListener('resize', () => layout(false));
  }

  /* ============ LIGHTBOX (results on home + results page) ============ */
  const triggers = $$('[data-lightbox]');
  if (triggers.length) {
    const box = document.createElement('dialog');
    box.className = 'lb';
    box.setAttribute('aria-label', 'Перегляд фото');
    box.innerHTML = `
      <div class="lb__stage"><img class="lb__img" alt=""></div>
      <div class="lb__bar">
        <p class="lb__cap"></p>
        <div class="lb__nav">
          <span class="lb__count"></span>
          <button class="lb__btn" type="button" data-lb-prev aria-label="Попереднє фото"><svg><use href="#i-left"/></svg></button>
          <button class="lb__btn" type="button" data-lb-next aria-label="Наступне фото"><svg><use href="#i-right"/></svg></button>
        </div>
      </div>
      <button class="lb__close" type="button" aria-label="Закрити"><svg viewBox="0 0 16 16"><path d="M3.5 3.5l9 9m0-9l-9 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>`;
    document.body.appendChild(box);
    const img = $('.lb__img', box), cap = $('.lb__cap', box), count = $('.lb__count', box);
    let list = [], idx = 0;

    const show = (i) => {
      idx = (i + list.length) % list.length;
      const a = list[idx];
      img.classList.remove('is-ready');
      img.onload = () => img.classList.add('is-ready');
      img.src = a.getAttribute('href');
      img.alt = $('img', a)?.alt || '';
      if (img.complete) img.classList.add('is-ready');
      cap.innerHTML = '';
      if (a.dataset.meta) { const m = document.createElement('span'); m.className = 'lb__meta'; m.textContent = a.dataset.meta; cap.appendChild(m); }
      cap.appendChild(document.createTextNode(a.dataset.caption || ''));
      count.textContent = `${idx + 1} / ${list.length}`;
      [list[idx + 1], list[idx - 1]].forEach(n => { if (n) { const p = new Image(); p.src = n.getAttribute('href'); } });
    };
    const open = (a) => {
      const scope = a.closest('[data-gallery]') || document;
      const order = (x) => +(x.closest('.result')?.dataset.i ?? 0);
      list = $$('[data-lightbox]', scope).filter(x => !x.closest('[hidden]')).sort((x, y) => order(x) - order(y));
      box.showModal();
      document.body.style.overflow = 'hidden';
      show(list.indexOf(a));
    };
    const close = () => box.close();
    box.addEventListener('close', () => { document.body.style.overflow = ''; });

    triggers.forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); open(a); }));
    $('[data-lb-prev]', box).addEventListener('click', () => show(idx - 1));
    $('[data-lb-next]', box).addEventListener('click', () => show(idx + 1));
    $('.lb__close', box).addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb__stage')) close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
    let sx = 0, sy = 0;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close(); // swipe down to close
    }, { passive: true });
  }
})();
