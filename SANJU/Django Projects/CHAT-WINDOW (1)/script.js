document.addEventListener('DOMContentLoaded', function() {
    const permissionPopup = document.getElementById('permission-popup');
    const grantPermissionButton = document.getElementById('grant-permission');
    const denyPermissionButton = document.getElementById('deny-permission');
    const notificationPopup = document.getElementById('notification-popup');
    const welcomePopup = document.getElementById('welcome-popup');
    const okNotificationButton = document.getElementById('ok-notification');
    const disableNotificationsButton = document.getElementById('disable-notifications');
    const okWelcomeButton = document.getElementById('ok-welcome');
    const disableWelcomeButton = document.getElementById('disable-welcome');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatResponse = document.querySelector('.chat-response');

    let notificationsEnabled = true; // Track if notifications are enabled
    let welcomeMessageEnabled = true; // Track if welcome message is enabled
    let notificationInterval; // Store the interval for repeating notifications
    let welcomeInterval; // Store the interval for repeating welcome message
    let billNumberEntered = false; // Track if bill number is entered

    // Show permission popup on load
    permissionPopup.style.display = 'block';

    // Grant permission
    grantPermissionButton.addEventListener('click', function() {
        permissionPopup.style.display = 'none';
        requestPermissions();
    });

    // Deny permission
    denyPermissionButton.addEventListener('click', function() {
        permissionPopup.style.display = 'none';
        alert('As the Permissions are Denied, the Service is non usage. Please share the Information on How this Permission can be done manually');
    });

    // Request permissions
    function requestPermissions() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                playWelcomeMessage();
                startWelcomeInterval(); // Start repeating welcome message
            }
        });
    }

    // Play welcome message
    function playWelcomeMessage() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            const welcomeMessage = new SpeechSynthesisUtterance('Hi, Welcome, Good Day. Could you please enter the Bill Number and Send so that I can Search the Order Status');
            speechSynthesis.speak(welcomeMessage);
        }
    }

    // Start repeating welcome message every 1 minute
    function startWelcomeInterval() {
        if (welcomeMessageEnabled && !billNumberEntered) {
            welcomeInterval = setInterval(() => {
                playWelcomeMessage();
            }, 60000); // 1 minute interval
        }
    }

    // Stop repeating welcome message
    function stopWelcomeInterval() {
        clearInterval(welcomeInterval);
    }

    // Play order ready sound
    function playOrderReadySound() {
        if (notificationsEnabled) {
            const orderReadyMessage = new SpeechSynthesisUtterance('Your Order is Ready');
            speechSynthesis.speak(orderReadyMessage);
        }
    }

    // Start repeating order ready notification every 1 minute
    function startNotificationInterval() {
        if (notificationsEnabled) {
            notificationInterval = setInterval(() => {
                playOrderReadySound();
            }, 60000); // 1 minute interval
        }
    }

    // Stop repeating order ready notification
    function stopNotificationInterval() {
        clearInterval(notificationInterval);
    }

    // Handle welcome pop-up buttons
    okWelcomeButton.addEventListener('click', function() {
        welcomePopup.style.display = 'none';
        if (welcomeMessageEnabled && !billNumberEntered) {
            startWelcomeInterval(); // Restart welcome message if enabled
        }
    });

    disableWelcomeButton.addEventListener('click', function() {
        welcomePopup.style.display = 'none';
        welcomeMessageEnabled = false; // Disable welcome message
        stopWelcomeInterval(); // Stop repeating welcome message
    });

    // Handle notification pop-up buttons
    okNotificationButton.addEventListener('click', function() {
        notificationPopup.style.display = 'none';
        if (notificationsEnabled) {
            startNotificationInterval(); // Restart notifications if enabled
        }
    });

    disableNotificationsButton.addEventListener('click', function() {
        notificationPopup.style.display = 'none';
        notificationsEnabled = false; // Disable notifications
        stopNotificationInterval(); // Stop repeating notifications
    });

    // Send message
    sendButton.addEventListener('click', function() {
        const message = chatInput.value;
        if (message.trim() !== '') {
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble', 'customer'); // Right-aligned for customer
            messageBubble.textContent = message;
            chatResponse.appendChild(messageBubble);
            chatInput.value = '';

            // Track if bill number is entered
            billNumberEntered = true;
            stopWelcomeInterval(); // Stop repeating welcome message

            // Mock API call
            mockAPICall(message);
        }
    });

    // Mock API call
    function mockAPICall(billNumber) {
        setTimeout(() => {
            const responseBubble = document.createElement('div');
            responseBubble.classList.add('message-bubble', 'server'); // Left-aligned for server
            responseBubble.textContent = 'Processing...';
            chatResponse.appendChild(responseBubble);

            setTimeout(() => {
                responseBubble.textContent = 'Ready';
                playOrderReadySound();
                notificationPopup.style.display = 'block'; // Show notification pop-up
                startNotificationInterval(); // Start repeating order ready notification
            }, 2000);
        }, 1000);
    }
});