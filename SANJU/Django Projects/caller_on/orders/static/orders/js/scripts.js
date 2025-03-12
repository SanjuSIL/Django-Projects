document.addEventListener('DOMContentLoaded', function() {
    const permissionModal = new bootstrap.Modal(document.getElementById('permissionModal'));
    const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const menuButton = document.getElementById('menu-button');

    let notificationsEnabled = true;
    let welcomeMessageEnabled = true;
    let audioUnlocked = false;

    // 1. Register the Service Worker at the root scope
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js", { scope: '/' })
        .then((registration) => {
            console.log("Service Worker Registered:", registration);
        })
        .catch((error) => {
            console.error("Service Worker Registration Failed:", error);
        });
    }

    // 2. If there's no controller, optionally reload once to let the SW take control
    if (!navigator.serviceWorker.controller) {
        console.log("No active service worker controller. Reloading...");
        // You can uncomment this if you want an automatic reload:
        // window.location.reload();
    }

    // Helper to convert your public key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Function to get or generate a unique browser ID stored in localStorage
    function getBrowserId() {
        let browserId = localStorage.getItem('browser_id');
        if (!browserId) {
            browserId = crypto.randomUUID();
            localStorage.setItem('browser_id', browserId);
        }
        return browserId;
    }

    // Subscribe to push notifications (called after user enters a token)
    async function subscribeToPushNotifications(token) {
        try {
            console.log("First call with token:", token);
            if (!token) {
                console.error("Token not provided. Cannot subscribe.");
                return;
            }
            
            if (Notification.permission !== "granted") {
                console.error("Notification permission is not granted.");
                return;
            }
            
            // Wait for the service worker registration.
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.error("No service worker found. Registering...");
                registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
            }
            console.log("Service Worker ready:", registration);
            console.log(navigator.serviceWorker.ready)

            // Check if the page is controlled by the service worker.
            if (!navigator.serviceWorker.controller) {
                console.warn("No active service worker controller. The page may need a reload.");
                // Optionally reload to let SW take control:
                window.location.reload();
            }
            console.log(navigator.serviceWorker.controller)

            // Try to retrieve an existing push subscription.
            let subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                console.log("Existing subscription found:", subscription);
                // Unsubscribe the existing subscription if you suspect corruption
                try {
                    await subscription.unsubscribe();
                    console.log("Unsubscribed from existing subscription.");
                    subscription = null;
                } catch (unsubError) {
                    console.error("Error unsubscribing:", unsubError);
                }
            }

            // Create a new push subscription
            if (!subscription) {
                const vapidKey = "BAv_HFvgMBKxx3Jnse3fLMjzUEn3n3zS76GwEGQ_oOPR_40U1e7O4AiezuOReRTK4ULx2EaGC9kGAz-lzV791Tw".trim();
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey)
                });
                console.log("New subscription created:", subscription);
                console.log("Subscription JSON string:", JSON.stringify(subscription));

            }
            
            // Save subscription to server if changed.
            const newSubscriptionJSON = JSON.stringify(subscription);
            const storedSubscription = localStorage.getItem("pushSubscription");
            if (storedSubscription !== newSubscriptionJSON) {
                // Convert the subscription to JSON to ensure we have plain objects.
                const sub = subscription.toJSON();

                const payload = {
                    endpoint: sub.endpoint,       // e.g., "https://fcm.googleapis.com/fcm/send/..."
                    keys: sub.keys,               // Contains "p256dh" and "auth"
                    browser_id: getBrowserId(),   // Your generated browser ID
                    token_number: token           // The token provided by the user
                };
                                
                const response = await fetch('/vendors/api/save-subscription/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    localStorage.setItem("pushSubscription", newSubscriptionJSON);
                    console.log("Push subscription updated successfully.");
                } else {
                    console.error("Failed to update push subscription on the server.");
                }
            } else {
                console.log("Subscription unchanged. No need to update.");
            }
        } catch (error) {
            console.error("Error in subscribeToPushNotifications:", error);
        }
    }

    console.log("Notification API supported:", "Notification" in window);

    // Adjust viewport for mobile devices
    function setVh() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', setVh);
    setVh();

    // Show permission modal
    permissionModal.show();

    // Menu button logic
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            let menuImageModal = new bootstrap.Modal(document.getElementById('menuImageModal'));
            menuImageModal.show();
        });
    }

    // Grant permission button
    document.getElementById('grant-permission').addEventListener('click', ()=> {
        Notification.requestPermission().then(permission => {
            console.log("permission:",permission);
            if (permission === "granted") {
                console.log("Notifications allowed!");
            } else {
                console.log("Notifications denied!");
            }
        });
        permissionModal.hide();
        requestPermissions();
    });

    // Deny permission button
    document.getElementById('deny-permission').addEventListener('click', function() {
        permissionModal.hide();
        alert('Permissions denied. Service may not function properly.');
    });

    // Additional function to request other permissions or do setup
    function requestPermissions() {
        playWelcomeMessage();
    }

    // Welcome message
    function playWelcomeMessage() {
        const welcomeMessage = new SpeechSynthesisUtterance('Hi, Welcome, Good Day. Please enter the Bill Number and send to track your order.');
        speechSynthesis.speak(welcomeMessage);
    }

    // Buttons for welcome modal
    document.getElementById('ok-welcome').addEventListener('click', function() {
        welcomeModal.hide();
    });
    document.getElementById('disable-welcome').addEventListener('click', function() {
        welcomeModal.hide();
        welcomeMessageEnabled = false;
    });

    // Buttons for notification modal
    document.getElementById('ok-notification').addEventListener('click', function() {
        notificationModal.hide();
    });
    document.getElementById('disable-notifications').addEventListener('click', function() {
        notificationModal.hide();
        notificationsEnabled = false;
    });

    // Audio setup
    const notificationAudio = new Audio('/static/orders/audio/0112.mp3');
    notificationAudio.load();
    
    function unlockAudio() {
        notificationAudio.play().then(() => {
            audioUnlocked = true;
            console.log('Audio unlocked!');
        }).catch(err => console.error('Audio unlock failed:', err));
        document.removeEventListener('click', unlockAudio);
    }

    function playNotificationSound() {
        if (notificationsEnabled) {
            if (audioUnlocked) {
                notificationAudio.play().catch(err => console.error('Error playing notification sound:', err));
            } else {
                console.log('Audio not unlocked. Please tap anywhere to enable audio.');
            }
        }
    }

    // Chat messaging
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-bubble', sender);
        messageDiv.innerHTML = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Send button logic
    sendButton.addEventListener('click', function () {
        const message = chatInput.value.trim();
        if (message !== '') {
            appendMessage(message, 'user');
            chatInput.value = '';
            unlockAudio();

            // 3. Instead of polling, we rely on push. 
            // If you still want to do an initial check:
            fetchOrderStatusOnce(message);
        }
    });

    // Single check to confirm the order status, no polling
    function fetchOrderStatusOnce(token) {
        fetch(`/check-status/?token_no=${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const messageHTML = `
                    <strong>Order Status:</strong> ${data.status || "Unknown"}<br>
                    <strong>Counter No:</strong> ${data.counter_no || "N/A"}<br>
                    <strong>Token No:</strong> ${token}
                `;
                appendMessage(messageHTML, 'server');

                // If status is ready, notify user
                if (data.status === "ready") {
                    playNotificationSound();
                    const orderReadyMessage = new SpeechSynthesisUtterance('Your Order is Ready');
                    speechSynthesis.speak(orderReadyMessage);
                    notificationModal.show();
                    if (navigator.vibrate) {
                        navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
                    }
                }

                // Finally, subscribe for push notifications with the token
                subscribeToPushNotifications(token);
            })
            .catch(error => {
                console.error("Error fetching order status:", error);
                appendMessage("Error fetching order status. Please try again.", 'server');
            });
    }

    // Unlock audio on first click
    document.addEventListener('click', unlockAudio);
});
