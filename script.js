// Group Kitchen Cloud - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    startRealTimeUpdates();
    setupEventListeners();
});

// Application data
let appData = {
    orders: [
        {
            id: "ORD-001",
            customer: "Rahul Sharma",
            items: ["Butter Chicken", "Naan", "Rice"],
            total: 520,
            status: "preparing",
            station: "curry",
            timeRemaining: 8,
            priority: "normal",
            platform: "Swiggy",
            timestamp: Date.now() - 300000
        },
        {
            id: "ORD-002",
            customer: "Priya Patel",
            items: ["Margherita Pizza", "Garlic Bread"],
            total: 450,
            status: "ready",
            station: "pizza",
            timeRemaining: 0,
            priority: "ready",
            platform: "Zomato",
            timestamp: Date.now() - 600000
        },
        {
            id: "ORD-003",
            customer: "Amit Kumar",
            items: ["Classic Burger", "Fries", "Coke"],
            total: 420,
            status: "new",
            station: "grill",
            timeRemaining: 12,
            priority: "urgent",
            platform: "Direct",
            timestamp: Date.now() - 100000
        }
    ],
    dailyStats: {
        totalOrders: 72,
        revenue: 29200,
        activeOrders: 5,
        efficiency: 92
    }
};

// Initialize the application
function initializeApp() {
    console.log('Group Kitchen Cloud - Initializing...');
    showPage('dashboard');
    updateLiveOrders();
    showToast('Welcome to Group Kitchen Cloud!', 'success');
    initializeOrderTimers();
    console.log('Group Kitchen Cloud - Ready!');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation menu clicks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
            setActiveNavItem(this);
        });
    });
    
    // Station tabs in kitchen display
    const stationTabs = document.querySelectorAll('.station-tab');
    stationTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const station = this.getAttribute('data-station');
            filterOrdersByStation(station);
            setActiveStationTab(this);
        });
    });
    
    setupOrderButtons();
    setupButtonEffects();
}

// Show specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        if (pageId === 'analytics') {
            updateAnalytics();
        } else if (pageId === 'inventory') {
            updateInventoryAlerts();
        }
    }
}

// Set active navigation item
function setActiveNavItem(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

// Set active station tab
function setActiveStationTab(activeTab) {
    document.querySelectorAll('.station-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
}

// Filter orders by station
function filterOrdersByStation(station) {
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        if (station === 'all') {
            card.style.display = 'block';
        } else {
            const orderStation = card.querySelector('.order-station').textContent.toLowerCase();
            if (orderStation.includes(station)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Update live orders feed
function updateLiveOrders() {
    const liveOrdersContainer = document.getElementById('liveOrders');
    if (!liveOrdersContainer) return;
    
    liveOrdersContainer.innerHTML = '';
    const recentOrders = appData.orders.slice(-5).reverse();
    
    recentOrders.forEach(order => {
        const orderElement = createLiveOrderElement(order);
        liveOrdersContainer.appendChild(orderElement);
    });
}

// Create live order element
function createLiveOrderElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    
    const timeAgo = formatTimeAgo(order.timestamp);
    const statusColor = getStatusColor(order.status);
    
    orderDiv.innerHTML = `
        <div class="order-info">
            <h4>${order.id} - ${order.customer}</h4>
            <div class="order-details">
                ${order.items.join(', ')} • ₹${order.total} • ${order.platform} • ${timeAgo}
            </div>
        </div>
        <div class="order-status" style="background-color: ${statusColor}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
    `;
    
    return orderDiv;
}

// Format time ago
function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

// Get status color
function getStatusColor(status) {
    switch(status) {
        case 'new': return '#FADA7A';
        case 'preparing': return '#F0A04B';
        case 'ready': return '#B1C29E';
        default: return '#B1C29E';
    }
}

// Initialize order timers
function initializeOrderTimers() {
    const timerElements = document.querySelectorAll('[id^="timer-"]');
    
    timerElements.forEach(timer => {
        const orderId = timer.id.split('-')[1];
        const order = appData.orders.find(o => o.id === `ORD-${orderId}`);
        
        if (order && order.timeRemaining > 0) {
            startTimer(timer, order.timeRemaining);
        }
    });
}

// Start countdown timer
function startTimer(element, minutes) {
    let timeLeft = minutes * 60;
    
    const interval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        
        element.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(interval);
            element.textContent = 'OVERDUE';
            element.parentElement.classList.add('overdue');
            showToast('Order is overdue!', 'warning');
        }
    }, 1000);
}

// Setup order action buttons
function setupOrderButtons() {
    const completeButtons = document.querySelectorAll('.btn-complete');
    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderCard = this.closest('.order-card');
            markOrderReady(orderCard);
        });
    });
    
    const dispatchButtons = document.querySelectorAll('.btn-dispatch');
    dispatchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderCard = this.closest('.order-card');
            dispatchOrder(orderCard);
        });
    });
}

