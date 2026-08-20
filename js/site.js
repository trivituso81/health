(function () {
  const PASSWORD = '8127';
  const AUTH_KEY = 'toms-health-unlocked';
  const SURGERY_START = new Date('2026-08-18T06:45:00-07:00');
  const SURGERY_END = '2026-08-19';
  const MILESTONES = [
    { date: '2026-08-16', label: 'Vitamin K1 · Sat–Sun' },
    { date: '2026-08-18', label: 'Surgery day 1' },
    { date: '2026-08-19', label: 'Surgery day 2' },
    { date: '2026-08-20', label: 'HBOT session 1 · 60 min' },
    { date: '2026-08-22', label: 'Graft revascularization window closes' },
    { date: '2026-09-02', label: 'Scabbing resolved (~2 wk)' },
    { date: '2026-09-16', label: 'Problend restart (~4 wk)' },
    { date: '2026-11-19', label: 'Regrowth begins (~mo 3)' },
  ].sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  function todayLocal() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

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
    const today = todayLocal();
    if (today > SURGERY_END) {
      const since = -daysUntil(new Date(SURGERY_END + 'T12:00:00'));
      setText('countdown-days', String(since));
      setText('countdown-label', since === 1 ? 'day since surgery' : 'days since surgery');
    } else {
      const days = daysUntil(new Date(SURGERY_START));
      setText('countdown-days', String(Math.max(0, days)));
      setText('countdown-label', days === 1 ? 'day until surgery' : 'days until surgery');
    }
    setText('today-date', new Date().toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }));

    const strip = document.getElementById('timeline-strip');
    if (strip) {
      strip.innerHTML = MILESTONES.map(function (m) {
        let cls = 'timeline-item';
        if (m.date === today) cls += ' current';
        else if (m.date < today) cls += ' past';
        return '<div class="' + cls + '"><div class="timeline-date">' + formatDate(m.date) + '</div><div class="timeline-label">' + m.label + '</div></div>';
      }).join('');
    }

    const phaseEl = document.getElementById('current-phase');
    if (phaseEl) {
      const t = today;
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
      preop: 'Until day 1 · K1 2–3× / day for 2 days',
      heal: 'Until scabs off + clinic restarts fish oil / multi',
      rebuild: 'After clinic OK',
      full: 'Full stack'
    };
    var today = todayLocal();
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

  var STACK_ITEMS = {
    trintellix: {
      kicker: 'Prescription',
      title: 'Trintellix (vortioxetine)',
      dose: '20 mg · Period 3 · bedtime',
      rx: true,
      rows: [
        ['Purpose', 'SSRI for mood.'],
        ['When', 'Period 3 — right before bed.'],
        ['Peri-op', 'Continue — confirmed with Dr. Sean.'],
        ['Interactions', 'Antiplatelet effect — already on Dr. Sean’s list; continue as confirmed.'],
        ['Side effects to watch', 'Nausea early on (usually settles), sexual side effects, rare serotonin syndrome if stacked with other serotonergic agents.']
      ]
    },
    olmesartan: {
      kicker: 'Prescription',
      title: 'Olmesartan',
      dose: '20 mg · Period 3 · bedtime',
      rx: true,
      rows: [
        ['Purpose', 'Blood pressure — target systolic 120–140 on surgery days.'],
        ['When', 'Period 3 — right before bed; also take the morning of 18 & 19 Aug.'],
        ['Peri-op', 'Continue — confirmed with Dr. Sean, including surgery mornings.'],
        ['Interactions', 'With daily creatine, creatinine labs can look higher than true GFR — disclose creatine at any kidney review.'],
        ['Side effects to watch', 'Dizziness / low BP if dehydrated; rare sprue-like enteropathy with long-term use.']
      ]
    },
    rosuvastatin: {
      kicker: 'Prescription',
      title: 'Rosuvastatin',
      dose: '10 mg · Period 3 · bedtime',
      rx: true,
      rows: [
        ['Purpose', 'LDL management — LDL 76 mg/dL (May 2026).'],
        ['When', 'Period 3 — right before bed.'],
        ['Peri-op', 'Continue — confirmed with Dr. Sean.'],
        ['Interactions', 'Paired with CoQ10 in your stack (rational, evidence mixed). Avoid unexplained muscle pain — report to clinician.'],
        ['Side effects to watch', 'Myalgia, rare myopathy; LFTs already clean on your panels.']
      ]
    },
    finasteride: {
      kicker: 'Prescription · Dr. Sean',
      title: 'Oral finasteride',
      dose: 'Script · start when Problend stops',
      rx: true,
      rows: [
        ['Purpose', '5α-reductase block to cover DHT during the peri-op minoxidil / Problend gap.'],
        ['When', 'Start when Problend stops (from 11 Aug) per Dr. Sean script.'],
        ['Peri-op', 'Bridge strategy — confirmed. Continue while Problend is held; Problend restarts ~4 weeks post-op alongside oral finasteride.'],
        ['Labs', 'PSA baseline 0.49 ng/mL (Feb 2026) — excellent before starting.'],
        ['Side effects to watch', 'Sexual side effects in a minority; mood changes uncommon but reportable. See Hair care for strategy.']
      ]
    },
    zepbound: {
      kicker: 'Prescription · paused',
      title: 'Zepbound (tirzepatide)',
      dose: '2.5 mg SC weekly · paused since 1 Aug',
      rx: true,
      rows: [
        ['Purpose', 'GLP-1 / GIP agonist for weight and metabolic control.'],
        ['Status', 'Stay paused — confirmed with Dr. Sean through acute recovery.'],
        ['Resume', 'Best-practice ~8–12 weeks post-op (~mid-Oct) — slow titration, high protein, no rapid weight loss (sheet warns rapid loss impairs graft growth).'],
        ['Interactions', 'Coordinate restart with wound healing and protein intake; do not stack aggressive calorie cuts post-FUE.'],
        ['Side effects to watch', 'Nausea, delayed gastric emptying, constipation; rare gallbladder issues.']
      ]
    },
    problend: {
      kicker: 'Compounded scalp Rx',
      title: 'Happy Head Problend',
      dose: 'Topical · Night A & B',
      rx: true,
      rows: [
        ['Contents', 'Minoxidil + finasteride + tretinoin (compounded).'],
        ['When', 'Evening scalp — both Night A and Night B blocks. See Hair care.'],
        ['Peri-op', 'Stop minoxidil 1 week out — last dose Mon 10 Aug PM.'],
        ['Bridge', 'Oral finasteride script covers the stop window.'],
        ['Restart', '~4 weeks post-op (~mid-Sep) while on oral finasteride.'],
        ['Side effects to watch', 'Scalp irritation from tretinoin/minoxidil; systemic minoxidil effects if over-applied.']
      ]
    },
    'problend-hold': null,
    'problend-restart': null,
    nac: {
      kicker: 'Supplement',
      title: 'NAC powder',
      dose: '1,200 mg · AM juice shot',
      rows: [
        ['Purpose', 'N-acetylcysteine — glutathione precursor; antioxidant support.'],
        ['When', 'AM in a juice shot.'],
        ['Peri-op', 'Held in pre-op / acute post-op phases on this schedule; back in Ideal / Clinic OK / Full.'],
        ['Notes', 'GI upset possible on empty stomach — juice shot helps.']
      ]
    },
    creatine: {
      kicker: 'Supplement',
      title: 'Creatine',
      dose: '5 g · AM coffee blend',
      rows: [
        ['Purpose', 'Muscle, cognition, and recovery support.'],
        ['When', 'AM in coffee blend — all phases on this schedule.'],
        ['Interactions', 'Raises serum creatinine without necessarily harming GFR — always disclose when kidney labs are read (especially on olmesartan).'],
        ['Peri-op', 'Continue unless a clinician directs a hold.']
      ]
    },
    glycine: {
      kicker: 'Supplement',
      title: 'Glycine',
      dose: '3 g+ · AM coffee blend',
      rows: [
        ['Purpose', 'Sleep / collagen amino-acid support; pairs with evening wind-down goals.'],
        ['When', 'AM coffee blend on this schedule.'],
        ['Notes', 'Well tolerated; can also be used evening if you prefer for sleep.']
      ]
    },
    collagen: {
      kicker: 'Supplement',
      title: 'Collagen',
      dose: '14 g · AM Greek yogurt',
      rows: [
        ['Purpose', 'Protein / connective tissue support around transplant recovery.'],
        ['When', 'AM with Greek yogurt.'],
        ['Notes', 'Food-first protein still matters more than collagen alone.']
      ]
    },
    urolithin: {
      kicker: 'Supplement · experimental',
      title: 'Urolithin A · Timeline Mitopure',
      dose: '1,000 mg · breakfast · Sat–Sun off',
      rows: [
        ['Purpose', 'Mitophagy support — longevity experiment tier.'],
        ['When', 'Breakfast on Ideal / Full; weekend off.'],
        ['Notes', 'See Longevity for evidence framing. Low practical interaction risk with your Rx list.']
      ]
    },
    akg: {
      kicker: 'Supplement · experimental',
      title: 'Calcium AKG',
      dose: '2 capsules · breakfast · Sat–Sun off',
      rows: [
        ['Purpose', 'Alpha-ketoglutarate — longevity stack experiment.'],
        ['When', 'Breakfast on Ideal / Full; weekend off.'],
        ['Notes', 'Calcium form — space from thyroid meds if any are added later (none now).']
      ]
    },
    'multi-am': {
      kicker: 'Supplement',
      title: 'Multivitamin',
      dose: '1 softgel · breakfast (1 of 2 daily)',
      rows: [
        ['Purpose', 'Broad micronutrient cover.'],
        ['When', 'Breakfast + lunch softgels on Ideal / Clinic OK / Full.'],
        ['Peri-op', 'One-week stop before surgery (clinic sheet) — held in Pre-op / Post-op phases here.'],
        ['Caution', 'Avoid mega-dose biotin that wrecks lab assays.']
      ]
    },
    'multi-pm': null,
    nad: {
      kicker: 'Supplement · experimental',
      title: 'NAD+ Cell Regenerator (NR)',
      dose: '1 capsule · breakfast · Sat–Sun off',
      rows: [
        ['Purpose', 'Nicotinamide riboside — NAD+ precursor experiment.'],
        ['When', 'Breakfast on Ideal / Full; weekend off.'],
        ['Notes', 'See Longevity — biomarker elevation ≠ proven clinical endpoints.']
      ]
    },
    'coq10-am': {
      kicker: 'Supplement',
      title: 'CoQ10',
      dose: '100 mg · 2× daily with meals',
      rows: [
        ['Purpose', 'Rational pairing with rosuvastatin; mitochondrial support.'],
        ['When', 'Breakfast and lunch — most phases.'],
        ['Evidence', 'Mixed clinical data; low downside at these doses.']
      ]
    },
    'coq10-pm': null,
    'k1-am': {
      kicker: 'Clinic protocol',
      title: 'Vitamin K1 (phytonadione)',
      dose: '1,000 mcg · 2–3× daily · 2-day course only',
      rows: [
        ['Purpose', 'Dr. Sean pre-op clotting support — Sat–Sun 16–17 Aug.'],
        ['When', 'Breakfast, lunch, and evening with food (1 of 3 slots).'],
        ['Confirm', 'Confirm start timing with clinic if unsure — 2 days only, not ongoing.'],
        ['Interactions', 'Antagonizes warfarin (you are not on warfarin). Irrelevant to your current Rx otherwise.']
      ]
    },
    'k1-lunch': null,
    'k1-eve': null,
    'maca-am': {
      kicker: 'Supplement',
      title: 'Black Maca',
      dose: '1,000 mg · 2× daily · Sat–Sun off',
      rows: [
        ['Purpose', 'Androgen-adjacent libido / energy experiment.'],
        ['When', 'Breakfast and lunch on Ideal / Full.'],
        ['Caution', 'Coordinate with Defy before stacking more androgen-adjacent agents on top of boron + soft free T.']
      ]
    },
    'maca-pm': null,
    boron: {
      kicker: 'Supplement',
      title: 'Boron',
      dose: '3 mg · 2 wk on · 1 wk off',
      rows: [
        ['Purpose', 'SHBG modulation rationale given free T 9.7 pg/mL.'],
        ['When', 'Breakfast on Ideal / Full; cycle 2 weeks on / 1 off.'],
        ['Caution', 'Hair risk if free androgens rise — coordinate with Defy, not DIY-stacked aggressively.']
      ]
    },
    omega: {
      kicker: 'Supplement',
      title: 'Omega-3 · fish oil',
      dose: '2 softgels · lunch',
      rows: [
        ['Purpose', 'Triglycerides / general cardiometabolic support.'],
        ['Peri-op', 'One-week stop before surgery (clinic sheet — bleeding risk). Held in Pre-op / Post-op until clinic OK.'],
        ['Interactions', 'Additive bleeding risk with antiplatelet effects — reason for the surgical hold.']
      ]
    },
    d3k2: {
      kicker: 'Supplement',
      title: 'Vitamin D3 + K2',
      dose: '1 softgel · lunch',
      rows: [
        ['Purpose', 'Vitamin D repletion / maintenance with K2 cofactor.'],
        ['Gap', 'No 25-OH vitamin D level drawn yet — dosing blind until next Defy panel.'],
        ['When', 'Lunch — most phases.']
      ]
    },
    whey: {
      kicker: 'Recovery',
      title: 'Naked Whey',
      dose: 'As directed · grass-fed concentrate',
      rows: [
        ['Purpose', 'Protein for healing — clinic-aligned post-op add.'],
        ['When', 'Post-op / Clinic OK / Full phases.'],
        ['Note', 'Concentrate, not isolate — per purchase checklist.']
      ]
    },
    'hh-caps': {
      kicker: 'Clinic sheet · post-op',
      title: 'Happy Head Hair Growth Supplements',
      dose: '2 capsules / day with food',
      rows: [
        ['Purpose', 'Post-op oral hair support (biotin, collagen, keratin, saw palmetto, ashwagandha, probiotics, A & D).'],
        ['When', 'After surgery per clinic sheet — not a substitute for Problend.'],
        ['Caution', 'Biotin can distort lab assays — tell the lab if you are on it when blood is drawn.']
      ]
    }
  };

  STACK_ITEMS['problend-hold'] = STACK_ITEMS.problend;
  STACK_ITEMS['problend-restart'] = STACK_ITEMS.problend;
  STACK_ITEMS['multi-pm'] = STACK_ITEMS['multi-am'];
  STACK_ITEMS['coq10-pm'] = STACK_ITEMS['coq10-am'];
  STACK_ITEMS['k1-lunch'] = STACK_ITEMS['k1-am'];
  STACK_ITEMS['k1-eve'] = STACK_ITEMS['k1-am'];
  STACK_ITEMS['maca-pm'] = STACK_ITEMS['maca-am'];

  function initItemSheet() {
    var sheet = document.getElementById('item-sheet');
    if (!sheet) return;

    var titleEl = document.getElementById('sheet-title');
    var kickerEl = document.getElementById('sheet-kicker');
    var doseEl = document.getElementById('sheet-dose');
    var bodyEl = document.getElementById('sheet-body');
    var closeBtn = document.getElementById('sheet-close');
    var backdrop = document.getElementById('sheet-backdrop');

    function close() {
      sheet.hidden = true;
      sheet.classList.remove('is-open');
      document.body.classList.remove('sheet-open');
    }

    function openItem(id) {
      var item = STACK_ITEMS[id];
      if (!item) return;
      kickerEl.textContent = item.kicker || (item.rx ? 'Prescription' : 'Supplement');
      kickerEl.classList.toggle('is-rx', !!item.rx);
      titleEl.textContent = item.title;
      doseEl.textContent = item.dose || '';
      bodyEl.innerHTML = '<dl class="sheet-dl">' + item.rows.map(function (row) {
        return '<div class="sheet-row"><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
      }).join('') + '</dl>';
      sheet.hidden = false;
      sheet.classList.add('is-open');
      document.body.classList.add('sheet-open');
      if (closeBtn) closeBtn.focus();
    }

    document.addEventListener('click', function (e) {
      var li = e.target.closest && e.target.closest('.supp-block li[data-item]');
      if (!li) return;
      e.preventDefault();
      openItem(li.getAttribute('data-item'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) {
        close();
        return;
      }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var li = e.target.closest && e.target.closest('.supp-block li[data-item]');
      if (!li) return;
      e.preventDefault();
      openItem(li.getAttribute('data-item'));
    });

    document.querySelectorAll('.supp-block li[data-item]').forEach(function (li) {
      li.classList.add('is-tappable');
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    if (location.hash && location.hash.indexOf('#item-') === 0) {
      openItem(location.hash.slice(6));
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
    initItemSheet();
    initLabArchives();
  });

  if (document.readyState !== 'loading') initAuth();
})();
