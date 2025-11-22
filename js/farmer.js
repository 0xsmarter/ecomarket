// Farmer Dashboard JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeFarmerDashboard();
});

function initializeFarmerDashboard() {
  loadDashboardStats();
  loadMyProducts();
  loadOrders();
  showTab("products");
  console.log("Farmer dashboard initialized");
}

function loadDashboardStats() {
  const products = StorageManager.load("ecomarket_products") || [];
  const orders = StorageManager.load("ecomarket_orders") || [];

  // Filter products by current farmer (for demo, we'll use a sample farmer name)
  const currentFarmer = "Green Valley Farm"; // In real app, this would come from user session
  const myProducts = products.filter((p) => p.farmer === currentFarmer);
  const myOrders = orders.filter((order) =>
    order.items.some((item) => {
      const product = products.find((p) => p.id == item.productId);
      return product && product.farmer === currentFarmer;
    }),
  );

  // Calculate stats
  const totalProducts = myProducts.length;
  const totalEarnings = myOrders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((orderSum, item) => {
        const product = products.find((p) => p.id == item.productId);
        if (product && product.farmer === currentFarmer) {
          return orderSum + item.total;
        }
        return orderSum;
      }, 0)
    );
  }, 0);
  const totalOrdersCount = myOrders.length;

  // Update dashboard stats
  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("totalEarnings").textContent =
    formatCurrency(totalEarnings);
  document.getElementById("totalOrders").textContent = totalOrdersCount;
}

function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".dashboard-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Remove active class from all tab buttons
  document.querySelectorAll(".dashboard-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.remove("hidden");

  // Add active class to clicked tab button
  event.target.classList.add("active");

  // Load tab-specific content
  switch (tabName) {
    case "products":
      loadMyProducts();
      break;
    case "orders":
      loadOrders();
      break;
    case "analytics":
      loadAnalytics();
      break;
  }
}

