// The three bakery previews on the landing. Each runs its own i18next instance
// with the translation files the agent "wrote". No build step.
(function () {
  var resources = {
    en: { common: {
      tagline: 'Sourdough and pastries, baked every morning.',
      hours: 'Open Tuesday to Saturday, 7:00 to 13:00',
      loaves_one: '{{count}} rye loaf for tomorrow',
      loaves_other: '{{count}} rye loaves for tomorrow',
      order: 'Order',
      less: 'One less', more: 'One more'
    } },
    de: { common: {
      tagline: 'Sauerteigbrot und Gebäck, jeden Morgen frisch gebacken.',
      hours: 'Dienstag bis Samstag, 7:00 bis 13:00 geöffnet',
      loaves_one: 'Ein Roggenbrot für morgen',
      loaves_other: '{{count}} Roggenbrote für morgen',
      order: 'Bestellen',
      less: 'Eins weniger', more: 'Eins mehr'
    } },
    fr: { common: {
      tagline: 'Pain au levain et viennoiseries, cuits chaque matin.',
      hours: 'Ouvert du mardi au samedi, de 7 h à 13 h',
      loaves_one: '{{count}} pain de seigle pour demain',
      loaves_other: '{{count}} pains de seigle pour demain',
      order: 'Commander',
      less: 'Un de moins', more: 'Un de plus'
    } }
  };
  var LNGS = ['en', 'de', 'fr'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function setup(frame) {
    var mini = frame.querySelector('.mini');
    var count = 1;
    // The English original, before i18next: one address, no language switcher, the plural written into the code
    var original = frame.classList.contains('source');
    var inst = window.i18next.createInstance();
    inst.init({ lng: frame.getAttribute('data-lng'), fallbackLng: 'en', ns: ['common'], defaultNS: 'common',
      resources: resources, returnObjects: true, interpolation: { escapeValue: true } }, render);

    function render() {
      var t = inst.t.bind(inst), lng = inst.language;
      var addr = frame.querySelector('[data-addr]');
      if (addr) addr.textContent = lng;
      mini.setAttribute('lang', lng);
      mini.innerHTML =
        '<div class="m-top"><span class="m-brand">Kornfeld</span>' +
        (original ? '' : '<span class="m-lng" role="group" aria-label="Language">' + LNGS.map(function (l) {
          return '<button data-l="' + l + '"' + (l === lng ? ' aria-pressed="true"' : '') + '>' + l.toUpperCase() + '</button>';
        }).join('') + '</span>') + '</div>' +
        '<div class="m-body"><p class="m-tag">' + esc(t('tagline')) + '</p>' +
        '<p class="m-hours">' + esc(t('hours')) + '</p>' +
        '<div class="m-stock"><button data-d="-1" aria-label="' + esc(t('less')) + '">−</button>' +
        '<span aria-live="polite">' + (original ? count + ' rye loaf(s) for tomorrow' : t('loaves', { count: count })) + '</span>' +
        '<button data-d="1" aria-label="' + esc(t('more')) + '">+</button></div>' +
        '<span class="m-cta">' + esc(t('order')) + '</span></div>';
    }

    mini.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.l) { inst.changeLanguage(b.dataset.l, render); return; }
      count = Math.max(0, Math.min(12, count + Number(b.dataset.d)));
      render();
    });
  }

  function start() {
    if (!window.i18next) return; // offline: the frames stay empty, the note explains them
    document.querySelectorAll('[data-story="site"] .result .frame').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
