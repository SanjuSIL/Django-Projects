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
  

  {% comment %} self.addEventListener('push', (event) => {
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
}); {% endcomment %}

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);

  let data = {};
  if (event.data) {
      try {
          data = event.data.json();
          console.log('Push data:', data);
      } catch (error) {
          console.error('Error parsing push data:', error);
      }
  } else {
      data = { title: "Order Update", body: "Your order is ready!" };
  }

  const title = data.title || "Order Update";
  const options = {
      body: data.body || "Your order is ready!",
      icon: "/static/orders/images/logo.png",
      // Attach full payload data so that clients can use it.
      data: data
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
      .then(() => {
          // Broadcast the push message to all client pages.
          return self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
          .then(clients => {
              clients.forEach(client => {
                  client.postMessage({
                      type: 'PUSH_STATUS_UPDATE',
                      payload: data
                  });
              });
          });
      })
  );
});

  
  

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // Opens the URL when clicked
    );
});
