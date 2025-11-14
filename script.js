/* script.js - product data + site logic */

/* ---------- Sample product data ----------
   Put images in assets/images/product1.jpg etc.
   id must be unique strings or numbers.
--------------------------------------------*/
const PRODUCTS = [
  {id: "1", title: "Blue Hoodie", price: 799, img: "product1.jpg", desc: "Comfortable cotton hoodie."},
  {id: "2", title: "White Sneaker", price: 1299, img: "assets/images/product2.jpg", desc: "Lightweight casual sneakers."},
  {id: "3", title: "Smart Watch", price: 2499, img: "assets/images/product3.jpg", desc: "Track your fitness and notifications."},
  {id: "4", title: "Backpack", price: 899, img: "assets/images/product4.jpg", desc: "Durable backpack with laptop sleeve."},
  {id: "5", title: "Sunglasses", price: 399, img: "assets/images/product5.jpg", desc: "Stylish UV-protection sunglasses."},
  {id: "6", title: "Wireless Earbuds", price: 1599, img: "assets/images/product6.jpg", desc: "Noise-isolating earbuds with charging case."},
  {id: "7", title: "Wireless mic", price: 199, img: "assets/images/product6.jpg", desc: "Noise-isolating mic with charging case."},
];

/* ---------- Utils ---------- */
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}
function money(n){ return "₱" + Number(n).toLocaleString() }

/* ---------- NAV toggle ---------- */
document.addEventListener("click", (e)=>{
  if(e.target.matches(".menu-btn")) {
    qs(".nav-links").classList.toggle("active");
  }
});

/* ---------- CART functions ---------- */
function getCart(){ return JSON.parse(localStorage.getItem("cart")||"[]") }
function saveCart(c){ localStorage.setItem("cart", JSON.stringify(c)) }

function addToCart(productId){
  const prod = PRODUCTS.find(p=>p.id==productId);
  if(!prod){ alert("Product not found"); return; }
  const cart = getCart();
  const item = cart.find(i=>i.id==productId);
  if(item) item.qty++;
  else cart.push({id:productId, qty:1});
  saveCart(cart);
  updateCartCount();
  alert(`${prod.title} added to cart`);
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  const badge = qs(".cart-count");
  if(badge) badge.textContent = count;
}

/* render products list (for products.html) */
function renderProductGrid(){
  const wrap = qs("#product-grid");
  if(!wrap) return;
  wrap.innerHTML = PRODUCTS.map(p=>`
    <div class="card">
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <div class="price">${money(p.price)}</div>
      <div class="actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

/* render single product (for product.html?id=) */
function renderProductDetail(){
  const el = qs("#product-detail");
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(x=>x.id==id);
  if(!p){ el.innerHTML = "<p>Product not found.</p>"; return; }
  el.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
      <div><img src="${p.img}" style="width:100%; border-radius:8px;"></div>
      <div>
        <h2>${p.title}</h2>
        <div class="price">${money(p.price)}</div>
        <p>${p.desc}</p>
        <div style="margin-top:12px">
          <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
          <a href="products.html" style="margin-left:10px">Back to products</a>
        </div>
      </div>
    </div>
  `;
}

/* render cart page (cart.html) */
function renderCartPage(){
  const el = qs("#cart-items");
  if(!el) return;
  const cart = getCart();
  if(cart.length===0){ el.innerHTML = "<p>Your cart is empty.</p>"; qs("#cart-total").textContent = money(0); return; }
  let html = `<table class="table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>`;
  let total = 0;
  cart.forEach(item=>{
    const p = PRODUCTS.find(x=>x.id==item.id);
    const sub = p.price * item.qty;
    total += sub;
    html += `<tr data-id="${item.id}">
      <td style="display:flex; gap:10px; align-items:center">
        <img src="${p.img}" style="width:64px; height:48px; object-fit:cover; border-radius:6px">
        <div>${p.title}</div>
      </td>
      <td>${money(p.price)}</td>
      <td><input class="qty-input" type="number" min="1" value="${item.qty}" data-id="${item.id}"></td>
      <td>${money(sub)}</td>
      <td><button onclick="removeFromCart('${item.id}')">Remove</button></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  el.innerHTML = html;
  qs("#cart-total").textContent = money(total);

  // bind qty changes
  qsa(".qty-input").forEach(inp=>{
    inp.addEventListener("change", (e)=>{
      const id = e.target.dataset.id;
      let val = parseInt(e.target.value)||1;
      updateQuantity(id, val);
      renderCartPage();
      updateCartCount();
    });
  });
}

function updateQuantity(id, qty){
  const cart = getCart();
  const item = cart.find(i=>i.id==id);
  if(!item) return;
  if(qty<=0) qty = 1;
  item.qty = qty;
  saveCart(cart);
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i=>i.id!=id);
  saveCart(cart);
  renderCartPage();
  updateCartCount();
}

/* checkout form validation (checkout.html) */
function handleCheckoutSubmit(e){
  e.preventDefault();
  const name = qs("#name").value.trim();
  const email = qs("#email").value.trim();
  const addr = qs("#address").value.trim();
  const cart = getCart();
  if(!name || !email || !addr){ alert("Please fill all required fields."); return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ alert("Please enter a valid email."); return; }
  if(cart.length===0){ alert("Your cart is empty."); return; }

  // pretend to submit
  const total = cart.reduce((s,i)=>{
    const p = PRODUCTS.find(x=>x.id==i.id);
    return s + (p.price * i.qty);
  }, 0);

  // clear cart
  localStorage.removeItem("cart");
  updateCartCount();
  qs("#checkout-form").reset();
  qs("#checkout-result").innerHTML = `<div style="padding:16px; background:#eaffea; border-radius:8px">Order placed successfully! Total: ${money(total)}. A confirmation email will be sent to ${email}.</div>`;
  renderCartPage();
}

/* PAGE INIT */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  renderProductGrid();
  renderProductDetail();
  renderCartPage();

  // bind checkout form if present
  const form = qs("#checkout-form");
  if(form) form.addEventListener("submit", handleCheckoutSubmit);

  // contact form basic validation (contact.html)
  const contactForm = qs("#contact-form");
  if(contactForm){
    contactForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      const nm = qs("#contact-name").value.trim();
      const em = qs("#contact-email").value.trim();
      const msg = qs("#contact-msg").value.trim();
      if(!nm || !em || !msg){ alert("Please fill all fields."); return; }
      alert("Message sent. (This is a demo site — messages are not actually sent.)");
      contactForm.reset();
    });
  }
});

