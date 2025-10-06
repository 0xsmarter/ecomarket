// Marketplace specific JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initializeMarketplace();
});

// Fruit data based on assets folder
const FRUIT_DATA = [
  {
    name: "Banana",
    category: "fruits",
    description: "Sweet and energy-rich bananas, fresh from the farm",
    basePrice: 800,
    unit: "kg",
    quality: "A",
    images: ["assets/banana1.jpeg"],
  },
  {
    name: "Mango",
    category: "fruits",
    description: "Juicy tropical mangoes, sweet and aromatic",
    basePrice: 2000,
    unit: "kg",
    quality: "A+",
    images: ["assets/mangoes1.jpeg"],
  },
  {
    name: "Tomatoes",
    category: "fruits",
    description: "Fresh, ripe tomatoes perfect for salads, sauces, and cooking",
    basePrice: 1000,
    unit: "kg",
    quality: "A",
    images: ["assets/tomates1.jpeg"],
  },
  {
    name: "Orange",
    category: "fruits",
    description: "Juicy citrus oranges bursting with vitamin C",
    basePrice: 1200,
    unit: "kg",
    quality: "A",
    images: ["assets/orange1.jpeg"],
  },
  {
    name: "Avocado",
    category: "fruits",
    description: "Creamy avocados rich in healthy fats and nutrients",
    basePrice: 2500,
    unit: "kg",
    quality: "A+",
    images: ["assets/avocado1.jpeg"],
  },
  {
    name: "Pineapple",
    category: "fruits",
    description: "Sweet and tropical pineapples, tangy and refreshing",
    basePrice: 1800,
    unit: "piece",
    quality: "A+",
    images: ["assets/pineapple1.jpeg"],
  },
  {
    name: "Plantain",
    category: "fruits",
    description: "Sweet tropical plantin , fresh from the farm",
    basePrice: 1200,
    unit: "piece",
    quality: "A",
    images: ["assets/plantain.jpeg"],
  },
  {
    name: "Guava",
    category: "fruits",
    description: "Sweet Guava from tropical west africa , delivered from farm",
    basePrice: 200,
    quality: "A",
    images: ["assets/guava.jpeg"],
  },
  {
    name: "Yam",
    category: "vegetables",
    description: "Fresh yams from the farm",
    basePrice: 1500,
    unit: "kg",
    quality: "A+",
    images: ["assets/yam.jpeg"],
  },
  {
    name: "Onion",
    category: "vegetables",
    description: "Fresh onions from the farm",
    basePrice: 800,
    unit: "kg",
    quality: "A+",
    images: ["assets/onion.jpeg"],
  },

  {
    name: "Cassava",
    category: "vegetables",
    description: "Fresh cassava from the farm",
    basePrice: 700,
    unit: "kg",
    quality: "A+",
    images: ["assets/cassava.jpeg"],
  },
];

const SAMPLE_FARMERS = [
  "Green Valley Farm",
  "Sunshine Agriculture",
  "Fresh Harvest Co-op",
  "Organic Paradise",
  "Mountain View Farms",
  "Tropical Fruits Ltd",
];

let currentProducts = [];
let packageBuilder = {
  items: [],
  totalPrice: 0,
  discount: 0,
};

function initializeMarketplace() {
  // One-time purge of specific unwanted products from localStorage
  let existingProducts = StorageManager.load("ecomarket_products") || [];
  const unwantedNames = [
    "Organic Tomatoes",
    "Fresh Strawberries",
    "Green Vegetables Bundle",
  ];
  existingProducts = existingProducts.filter(
    (product) => !unwantedNames.includes(product.name),
  );
  StorageManager.save("ecomarket_products", existingProducts);

  initializeFruitProducts();
  loadProducts();
  updateCartDisplay();
  initializeFilters();

  // Add event listeners for real-time package calculation
  document.addEventListener("input", function (e) {
    if (e.target.closest("#packageBuilder")) {
      calculatePackagePrice();
    }
  });
}

function initializeFruitProducts() {
  let existingProducts = StorageManager.load("ecomarket_products") || [];

  const newProducts = [];
  let productId = Math.max(...existingProducts.map((p) => p.id || 0), 0) + 1;

  FRUIT_DATA.forEach((fruit) => {
    const existing = existingProducts.find((p) => p.name === fruit.name);
    if (!existing) {
      const farmer =
        SAMPLE_FARMERS[Math.floor(Math.random() * SAMPLE_FARMERS.length)];
      const quantity = Math.floor(Math.random() * 100) + 20; // 20-120 units

      const product = {
        id: productId++,
        name: fruit.name,
        farmer: farmer,
        price: fruit.basePrice,
        quantity: quantity,
        unit: fruit.unit,
        description: fruit.description,
        category: fruit.category,
        image: fruit.images[0], // Use first image
        quality: fruit.quality,
        isPackage: false,
        active: true,
        dateAdded: new Date().toISOString(),
      };

      newProducts.push(product);
    }
  });

  if (newProducts.length > 0) {
    const allProducts = [...existingProducts, ...newProducts];
    StorageManager.save("ecomarket_products", allProducts);
  }
}

