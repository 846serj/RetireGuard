self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (error) { data = { title: "Retirement Watch", body: event.data?.text() }; }
  const title = data.title || "Retirement Watch alert";
  const options = {
    body: data.body || "Open RetireShield to review an alert matched to you.",
    tag: data.tag || "retirement-watch",
    data: { url: data.url || "/dashboard/monitoring" },
    badge: "/favicon.ico",
    icon: "/favicon.ico",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/monitoring";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(url) && "focus" in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
