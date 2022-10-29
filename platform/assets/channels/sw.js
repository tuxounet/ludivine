const cache_version = "v1"
const cache_files = [
  "/",
  "/index.css",
  "/index.js",
  "/static/favicon.ico",
  "/static/android-chrome-192x192.png",
  "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cache_version).then((cache) => {
      return cache.addAll(cache_files).then(() => self.skipWaiting());
    })
  );
});
self.addEventListener("message", function (event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
self.addEventListener("push", (event) => {
  if (!(self.Notification && self.Notification.permission === "granted")) {
    return;
  }
  const dataJSON = event.data?.json() ?? {};
  
  const img = "/_static/favicon-32x32.png";
  const text = dataJSON.body;
  const title = `Ludivine (${dataJSON.type})`
  const options = {
    body: text,
    icon: img,
    vibrate: [200, 100, 200],
    tag: "welcome",
    data: dataJSON,
    actions: [{ action: "open", title: "Ouvrir" }],
  };
  return self.registration.showNotification(title, options);
});
addEventListener("notificationclick", (event) => {
  console.info("event", event.action);
  event.notification.close();
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    client.openWindow(
      event.notification.data.url ? event.notification.data.url : "/"
    )
  );
});
 