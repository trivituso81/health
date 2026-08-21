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
      n <= 2 ? 'Antibiotic BID · prednisone AM · no NSAIDs yet' :
      n <= 5 ? 'Antibiotic BID · prednisone AM · Advil OK' :
      n <= 10 ? 'Finish antibiotic · ACell if jar remains' :
      n < 28 ? 'Problend still held · oral finasteride on' :
      'Problend restart window · keep finasteride';

    var wash =
      n <= 1 ? 'No graft wash yet' :
      n <= 11 ? 'Cup-rinse grafts · no touching' :
      n <= 14 ? 'Scab softener · baby oil overnight' :
      n < 31 ? 'Gentle wash · no shower pressure on grafts' :
      'Regular showering cleared';

    var scalp =
      n < 28 ? 'Problend held · oral minoxidil ½ dose' :
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
      acute: 'Acute · days 0–5',
      heal: 'Heal · days 6–27',
      rebuild: 'Rebuild · ~4 weeks',
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

  /* Schedule phases aligned to Dr. Sean post-op packet */
  var PHASE_COPY = {
    acute: 'Days 0–5 — spray, ACell, antibiotics + prednisone. Stack analysis: mostly helpful/neutral; only ADAM vit E + grape seed is a bleed question while on aspirin/pentox.',
    heal: 'Days 6–27 — keep Ca-AKG continuous through day 21 (peak collagen days 8–14). Omega-3 cleared. NAC best-timed around days 4–7 reperfusion.',
    rebuild: '~4 weeks / month 1 — restart Problend (not sooner). Donor LED + 0.25 mm stamp 3×/week from day 21.',
    full: 'Back toward baseline — full stack, Problend nightly, Zepbound only after Dr. Sean clears a slow restart. Keep whey + Happy Head capsules through month 6.'
  };

  function defaultPhase() {
    var n = daysSinceSurgery();
    if (n <= 5) return 'acute';
    if (n < 28) return 'heal';
    if (n < 56) return 'rebuild';
    return 'full';
  }

  function defaultAnalysisPhase() {
    var n = daysSinceSurgery();
    if (n <= 3) return 'd1';
    if (n <= 7) return 'd4';
    if (n <= 14) return 'd8';
    return 'd15';
  }

  function initSchedule() {
    var root = document.querySelector('[data-schedule]');
    if (!root) return;

    var tabs = root.querySelectorAll('.phase-tabs[aria-label="Recovery phase"] [data-phase]');
    var note = document.getElementById('phase-note');
    var items = root.querySelectorAll('[data-on]');
    var day = daysSinceSurgery();

    function apply(phase) {
      tabs.forEach(function (btn) {
        btn.setAttribute('aria-selected', btn.getAttribute('data-phase') === phase ? 'true' : 'false');
      });
      if (note) note.textContent = PHASE_COPY[phase] || '';
      items.forEach(function (li) {
        var on = (li.getAttribute('data-on') || '').split(/\s+/);
        var dayAttr = li.getAttribute('data-day');
        var visible = on.indexOf(phase) !== -1;
        li.hidden = !visible;
        if (dayAttr !== null && Number(dayAttr) === day) {
          li.classList.add('is-today');
        } else {
          li.classList.remove('is-today');
        }
      });
      root.querySelectorAll('[data-block]').forEach(function (block) {
        var visible = block.querySelectorAll('li:not([hidden])');
        block.hidden = visible.length === 0;
      });
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
