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
    let notificationInterval;
    let welcomeInterval;
    let billNumberEntered = false;
    let orderStatusInterval;

    
   

    function setVh() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', setVh);
    setVh();
    
    permissionModal.show();

    if (menuButton){
        menuButton.addEventListener('click', function() {
        // var menuUrl = this.getAttribute('data-menu-url');
        // window.open(menuUrl, '_blank');
        let menuImageModal = new bootstrap.Modal(document.getElementById('menuImageModal'));
        menuImageModal.show();
    });
    }
    
    document.getElementById('grant-permission').addEventListener('click', function() {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notifications allowed!");
                registerServiceWorker();
            } else {
                console.log("Notifications denied!");
            }
        });
        permissionModal.hide();
        requestPermissions();
    });

    document.getElementById('deny-permission').addEventListener('click', function() {
        permissionModal.hide();
        alert('Permissions denied. Service may not function properly.');
    });

    function requestPermissions() {
        playWelcomeMessage();

    }

    function playWelcomeMessage() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            const welcomeMessage = new SpeechSynthesisUtterance('Hi, Welcome, Good Day. Please enter the Bill Number and send to track your order.');
            speechSynthesis.speak(welcomeMessage);
        }
    }

    function startWelcomeInterval() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            welcomeInterval = setInterval(playWelcomeMessage, 60000);
        }
    }

    function stopWelcomeInterval() {
        clearInterval(welcomeInterval);
    }

    function playOrderReadySound() {
        if (notificationsEnabled) {
            const orderReadyMessage = new SpeechSynthesisUtterance('Your Order is Ready');
            speechSynthesis.speak(orderReadyMessage);
        }
    }
    
    let audioUnlocked = false;
    
    // Create and preload the notification audio object
    const notificationAudio = new Audio('/static/orders/audio/0112.mp3');
    notificationAudio.load();
    

    // Function to unlock audio context with a user gesture
    function unlockAudio() {
      notificationAudio.play().then(() => {
        audioUnlocked = true;
        console.log('Audio unlocked!');
      }).catch(err => console.error('Audio unlock failed:', err));
      document.removeEventListener('click', unlockAudio);
    }

    // Function to play notification sound
    function playNotificationSound() {
      if (notificationsEnabled) {
        if (audioUnlocked) {
          notificationAudio.play().catch(err => console.error('Error playing notification sound:', err));
        } else {
          console.log('Audio not unlocked. Please tap anywhere to enable audio.');
        }
      }
    }
    


    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-bubble', sender);
        messageDiv.innerHTML = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    sendButton.addEventListener('click', function () {
        const message = chatInput.value.trim();
        if (message !== '') {
            appendMessage(message, 'user');
            chatInput.value = '';
            // Start polling for the order status
            fetchOrderStatusUpdate(message);
            checkOrderStatusWithPolling(message);
            unlockAudio();
        }
    });
    
    function checkOrderStatusWithPolling(token) {
        // Set up polling at 5-second intervals.
        orderStatusInterval = setInterval(() => {
            fetchOrderStatusUpdate(token);
        }, 5000);
    }
    
    // async function fetchOrderStatusUpdate(token) {
    //     try {
    //         const response = await fetch(`/check-status/?token_no=${token}`);
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         appendMessage(`Order Status: ${data.status || "Unknown"} for Bill #${token}.Counter no:${data.counter_no}`, 'server');
           
    //         if (data.status === "ready") {
    //             playNotificationSound();
    //             playOrderReadySound();
    //             notificationModal.show();
    //             if (navigator.vibrate) {
    //                 navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
    //             }
    //             clearInterval(orderStatusInterval);
    //         }
    //         // No recursive call here. Polling continues until status is "ready".
    //     } catch (error) {
    //         console.error("Error fetching update:", error);
    //         appendMessage("Error fetching order status. Please try again.", 'server');
    //         clearInterval(orderStatusInterval);
    //     }
    // }
    
    function fetchOrderStatusUpdate(token) {
        fetch(`/check-status/?token_no=${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('API response:', data);

                const messageHTML = `
                <strong>Order Status:</strong> ${data.status || "Unknown"}<br>
                <strong>Counter No:</strong> ${data.counter_no || "N/A"}<br>
                <strong>Token No:</strong> ${token}
            `;
            appendMessage(messageHTML, 'server');
                // appendMessage(`Order Status: ${data.status || "Unknown"} for Bill #${token}.`, 'server');
                if (data.status === "ready") {
                    playNotificationSound();
                    playOrderReadySound();
                    notificationModal.show();
                    if (navigator.vibrate) {
                        navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
                    }
                    clearInterval(orderStatusInterval);
                }
                // No recursive call here. Polling continues until status is "ready".
            })
            .catch(error => {
                console.error("Error fetching update:", error);
                appendMessage("Error fetching order status. Please try again.", 'server');
                clearInterval(orderStatusInterval);
            });
    }
    

    document.getElementById('ok-welcome').addEventListener('click', function() {
        welcomeModal.hide();
        startWelcomeInterval();
    });

    document.getElementById('disable-welcome').addEventListener('click', function() {
        welcomeModal.hide();
        welcomeMessageEnabled = false;
        stopWelcomeInterval();
    });

    document.getElementById('ok-notification').addEventListener('click', function() {
        notificationModal.hide();
        startNotificationInterval();
    });

    document.getElementById('disable-notifications').addEventListener('click', function() {
        notificationModal.hide();
        notificationsEnabled = false;
        stopNotificationInterval();
    });

    function startNotificationInterval() {
        if (notificationsEnabled) {
            notificationInterval = setInterval(playOrderReadySound, 60000);
        }
    }

    function stopNotificationInterval() {
        clearInterval(notificationInterval);
    }
});


