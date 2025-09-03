const CART_KEY = 'ls_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartCount();
}
function renderCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = getCart().reduce((s, it) => s + it.qty, 0);
}
function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(it => it.productId === product.id);
  if (idx === -1) cart.push({ productId: product.id, name: product.name, price: product.price, image: product.image, qty });
  else cart[idx].qty += qty;
  saveCart(cart);
}
function updateQty(productId, qty) {
  const cart = getCart();
  const idx = cart.findIndex(it => it.productId === productId);
  if (idx !== -1) {
    cart[idx].qty = Math.max(1, Number(qty));
    saveCart(cart);
  }
}
function removeFromCart(productId) {
  const cart = getCart().filter(it => it.productId !== productId);
  saveCart(cart);
}
function clearCart() {
  saveCart([]);
}
document.addEventListener('DOMContentLoaded', renderCartCount);
