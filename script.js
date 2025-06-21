const elements = {
  main: document.querySelector("main"),
  cartContainer: document.getElementById("cartContainer"),
  checkoutForm: document.getElementById("checkoutForm"),
  receipt: document.querySelector(".receipt"),
  themeToggle: document.getElementById("themeToggle"),
  searchInput: document.getElementById("searchBar"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortSelect: document.getElementById("sortPrice"),
  totalQty: document.getElementById("totalQty"),
  totalPrice: document.getElementById("totalPrice"),
};

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ========== LOGIN ========== //
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    const email = e.target.email.value;
    localStorage.setItem("user", JSON.stringify({ name, email }));
    window.location.href = "shop.html";
  });
}

// ========== Load User Info for Checkout ========== //
const user = JSON.parse(localStorage.getItem("user"));
if (user && document.getElementById("checkoutForm")) {
  document.querySelector("#checkoutForm input[type='text']").value = user.name;
  document.querySelector("#checkoutForm input[type='email']").value = user.email;
}

// ========== Fetch Products ========== //
async function fetchProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  const data = await res.json();
  products = data;
  renderProducts();
  populateCategoryFilter();
}

// ========== Render Products ========== //
function renderProducts() {
  const search = elements.searchInput?.value.toLowerCase() || "";
  const category = elements.categoryFilter?.value || "all";
  const sort = elements.sortSelect?.value;

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

// ========== Add to Cart ========== //
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const found = cart.find(i => i.id === id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  animateFly(product.image);
}

// ========== Fly Animation ========== //
function animateFly(imgSrc) {
  const img = document.createElement("img");
  img.src = imgSrc;
  img.className = "fly";
  document.body.appendChild(img);

  const cartBtn = document.querySelector("a[href='cart.html']") || document.getElementById("cartCount");
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

// ========== Render Cart Page ========== //
function renderCart() {
  if (!elements.cartContainer) return;

  if (cart.length === 0) {
    elements.cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    updateCartTotals();
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
  `).join("");

  updateCartTotals();
}

// ========== Update Cart Totals ========== //
function updateCartTotals() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  if (elements.totalQty) elements.totalQty.textContent = totalQty;
  if (elements.totalPrice) elements.totalPrice.textContent = totalPrice.toFixed(2);

  const cartCounter = document.getElementById("cartCount");
  if (cartCounter) cartCounter.textContent = totalQty;
}

// ========== Change Quantity ========== //
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ========== Remove Item ========== //
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ========== Checkout Submission ========== //
if (elements.checkoutForm) {
  elements.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty.");

    const name = e.target[0].value;
    const email = e.target[1].value;
    const address = e.target[2].value;

    // Show receipt
    elements.receipt.classList.remove("hidden");
    elements.receipt.innerHTML = `
      <div class="bill">
        <h2>🧾 Receipt</h2>
        <hr>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr>
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
        <hr>
        <div class="bill-total">
          <strong>Total Paid:</strong> $${getTotal().toFixed(2)}
        </div>
        <p class="thankyou">Thank you, ${name}, for shopping with us! 🛍️</p>
        <button onclick="window.print()">🖨️ Print Receipt</button>
      </div>
    `;

    cart = [];
    localStorage.removeItem("cart");
    renderCart?.();
    e.target.reset();
  });
}

// ========== Get Total ========== //
function getTotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

// ========== Populate Categories ========== //
function populateCategoryFilter() {
  if (!elements.categoryFilter) return;
  const cats = [...new Set(products.map(p => p.category))];
  elements.categoryFilter.innerHTML = `<option value="all">All</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ========== Theme Toggle ========== //
elements.themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ========== Filter Events ========== //
elements.searchInput?.addEventListener("input", renderProducts);
elements.categoryFilter?.addEventListener("change", renderProducts);
elements.sortSelect?.addEventListener("change", renderProducts);

// ========== Initial Load ========== //
if (elements.main) fetchProducts();
if (elements.cartContainer) renderCart();
updateCartCounter();

// ========== Update Cart Icon ========== //
function updateCartCounter() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = totalQty;
}
