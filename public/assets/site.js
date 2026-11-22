// Theme toggle, copy buttons, tabs. No build step.
(function () {
  var root = document.documentElement;
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}

  // Docs sidebar: open on wide screens, folded on phones
  document.addEventListener('DOMContentLoaded', function () {
    var d = document.querySelector('.sidebar details');
    if (d && matchMedia('(max-width: 860px)').matches) d.open = false;
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-theme-toggle]');
    if (t) {
      var dark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e2) {}
      return;
    }
    var c = e.target.closest('[data-copy]');
    if (c) {
      var box = c.closest('.prompt, .code');
      var text = box.querySelector('pre').innerText.trim();
      var done = function () {
        var old = c.textContent; c.textContent = 'Copied'; c.classList.add('done');
        setTimeout(function () { c.textContent = old; c.classList.remove('done'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
      return;
    }
    var tab = e.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  function selectTab(tab) {
    tab.parentElement.querySelectorAll('[role="tab"]').forEach(function (b) {
      var on = b === tab;
      b.setAttribute('aria-selected', on);
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
  }

  // A language switch starts on the first of the browser's languages it offers
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lng-pick]').forEach(function (list) {
      var langs = navigator.languages || [navigator.language];
      for (var i = 0; i < langs.length; i++) {
        var tab = list.querySelector('[data-lng="' + String(langs[i]).slice(0, 2).toLowerCase() + '"]');
        if (tab) { selectTab(tab); return; }
      }
    });
  });
})();
