// Buyer Dashboard JavaScript
// Basic functionality without algorithm-based features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize buyer dashboard
    initializeBuyerDashboard();
});

function initializeBuyerDashboard() {
    // Load initial data
    loadBuyerStats();
    loadBuyerOrders();
    loadWishlist();
    loadFavoriteFarmers();

    // Set up event listeners
    setupEventListeners();

    // Show default tab
    showBuyerTab('orders');
}

function setupEventListeners() {
    // Star rating functionality
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            setStarRating(rating);
        });
    });

    // Modal close functionality
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function showBuyerTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.dashboard-content');
    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.dashboard-tab');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Add active class to selected button
    const selectedButton = document.querySelector(`[onclick="showBuyerTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Load tab-specific content
    switch(tabName) {
        case 'orders':
            loadBuyerOrders();
            break;
        case 'wishlist':
            loadWishlist();
            break;
        case 'favorites':
            loadFavoriteFarmers();
            break;
        case 'profile':
            // Profile tab is already loaded
            break;
    }
}

function loadBuyerStats() {
    const orders = StorageManager.load('ecomarket_orders') || [];
    const cart = StorageManager.load('ecomarket_cart') || [];
    const wishlist = StorageManager.load('ecomarket_wishlist') || [];

    // Update stats (basic calculations)
    const totalOrders = orders.length;
    const cartItems = cart.length;
    const wishlistItems = wishlist.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Update DOM elements if they exist
    const statsElements = {
        totalOrders: document.querySelector('#totalOrders'),
        cartItems: document.querySelector('#cartItems'),
        wishlistItems: document.querySelector('#wishlistItems'),
        totalSpent: document.querySelector('#totalSpent')
    };

    if (statsElements.totalOrders) statsElements.totalOrders.textContent = totalOrders;
    if (statsElements.cartItems) statsElements.cartItems.textContent = cartItems;
    if (statsElements.wishlistItems) statsElements.wishlistItems.textContent = wishlistItems;
    if (statsElements.totalSpent) statsElements.totalSpent.textContent = formatCurrency(totalSpent);
}

function loadBuyerOrders() {
    const orders = StorageManager.load('ecomarket_orders') || [];
    const ordersList = document.getElementById('ordersList');

    if (!ordersList) return;

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here</p>
                <a href="marketplace.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status status-${order.status}">
                    ${order.status}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">${formatCurrency(item.price)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">Total: ${formatCurrency(order.total)}</div>
                <div class="order-actions">
                    <button class="btn btn-secondary btn-small" onclick="trackOrder('${order.id}')">
                        Track Order
                    </button>
                    ${order.status === 'delivered' ?
                        `<button class="btn btn-primary btn-small" onclick="showReviewModal('${order.id}')">
                            Write Review
                        </button>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function filterBuyerOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;
    const orders = StorageManager.load('ecomarket_orders') || [];

    let filteredOrders = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.toDateString() === filterDate.toDateString();
        });
    }

    // Update display
    displayFilteredOrders(filteredOrders);
}

function displayFilteredOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No orders found</h3>
                <p>No orders match your current filters</p>
            </div>
        `;
        return;
    }

    // Use the same display logic as loadBuyerOrders but with filtered data
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status status-${order.status}">
                    ${order.status}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">${formatCurrency(item.price)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">Total: ${formatCurrency(order.total)}</div>
                <div class="order-actions">
                    <button class="btn btn-secondary btn-small" onclick="trackOrder('${order.id}')">
                        Track Order
                    </button>
                    ${order.status === 'delivered' ?
                        `<button class="btn btn-primary btn-small" onclick="showReviewModal('${order.id}')">
                            Write Review
                        </button>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function loadWishlist() {
    const wishlist = StorageManager.load('ecomarket_wishlist') || [];
    const products = StorageManager.load('ecomarket_products') || [];
    const wishlistGrid = document.getElementById('wishlistGrid');

    if (!wishlistGrid) return;

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💝</div>
                <h3>Your wishlist is empty</h3>
                <p>Add products you love to your wishlist</p>
                <a href="marketplace.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        return;
    }

    const wishlistProducts = wishlist.map(wishItem => {
        return products.find(product => product.id === wishItem.productId);
    }).filter(product => product); // Remove undefined products

    wishlistGrid.innerHTML = wishlistProducts.map(product => `
        <div class="wishlist-card">
            <div class="product-image">${product.image || '🥬'}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="farmer-name">${product.farmer}</p>
                <p class="price">${formatCurrency(product.price)} per ${product.unit}</p>
            </div>
            <div class="wishlist-actions">
                <button class="btn btn-primary btn-small" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="btn btn-secondary btn-small" onclick="removeFromWishlist(${product.id})">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function loadFavoriteFarmers() {
    const favorites = StorageManager.load('ecomarket_favorite_farmers') || [
        {
            id: 1,
            name: 'Green Valley Farm',
            owner: 'John Smith',
            specialty: 'Organic Vegetables & Fruits',
            rating: 4.9,
            reviews: 127,
            image: '👨‍🌾'
        },
        {
            id: 2,
            name: 'Sunrise Organic Farm',
            owner: 'Maria Garcia',
            specialty: 'Premium Organic Produce',
            rating: 4.8,
            reviews: 89,
            image: '👩‍🌾'
        },
        {
            id: 3,
            name: 'Mountain Fresh Farms',
            owner: 'Robert Johnson',
            specialty: 'Seasonal Fruits & Berries',
            rating: 4.7,
            reviews: 156,
            image: '🚜'
        }
    ];

    const farmersGrid = document.getElementById('favoriteFarmersGrid');
    if (!farmersGrid) return;

    farmersGrid.innerHTML = favorites.map(farmer => `
        <div class="farmer-card">
            <div class="farmer-avatar">${farmer.image}</div>
            <div class="farmer-info">
                <h3>${farmer.name}</h3>
                <p>${farmer.owner}</p>
                <p class="farmer-specialty">${farmer.specialty}</p>
                <div class="farmer-rating">
                    <span class="stars">⭐⭐⭐⭐⭐</span>
                    <span class="rating-text">${farmer.rating} (${farmer.reviews} reviews)</span>
                </div>
            </div>
            <div class="farmer-actions">
                <button class="btn btn-primary btn-small" onclick="visitFarmer(${farmer.id})">
                    Visit Shop
                </button>
                <button class="btn btn-secondary btn-small" onclick="removeFavoriteFarmer(${farmer.id})">
                    ❤️ Remove
                </button>
            </div>
        </div>
    `).join('');
}

function trackOrder(orderId) {
    // Redirect to delivery tracking page
    window.location.href = `delivery.html?order=${orderId}`;
}

function showReviewModal(orderId) {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('data-order-id', orderId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function setStarRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffd700';
        } else {
            star.style.color = '#ddd';
        }
    });

    // Store the rating value
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.setAttribute('data-rating', rating);
    }
}

function submitReview() {
    const modal = document.getElementById('reviewModal');
    const orderId = modal.getAttribute('data-order-id');
    const rating = modal.getAttribute('data-rating') || 5;
    const reviewText = document.getElementById('reviewText').value;

    if (!reviewText.trim()) {
        alert('Please write a review');
        return;
    }

    // Save review (in a real app, this would be sent to the server)
    const reviews = StorageManager.load('ecomarket_reviews') || [];
    const newReview = {
        id: Date.now(),
        orderId: orderId,
        rating: parseInt(rating),
        text: reviewText,
        date: new Date().toISOString(),
        buyerId: 'current_buyer' // In real app, get from user session
    };

    reviews.push(newReview);
    StorageManager.save('ecomarket_reviews', reviews);

    // Close modal and show success
    closeModal('reviewModal');
    showSuccessMessage('Review submitted successfully!');

    // Clear form
    document.getElementById('reviewText').value = '';
    setStarRating(5);
}

function removeFromWishlist(productId) {
    const wishlist = StorageManager.load('ecomarket_wishlist') || [];
    const updatedWishlist = wishlist.filter(item => item.productId !== productId);
    StorageManager.save('ecomarket_wishlist', updatedWishlist);

    // Reload wishlist display
    loadWishlist();
    updateCartBadge();
}

function removeFavoriteFarmer(farmerId) {
    const favorites = StorageManager.load('ecomarket_favorite_farmers') || [];
    const updatedFavorites = favorites.filter(farmer => farmer.id !== farmerId);
    StorageManager.save('ecomarket_favorite_farmers', updatedFavorites);

    // Reload favorites display
    loadFavoriteFarmers();
}

function visitFarmer(farmerId) {
    // Redirect to marketplace with farmer filter
    window.location.href = `marketplace.html?farmer=${farmerId}`;
}

function showSuccessMessage(message) {
    // Simple success message (you could make this a modal or toast)
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d8f3f;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function formatCurrency(amount) {
    return amount + ' CFA';
}

// Add to cart function (reuse from main.js if available)
function addToCart(productId) {
    if (window.CartManager) {
        CartManager.addToCart(productId);
        showSuccessMessage('Product added to cart!');
    } else {
        // Fallback implementation
        console.log('Adding product to cart:', productId);
        showSuccessMessage('Product added to cart!');
    }
}
