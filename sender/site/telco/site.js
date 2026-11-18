/* Demo Telco site — shared: reads what the sender published (/api/site) and shows a web push as a browser
   notification while the site is open. Every value is written as text, never as markup. */
(function () {
  var started = Date.now(), lastAt = 0, listeners = [];
  var T = window.Telco = {
    state: {},
    onState: function (fn) { listeners.push(fn); if (T.state.at) fn(T.state, false); },
    canNotify: function () { return 'Notification' in window && Notification.permission === 'granted'; },
    askNotify: function () { if (!('Notification' in window)) return Promise.resolve('unsupported'); return Notification.requestPermission(); },
    toast: function (title, text) {
      var el = document.getElementById('toast'); if (!el) return;
      el.querySelector('b').textContent = title; el.querySelector('span').textContent = text;
      el.classList.add('in'); clearTimeout(T._t); T._t = setTimeout(function () { el.classList.remove('in'); }, 9000);
    },
    notify: function (title, text) {
      T.toast(title, text); /* always visible on the page, so the demo works without the permission too */
      if (!T.canNotify()) return;
      var opt = { body: text, icon: '/telco/icon.svg', tag: 'demo-telco' };
      if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function (reg) { return reg.showNotification(title, opt); }).catch(function () { try { new Notification(title, opt); } catch (e) {} });
      else try { new Notification(title, opt); } catch (e) {}
    }
  };
  function poll() {
    fetch('/api/site', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (s) {
      if (!s || !s.at || s.at === lastAt) return;
      var fresh = lastAt !== 0 || s.at > started - 15000; /* arrived while the site is open, or just before */
      lastAt = s.at; T.state = s;
      listeners.forEach(function (fn) { fn(s, fresh); });
      if (fresh && s.webpush && s.webpush.title) T.notify(s.webpush.title, s.webpush.text || '');
    }).catch(function () {});
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/telco/sw.js', { scope: '/telco/' }).catch(function () {});
  poll(); setInterval(poll, 4000);
})();