// Mark order as ready
function markOrderReady(orderCard) {
    orderCard.classList.remove('normal', 'urgent');
    orderCard.classList.add('ready');
    
    const timer = orderCard.querySelector('[id^="timer-"]');
    if (timer) {
        timer.textContent = 'Ready';
        timer.parentElement.classList.remove('normal', 'urgent');
        timer.parentElement.classList.add('ready');
    }
    
    const button = orderCard.querySelector('.btn-complete');
    if (button) {
        button.textContent = 'Dispatch';
        button.className = 'btn-dispatch';
        button.addEventListener('click', function() {
            dispatchOrder(orderCard);
        });
    }
    
    showToast('Order marked as ready!', 'success');
    updateOrderStats();
}

// Dispatch order
function dispatchOrder(orderCard) {
    orderCard.style.transform = 'translateX(100%)';
    orderCard.style.opacity = '0.5';
    
    setTimeout(() => {
        orderCard.remove();
        showToast('Order dispatched!', 'success');
        updateOrderStats();
    }, 500);
}

// Update order statistics
function updateOrderStats() {
    const activeOrdersElement = document.getElementById('activeOrders');
    const totalOrdersElement = document.getElementById('totalOrders');
    
    if (activeOrdersElement) {
        let currentCount = parseInt(activeOrdersElement.textContent);
        activeOrdersElement.textContent = Math.max(0, currentCount - 1);
    }
    
    if (totalOrdersElement) {
        let currentCount = parseInt(totalOrdersElement.textContent);
        totalOrdersElement.textContent = currentCount + 1;
    }
}

// Setup button hover effects
function setupButtonEffects() {
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-complete, .btn-dispatch');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Update analytics page
function updateAnalytics() {
    const canvas = document.getElementById('revenueChart');
    if (canvas) {
        drawSimpleChart(canvas);
    }
}

// Draw a simple chart
function drawSimpleChart(canvas) {
    const ctx = canvas.getContext('2d');
    const data = [25000, 28000, 32000, 29000, 35000, 31000, 29000];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 40;
    const chartWidth = canvas.width - (2 * padding);
    const chartHeight = canvas.height - (2 * padding);
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0d5c4';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#F0A04B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = canvas.height - padding - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw points
        ctx.fillStyle = '#F0A04B';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
        const x = padding + (chartWidth / (labels.length - 1)) * index;
        ctx.fillText(label, x, canvas.height - 10);
    });
}

// Update inventory alerts
function updateInventoryAlerts() {
    const lowStockItems = document.querySelectorAll('.inventory-item.low');
    
    if (lowStockItems.length > 0) {
        showToast(`${lowStockItems.length} items need restocking`, 'warning');
    }
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        if (Math.random() < 0.1) {
            addNewRandomOrder();
        }
        updateLiveOrders();
    }, 5000);
    
    setInterval(() => {
        updateDailyStats();
    }, 30000);
}

// Add new random order
function addNewRandomOrder() {
    const customers = ['Arjun Sharma', 'Kavya Patel', 'Rohit Kumar', 'Ananya Singh', 'Vikram Gupta'];
    const items = [
        ['Paneer Tikka', 'Naan'],
        ['Pasta Arrabiata', 'Garlic Bread'],
        ['Chicken Burger', 'Fries'],
        ['Mutton Biryani', 'Raita'],
        ['Margherita Pizza']
    ];
    const platforms = ['Swiggy', 'Zomato', 'Direct'];
    
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const randomItems = items[Math.floor(Math.random() * items.length)];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const randomTotal = Math.floor(Math.random() * 300) + 200;
    const orderNumber = Math.floor(Math.random() * 1000) + 100;
    
    const newOrder = {
        id: `ORD-${orderNumber}`,
        customer: randomCustomer,
        items: randomItems,
        total: randomTotal,
        status: 'new',
        station: 'grill',
        timeRemaining: 15,
        priority: 'normal',
        platform: randomPlatform,
        timestamp: Date.now()
    };
    
    appData.orders.push(newOrder);
    appData.dailyStats.totalOrders++;
    appData.dailyStats.activeOrders++;
    appData.dailyStats.revenue += randomTotal;
    
    showToast(`New order from ${randomCustomer}!`, 'success');
}

// Update daily statistics
function updateDailyStats() {
    const stats = appData.dailyStats;
    
    stats.totalOrders += Math.floor(Math.random() * 3);
    stats.revenue += Math.floor(Math.random() * 1000);
    stats.efficiency = Math.min(100, stats.efficiency + (Math.random() - 0.5) * 2);
    
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    
    const revenueElement = document.querySelector('.kpi-value');
    if (revenueElement && revenueElement.textContent.includes('₹')) {
        revenueElement.textContent = `₹${stats.revenue.toLocaleString()}`;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Console welcome message
console.log(`
🍽️ Group Kitchen Cloud - Kitchen Management System
👨‍🍳 Manager: Pradip Barik
🚀 System Status: Running
⚡ Real-time Updates: Active
📊 Analytics: Enabled
🤖 AI Optimization: Active

Welcome to the future of cloud kitchen management!
`);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .overdue {
        background-color: #e74c3c !important;
        color: white !important;
        animation: blink 1s infinite;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);