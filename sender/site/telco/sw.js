/* Demo Telco — only here so the site can show notifications through the browser; clicking one opens My account. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) if (cs[i].url.indexOf('/telco/') !== -1) return cs[i].focus();
    return self.clients.openWindow('/telco/account/');
  }));
});
