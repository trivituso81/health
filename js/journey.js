/* Tom's Hair Journey */
(function () {
  var PASSWORD = '8127';
  var AUTH_KEY = 'toms-health-unlocked';
  var DAY0 = new Date(2026, 7, 19); // Wed 19 Aug 2026 — last graft session

  function unlocked() {
    return (
      localStorage.getItem(AUTH_KEY) === '1' ||
      sessionStorage.getItem(AUTH_KEY) === '1'
    );
  }

  function showGate() {
    if (document.documentElement.classList.contains('unlocked')) return;
    if (unlocked()) {
      document.documentElement.classList.add('unlocked');
      return;
    }
    if (document.getElementById('auth-gate')) return;

    var gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-labelledby', 'auth-title');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML =
      '<div class="auth-card">' +
      '<h1 id="auth-title">Tom\'s Hair Journey</h1>' +
      '<p>Enter the password to open the app.</p>' +
      '<p class="auth-error" id="auth-error" role="alert">Incorrect password. Please try again.</p>' +
      '<form id="auth-form">' +
      '<label for="auth-password">Password</label>' +
      '<input type="password" id="auth-password" name="password" inputmode="numeric" autocomplete="current-password" required autofocus />' +
      '<button type="submit">Open</button>' +
      '</form>' +
      '</div>';
    document.body.insertBefore(gate, document.body.firstChild);

    var form = document.getElementById('auth-form');
    var input = document.getElementById('auth-password');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value === PASSWORD) {
        localStorage.setItem(AUTH_KEY, '1');
        sessionStorage.setItem(AUTH_KEY, '1');
        document.documentElement.classList.add('unlocked');
        gate.remove();
      } else {
        gate.classList.add('is-error');
        input.value = '';
        input.focus();
      }
    });
  }

  function startOfLocalDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function daysSinceSurgery() {
    var today = startOfLocalDay(new Date());
    var zero = startOfLocalDay(DAY0);
    return Math.floor((today - zero) / 86400000);
  }

  function fillDayMetric() {
    var el = document.getElementById('metric-day');
    if (!el) return;
    var n = daysSinceSurgery();
    var label = document.getElementById('metric-day-label');
    if (n < 0) {
      el.textContent = String(Math.abs(n));
      if (label) label.textContent = Math.abs(n) === 1 ? 'Day to go' : 'Days to go';
    } else {
      el.textContent = String(n);
      if (label) label.textContent = n === 1 ? 'Day post-op' : 'Days post-op';
    }
  }

  function daysUntil(targetDay) {
    return targetDay - daysSinceSurgery();
  }

  function formatCountdown(daysLeft) {
    if (daysLeft < 0) return 'done';
    if (daysLeft === 0) return 'today';
    if (daysLeft === 1) return '1 day';
    return daysLeft + ' days';
  }

  function todayFacts(n) {
    var spray =
      n <= 0 ? 'Every 10 min while awake' :
      n === 1 ? 'Every 20 min while awake' :
      n === 2 ? 'Every 30 min while awake' :
      n <= 5 ? 'Optional · about hourly' :
      'Spray window closed';

    var meds =
      n <= 2 ? 'AM: aspirin · pentox · cephalexin · full prednisone · PM: cephalexin · ½ minoxidil · no NSAIDs' :
      n <= 5 ? 'AM: aspirin · pentox · cephalexin · full prednisone · PM: cephalexin · ½ minoxidil · Advil OK' :
      n <= 10 ? 'AM: aspirin · pentox · cephalexin · PM: cephalexin · ½ minoxidil' :
      n < 28 ? '½ oral minoxidil evenings · Problend still held' :
      'Problend restart window · ½ oral minoxidil evenings until cleared';

    var wash =
      n <= 1 ? 'No graft wash yet' :
      n <= 11 ? 'Cup-rinse grafts · no touching' :
      n <= 14 ? 'Scab softener · baby oil overnight' :
      n < 31 ? 'Gentle wash · no shower pressure on grafts' :
      'Regular showering cleared';

    var scalp =
      n < 28 ? 'Problend held · oral minoxidil ½ dose (evening)' :
      'Problend restart eligible';

    return [
      ['Spray', spray],
      ['Clinic Rx', meds],
      ['Wash', wash],
      ['Scalp', scalp]
    ];
  }

  function fillHomeStatus() {
    var n = daysSinceSurgery();
    var stamp = document.getElementById('home-stamp');
    var phaseEl = document.getElementById('home-phase');
    var factsEl = document.getElementById('home-facts');
    var nextEl = document.getElementById('home-next');
    if (!factsEl || !nextEl) return;

    var phaseKey = defaultPhase();
    var phaseLabel = {
      d0: 'Day 0',
      d1: 'Day 1',
      d2: 'Day 2',
      d3: 'Days 3–5',
      d6: 'Days 6–14',
      d15: 'Days 15–30',
      full: 'Full stack'
    }[phaseKey] || phaseKey;

    if (stamp) {
      stamp.innerHTML = (n < 0 ? 'Pre-op' : 'Day ' + n) + '<br>Aug 19 start';
    }
    if (phaseEl) phaseEl.textContent = phaseLabel;

    var facts = todayFacts(n);
    factsEl.innerHTML = facts.map(function (row) {
      return '<div><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
    }).join('');

    var milestones = [
      { day: 3, label: 'Advil / NSAIDs OK' },
      { day: 5, label: 'Forehead tape off' },
      { day: 12, label: 'Scab softener starts' },
      { day: 21, label: 'Donor LED + stamp' },
      { day: 28, label: 'Problend restart' },
      { day: 30, label: 'Month-1 photos' }
    ];

    nextEl.innerHTML = milestones.map(function (m) {
      var left = daysUntil(m.day);
      var cls = left < 0 ? ' class="is-done"' : '';
      return '<li' + cls + '><span class="next-label">' + m.label + '</span><span class="next-when">' + formatCountdown(left) + '</span></li>';
    }).join('');
  }

  /* Schedule day-range filters */
  var PHASE_COPY = {
    d0: 'Procedure night — spray every 10 min, sleep at 45°, no NSAIDs, start whey + Happy Head capsules · PM ½ oral minoxidil.',
    d1: 'Spray every 20 min · AM: aspirin/pentox/cephalexin/full prednisone · PM: cephalexin + ½ minoxidil · ACell ×3 · forehead tape/ice/massage · last night at 45°.',
    d2: 'Spray every 30 min · same AM/PM clinic Rx · Advil still held until tomorrow · first cup-rinse · ACell continues.',
    d3: 'Days 3–5 — optional spray · Advil OK · finish prednisone (full AM) · keep cephalexin BID + ½ minoxidil PM · ACell until jar empty · tape off by day 5.',
    d6: 'Days 6–14 — finish antibiotic · keep ½ minoxidil PM · donor cleanse · cup-rinse then scab softener from day 12 · Ca-AKG continuous · Problend still held.',
    d15: 'Days 15–30 — gentle wash · donor LED/stamp from day 21 · Problend still held until ~day 28 · ½ minoxidil PM · maca/boron can return.',
    full: 'Baseline stack — Problend nightly, full supplements, Zepbound only after Dr. Sean clears a slow restart.'
  };

  function defaultPhase() {
    var n = daysSinceSurgery();
    if (n <= 0) return 'd0';
    if (n === 1) return 'd1';
    if (n === 2) return 'd2';
    if (n <= 5) return 'd3';
    if (n <= 14) return 'd6';
    if (n <= 30) return 'd15';
    return 'full';
  }

  function defaultAnalysisPhase() {
    var n = daysSinceSurgery();
    if (n <= 3) return 'd1';
    if (n <= 7) return 'd4';
    if (n <= 14) return 'd8';
    return 'd15';
  }

  function localDayStamp() {
    var d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  /* Ticks are scoped to the calendar date so the list is blank again each
     morning; yesterday's keys are dropped on load. */
  function initScheduleTicks(root) {
    var stamp = localDayStamp();
    var prefix = 'hp-sched-';
    var todayPrefix = prefix + stamp + '-';

    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(prefix) === 0 && k.indexOf(todayPrefix) !== 0) localStorage.removeItem(k);
      });
    } catch (e) { /* private mode */ }

    var counter = document.getElementById('sched-progress');

    root.querySelectorAll('li[data-on]').forEach(function (li, i) {
      if (li.querySelector('.tick')) return;
      var name = li.querySelector('.name');
      if (!name) return;

      var label = (name.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48);
      var key = todayPrefix + i + '-' + label;

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'tick';
      box.setAttribute('aria-label', 'Mark done: ' + label);
      try { box.checked = localStorage.getItem(key) === '1'; } catch (e) { box.checked = false; }
      li.classList.toggle('is-done', box.checked);

      box.addEventListener('change', function () {
        try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (e) { /* ignore */ }
        li.classList.toggle('is-done', box.checked);
        updateCount();
      });

      li.insertBefore(box, li.firstChild);
    });

    function updateCount() {
      if (!counter) return;
      var shown = root.querySelectorAll('li[data-on]:not([hidden])');
      var done = 0;
      shown.forEach(function (li) {
        var b = li.querySelector('.tick');
        if (b && b.checked) done++;
      });
      counter.textContent = shown.length ? done + ' of ' + shown.length + ' done today' : '';
    }

    return updateCount;
  }

  function initSchedule() {
    var root = document.querySelector('[data-schedule]');
    if (!root) return;

    var tabs = root.querySelectorAll('.phase-tabs[aria-label="Recovery phase"] [data-phase]');
    var note = document.getElementById('phase-note');
    var items = root.querySelectorAll('li[data-on]');
    var updateCount = initScheduleTicks(root);

    function apply(phase) {
      if (!phase) return;
      tabs.forEach(function (btn) {
        var on = btn.getAttribute('data-phase') === phase;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (note) note.textContent = PHASE_COPY[phase] || '';

      items.forEach(function (li) {
        var tags = (li.getAttribute('data-on') || '').trim().split(/\s+/).filter(Boolean);
        var match = tags.indexOf(phase) !== -1;
        if (match) {
          li.removeAttribute('hidden');
        } else {
          li.setAttribute('hidden', '');
        }
      });

      root.querySelectorAll('[data-group]').forEach(function (group) {
        var visible = group.querySelectorAll('li[data-on]:not([hidden])');
        if (visible.length) {
          group.removeAttribute('hidden');
        } else {
          group.setAttribute('hidden', '');
        }
      });

      root.querySelectorAll('[data-block]').forEach(function (block) {
        var visible = block.querySelectorAll('li[data-on]:not([hidden])');
        if (visible.length) {
          block.removeAttribute('hidden');
        } else {
          block.setAttribute('hidden', '');
        }
      });

      if (updateCount) updateCount();
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-phase'));
      });
    });

    apply(defaultPhase());
  }

  function initAnalysis() {
    var root = document.querySelector('[data-analysis]');
    if (!root) return;
    var tabs = root.querySelectorAll('[data-analysis-phase]');
    var panels = root.querySelectorAll('[data-analysis-panel]');

    function apply(phase) {
      tabs.forEach(function (btn) {
        btn.setAttribute('aria-selected', btn.getAttribute('data-analysis-phase') === phase ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-analysis-panel') !== phase;
      });
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-analysis-phase'));
      });
    });

    apply(defaultAnalysisPhase());
  }

  function initProgressPhotos() {
    var exts = ['.jpg', '.jpeg', '.png', '.webp'];
    document.querySelectorAll('[data-photo]').forEach(function (card) {
      var base = card.getAttribute('data-photo');
      var frame = card.querySelector('.photo-frame');
      if (!base || !frame) return;

      var stem = base.replace(/\.(jpe?g|png|webp)$/i, '');
      var label = card.getAttribute('data-label') || 'Progress photo';
      var i = 0;

      function tryNext() {
        if (i >= exts.length) return;
        var img = new Image();
        img.alt = label;
        img.onload = function () {
          frame.innerHTML = '';
          frame.appendChild(img);
          card.classList.add('is-filled');
        };
        img.onerror = function () {
          i += 1;
          tryNext();
        };
        img.src = stem + exts[i];
      }

      tryNext();
    });
  }

  showGate();
  if (unlocked()) document.documentElement.classList.add('unlocked');
  fillDayMetric();
  fillHomeStatus();
  initSchedule();
  initAnalysis();
  initProgressPhotos();
})();
