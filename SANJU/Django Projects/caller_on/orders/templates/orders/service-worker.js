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
  

self.addEventListener("push", (event) => {
    console.log("Push Event Received", event);
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || "Notification";
    const options = {
        body: data.body || "You have a new update!",
        icon: "/static/orders/images/notification-icon.png", // Optional icon
        badge: "/static/orders/images/badge-icon.png", // Optional badge
        vibrate: [200, 100, 200], // Vibration pattern
        data: { url: data.url || "/" } // URL to open when clicked
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // Opens the URL when clicked
    );
});
