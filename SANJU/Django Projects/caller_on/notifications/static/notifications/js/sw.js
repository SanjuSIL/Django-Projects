self.addEventListener("push", function(event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: "/static/notifications/img/icon.png",  // Provide your icon path
        badge: "/static/notifications/img/badge.png", // Provide your badge path
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
