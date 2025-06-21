const elements = {
    main: document.getElementById("productContainer"),
    cartContainer: document.getElementById("cartContainer"),
    checkoutForm: document.getElementById("checkoutForm"),
    receipt: document.querySelector(".receipt"),
    themeToggle: document.getElementById("themeToggle"),
    searchInput: document.getElementById("searchBar"),
    categoryFilter: document.getElementById("categoryFilter"),
    sortSelect: document.getElementById("sortPrice"),
  };
  
  let products = [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Fetch products from API
  async function fetchProducts() {
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      products = data;
      renderProducts();
      populateCategoryFilter();
    } catch (err) {
      elements.main.innerHTML = "<p>⚠️ Failed to load products. Try again later.</p>";
    }
  }

  // ==== LOGIN PAGE SCRIPT ====

if (document.getElementById("loginForm")) {
    const user = JSON.parse(localStorage.getItem("user"));
  
    document.getElementById("loginForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const user = {
        name: document.getElementById("loginName").value.trim(),
        email: document.getElementById("loginEmail").value.trim(),
        address: document.getElementById("loginAddress").value.trim()
      };
      localStorage.setItem("user", JSON.stringify(user));
      alert("Login successful! Redirecting to shop...");
      window.location.href = "shop.html";
    });
  }
  
  
  // Render product cards
  function renderProducts() {
    const search = elements.searchInput?.value.toLowerCase() || "";
    const category = elements.categoryFilter?.value || "all";
    const sort = elements.sortSelect?.value || "default";
  
    let filtered = products.filter(p =>
      p.title.toLowerCase().includes(search) &&
      (category === "all" || p.category === category)
    );
  
    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  
    elements.main.innerHTML = filtered.map(p => `
      <div class="product">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="rating">⭐ ${p.rating.rate} (${p.rating.count})</div>
        <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
      </div>
    `).join("");
  }
  
  // Add product to cart
  function addToCart(id) {
    const product = products.find(p => p.id === id);
    const found = cart.find(i => i.id === id);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    animateFly(product.image);
  }
  
  // Cart fly-to animation
  function animateFly(imgSrc) {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.className = "fly";
    document.body.appendChild(img);
  
    const cartBtn = document.querySelector("a[href='cart.html']");
    const rect = cartBtn.getBoundingClientRect();
    img.style.top = "100px";
    img.style.left = "100px";
    setTimeout(() => {
      img.style.top = `${rect.top}px`;
      img.style.left = `${rect.left}px`;
      img.style.opacity = 0;
    }, 10);
  
    setTimeout(() => img.remove(), 800);
  }
  
  // Display cart items
  function renderCart() {
    if (!elements.cartContainer) return;
  
    if (cart.length === 0) {
      elements.cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      updateCartSummary(); // <== important!
      return;
    }
  
    elements.cartContainer.innerHTML = cart.map(item => `
      <div class="cartItem">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <h4>${item.title}</h4>
          <p>$${item.price.toFixed(2)}</p>
        </div>
        <div class="qtyCtr">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
          <button onclick="removeItem(${item.id})">🗑️</button>
        </div>
      </div>
    `).join("") + `
      <div class="cartSummary">
        <strong>Total:</strong> $${getTotal().toFixed(2)}
      </div>
    `;
  
    updateCartSummary();
  }
  
  
  // Change item quantity
  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
  
  // Remove item from cart
  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
  
  // Calculate cart total
  function getTotal() {
    return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  }
  
  // Populate category dropdown
  function populateCategoryFilter() {
    if (!elements.categoryFilter) return;
    const cats = [...new Set(products.map(p => p.category))];
    elements.categoryFilter.innerHTML = `<option value="all">All Categories</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join("");
  }
  
  // Handle checkout form submission
  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      if (cart.length === 0) {
        return alert("Your cart is empty.");
      }
  
      const name = e.target.name.value;
      const email = e.target.email.value;
      const address = e.target.address.value;
  
      elements.receipt.classList.remove("hidden");
     
      const receiptHTML = `
  <h2>🧾 Receipt</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Address:</strong> ${address}</p>
  <table class="bill-table">
    <thead>
      <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${cart.map(item => `
        <tr>
          <td>${item.title}</td>
          <td>${item.qty}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.qty * item.price).toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <p class="thankyou">Thank you, ${name}!</p>
`;

openReceiptInNewTab(receiptHTML);

  
      cart = [];
      localStorage.removeItem("cart");
      renderCart?.();
      e.target.reset();
    });
  }
  
  // Autofill checkout form with stored user info
if (elements.checkoutForm) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      elements.checkoutForm.name.value = user.name;
      elements.checkoutForm.email.value = user.email;
      elements.checkoutForm.address.value = user.address;
    }
  
    elements.checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (cart.length === 0) return alert("Your cart is empty.");
  
      const name = e.target.name.value;
      const email = e.target.email.value;
      const address = e.target.address.value;
  
      // Optional: Save info again to localStorage
      const userInfo = { name, email, address };
      localStorage.setItem("user", JSON.stringify(userInfo));
  
      // Show receipt
      const receipt = document.getElementById("receipt");
      receipt.classList.remove("hidden");
      receipt.innerHTML = `
        <div class="bill">
          <h2>🧾 Receipt</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Address:</strong> ${address}</p>
          <table class="bill-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.qty}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <p><strong>Total Paid:</strong> $${getTotal().toFixed(2)}</p>
          <p class="thankyou">Thank you, ${name}, for your purchase!</p>
          <button onclick="window.print()">🖨️ Print Receipt</button>
        </div>
      `;
  
      cart = [];
      localStorage.removeItem("cart");
      renderCart();
      e.target.reset();
    });
  }
  
  // Logout function
  function logout() {
    localStorage.removeItem("user");
    alert("Logged out successfully.");
    window.location.href = "login.html";
  }
  
  
  // Update cart count in header
  function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      const total = cart.reduce((sum, item) => sum + item.qty, 0);
      cartCount.textContent = total;
    }
  }

  function updateCartSummary() {
    const qtySpan = document.getElementById("totalQty");
    const priceSpan = document.getElementById("totalPrice");
  
    if (!qtySpan || !priceSpan) return;
  
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  
    qtySpan.textContent = totalQty;
    priceSpan.textContent = totalPrice.toFixed(2);
  }
  
  
  // Dark/light theme toggle
  elements.themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
  
  // Filter/search/sort listeners
  elements.searchInput?.addEventListener("input", renderProducts);
  elements.categoryFilter?.addEventListener("change", renderProducts);
  elements.sortSelect?.addEventListener("change", renderProducts);
  
  //recipt
  function openReceiptInNewTab(receiptHTML) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .bill-table {
            width: 100%;
            border-collapse: collapse;
          }
          .bill-table th, .bill-table td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }
          .thankyou { margin-top: 20px; color: #007bff; font-style: italic; }
        </style>
      </head>
      <body onload="window.print()">
        ${receiptHTML}
      </body>
      </html>
    `);
    newWindow.document.close();
  }
  
  // Initial setup
  if (elements.main) fetchProducts();
  if (elements.cartContainer) renderCart();
  updateCartCount();
  
