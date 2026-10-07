
// THE ROYAL FEAST - DEMO RESTAURANT WEBSITE


const defaultMenu = [
  {id:1,name:"Paneer Tikka",category:"Starters",price:220,image:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600"},
  {id:2,name:"Veg Spring Rolls",category:"Starters",price:180,image:"https://images.unsplash.com/photo-1544025162-d76694265947?w=600"},
  {id:3,name:"Chicken Tandoori",category:"Starters",price:350,image:"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600"},
  {id:4,name:"Veg Biryani",category:"Main Course",price:260,image:"https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600"},
  {id:5,name:"Butter Chicken",category:"Main Course",price:390,image:"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600"},
  {id:6,name:"Paneer Butter Masala",category:"Main Course",price:290,image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600"},
  {id:7,name:"Chocolate Brownie",category:"Desserts",price:160,image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600"},
  {id:8,name:"Gulab Jamun",category:"Desserts",price:100,image:"https://images.unsplash.com/photo-1666190092159-4d1e5a9a8f83?w=600"},
  {id:9,name:"Fresh Lime Soda",category:"Drinks",price:90,image:"https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?w=600"},
  {id:10,name:"Mango Shake",category:"Drinks",price:150,image:"https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600"}
];

const defaultWaiters = [
  {id:"W001",name:"Rahul Sharma",table:"Table 1",status:"Available"},
  {id:"W002",name:"Priya Kumar",table:"Table 2",status:"Busy"},
  {id:"W003",name:"Arjun Rao",table:"Table 3",status:"Available"},
  {id:"W004",name:"Sneha Patil",table:"Table 4",status:"Off Duty"}
];

const defaultReviews = [
  {id:1,name:"Aarav",rating:5,text:"Amazing food and wonderful service!"},
  {id:2,name:"Ananya",rating:4,text:"Beautiful ambience and delicious biryani."},
  {id:3,name:"Kiran",rating:5,text:"A lovely place for family dining."}
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

let menu = loadData("rf_menu", defaultMenu);
let waiters = loadData("rf_waiters", defaultWaiters);
let reviews = loadData("rf_reviews", defaultReviews);
let orders = loadData("rf_orders", []);
let cart = [];
let currentFilter = "All";
let loggedIn = false;

function saveData() {
  localStorage.setItem("rf_menu", JSON.stringify(menu));
  localStorage.setItem("rf_waiters", JSON.stringify(waiters));
  localStorage.setItem("rf_reviews", JSON.stringify(reviews));
  localStorage.setItem("rf_orders", JSON.stringify(orders));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  })[char]);
}

// MENU
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const items = currentFilter === "All"
    ? menu
    : menu.filter(item => item.category === currentFilter);

  grid.innerHTML = items.map(item => `
    <article class="menu-card">
      <img src="${escapeHTML(item.image || "https://images.unsplash.com/photo-1547592180-85f173990554?w=600")}"
           alt="${escapeHTML(item.name)}"
           onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=600'">
      <div class="menu-info">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${escapeHTML(item.category)}</p>
        <div class="menu-bottom">
          <span class="price">₹${Number(item.price).toLocaleString("en-IN")}</span>
          <button class="add-btn" onclick="addToCart(${Number(item.id)})">Add +</button>
        </div>
      </div>
    </article>
  `).join("") || "<p>No dishes available in this category.</p>";
}

function filterMenu(category, button) {
  currentFilter = category;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  renderMenu();
}

function addToCart(id) {
  const item = menu.find(dish => dish.id === id);
  if (!item) return;

  const existing = cart.find(dish => dish.id === id);
  if (existing) existing.quantity++;
  else cart.push({...item, quantity:1});

  renderCart();
}

// CART
function renderCart() {
  const container = document.getElementById("cartItems");

  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty. Explore our menu to add dishes.</p>";
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>₹${item.price} × ${item.quantity}</small>
        </div>
        <div>
          <strong>₹${item.price * item.quantity}</strong>
          <button class="delete-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `).join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cartTotal").textContent = total.toLocaleString("en-IN");
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function placeOrder() {
  if (!cart.length) {
    document.getElementById("orderMessage").textContent = "Please add a dish before placing an order.";
    return;
  }

  const order = {
    id: Date.now(),
    items: cart.map(item => ({name:item.name, quantity:item.quantity, price:item.price})),
    total: cart.reduce((sum,item) => sum + item.price * item.quantity, 0),
    status: "Pending",
    date: new Date().toLocaleString()
  };

  orders.unshift(order);
  saveData();
  cart = [];
  renderCart();
  document.getElementById("orderMessage").textContent =
    `Demo order #${order.id.toString().slice(-6)} placed successfully!`;
  if (loggedIn) refreshDashboard();
}