function loadMyProducts() {
  const products = StorageManager.load("ecomarket_products") || [];
  const currentFarmer = "Green Valley Farm"; // In real app, get from user session
  const myProducts = products.filter((p) => p.farmer === currentFarmer);

  const productsList = document.getElementById("myProductsList");

  if (myProducts.length === 0) {
    productsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No Products Listed Yet</h3>
                <p>Start by adding your first product to the marketplace</p>
                <button class="btn btn-primary" onclick="showTab('add-product')">Add Your First Product</button>
            </div>
        `;
    return;
  }

  productsList.innerHTML = myProducts
    .map(
      (product) => `
        <div class="product-item" data-product-id="${product.id}">
            <div class="product-image-small">${product.image}</div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-description-short">${product.description.substring(0, 100)}...</p>
                <div class="product-meta">
                    <span class="price">${formatCurrency(product.price)} per ${product.unit}</span>
                    <span class="stock ${product.quantity < 10 ? "low-stock" : ""}">
                        ${product.quantity} ${product.unit} available
                    </span>
                    ${product.isPackage ? '<span class="package-badge-small">PACKAGE</span>' : ""}
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn-outline btn-small" onclick="toggleProductStatus(${product.id})">
                    ${product.active !== false ? "⏸️ Pause" : "▶️ Activate"}
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function searchMyProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
  const products = StorageManager.load("ecomarket_products") || [];
  const currentFarmer = "Green Valley Farm";

  let myProducts = products.filter((p) => p.farmer === currentFarmer);

  if (searchTerm) {
    myProducts = myProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm),
    );
  }

  const productsList = document.getElementById("myProductsList");

  if (myProducts.length === 0 && searchTerm) {
    productsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>No products match your search: "${searchTerm}"</p>
            </div>
        `;
    return;
  }

  // Re-render filtered products
  loadMyProducts();
}

function addProduct(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Validate form
  if (!validateForm(form)) {
    showToast("Veuillez remplir tous les champs requis!", "error");
    return;
  }

  // Create new product
  const newProduct = {
    id: generateId(),
    name: formData.get("productName"),
    farmer: formData.get("farmerName"),
    price: parseFloat(formData.get("productPrice")),
    quantity: parseInt(formData.get("productQuantity")),
    unit: formData.get("productUnit"),
    description: formData.get("productDescription"),
    category: formData.get("productCategory"),
    image: formData.get("productImage"),
    quality: "A+",
    isPackage: false,
    organic: form.organicCertified.checked,
    active: true,
    createdAt: new Date().toISOString(),
  };

  // Save to storage
  const products = StorageManager.load("ecomarket_products") || [];
  products.unshift(newProduct);
  StorageManager.save("ecomarket_products", products);

  // Reset form and show success message
  form.reset();
  showToast(`Produit "${newProduct.name}" ajouté avec succès!`, "success");

  // Update dashboard stats and switch to products tab
  loadDashboardStats();
  showTab("products");
}

function editProduct(productId) {
  const products = StorageManager.load("ecomarket_products") || [];
  const product = products.find((p) => p.id == productId);

  if (!product) {
    showToast("Produit non trouvé!", "error");
    return;
  }

  // Populate edit form
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductCategory").value = product.category;
  document.getElementById("editProductDescription").value = product.description;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductQuantity").value = product.quantity;

  // Open edit modal
  openModal("editProductModal");
}

function updateProduct(event) {
  event.preventDefault();

  const form = event.target;
  const productId = document.getElementById("editProductId").value;

  if (!validateForm(form)) {
    showToast("Please fill in all required fields!", "error");
    return;
  }

  const products = StorageManager.load("ecomarket_products") || [];
  const productIndex = products.findIndex((p) => p.id == productId);

  if (productIndex === -1) {
    showToast("Produit non trouvé!", "error");
    return;
  }

  // Update product
  products[productIndex] = {
    ...products[productIndex],
    name: document.getElementById("editProductName").value,
    category: document.getElementById("editProductCategory").value,
    description: document.getElementById("editProductDescription").value,
    price: parseFloat(document.getElementById("editProductPrice").value),
    quantity: parseInt(document.getElementById("editProductQuantity").value),
    updatedAt: new Date().toISOString(),
  };

  StorageManager.save("ecomarket_products", products);
  closeModal("editProductModal");
  loadMyProducts();
  showToast("Product updated successfully!", "success");
}

function deleteProduct(productId) {
  if (
    !confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    )
  ) {
    return;
  }

  const products = StorageManager.load("ecomarket_products") || [];
  const updatedProducts = products.filter((p) => p.id != productId);

  StorageManager.save("ecomarket_products", updatedProducts);
  loadMyProducts();
  loadDashboardStats();
  showToast("Product deleted successfully!", "success");
}

function toggleProductStatus(productId) {
  const products = StorageManager.load("ecomarket_products") || [];
  const productIndex = products.findIndex((p) => p.id == productId);

  if (productIndex === -1) {
    showToast("Produit non trouvé!", "error");
    return;
  }

  const product = products[productIndex];
  product.active = product.active !== false ? false : true;

  StorageManager.save("ecomarket_products", products);
  loadMyProducts();

  const status = product.active ? "activated" : "paused";
  showToast(`Product ${status} successfully!`, "success");
}

function resetProductForm() {
  document.getElementById("addProductForm").reset();
  showToast("Form reset!", "info");
}

function loadOrders() {
  const orders = StorageManager.load("ecomarket_orders") || [];
  const products = StorageManager.load("ecomarket_products") || [];
  const currentFarmer = "Green Valley Farm";

  // Filter orders that contain products from current farmer
  const myOrders = orders
    .filter((order) =>
      order.items.some((item) => {
        const product = products.find((p) => p.id == item.productId);
        return product && product.farmer === currentFarmer;
      }),
    )
    .map((order) => ({
      ...order,
      items: order.items.filter((item) => {
        const product = products.find((p) => p.id == item.productId);
        return product && product.farmer === currentFarmer;
      }),
    }));

  const ordersList = document.getElementById("ordersList");

  if (myOrders.length === 0) {
    ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Orders Yet</h3>
                <p>Orders for your products will appear here</p>
            </div>
        `;
    return;
  }

  ordersList.innerHTML = myOrders
    .map(
      (order) => `
        <div class="order-item" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-id">
                    <h3>Order #${order.id.substring(0, 8)}</h3>
                    <span class="order-date">${formatDate(order.createdAt)}</span>
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">${order.status.replace("-", " ")}</span>
                </div>
                <div class="order-total">
                    <strong>${formatCurrency(order.items.reduce((sum, item) => sum + item.total, 0))}</strong>
                </div>
            </div>
            <div class="order-items">
                ${order.items
                  .map(
                    (item) => `
                    <div class="order-product">
                        <span class="product-name">${item.productName}</span>
                        <span class="product-quantity">Qty: ${item.quantity}</span>
                        <span class="product-total">${formatCurrency(item.total)}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary btn-small" onclick="updateOrderStatus('${order.id}', 'confirmed')">
                    ✅ Confirm
                </button>
                <button class="btn btn-primary btn-small" onclick="viewOrderDetails('${order.id}')">
                    👁️ View Details
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function filterOrders() {
  const statusFilter = document.getElementById("orderStatusFilter").value;
  const orders = StorageManager.load("ecomarket_orders") || [];
  const products = StorageManager.load("ecomarket_products") || [];
  const currentFarmer = "Green Valley Farm";

  let filteredOrders = orders.filter((order) =>
    order.items.some((item) => {
      const product = products.find((p) => p.id == item.productId);
      return product && product.farmer === currentFarmer;
    }),
  );

  if (statusFilter !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusFilter,
    );
  }

  // Re-render with filtered orders
  const ordersList = document.getElementById("ordersList");

  if (filteredOrders.length === 0) {
    ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No orders found</h3>
                <p>No orders match the selected filter</p>
            </div>
        `;
    return;
  }

  loadOrders();
}

function updateOrderStatus(orderId, newStatus) {
  const orders = StorageManager.load("ecomarket_orders") || [];
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    showToast("Order not found!", "error");
    return;
  }

  orders[orderIndex].status = newStatus;
  orders[orderIndex].updatedAt = new Date().toISOString();

  StorageManager.save("ecomarket_orders", orders);
  loadOrders();

  showToast(
    `Order status updated to ${newStatus.replace("-", " ")}!`,
    "success",
  );
}

function viewOrderDetails(orderId) {
  const orders = StorageManager.load("ecomarket_orders") || [];
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    showToast("Order not found!", "error");
    return;
  }

  // This would open a detailed order view modal
  // For now, just show order info
  alert(
    `Order Details:\nOrder ID: ${order.id}\nTotal: ${formatCurrency(order.total)}\nStatus: ${order.status}\nDate: ${formatDate(order.createdAt)}`,
  );
}

function loadAnalytics() {
  // This would load real analytics data
  // For now, the analytics are static in the HTML
  console.log("Analytics loaded");
}

// Package Creation Functions
let packageBuilder = {
  selectedProducts: [],
  originalPrice: 0,
  discount: 15,
  finalPrice: 0,
};

function openCreatePackageModal() {
  loadAvailableProductsForPackage();
  openModal("createPackageModal");
}

function loadAvailableProductsForPackage() {
  const products = StorageManager.load("ecomarket_products") || [];
  const currentFarmer = "Green Valley Farm"; // In real app, get from user session
  const myProducts = products.filter(
    (p) => p.farmer === currentFarmer && p.active !== false,
  );

  const availableProductsDiv = document.getElementById("availableProducts");

  if (myProducts.length === 0) {
    availableProductsDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No Products Available</h3>
        <p>You need to add products to your inventory before creating packages.</p>
      </div>
    `;
    return;
  }

  availableProductsDiv.innerHTML = myProducts
    .map(
      (product) => `
    <div class="product-selector" data-product-id="${product.id}">
      <div class="product-checkbox">
        <input type="checkbox" id="product-${product.id}" onchange="toggleProductForPackage(${product.id})">
        <label for="product-${product.id}">${product.name}</label>
      </div>
      <div class="product-info">
        <span class="product-price">${product.price.toLocaleString()} CFA per ${product.unit}</span>
        <span class="product-stock">${product.quantity} available</span>
      </div>
      <div class="quantity-input" style="display: none;" id="quantity-input-${product.id}">
        <label>Quantity per package:</label>
        <input type="number" min="1" max="${product.quantity}" value="1" onchange="updatePackageCalculation()">
        <span>${product.unit}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function toggleProductForPackage(productId) {
  const checkbox = document.getElementById(`product-${productId}`);
  const quantityInput = document.getElementById(`quantity-input-${productId}`);
  const products = StorageManager.load("ecomarket_products") || [];
  const product = products.find((p) => p.id == productId);

  if (checkbox.checked) {
    quantityInput.style.display = "block";
    packageBuilder.selectedProducts.push({
      id: productId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      maxQuantity: product.quantity,
    });
  } else {
    quantityInput.style.display = "none";
    packageBuilder.selectedProducts = packageBuilder.selectedProducts.filter(
      (p) => p.id != productId,
    );
  }

  updatePackageCalculation();
  updateSelectedItemsList();
}

function updatePackageCalculation() {
  const discountInput = document.getElementById("packageDiscount");
  const discount = parseFloat(discountInput.value) || 0;

  let originalPrice = 0;

  packageBuilder.selectedProducts.forEach((product) => {
    const quantityInput = document.querySelector(
      `#quantity-input-${product.id} input`,
    );
    if (quantityInput) {
      const quantity = parseInt(quantityInput.value) || 1;
      product.quantity = quantity;
      originalPrice += product.price * quantity;
    }
  });

  const discountAmount = (originalPrice * discount) / 100;
  const finalPrice = originalPrice - discountAmount;

  packageBuilder.originalPrice = originalPrice;
  packageBuilder.discount = discount;
  packageBuilder.finalPrice = finalPrice;

  document.getElementById("originalPrice").textContent =
    `${originalPrice.toLocaleString()} CFA`;
  document.getElementById("discountAmount").textContent =
    `${discountAmount.toLocaleString()} CFA`;
  document.getElementById("packagePrice").textContent =
    `${finalPrice.toLocaleString()} CFA`;
}

