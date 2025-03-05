document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        if (Notification.permission === 'default' || Notification.permission === 'denied') {
            // Show the prompt
            const notificationPrompt = document.getElementById('notification-prompt');
            notificationPrompt.style.display = 'block';

            // Change button text and behavior for denied case
            const enableButton = document.getElementById('enable-notifications');
            if (Notification.permission === 'denied') {
                enableButton.textContent = "Change Notification Settings";
                enableButton.addEventListener('click', () => {
                    alert("Please go to your browser settings > Privacy and security > Site settings > Notifications and allow notifications for this site.");
                    notificationPrompt.style.display = 'none';
                });
            } else {
                enableButton.addEventListener('click', () => {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            console.log('Notification permission granted.');
                            // Store sound and vibration preferences
                            localStorage.setItem('enableSound', document.getElementById('enable-sound').checked);
                            localStorage.setItem('enableVibration', document.getElementById('enable-vibration').checked);
                        }
                        notificationPrompt.style.display = 'none'; // Hide prompt after request
                    });
                });
            }

            // Close button
            document.getElementById('close-notifications').addEventListener('click', () => {
                notificationPrompt.style.display = 'none';
            });

            // Set initial checkbox values based on localStorage
            document.getElementById('enable-sound').checked = localStorage.getItem('enableSound') !== 'false'; // Default to true if not set
            document.getElementById('enable-vibration').checked = localStorage.getItem('enableVibration') !== 'false'; // Default to true if not set

        } else if (Notification.permission === 'granted') {
            console.log('Notification permission already granted.');
            // Set initial checkbox values based on localStorage
            document.getElementById('enable-sound').checked = localStorage.getItem('enableSound') !== 'false'; // Default to true if not set
            document.getElementById('enable-vibration').checked = localStorage.getItem('enableVibration') !== 'false'; // Default to true if not set
        }
    } else {
        console.log('Notifications not supported.');
    }
});

// Example functions to use the stored preferences
function playNotificationSound() {
    if (localStorage.getItem('enableSound') === 'true' && 'Notification' in window && Notification.permission === 'granted') {
        const audio = new Audio('/static/orders/0112.mp3');
        audio.play();
    }
}

function vibrateDevice(duration) {
    if (localStorage.getItem('enableVibration') === 'true' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}


function checkOrderStatus() {
    let token = document.getElementById("token_no").value;
    let initialContent = document.getElementById("initial-content");
    let orderStatusContainer = document.getElementById("orderStatusContainer");

    if (!token) {
        alert("Please enter a valid token number!");
        return;
    }

    // Hide the initial search content
    initialContent.style.display = "none";
    // Show the order status container
    orderStatusContainer.style.display = "block";

    // Replace the IP with your actual server IP if needed
    fetch(`/check-status/?token_no=${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate the order details
            document.getElementById("order-status-title").innerText = "Order Status";
            document.getElementById("order-status-message").innerText = "";
            document.getElementById("order-id").innerText = data.token_no || "N/A";
            document.getElementById("order-restaurant").innerText = data.restaurant || "N/A";
            document.getElementById("order-current-status").innerText = data.status || "N/A";
            console.log(data)
            
            if (data.status === "Ready") {
                playBeep();
                // Vibrate the device (if supported)
                if (navigator.vibrate) { // Check if the Vibration API is supported
                    navigator.vibrate([500, 200, 500,200,500,200,500]); // Vibrate for 200ms, pause 100ms, vibrate for 200ms
                } else {
                    console.log("Vibration not supported on this device.");
                }
                // Stop polling if the status is "Ready"
                clearInterval(orderStatusInterval); // Clear the interval
                return; // Exit the function to prevent further checks
            }
            // Start polling if the status is NOT "Ready"
            if (!orderStatusInterval) { // Check if polling is not already running
                orderStatusInterval = setInterval(function () {
                    fetchOrderStatusUpdate(token); // Call function to check for updates
                }, 5000); // Check every 5 seconds (adjust as needed)
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("order-status-title").innerText = "Error";
            document.getElementById("order-status-message").innerText = "Something went wrong. Please try again later.";
            document.getElementById("order-id").innerText = "";
            document.getElementById("order-restaurant").innerText = "";
            document.getElementById("order-current-status").innerText = "";
        });
}

let orderStatusInterval; // Variable to store the interval ID

function fetchOrderStatusUpdate(token) {
    fetch(`/check-status/?token_no=${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Update the status on the page
            document.getElementById("order-current-status").innerText = data.status || "N/A";

            if (data.status === "Ready") {
                playBeep();
                // Vibrate the device (if supported)
                if (navigator.vibrate) { // Check if the Vibration API is supported
                    navigator.vibrate([500, 200, 500,200,500,200,500]); // Vibrate for 200ms, pause 100ms, vibrate for 200ms
                } else {
                    console.log("Vibration not supported on this device.");
                }
                clearInterval(orderStatusInterval); // Stop polling
            }

        })
        .catch(error => {
            console.error("Error fetching update:", error);
        });
}

function playBeep() {
    let beep = new Audio("/static/orders/0112.mp3");
    beep.play();
}
