(function () {
  var ALIGNERS = [
    { n: 1, days: 14, start: '2026-05-01', end: '2026-05-15' },
    { n: 2, days: 14, start: '2026-05-15', end: '2026-05-29' },
    { n: 3, days: 14, start: '2026-05-29', end: '2026-06-12' },
    { n: 4, days: 7, start: '2026-06-12', end: '2026-06-19' },
    { n: 5, days: 7, start: '2026-06-19', end: '2026-06-26' },
    { n: 6, days: 7, start: '2026-06-26', end: '2026-07-03' },
    { n: 7, days: 7, start: '2026-07-03', end: '2026-07-10' },
    { n: 8, days: 10, start: '2026-07-10', end: '2026-07-20' },
    { n: 9, days: 7, start: '2026-07-20', end: '2026-07-27' },
    { n: 10, days: 7, start: '2026-07-27', end: '2026-08-03' },
    { n: 11, days: 7, start: '2026-08-03', end: '2026-08-10' },
    { n: 12, days: 7, start: '2026-08-10', end: '2026-08-17' },
    { n: 13, days: 7, start: '2026-08-17', end: '2026-08-24' },
    { n: 14, days: 7, start: '2026-08-24', end: '2026-08-31' },
    { n: 15, days: 7, start: '2026-08-31', end: '2026-09-07' },
    { n: 16, days: 7, start: '2026-09-07', end: '2026-09-14' },
    { n: 17, days: 7, start: '2026-09-14', end: '2026-09-21' },
    { n: 18, days: 7, start: '2026-09-21', end: '2026-09-28' },
    { n: 19, days: 7, start: '2026-09-28', end: '2026-10-05' },
    { n: 20, days: 7, start: '2026-10-05', end: '2026-10-12' },
    { n: 21, days: 7, start: '2026-10-12', end: '2026-10-19' },
    { n: 22, days: 7, start: '2026-10-19', end: '2026-10-26' }
  ];

  function todayLocal() {
    var d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function parseDate(iso) {
    var p = iso.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatShort(iso) {
    var d = parseDate(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatLong(iso) {
    var d = parseDate(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function daysBetween(a, b) {
    return Math.round((parseDate(b) - parseDate(a)) / 86400000);
  }

  function currentAligner(today) {
    for (var i = 0; i < ALIGNERS.length; i++) {
      var a = ALIGNERS[i];
      if (today >= a.start && today < a.end) return a;
    }
    if (today < ALIGNERS[0].start) return null;
    if (today >= ALIGNERS[ALIGNERS.length - 1].end) return { done: true, last: ALIGNERS[ALIGNERS.length - 1] };
    return null;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function fillStatus() {
    var today = todayLocal();
    var current = currentAligner(today);
    var total = ALIGNERS.length;

    if (current && current.done) {
      setText('inv-current', 'Done');
      setText('inv-current-label', 'Treatment complete');
      setText('inv-switch', formatLong(current.last.end));
      setText('inv-switch-label', 'Finished');
      setText('inv-remaining', '0');
      setText('inv-remaining-label', 'Aligners left');
      setText('inv-progress', '100%');
    } else if (current) {
      var dayInTray = daysBetween(current.start, today) + 1;
      var daysLeft = daysBetween(today, current.end);
      setText('inv-current', '#' + current.n);
      setText('inv-current-label', 'Current aligner · day ' + dayInTray + ' of ' + current.days);
      setText('inv-switch', daysLeft === 0 ? 'Today' : formatLong(current.end));
      setText('inv-switch-label', daysLeft === 0 ? 'Switch today' : daysLeft === 1 ? 'Switch tomorrow' : 'Next switch');
      setText('inv-remaining', String(total - current.n + 1));
      setText('inv-remaining-label', 'Including this tray');
      setText('inv-progress', Math.round(((current.n - 1) / total) * 100 + ((dayInTray / current.days) / total) * 100) + '%');
    } else {
      setText('inv-current', '—');
      setText('inv-current-label', 'Not started');
      setText('inv-switch', formatLong(ALIGNERS[0].start));
      setText('inv-switch-label', 'First tray');
      setText('inv-remaining', String(total));
      setText('inv-remaining-label', 'Total aligners');
      setText('inv-progress', '0%');
    }

    setText('inv-finish', formatLong(ALIGNERS[ALIGNERS.length - 1].end));
  }

  function renderSchedule() {
    var list = document.getElementById('inv-schedule');
    if (!list) return;

    var today = todayLocal();
    var html = '';

    ALIGNERS.forEach(function (a) {
      var state = today >= a.end ? 'past' : (today >= a.start && today < a.end ? 'current' : 'upcoming');
      html +=
        '<li class="inv-step ' + state + '" data-aligner="' + a.n + '">' +
          '<div class="inv-step-num">' + a.n + '</div>' +
          '<div class="inv-step-body">' +
            '<div class="inv-step-title">Aligner #' + a.n + '</div>' +
            '<div class="inv-step-dates">' + formatShort(a.start) + ' → ' + formatShort(a.end) + '</div>' +
          '</div>' +
          '<div class="inv-step-days">' + a.days + ' days</div>' +
        '</li>';
    });

    list.innerHTML = html;

    var currentEl = list.querySelector('.inv-step.current');
    if (currentEl) {
      currentEl.scrollIntoView({ block: 'center', behavior: 'instant' in window ? 'instant' : 'auto' });
    }
  }

  function photoStorageKey(key) {
    return 'invisalign-photo-' + key;
  }

  function showPhoto(card, frame, src, label) {
    var img = document.createElement('img');
    img.alt = label;
    img.src = src;
    frame.innerHTML = '';
    frame.appendChild(img);
    card.classList.add('is-filled');
  }

  function compressImage(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1400;
        var w = img.width;
        var h = img.height;
        if (w > max || h > max) {
          if (w > h) {
            h = Math.round(h * (max / w));
            w = max;
          } else {
            w = Math.round(w * (max / h));
            h = max;
          }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        done(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { done(reader.result); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function bindPhotoUpload(card, frame, key, label) {
    var input = card.querySelector('.inv-photo-upload');
    if (!input) return;

    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      compressImage(file, function (dataUrl) {
        try {
          localStorage.setItem(photoStorageKey(key), dataUrl);
        } catch (e) {
          window.alert('Photo is too large for this browser. Try a smaller image.');
          return;
        }
        showPhoto(card, frame, dataUrl, label);
      });
      input.value = '';
    });
  }

  function initPhotos() {
    var exts = ['.jpg', '.jpeg', '.png', '.webp'];
    document.querySelectorAll('[data-inv-photo]').forEach(function (card) {
      var base = card.getAttribute('data-inv-photo');
      var key = card.getAttribute('data-photo-key');
      var frame = card.querySelector('.inv-photo-frame');
      if (!base || !frame) return;

      var label = card.getAttribute('data-label') || 'Photo';
      bindPhotoUpload(card, frame, key, label);

      if (key) {
        var saved = localStorage.getItem(photoStorageKey(key));
        if (saved) {
          showPhoto(card, frame, saved, label);
          return;
        }
      }

      var stem = base.replace(/\.(jpe?g|png|webp)$/i, '');
      var i = 0;

      function tryNext() {
        if (i >= exts.length) return;
        var img = new Image();
        img.alt = label;
        img.onload = function () {
          showPhoto(card, frame, img.src, label);
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

  function init() {
    fillStatus();
    renderSchedule();
    initPhotos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
