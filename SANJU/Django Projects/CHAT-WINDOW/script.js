

document.addEventListener('DOMContentLoaded', function() {
    const permissionModal = new bootstrap.Modal(document.getElementById('permissionModal'));
    const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    let notificationsEnabled = true;
    let welcomeMessageEnabled = true;
    let notificationInterval;
    let welcomeInterval;
    let billNumberEntered = false;

    // Show permission modal on load
    permissionModal.show();

    // Grant permission
    document.getElementById('grant-permission').addEventListener('click', function() {
        permissionModal.hide();
        requestPermissions();
    });

    // Deny permission
    document.getElementById('deny-permission').addEventListener('click', function() {
        permissionModal.hide();
        alert('As the Permissions are Denied, the Service is non usage. Please share the Information on How this Permission can be done manually');
    });

    function requestPermissions() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                playWelcomeMessage();
                startWelcomeInterval();
            }
        });
    }

    function playWelcomeMessage() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            const welcomeMessage = new SpeechSynthesisUtterance('Hi, Welcome, Good Day. Could you please enter the Bill Number and Send so that I can Search the Order Status');
            speechSynthesis.speak(welcomeMessage);
        }
    }

    function startWelcomeInterval() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            welcomeInterval = setInterval(() => {
                playWelcomeMessage();
            }, 60000);
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

    function startNotificationInterval() {
        if (notificationsEnabled) {
            notificationInterval = setInterval(() => {
                playOrderReadySound();
            }, 60000);
        }
    }

    function stopNotificationInterval() {
        clearInterval(notificationInterval);
    }

    document.getElementById('ok-welcome').addEventListener('click', function() {
        welcomeModal.hide();
        if (welcomeMessageEnabled && !billNumberEntered) {
            startWelcomeInterval();
        }
    });

    document.getElementById('disable-welcome').addEventListener('click', function() {
        welcomeModal.hide();
        welcomeMessageEnabled = false;
        stopWelcomeInterval();
    });

    document.getElementById('ok-notification').addEventListener('click', function() {
        notificationModal.hide();
        if (notificationsEnabled) {
            startNotificationInterval();
        }
    });

    document.getElementById('disable-notifications').addEventListener('click', function() {
        notificationModal.hide();
        notificationsEnabled = false;
        stopNotificationInterval();
    });
   
    sendButton.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (message !== '') {
            appendMessage(message, 'user');
            chatInput.value = '';

            // Simulate API response
            mockAPICall(message);
        }
    });

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-bubble', sender);
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);

        // Auto-scroll to the latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function mockAPICall(billNumber) {
        setTimeout(() => {
            appendMessage('Processing...', 'server');

            setTimeout(() => {
                appendMessage(`Order Status: Ready for Bill #${billNumber}`, 'server');
            }, 2000);
        }, 1000);
    }
});