self.addEventListener("install", (event) => {
    console.log("Service Worker Installed");
    // Force the waiting service worker to become active
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker Activated");
    // Take control of all clients immediately
    event.waitUntil(clients.claim());
  });
  

  self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received:', event);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
            console.log('Received Push Data:', data);
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    } else {
        console.warn('No data received, using defaults.');
        data = { title: "Default Title", body: "Default body" };
    }

    const title = data.title || "Order Update";
    const options = {
        body: data.body || "Your order is ready!",
        icon: "/static/orders/images/logo.png"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

  {% comment %} self.addEventListener('push', (event) => {
    console.log("Push event:", event);
    const message = event.data ? event.data.text() : "No payload";
    event.waitUntil(
      self.registration.showNotification("Test Notification", { body: message })
    );
  }); {% endcomment %}
  
  

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // Opens the URL when clicked
    );
});