function loadProducts() {
  currentProducts = StorageManager.load("ecomarket_products") || [];
  displayProducts(currentProducts);
}

function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid");

  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or check back later for new products.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
}

function createProductCard(product) {
  const isPackage = product.isPackage;
  const packageBadge = isPackage
    ? '<div class="product-badge package">PACKAGE DEAL</div>'
    : "";
  const packageClass = isPackage ? "package-card" : "";

  const priceDisplay = isPackage
    ? `
      <div class="package-pricing">
        <span class="original-price">${product.originalPrice?.toLocaleString()} CFA</span>
        <span class="package-price">${product.price.toLocaleString()} CFA</span>
        <span class="package-savings">Save ${product.discount}%</span>
      </div>
    `
    : `<div class="product-price">${product.price.toLocaleString()} CFA per ${product.unit}</div>`;

  const quantityBadge =
    product.quantity > 0
      ? `<span class="stock-badge in-stock">${product.quantity} ${product.unit} available</span>`
      : `<span class="stock-badge out-stock">Out of stock</span>`;

  return `
    <div class="product-card ${packageClass}" data-product-id="${product.id}">
      ${packageBadge}
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/placeholder.jpg'">
        <div class="product-overlay">
          <button class="btn btn-quick-view" onclick="viewProductDetails(${product.id})">
            Quick View
          </button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="farmer-name">by ${product.farmer}</p>
        <p class="product-description">${product.description}</p>
        <div class="product-meta">
          <span class="quality-badge quality-${product.quality.replace("+", "plus")}">${product.quality}</span>
          ${quantityBadge}
        </div>
        ${priceDisplay}
        <div class="product-actions">
          ${
            product.quantity > 0
              ? `
            <button class="btn btn-primary" onclick="addToCart(${product.id})">
              Add to Cart
            </button>
            <button class="btn btn-secondary" onclick="addToPackage(${product.id})">
              Add to Package
            </button>
          `
              : `
            <button class="btn btn-disabled" disabled>Out of Stock</button>
          `
          }
        </div>
      </div>
    </div>
  `;
}

function initializeFilters() {
  const searchInput = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const priceFilter = document.getElementById("priceFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
  }
  if (priceFilter) {
    priceFilter.addEventListener("change", filterProducts);
  }
}

function filterProducts() {
  const searchTerm =
    document.getElementById("productSearch")?.value.toLowerCase() || "";
  const category = document.getElementById("categoryFilter")?.value || "all";
  const priceRange = document.getElementById("priceFilter")?.value || "all";

  let filteredProducts = currentProducts.filter((product) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.farmer.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    // Category filter
    const matchesCategory = category === "all" || product.category === category;

    // Price filter
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = product.price;
      switch (priceRange) {
        case "low":
          matchesPrice = price < 1000;
          break;
        case "medium":
          matchesPrice = price >= 1000 && price < 2000;
          break;
        case "high":
          matchesPrice = price >= 2000;
          break;
      }
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      product.active !== false
    );
  });

  displayProducts(filteredProducts);
}

function addToCart(productId, quantity = 1) {
  const product = currentProducts.find((p) => p.id == productId);

  if (!product) {
    showToast("Product not found!", "error");
    return;
  }

  if (product.quantity < quantity) {
    showToast("Not enough stock available!", "error");
    return;
  }

  CartManager.addToCart(productId, quantity);
  showToast(`${product.name} added to cart!`, "success");
  updateCartDisplay();
}

function addToPackage(productId) {
  const product = currentProducts.find((p) => p.id == productId);

  if (!product) {
    showToast("Product not found!", "error");
    return;
  }

  // Check if already in package
  const existingItem = packageBuilder.items.find(
    (item) => item.productId == productId,
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    packageBuilder.items.push({
      productId: product.id,
      name: product.name,
      farmer: product.farmer,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      maxQuantity: product.quantity,
    });
  }

  updatePackageDisplay();
  calculatePackagePrice();
  showToast(`${product.name} added to package!`, "success");
}

function removeFromPackage(productId) {
  packageBuilder.items = packageBuilder.items.filter(
    (item) => item.productId != productId,
  );
  updatePackageDisplay();
  calculatePackagePrice();
}

function updatePackageQuantity(productId, quantity) {
  const item = packageBuilder.items.find((item) => item.productId == productId);
  if (item) {
    item.quantity = Math.max(1, Math.min(quantity, item.maxQuantity));
    updatePackageDisplay();
    calculatePackagePrice();
  }
}

