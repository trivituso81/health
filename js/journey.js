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
    if (n < 0) {
      el.textContent = String(Math.abs(n));
      var label = document.getElementById('metric-day-label');
      if (label) label.textContent = 'Days to go';
    } else {
      el.textContent = String(n);
    }
  }

  /* Schedule phases: heal (acute) → rebuild (~4 wk) → full */
  var PHASE_COPY = {
    heal: 'Now through ~week 4 — keep Problend held, stay on oral finasteride, add whey + Happy Head capsules. Zepbound stays paused.',
    rebuild: '~4 weeks post-op (mid-Sep) — restart Problend while continuing finasteride. Resume fish oil & multivitamins when clinic agrees.',
    full: 'Back to baseline once cleared — full stack, Problend nightly, Zepbound only after Dr. Sean okays a slow restart (~8–12 weeks).'
  };

  function defaultPhase() {
    var n = daysSinceSurgery();
    if (n < 28) return 'heal';
    if (n < 56) return 'rebuild';
    return 'full';
  }

  function initSchedule() {
    var root = document.querySelector('[data-schedule]');
    if (!root) return;

    var tabs = root.querySelectorAll('[data-phase]');
    var note = document.getElementById('phase-note');
    var items = root.querySelectorAll('[data-on]');

    function apply(phase) {
      tabs.forEach(function (btn) {
        btn.setAttribute('aria-selected', btn.getAttribute('data-phase') === phase ? 'true' : 'false');
      });
      if (note) note.textContent = PHASE_COPY[phase] || '';
      items.forEach(function (li) {
        var on = (li.getAttribute('data-on') || '').split(/\s+/);
        li.hidden = on.indexOf(phase) === -1;
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
  initSchedule();
  initProgressPhotos();
})();
