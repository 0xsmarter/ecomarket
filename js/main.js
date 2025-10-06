// Main JavaScript file for EcoMarket
document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navigation
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((n) =>
      n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }),
    );
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Stats counter animation
  function animateStats() {
    const stats = document.querySelectorAll(".stat-number");

    stats.forEach((stat) => {
      const target = parseInt(stat.getAttribute("data-target"));
      const increment = target / 200;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current).toLocaleString();
        }
      }, 10);
    });
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("stats")) {
          animateStats();
        }
        entry.target.classList.add("fade-in");
      }
    });
  }, observerOptions);

  // Observe sections for animations
  document
    .querySelectorAll(".features, .stats, .process, .cta")
    .forEach((section) => {
      observer.observe(section);
    });

  // Enhanced header scroll effect with backdrop blur
  window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.backdropFilter = "blur(25px)";
      header.style.webkitBackdropFilter = "blur(25px)";
      header.style.boxShadow =
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    } else {
      header.classList.remove("scrolled");
      header.style.background = "rgba(255, 255, 255, 0.95)";
      header.style.backdropFilter = "blur(20px)";
      header.style.webkitBackdropFilter = "blur(20px)";
      header.style.boxShadow =
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
    }
  });

  // Mobile menu functionality
  // Mobile menu elements are already declared above, no need to redeclare
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      hamburger.classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
      }
    });
  }

  // Feature cards hover effects
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Dynamic greeting based on time
  function setGreeting() {
    const greetingElement = document.querySelector(".dynamic-greeting");
    if (greetingElement) {
      const hour = new Date().getHours();
      let greeting = "Welcome to";

      if (hour < 12) {
        greeting = "Good morning! Welcome to";
      } else if (hour < 18) {
        greeting = "Good afternoon! Welcome to";
      } else {
        greeting = "Good evening! Welcome to";
      }

      greetingElement.textContent = greeting;
    }
  }

  setGreeting();

  // Form validation utility
  window.validateForm = function (formElement) {
    let isValid = true;
    const requiredFields = formElement.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("error");
        isValid = false;
      } else {
        field.classList.remove("error");
      }
    });

    return isValid;
  };

  // Toast notification system
  window.showToast = function (message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
                <span class="toast-message">${message}</span>
                <span class="toast-close" onclick="this.parentElement.parentElement.remove()">×</span>
            </div>
        `;

    // Add toast styles if not already added
    if (!document.querySelector("#toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "toast-styles";
      styles.innerHTML = `
                .toast {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    z-index: 3000;
                    max-width: 400px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    animation: slideInRight 0.3s ease-out;
                }
                .toast-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .toast-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .toast-info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
                .toast-content {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                }
                .toast-icon { margin-right: 10px; }
                .toast-message { flex: 1; font-weight: 500; }
                .toast-close {
                    margin-left: 10px;
                    cursor: pointer;
                    font-weight: bold;
                    opacity: 0.7;
                }
                .toast-close:hover { opacity: 1; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  // Local storage utilities for data persistence
  window.StorageManager = {
    save: function (key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error("Error saving to localStorage:", e);
        return false;
      }
    },

    load: function (key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.error("Error loading from localStorage:", e);
        return null;
      }
    },

    remove: function (key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error("Error removing from localStorage:", e);
        return false;
      }
    },
  };

  // Initialize sample data if not exists
  if (!StorageManager.load("ecomarket_products")) {
    const sampleProducts = [
      {
        id: 1,
        name: "Organic Tomatoes",
        farmer: "John Smith Farm",
        price: 2000,
        quantity: 100,
        unit: "kg",
        description: "Fresh organic tomatoes grown without pesticides",
        category: "vegetables",
        image: "🍅",
        quality: "A+",
        isPackage: false,
      },
      {
        id: 2,
        name: "Fresh Strawberries",
        farmer: "Berry Paradise",
        price: 3500,
        quantity: 50,
        unit: "kg",
        description: "Sweet and juicy strawberries picked fresh daily",
        category: "fruits",
        image: "🍓",
        quality: "A+",
        isPackage: false,
      },
      {
        id: 3,
        name: "Green Vegetables Bundle",
        farmer: "Green Valley Farm",
        price: 10000,
        originalPrice: 15000,
        quantity: 20,
        unit: "bundle",
        description:
          "Mixed bundle of fresh green vegetables: spinach, lettuce, broccoli, and green beans",
        category: "vegetables",
        image: "🥬",
        quality: "A+",
        isPackage: true,
        discount: 30,
        packageItems: [
          "Spinach (2kg)",
          "Lettuce (1kg)",
          "Broccoli (1.5kg)",
          "Green Beans (1kg)",
        ],
      },
    ];
    StorageManager.save("ecomarket_products", sampleProducts);
  }

  if (!StorageManager.load("ecomarket_orders")) {
    StorageManager.save("ecomarket_orders", []);
  }

  if (!StorageManager.load("ecomarket_cart")) {
    StorageManager.save("ecomarket_cart", []);
  }

  // Cart functionality
  window.CartManager = {
    addToCart: function (productId, quantity = 1, customProduct = null) {
      const products = StorageManager.load("ecomarket_products") || [];
      const cart = StorageManager.load("ecomarket_cart") || [];

      let product = products.find((p) => p.id == productId);

      // Handle custom products (like packages)
      if (!product && customProduct) {
        product = customProduct;
      } else if (!product) {
        showToast("Product not found!", "error");
        return false;
      }

      const existingItem = cart.find((item) => item.productId == productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        if (customProduct) {
          existingItem.customProduct = customProduct;
        }
      } else {
        const cartItem = {
          productId: productId,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        };

        if (customProduct) {
          cartItem.customProduct = customProduct;
        }

        cart.push(cartItem);
      }

      StorageManager.save("ecomarket_cart", cart);
      updateCartBadge();
      showToast(`${product.name} added to cart!`, "success");
      return true;
    },

    updateQuantity: function (productId, newQuantity) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
        return;
      }

      const cart = StorageManager.load("ecomarket_cart") || [];
      const item = cart.find((item) => item.productId == productId);

      if (item) {
        item.quantity = newQuantity;
        StorageManager.save("ecomarket_cart", cart);
        updateCartBadge();
      }
    },

    removeFromCart: function (productId) {
      const cart = StorageManager.load("ecomarket_cart") || [];
      const updatedCart = cart.filter((item) => item.productId != productId);
      StorageManager.save("ecomarket_cart", updatedCart);
      updateCartBadge();
    },

    getCart: function () {
      return StorageManager.load("ecomarket_cart") || [];
    },

    clearCart: function () {
      StorageManager.save("ecomarket_cart", []);
      updateCartBadge();
    },
  };

  function updateCartBadge() {
    const cart = CartManager.getCart();
    const badge = document.querySelector(".cart-badge");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? "block" : "none";
    }
  }

  // Initialize cart badge
  updateCartBadge();

  // Search functionality
  window.searchProducts = function (query, category = "all") {
    const products = StorageManager.load("ecomarket_products") || [];
    query = query.toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.farmer.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesQuery && matchesCategory;
    });
  };

  // Product filtering and sorting
  window.sortProducts = function (products, sortBy) {
    return products.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "farmer":
          return a.farmer.localeCompare(b.farmer);
        default:
          return 0;
      }
    });
  };

  // Modal functionality
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // Close modal when clicking outside
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Image upload preview
  window.previewImage = function (input, previewId) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById(previewId);
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Format currency
  window.formatCurrency = function (amount) {
    return amount.toLocaleString() + " CFA";
  };

  // Format date
  window.formatDate = function (dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Generate unique ID
  window.generateId = function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Debounce function for search
  window.debounce = function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Loading states
  window.showLoading = function (element) {
    if (element) {
      element.innerHTML = '<div class="loading"></div>';
      element.disabled = true;
    }
  };

  window.hideLoading = function (element, originalContent) {
    if (element) {
      element.innerHTML = originalContent;
      element.disabled = false;
    }
  };

  // Print function
  window.printPage = function () {
    window.print();
  };

  // Export data function
  window.exportData = function (data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    link.click();
  };

  // Initialize page-specific functionality
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  switch (currentPage) {
    case "index.html":
    case "":
      // Homepage specific initialization
      setTimeout(() => {
        document.querySelectorAll(".hero-content").forEach((el) => {
          el.classList.add("slide-in");
        });
      }, 500);
      break;

    case "marketplace.html":
      // Marketplace specific initialization
      if (typeof initializeMarketplace === "function") {
        initializeMarketplace();
      }
      break;

    case "farmer-dashboard.html":
      // Farmer dashboard specific initialization
      if (typeof initializeFarmerDashboard === "function") {
        initializeFarmerDashboard();
      }
      break;

    case "buyer-dashboard.html":
      // Buyer dashboard specific initialization
      if (typeof initializeBuyerDashboard === "function") {
        initializeBuyerDashboard();
      }
      break;
  }

  // Log initialization
  console.log("EcoMarket JavaScript initialized successfully!");
});

// Service Worker registration for PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("SW registered: ", registration);
      })
      .catch(function (registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
