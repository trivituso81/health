(function () {
  const SURGERY_START = new Date('2026-08-18T06:45:00-07:00');
  const MILESTONES = [
    { date: '2026-08-08', label: 'Today — review dashboard' },
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
    initDashboard();
    initChecklists();
    initActiveNav();
    initResponsiveTables();
    initTransplantSubnav();
    initLabArchives();
  });
})();
