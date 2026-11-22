// Two stories in the same form: "An existing website" (the bakery, default) and "An app I already have".
// Also the app preview: an invoice screen, live with i18next. No build step.
(function () {
  // The switch above the first sentence shows one story at a time, in both parts of the conversation
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-story-tab]');
    if (!tab) return;
    var story = tab.getAttribute('data-story-tab');
    document.querySelectorAll('[data-story-tab]').forEach(function (b) { b.setAttribute('aria-selected', b === tab); });
    document.querySelectorAll('[data-story]').forEach(function (el) { el.hidden = el.getAttribute('data-story') !== story; });
  });

  var resources = {
    en: { translation: {
      nav: ['Invoices', 'Customers', 'Reports', 'Settings'],
      title: 'Invoices', newInvoice: 'New invoice',
      overdue_one: '{{count}} invoice is overdue',
      overdue_other: '{{count}} invoices are overdue',
      selected_one: '{{count}} invoice selected',
      selected_other: '{{count}} invoices selected',
      remind: 'Send reminder', select: 'Select',
      cols: { customer: 'Customer', due: 'Due', amount: 'Amount', status: 'Status' },
      status: { paid: 'Paid', late: 'Overdue' },
      amount: '{{val, currency(EUR)}}',
      due: '{{val, datetime}}'
    } },
    de: { translation: {
      nav: ['Rechnungen', 'Kunden', 'Auswertungen', 'Einstellungen'],
      title: 'Rechnungen', newInvoice: 'Neue Rechnung',
      overdue_one: '{{count}} Rechnung ist überfällig',
      overdue_other: '{{count}} Rechnungen sind überfällig',
      selected_one: '{{count}} Rechnung ausgewählt',
      selected_other: '{{count}} Rechnungen ausgewählt',
      remind: 'Erinnerung senden', select: 'Auswählen',
      cols: { customer: 'Kunde', due: 'Fällig', amount: 'Betrag', status: 'Status' },
      status: { paid: 'Bezahlt', late: 'Überfällig' },
      amount: '{{val, currency(EUR)}}',
      due: '{{val, datetime}}'
    } }
  };
  var ROWS = [
    { c: 'Kornfeld Bakery', d: new Date(2026, 10, 3), a: 1240, s: 'late' },
    { c: 'Studio Marent', d: new Date(2026, 10, 12), a: 386.5, s: 'paid' },
    { c: 'Alpwerk AG', d: new Date(2026, 9, 21), a: 12800, s: 'late' }
  ];
  var LNGS = ['en', 'de'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function setup(frame) {
    var mini = frame.querySelector('.mini');
    mini.classList.add('app-ui');
    // the overdue invoices are selected at the start, ready for a reminder
    var picked = ROWS.map(function (r) { return r.s === 'late'; });
    // The English original, before i18next: no language switcher, the plurals written into the code
    var original = frame.classList.contains('source');
    var inst = window.i18next.createInstance();
    inst.init({ lng: frame.getAttribute('data-lng'), fallbackLng: 'en', resources: resources, returnObjects: true }, render);

    function render() {
      var t = inst.t.bind(inst), lng = inst.language;
      var count = picked.filter(Boolean).length;
      var late = ROWS.filter(function (r) { return r.s === 'late'; }).length;
      var addr = frame.querySelector('[data-addr]');
      if (addr) addr.textContent = lng;
      mini.setAttribute('lang', lng);
      var nav = t('nav');
      mini.innerHTML =
        '<div class="a-side"><span class="a-logo">Ledgerly</span>' + nav.map(function (n, i) {
          return '<span' + (i === 0 ? ' class="on"' : '') + '>' + esc(n) + '</span>';
        }).join('') + '</div>' +
        '<div class="a-main"><div class="a-top"><h4>' + esc(t('title')) + '</h4>' +
        (original ? '' : '<span class="a-lng" role="group" aria-label="Language">' + LNGS.map(function (l) {
          return '<button data-l="' + l + '"' + (l === lng ? ' aria-pressed="true"' : '') + '>' + l.toUpperCase() + '</button>';
        }).join('') + '</span>') + '<span class="a-new">+ ' + esc(t('newInvoice')) + '</span></div>' +
        '<div class="a-alert">' + (original ? late + ' invoice(s) overdue' : esc(t('overdue', { count: late }))) + '</div>' +
        '<div class="a-bar"><span aria-live="polite">' + (original ? count + ' invoice(s) selected' : esc(t('selected', { count: count }))) + '</span>' +
        '<span class="a-btn">' + esc(t('remind')) + '</span></div>' +
        '<table class="a-table"><thead><tr><th>' + esc(t('cols.customer')) + '</th><th class="opt">' + esc(t('cols.due')) + '</th>' +
        '<th class="num">' + esc(t('cols.amount')) + '</th><th>' + esc(t('cols.status')) + '</th></tr></thead><tbody>' +
        ROWS.map(function (r, i) {
          return '<tr><td><label class="a-pick"><input type="checkbox" data-row="' + i + '"' + (picked[i] ? ' checked' : '') +
            ' aria-label="' + esc(t('select')) + ' ' + esc(r.c) + '">' + esc(r.c) + '</label></td><td class="opt">' +
            esc(t('due', { val: r.d, formatParams: { val: { day: 'numeric', month: 'short', year: 'numeric' } } })) + '</td>' +
            '<td class="num">' + esc(t('amount', { val: r.a })) + '</td>' +
            '<td><span class="a-pill ' + r.s + '">' + esc(t('status.' + r.s)) + '</span></td></tr>';
        }).join('') + '</tbody></table></div>';
    }

    mini.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-l]');
      if (b) inst.changeLanguage(b.dataset.l, render);
    });
    mini.addEventListener('change', function (e) {
      var box = e.target.closest('[data-row]');
      if (!box) return;
      picked[Number(box.dataset.row)] = box.checked;
      render();
      var again = mini.querySelector('[data-row="' + box.dataset.row + '"]');
      if (again) again.focus();
    });
  }

  function start() {
    if (!window.i18next) return;
    document.querySelectorAll('[data-story="app"] .result .frame').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
