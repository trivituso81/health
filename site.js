(function () {
  const PASSWORD = '8127';
  const AUTH_KEY = 'toms-health-unlocked';
  const SURGERY_START = new Date('2026-08-18T06:45:00-07:00');
  const MILESTONES = [
    { date: '2026-08-08', label: 'Review home dashboard' },
    { date: '2026-08-10', label: 'Last Problend (Mon PM)' },
    { date: '2026-08-11', label: 'Start 1-week stops' },
    { date: '2026-08-15', label: 'Hydration protocol begins' },
    { date: '2026-08-16', label: 'Vitamin K1 · Sat–Sun' },
    { date: '2026-09-16', label: 'Problend restart (~4 wk)' },
    { date: '2026-08-18', label: 'Surgery day 1' },
    { date: '2026-08-19', label: 'Surgery day 2' },
  ];

  function daysUntil(target) {
    const now = new Date();
    const ms = target.setHours(0, 0, 0, 0) - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.ceil(ms / 86400000);
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function initAuth() {
    if (document.documentElement.classList.contains('unlocked')) return;
    if (document.getElementById('auth-gate')) return;

    var gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-labelledby', 'auth-title');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML =
      '<div class="auth-card">' +
        '<h2 id="auth-title">Tom\'s Health App</h2>' +
        '<p>Enter the password to open the app.</p>' +
        '<p class="auth-error" id="auth-error" role="alert">Incorrect password. Please try again.</p>' +
        '<form id="auth-form">' +
          '<div class="auth-field">' +
            '<label for="auth-password">Password</label>' +
            '<input type="password" id="auth-password" name="password" inputmode="numeric" autocomplete="current-password" required autofocus />' +
          '</div>' +
          '<label class="auth-remember">' +
            '<input type="checkbox" id="auth-remember" checked />' +
            'Remember on this device' +
          '</label>' +
          '<button type="submit" class="auth-submit">Unlock</button>' +
        '</form>' +
      '</div>';
    document.body.insertBefore(gate, document.body.firstChild);

    var form = document.getElementById('auth-form');
    var input = document.getElementById('auth-password');
    var remember = document.getElementById('auth-remember');
    var error = document.getElementById('auth-error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value === PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, '1');
        if (remember.checked) localStorage.setItem(AUTH_KEY, '1');
        document.documentElement.classList.add('unlocked');
        error.classList.remove('visible');
      } else {
        error.classList.add('visible');
        input.select();
      }
    });
  }

  function initDashboard() {
    const days = daysUntil(new Date(SURGERY_START));
    setText('countdown-days', String(Math.max(0, days)));
    setText('countdown-label', days === 1 ? 'day until surgery' : 'days until surgery');
    setText('today-date', new Date().toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }));

    const strip = document.getElementById('timeline-strip');
    if (strip) {
      const today = new Date().toISOString().slice(0, 10);
      strip.innerHTML = MILESTONES.map(function (m) {
        let cls = 'timeline-item';
        if (m.date === today) cls += ' current';
        else if (m.date < today) cls += ' past';
        return '<div class="' + cls + '"><div class="timeline-date">' + formatDate(m.date) + '</div><div class="timeline-label">' + m.label + '</div></div>';
      }).join('');
    }

    const phaseEl = document.getElementById('current-phase');
    if (phaseEl) {
      const t = new Date().toISOString().slice(0, 10);
      let phase = 'Pre-operative preparation';
      if (t >= '2026-08-18' && t <= '2026-08-19') phase = 'Surgery in progress';
      else if (t >= '2026-08-20' && t <= '2026-08-26') phase = 'Acute recovery (days 0–7)';
      else if (t > '2026-08-19') phase = 'Post-operative recovery';
      else if (t >= '2026-08-16') phase = 'Vitamin K1 window';
      else if (t >= '2026-08-15') phase = 'Hydration protocol · 3 days out';
      else if (t >= '2026-08-11') phase = 'One-week stop window active';
      phaseEl.textContent = phase;
    }
  }

  function initChecklists() {
    document.querySelectorAll('.qgroup input[type=checkbox]').forEach(function (box) {
      const key = box.dataset.checkId
        ? 'hp-check-' + box.dataset.checkId
        : 'hp-check-' + box.closest('li').textContent.trim().slice(0, 60);
      box.checked = localStorage.getItem(key) === '1';
      box.addEventListener('change', function () {
        localStorage.setItem(key, box.checked ? '1' : '0');
      });
    });
  }

  function initActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll('.site-nav a[data-nav]').forEach(function (a) {
      if (a.dataset.nav === page) a.classList.add('active');
    });
  }

  function initResponsiveTables() {
    document.querySelectorAll('.tscroll table, main table').forEach(function (table) {
      if (table.classList.contains('lab-table')) return;

      const thead = table.querySelector('thead');
      if (!thead) return;

      const headers = [];
      thead.querySelectorAll('th').forEach(function (th) {
        headers.push(th.textContent.trim());
      });
      if (!headers.length) return;

      table.classList.add('responsive-table');
      table.classList.add('cols-' + headers.length);

      table.querySelectorAll('tbody tr').forEach(function (tr) {
        let col = 0;
        tr.querySelectorAll(':scope > td').forEach(function (td) {
          const span = td.colSpan || 1;
          const empty = !td.textContent.trim();

          if (empty && span > 1) {
            td.classList.add('mobile-empty');
          } else {
            const label = headers[col] || headers[headers.length - 1] || '';
            if (label) td.setAttribute('data-label', label);
          }

          col += span;
        });
      });

      const wrap = table.closest('.tscroll');
      if (wrap) wrap.classList.add('tscroll-table-cards');
    });
  }

  function initTransplantSubnav() {
    if (document.body.dataset.page !== 'transplant') return;

    var links = document.querySelectorAll('.subnav-chapters a[href^="#"]');
    if (!links.length) return;

    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) sections.push({ link: a, el: el });
    });
    if (!sections.length) return;

    function setActive(active) {
      links.forEach(function (l) { l.classList.remove('is-active'); });
      active.link.classList.add('is-active');
    }

    function updateActive() {
      var offset = (document.querySelector('.subnav-chapters') || { offsetHeight: 96 }).offsetHeight + 80;
      var y = window.scrollY + offset;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) current = s;
      });
      setActive(current);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (match) setActive(match);
      });
    }, { rootMargin: '-40% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s.el); });
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  function currentSupplementPhase(iso) {
    if (iso >= '2026-09-16') return 'full';
    if (iso >= '2026-09-03') return 'rebuild';
    if (iso >= '2026-08-19') return 'heal';
    if (iso >= '2026-08-11') return 'preop';
    return 'ideal';
  }

  function initSupplementPhases() {
    if (window.__suppPhases) return;
    var bar = document.querySelector('.supp-phasebar');
    if (!bar) return;

    var WHEN = {
      ideal: 'Everyday stack',
      preop: '11–18 Aug · K1 2–3× / day for 2 days',
      heal: '19 Aug – 2 Sep',
      rebuild: '3–16 Sep',
      full: '16 Sep onward'
    };
    var today = new Date().toISOString().slice(0, 10);
    var nowPhase = currentSupplementPhase(today);
    var whenEl = document.getElementById('supp-when');
    var buttons = bar.querySelectorAll('[data-phase]');
    var items = document.querySelectorAll('.supp-block li[data-on]');
    var blocks = document.querySelectorAll('.supp-block[data-block]');

    buttons.forEach(function (btn) {
      if (btn.dataset.phase === nowPhase) btn.classList.add('is-now');
    });

    function show(phase) {
      buttons.forEach(function (btn) {
        var on = btn.getAttribute('data-phase') === phase;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (whenEl) whenEl.textContent = WHEN[phase] || '';
      items.forEach(function (li) {
        var on = (li.getAttribute('data-on') || '').split(/\s+/).indexOf(phase) !== -1;
        li.classList.toggle('is-off', !on);
        li.hidden = !on;
      });
      blocks.forEach(function (block) {
        var visible = block.querySelector('li[data-on]:not(.is-off)');
        block.classList.toggle('is-off', !visible);
        block.hidden = !visible;
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(btn.getAttribute('data-phase'));
      });
    });

    window.__suppPhases = true;
    show(nowPhase);
  }

  function initLabArchives() {
    var hash = location.hash;
    if (!hash || hash.indexOf('#lab-2026-') !== 0) return;
    var el = document.querySelector(hash);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAuth();
    initDashboard();
    initChecklists();
    initActiveNav();
    initResponsiveTables();
    initTransplantSubnav();
    initSupplementPhases();
    initLabArchives();
  });

  if (document.readyState !== 'loading') initAuth();
})();