function updateSelectedItemsList() {
  const itemsList = document.getElementById("packageItemsList");

  if (packageBuilder.selectedProducts.length === 0) {
    itemsList.innerHTML = "<p>No items selected yet</p>";
    return;
  }

  itemsList.innerHTML = packageBuilder.selectedProducts
    .map(
      (product) => `
    <div class="selected-item">
      <span>${product.name} (${product.quantity} ${product.unit})</span>
      <span>${(product.price * product.quantity).toLocaleString()} CFA</span>
    </div>
  `,
    )
    .join("");
}

function createPackage(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  if (packageBuilder.selectedProducts.length === 0) {
    showToast("Please select at least one product for the package!", "error");
    return;
  }

  const packageName = formData.get("packageName");
  const packageDescription = formData.get("packageDescription");
  const packageQuantity = parseInt(formData.get("packageQuantity"));
  const discount = parseFloat(formData.get("packageDiscount"));

  if (!packageName || !packageDescription || !packageQuantity) {
    showToast("Please fill in all required fields!", "error");
    return;
  }

  const products = StorageManager.load("ecomarket_products") || [];
  const newPackage = {
    id: generateId(),
    name: packageName,
    farmer: "Green Valley Farm", // In real app, get from user session
    price: packageBuilder.finalPrice,
    originalPrice: packageBuilder.originalPrice,
    quantity: packageQuantity,
    unit: "package",
    description: packageDescription,
    category: "packages",
    image: "assets/package-icon.png", // You might want to add a default package image
    quality: "A+",
    isPackage: true,
    discount: discount,
    packageItems: packageBuilder.selectedProducts.map(
      (product) => `${product.name} (${product.quantity} ${product.unit})`,
    ),
    active: true,
    dateAdded: new Date().toISOString(),
  };

  products.unshift(newPackage);
  StorageManager.save("ecomarket_products", products);

  // Reset package builder
  packageBuilder.selectedProducts = [];
  packageBuilder.originalPrice = 0;
  packageBuilder.finalPrice = 0;

  // Reset form and close modal
  form.reset();
  closeModal("createPackageModal");

  // Refresh products display
  loadMyProducts();
  loadDashboardStats();

  showToast(
    `Package "${packageName}" created successfully with ${discount}% discount!`,
    "success",
  );
}

