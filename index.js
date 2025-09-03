const productsEl = document.getElementById('products');
const qEl = document.getElementById('search');
const catEl = document.getElementById('category');
const sortEl = document.getElementById('sort');
const applyBtn = document.getElementById('apply');

async function loadProducts() {
  const params = {
    q: qEl.value.trim(),
    category: catEl.value,
    sort: sortEl.value
  };
  const products = await API.get('/api/products', params);

  productsEl.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" />
      <div class="row"><h3>${p.name}</h3><span class="badge">${p.category}</span></div>
      <div class="muted">${p.description}</div>
      <div class="row"><span class="price">₹${p.price}</span><span class="muted">Stock: ${p.stock}</span></div>
      <div class="row">
        <button onclick="viewProduct('${p.id}')">View</button>
        <button class="secondary" onclick='quickAdd("${p.id}")'>Add to Cart</button>
      </div>
    </div>
  `).join('');
}

window.viewProduct = (id) => location.href = `product.html?id=${encodeURIComponent(id)}`;
window.quickAdd = async (id) => {
  const p = await API.get(`/api/products/${id}`);
  addToCart(p, 1);
  alert('Added to cart.');
};

document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('applyBtn'); // Make sure ID matches your button's ID
  if (applyBtn) {
    applyBtn.addEventListener('click', loadProducts);
  } else {
    console.error('Apply button not found!');
  }

  // Optional: Enter key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadProducts();
  });
});

// applyBtn.addEventListener('click', loadProducts);
// qEl.addEventListener('keydown', e => { if (e.key === 'Enter') loadProducts(); });

// loadProducts().catch(err => productsEl.innerHTML = `<p class="muted">${err.message}</p>`);