function updatePackageDisplay() {
  const selectedItemsDiv = document.getElementById("selectedItems");

  if (!selectedItemsDiv) return;

  if (packageBuilder.items.length === 0) {
    selectedItemsDiv.innerHTML = "<p>No items selected yet</p>";
    return;
  }

  selectedItemsDiv.innerHTML = `
    <div class="package-items-list">
      ${packageBuilder.items
        .map(
          (item) => `
        <div class="package-item">
          <div class="item-info">
            <h4>${item.name}</h4>
            <p>by ${item.farmer}</p>
            <p>${item.price.toLocaleString()} CFA per ${item.unit}</p>
          </div>
          <div class="item-controls">
            <div class="quantity-control">
              <button onclick="updatePackageQuantity(${item.productId}, ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button onclick="updatePackageQuantity(${item.productId}, ${item.quantity + 1})">+</button>
            </div>
            <button class="btn btn-remove" onclick="removeFromPackage(${item.productId})">Remove</button>
          </div>
          <div class="item-total">
            ${(item.price * item.quantity).toLocaleString()} CFA
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function calculatePackagePrice() {
  const subtotal = packageBuilder.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate discount based on number of items and total value
  let discountRate = 0;
  if (packageBuilder.items.length >= 5) {
    discountRate = 0.25; // 25% discount for 5+ items
  } else if (packageBuilder.items.length >= 3) {
    discountRate = 0.15; // 15% discount for 3+ items
  } else if (subtotal >= 20000) {
    discountRate = 0.1; // 10% discount for orders over 20,000 CFA
  }

  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  packageBuilder.totalPrice = total;
  packageBuilder.discount = discount;

  // Update display
  const subtotalElement = document.getElementById("packageSubtotal");
  const discountElement = document.getElementById("packageDiscount");
  const totalElement = document.getElementById("packageTotal");

  if (subtotalElement)
    subtotalElement.textContent = `${subtotal.toLocaleString()} CFA`;
  if (discountElement)
    discountElement.textContent = `-${discount.toLocaleString()} CFA`;
  if (totalElement) totalElement.textContent = `${total.toLocaleString()} CFA`;
}

function addPackageToCart() {
  if (packageBuilder.items.length === 0) {
    showToast("Please add items to your package first!", "error");
    return;
  }

  // Create package product
  const packageProduct = {
    id: Date.now(),
    name: `Custom Package (${packageBuilder.items.length} items)`,
    farmer: "Multiple Farmers",
    price: packageBuilder.totalPrice,
    originalPrice: packageBuilder.totalPrice + packageBuilder.discount,
    quantity: 1,
    unit: "package",
    description: `Custom package containing: ${packageBuilder.items
      .map((item) => `${item.name} (${item.quantity}${item.unit})`)
      .join(", ")}`,
    category: "packages",
    image: "🎁",
    quality: "A+",
    isPackage: true,
    discount: Math.round(
      (packageBuilder.discount /
        (packageBuilder.totalPrice + packageBuilder.discount)) *
        100,
    ),
    packageItems: packageBuilder.items.map(
      (item) => `${item.name} (${item.quantity} ${item.unit}) - ${item.farmer}`,
    ),
  };

  // Add to cart
  CartManager.addToCart(packageProduct.id, 1, packageProduct);

  // Clear package builder
  packageBuilder.items = [];
  packageBuilder.totalPrice = 0;
  packageBuilder.discount = 0;

  updatePackageDisplay();
  calculatePackagePrice();
  updateCartDisplay();

  showToast("Package added to cart!", "success");
}

function updateCartDisplay() {
  const cart = CartManager.getCart();
  const products = StorageManager.load("ecomarket_products") || [];
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = "0 CFA";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item) => {
      let product = products.find((p) => p.id == item.productId);

      // Handle custom packages
      if (!product && item.customProduct) {
        product = item.customProduct;
      }

      if (!product) return "";

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div class="item-details">
            <h4>${product.name}</h4>
            <p>by ${product.farmer}</p>
            <div class="item-price">${product.price.toLocaleString()} CFA per ${product.unit}</div>
          </div>
          <div class="quantity-controls">
            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">+</button>
          </div>
          <div class="item-total">${itemTotal.toLocaleString()} CFA</div>
          <button class="remove-item" onclick="removeFromCart(${item.productId})">×</button>
        </div>
      `;
    })
    .join("");

  cartTotal.textContent = `${total.toLocaleString()} CFA`;
}

function updateCartQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const products = StorageManager.load("ecomarket_products") || [];
  const product = products.find((p) => p.id == productId);

  if (product && newQuantity > product.quantity) {
    showToast("Not enough stock available!", "error");
    return;
  }

  CartManager.updateQuantity(productId, newQuantity);
  updateCartDisplay();
}

function removeFromCart(productId) {
  CartManager.removeFromCart(productId);
  updateCartDisplay();
}

function clearCart() {
  CartManager.clearCart();
  updateCartDisplay();
  showToast("Cart cleared!", "info");
}

function checkout() {
  const cart = CartManager.getCart();

  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  // Simulate checkout process
  const orderId = generateId();
  const products = StorageManager.load("ecomarket_products") || [];

  let total = 0;
  const orderItems = cart.map((item) => {
    let product = products.find((p) => p.id == item.productId);
    if (!product && item.customProduct) {
      product = item.customProduct;
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    return {
      productId: item.productId,
      productName: product.name,
      farmer: product.farmer,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    };
  });

  const order = {
    id: orderId,
    items: orderItems,
    total: total,
    status: "pending",
    date: new Date().toISOString(),
    customer: "Current User", // In real app, get from user session
  };

  // Save order
  const orders = StorageManager.load("ecomarket_orders") || [];
  orders.unshift(order);
  StorageManager.save("ecomarket_orders", orders);

  // Clear cart
  CartManager.clearCart();
  updateCartDisplay();

  showToast(`Order #${orderId} placed successfully!`, "success");

  // Optional: redirect to order confirmation page
  // window.location.href = `order-confirmation.html?id=${orderId}`;
}

function viewProductDetails(productId) {
  const product = currentProducts.find((p) => p.id == productId);

  if (!product) {
    showToast("Product not found!", "error");
    return;
  }

  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("productModalTitle");
  const modalContent = document.getElementById("productModalContent");

  if (!modal || !modalTitle || !modalContent) return;

  modalTitle.textContent = product.name;

  modalContent.innerHTML = `
    <div class="product-details-modal">
      <div class="product-image-large">
        <img src="${product.image}" alt="${product.name}">
        ${product.isPackage ? '<div class="package-badge">PACKAGE DEAL</div>' : ""}
      </div>
      <div class="product-info-detailed">
        <h3>${product.name}</h3>
        <p class="farmer-info">by ${product.farmer}</p>
        <div class="product-meta-detailed">
          <span class="quality-badge quality-${product.quality.replace("+", "plus")}">${product.quality}</span>
          <span class="stock-info">${product.quantity} ${product.unit} available</span>
        </div>
        <p class="product-description-full">${product.description}</p>

        ${
          product.isPackage
            ? `
          <div class="package-details">
            <h4>Package Contents:</h4>
            <ul>
              ${product.packageItems?.map((item) => `<li>${item}</li>`).join("") || ""}
            </ul>
            <div class="package-pricing-detailed">
              <div class="original-price">Original: ${product.originalPrice?.toLocaleString()} CFA</div>
              <div class="package-price">Package Price: ${product.price.toLocaleString()} CFA</div>
              <div class="savings">You Save: ${product.discount}%</div>
            </div>
          </div>
        `
            : `
          <div class="pricing-info">
            <div class="price-large">${product.price.toLocaleString()} CFA per ${product.unit}</div>
          </div>
        `
        }

        <div class="quantity-selector">
          <label for="modalQuantity">Quantity:</label>
          <div class="quantity-input">
            <button onclick="changeQuantity(-1)">-</button>
            <input type="number" id="modalQuantity" value="1" min="1" max="${product.quantity}">
            <button onclick="changeQuantity(1)">+</button>
          </div>
        </div>

        <div class="modal-actions">
          ${
            product.quantity > 0
              ? `
            <button class="btn btn-primary" onclick="addToCartFromModal(${product.id})">
              Add to Cart
            </button>
            <button class="btn btn-secondary" onclick="addToPackage(${product.id})">
              Add to Package
            </button>
          `
              : `
            <button class="btn btn-disabled" disabled>Out of Stock</button>
          `
          }
        </div>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function changeQuantity(change) {
  const quantityInput = document.getElementById("modalQuantity");
  if (quantityInput) {
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(
      1,
      Math.min(currentValue + change, parseInt(quantityInput.max)),
    );
    quantityInput.value = newValue;
  }
}

function addToCartFromModal(productId) {
  const quantityInput = document.getElementById("modalQuantity");
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  addToCart(productId, quantity);
  closeModal("productModal");
}

function toggleView(viewType) {
  const productsGrid = document.getElementById("productsGrid");
  const viewBtns = document.querySelectorAll(".view-btn");

  if (!productsGrid) return;

  // Update active button
  viewBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewType);
  });

  // Update grid class
  productsGrid.className =
    viewType === "list" ? "products-grid list-view" : "products-grid";
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add to page
  document.body.appendChild(toast);

  // Show and auto-remove
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// Close modals when clicking outside
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// Debounced search
const debouncedFilter = debounce(filterProducts, 300);

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