// WAITERS
function renderWaiters() {
  document.getElementById("waiterGrid").innerHTML = waiters.map(waiter => `
    <div class="waiter-card">
      <div class="waiter-avatar">👨‍🍳</div>
      <h3>${escapeHTML(waiter.name)}</h3>
      <p>ID: ${escapeHTML(waiter.id)}</p>
      <p>${escapeHTML(waiter.table)}</p>
      <p class="${waiter.status === "Available" ? "status" : ""}">
        ${escapeHTML(waiter.status)}
      </p>
    </div>
  `).join("") || "<p>Waiter details will be available soon.</p>";
}

function addWaiter() {
  const name = document.getElementById("newWaiter").value.trim();
  const id = document.getElementById("newWaiterId").value.trim();
  const table = document.getElementById("newTable").value.trim();
  const status = document.getElementById("newStatus").value;

  if (!name || !id || !table) {
    alert("Please fill in the waiter name, ID and table.");
    return;
  }
  if (waiters.some(w => w.id.toLowerCase() === id.toLowerCase())) {
    alert("This waiter ID already exists.");
    return;
  }

  waiters.push({name,id,table,status});
  saveData();
  ["newWaiter","newWaiterId","newTable"].forEach(id => document.getElementById(id).value = "");
  renderWaiters();
  renderAdminWaiters();
}

// REVIEWS
function renderReviews() {
  document.getElementById("reviewsList").innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}</div>
      <p>${escapeHTML(review.text)}</p>
      <strong>${escapeHTML(review.name)}</strong>
    </div>
  `).join("") || "<p>No reviews yet.</p>";
}

function submitReview() {
  const name = document.getElementById("reviewName").value.trim();
  const text = document.getElementById("reviewText").value.trim();
  const rating = Number(document.getElementById("reviewRating").value);

  if (!name || !text) {
    alert("Please enter your name and review.");
    return;
  }

  reviews.unshift({id:Date.now(),name,text,rating});
  saveData();
  document.getElementById("reviewName").value = "";
  document.getElementById("reviewText").value = "";
  renderReviews();
  if (loggedIn) refreshDashboard();
  alert("Thank you for your review!");
}

// ADMIN LOGIN
function showAdmin() {
  document.getElementById("adminOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeAdmin() {
  document.getElementById("adminOverlay").classList.remove("show");
  document.body.style.overflow = "";
}
function adminLogin() {
  const username = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;

  // Demo-only credentials. Not secure for real deployment.
  if (username === "admin" && password === "feast123") {
    loggedIn = true;
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    refreshDashboard();
  } else {
    document.getElementById("loginError").textContent = "Incorrect username or password.";
  }
}
function adminLogout() {
  loggedIn = false;
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";
  document.getElementById("loginError").textContent = "";
}

// ADMIN TABS
function showTab(tabId, button) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabId).classList.remove("hidden");
  button.classList.add("active");
}

// ADMIN MENU
function addDish() {
  const name = document.getElementById("newDish").value.trim();
  const price = Number(document.getElementById("newPrice").value);
  const category = document.getElementById("newCategory").value;
  const image = document.getElementById("newImage").value.trim();

  if (!name || !Number.isFinite(price) || price <= 0) {
    alert("Enter a valid dish name and price.");
    return;
  }

  menu.push({
    id:Date.now(),
    name,price,category,
    image:image || "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
  });

  saveData();
  ["newDish","newPrice","newImage"].forEach(id => document.getElementById(id).value = "");
  renderMenu();
  renderAdminMenu();
  refreshDashboard();
}

function deleteDish(id) {
  if (!confirm("Delete this dish?")) return;
  menu = menu.filter(item => item.id !== id);
  cart = cart.filter(item => item.id !== id);
  saveData();
  renderMenu();
  renderCart();
  renderAdminMenu();
  refreshDashboard();
}

function renderAdminMenu() {
  document.getElementById("adminMenuList").innerHTML = menu.map(item => `
    <div class="admin-list-row">
      <div><strong>${escapeHTML(item.name)}</strong>
      <small>${escapeHTML(item.category)} · ₹${item.price}</small></div>
      <button class="delete-btn" onclick="deleteDish(${item.id})">Delete</button>
    </div>
  `).join("") || "<p>No menu items.</p>";
}

// ADMIN WAITERS
function renderAdminWaiters() {
  document.getElementById("adminWaiterList").innerHTML = waiters.map(waiter => `
    <div class="admin-list-row">
      <div>
        <strong>${escapeHTML(waiter.name)}</strong>
        <small>${escapeHTML(waiter.id)} · ${escapeHTML(waiter.table)}</small>
      </div>
      <div>
        <select class="order-status" onchange="changeWaiterStatus('${escapeHTML(waiter.id)}', this.value)">
          ${["Available","Busy","Off Duty"].map(status =>
            `<option ${waiter.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
        <button class="delete-btn" onclick="deleteWaiter('${escapeHTML(waiter.id)}')">Delete</button>
      </div>
    </div>
  `).join("") || "<p>No waiters listed.</p>";
}