// Utility function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Add CSS styles for farmer dashboard specific elements
  const styles = document.createElement("style");
  styles.innerHTML = `
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        .empty-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        .product-item {
            display: flex;
            align-items: center;
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        .product-item:hover {
            transform: translateY(-2px);
        }
        .product-image-small {
            font-size: 3rem;
            margin-right: 20px;
            flex-shrink: 0;
        }
        .product-details {
            flex: 1;
        }
        .product-name {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.2rem;
        }
        .product-category {
            margin: 0 0 8px 0;
            color: #2d8f3f;
            font-weight: 500;
            text-transform: capitalize;
        }
        .product-description-short {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9rem;
        }
        .product-meta {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        .low-stock {
            color: #dc3545;
            font-weight: 600;
        }
        .package-badge-small {
            background: #2d8f3f;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
        }
        .product-actions {
            display: flex;
            gap: 8px;
            flex-direction: column;
        }
        .btn-danger {
            background-color: #dc3545;
            color: white;
            border: 2px solid #dc3545;
        }
        .btn-danger:hover {
            background-color: #c82333;
            border-color: #c82333;
        }
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .stat-icon {
            font-size: 2.5rem;
            opacity: 0.8;
        }
        .stat-info h3 {
            margin: 0 0 5px 0;
            font-size: 1.8rem;
            color: #2d8f3f;
        }
        .stat-info p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
        .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .content-actions {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        .content-actions input {
            padding: 10px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            min-width: 200px;
        }
        .order-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .order-id h3 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .order-date {
            color: #666;
            font-size: 0.9rem;
        }
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-quality-check { background: #cce7ff; color: #004085; }
        .status-shipped { background: #e2e3e5; color: #383d41; }
        .status-delivered { background: #d1ecf1; color: #0c5460; }
        .order-items {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .order-product {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            flex-wrap: wrap;
            gap: 10px;
        }
        .order-product:last-child {
            border-bottom: none;
        }
        .order-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .analytics-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .analytics-card h3 {
            margin: 0 0 20px 0;
            color: #333;
        }
        .revenue-bars {
            display: flex;
            align-items: end;
            gap: 8px;
            height: 120px;
            margin-top: 20px;
        }
        .bar {
            background: linear-gradient(to top, #2d8f3f, #4db56a);
            width: 30px;
            border-radius: 4px 4px 0 0;
            display: flex;
            align-items: end;
            justify-content: center;
            padding-bottom: 5px;
            color: white;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .product-icon {
            font-size: 1.2rem;
            margin-right: 10px;
        }
        .product-name {
            flex: 1;
            font-weight: 500;
        }
        .product-status {
            color: #2d8f3f;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .rating-overview {
            text-align: center;
            margin-bottom: 15px;
        }
        .rating-stars {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        .rating-score {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d8f3f;
        }
        .season {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
        }
        .season-growth {
            color: #2d8f3f;
            font-weight: 600;
        }
        .certifications {
            margin: 30px 0;
        }
        .certification-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .cert-badge {
            background: #e8f5e8;
            color: #2d8f3f;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }

        @media (max-width: 768px) {
            .product-item {
                flex-direction: column;
                text-align: center;
            }
            .product-image-small {
                margin-right: 0;
                margin-bottom: 15px;
            }
            .product-actions {
                flex-direction: row;
                margin-top: 15px;
            }
            .order-header {
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
        }

        /* Package Creation Styles */
        .package-modal {
            max-width: 800px;
            width: 90%;
        }

        .package-form {
            max-height: 70vh;
            overflow-y: auto;
        }

        .package-items-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .available-products {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
            margin: 15px 0;
        }

        .product-selector {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .product-selector:last-child {
            border-bottom: none;
        }

        .product-checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        }

        .product-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }

        .product-checkbox label {
            font-weight: 600;
            color: #333;
            cursor: pointer;
        }

        .product-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            min-width: 150px;
        }

        .product-price {
            font-weight: 600;
            color: #2d8f3f;
        }

        .product-stock {
            font-size: 0.9rem;
            color: #666;
        }

        .quantity-input {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            width: 100%;
        }

        .quantity-input input {
            width: 60px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
        }

        .selected-package-items {
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        .selected-package-items h5 {
            margin: 0 0 10px 0;
            color: #333;
        }

        .selected-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }

        .selected-item:last-child {
            border-bottom: none;
        }

        .package-pricing {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #2d8f3f;
            margin-top: 15px;
        }

        .pricing-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 1rem;
        }

        .pricing-row.discount {
            color: #ff6b35;
            font-weight: 600;
        }

        .pricing-row.total {
            font-size: 1.2rem;
            font-weight: 700;
            color: #2d8f3f;
            border-top: 2px solid #ddd;
            padding-top: 10px;
            margin-top: 15px;
        }

        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }

        @media (max-width: 768px) {
            .product-selector {
                flex-direction: column;
                align-items: stretch;
            }

            .product-info {
                flex-direction: row;
                justify-content: space-between;
                min-width: auto;
            }

            .form-actions {
                flex-direction: column;
            }
        }
    `;
  document.head.appendChild(styles);
});
