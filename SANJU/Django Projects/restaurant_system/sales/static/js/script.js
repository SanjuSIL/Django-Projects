document.addEventListener('DOMContentLoaded', () => {
    // Event listener for create order form
    document.getElementById('create-order-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const tokenNumber = document.getElementById('token-number').value;

        fetch('/sales/api/create_order/', { // Updated API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 
                token_no: tokenNumber,
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.message) {
                if (data.message.includes('created')) {
                    document.getElementById('create-order-form').reset();
                    fetchReadyOrders(); // Refresh the order list
                }
            } else {
                alert("Unexpected response from server.");
                console.error("API response:", data);
            }
        })
        .catch(error => console.error('Error:', error));
    });
    // Fetch ready orders
    fetchReadyOrders();
});

// Function to get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function handleOrderButtonClick(tokenNumber, orderStatus) {
    const restaurantId = 1;

    let statusToSend = "ready"; // Default to preparing

    if (orderStatus === "ready") {
        statusToSend = "delete"; // If order is ready, send "delete"
    }

    fetch('/sales/api/create_or_update_order/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            token_no: tokenNumber,
            restaurant_id: restaurantId,
            status: statusToSend
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.message) {
            
            fetchReadyOrders(); // Refresh after update or delete
        } else {
            alert("Error updating order status.");
            console.error("API response:", data);
        }
    })
    .catch(error => console.error('Error:', error));
    fetchReadyOrders();
}

function fetchReadyOrders() {
    console.log("Fetching ready orders...");
    fetch('/sales/api/order_list/')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Ready orders data:", data);
            const container = document.getElementById('ready-orders-container');
            container.innerHTML = '';

            data.sort((a, b) => {
                if (a.status === 'ready' && b.status !== 'ready') return -1; // Corrected to 'ready'
                if (a.status !== 'ready' && b.status === 'ready') return 1; // Corrected to 'ready'
                return new Date(a.updated_at) - new Date(b.updated_at);
            });

            data.forEach(order => {
                const orderButton = document.createElement('button');
                orderButton.classList.add('ready-order-block');

                const contentDiv = document.createElement('div');
                contentDiv.classList.add('order-content');

                const tokenSpan = document.createElement('span');
                tokenSpan.classList.add('token-number');
                tokenSpan.textContent = order.token_no;

                const statusSpan = document.createElement('span');
                statusSpan.classList.add('order-status');
                statusSpan.textContent = order.status;

                contentDiv.appendChild(tokenSpan);
                contentDiv.appendChild(statusSpan);

                orderButton.appendChild(contentDiv);

                if (order.status === 'ready') { // Corrected to 'ready'
                    orderButton.style.backgroundColor = 'lightgreen';
                }
                orderButton.addEventListener('click', () => {
                    handleOrderButtonClick(order.token_no, order.status);
                });
                container.appendChild(orderButton);
            });
        })
        .catch(error => {
            console.error("Error fetching ready orders:", error);
        });
}

function updateButtonUI(tokenNumber) {
    const buttons = document.querySelectorAll('.ready-order-block');
    buttons.forEach(button => {
        if (button.textContent === tokenNumber.toString()) {
            button.style.backgroundColor = 'lightgreen'; // Change color to green
        }
    });
}