function changeWaiterStatus(id, status) {
  const waiter = waiters.find(w => w.id === id);
  if (!waiter) return;
  waiter.status = status;
  saveData();
  renderWaiters();
}

function deleteWaiter(id) {
  if (!confirm("Remove this waiter?")) return;
  waiters = waiters.filter(w => w.id !== id);
  saveData();
  renderWaiters();
  renderAdminWaiters();
}

// ADMIN ORDERS
function renderOrders() {
  const html = orders.map(order => `
    <div class="admin-list-row">
      <div>
        <strong>Order #${String(order.id).slice(-6)}</strong>
        <small>${escapeHTML(order.date)} · ${order.items.map(item =>
          `${escapeHTML(item.name)} × ${item.quantity}`
        ).join(", ")}</small>
        <small>Total: ₹${order.total}</small>
      </div>
      <select class="order-status" onchange="changeOrderStatus(${order.id}, this.value)">
        ${["Pending","Preparing","Completed","Cancelled"].map(status =>
          `<option ${order.status === status ? "selected" : ""}>${status}</option>`
        ).join("")}
      </select>
    </div>
  `).join("") || "<p>No orders have been placed.</p>";

  document.getElementById("allOrders").innerHTML = html;
  document.getElementById("recentOrders").innerHTML = orders.slice(0,5).map(order =>
    `<div class="admin-list-row">
      <div><strong>Order #${String(order.id).slice(-6)}</strong>
      <small>${escapeHTML(order.status)} · ₹${order.total}</small></div>
    </div>`
  ).join("") || "<p>No recent orders.</p>";
}

function changeOrderStatus(id, status) {
  const order = orders.find(order => order.id === id);
  if (!order) return;
  order.status = status;
  saveData();
  renderOrders();
  refreshDashboard();
}

// ADMIN REVIEWS
function renderAdminReviews() {
  document.getElementById("adminReviews").innerHTML = reviews.map(review => `
    <div class="admin-list-row">
      <div>
        <strong>${escapeHTML(review.name)} · ${"★".repeat(review.rating)}</strong>
        <small>${escapeHTML(review.text)}</small>
      </div>
      <button class="delete-btn" onclick="deleteReview(${review.id})">Delete</button>
    </div>
  `).join("") || "<p>No reviews yet.</p>";
}

function deleteReview(id) {
  if (!confirm("Delete this review?")) return;
  reviews = reviews.filter(review => review.id !== id);
  saveData();
  renderReviews();
  renderAdminReviews();
  refreshDashboard();
}

// DASHBOARD
function refreshDashboard() {
  document.getElementById("statOrders").textContent = orders.length;
  const revenue = orders
    .filter(order => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  document.getElementById("statRevenue").textContent =
    "₹" + revenue.toLocaleString("en-IN");
  document.getElementById("statMenu").textContent = menu.length;
  document.getElementById("statReviews").textContent = reviews.length;

  renderOrders();
  renderAdminMenu();
  renderAdminWaiters();
  renderAdminReviews();
}

// INITIALIZE
renderMenu();
renderCart();
renderWaiters();
renderReviews();