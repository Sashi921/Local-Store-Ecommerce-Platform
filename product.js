function getParam(name) {
  return new URL(location.href).searchParams.get(name);
}

async function renderProduct() {
  const id = getParam('id');
  const product = await API.get(`/api/products/${id}`);
  const reviews = await API.get(`/api/products/${id}/reviews`);

  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr 1.1fr; gap: 24px;">
      <div>
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="card">
        <h2>${product.name}</h2>
        <p class="muted">${product.description}</p>
        <div class="row"><span class="badge">${product.category}</span><span class="price">₹${product.price}</span></div>
        <div class="row">
          <button id="add">Add to Cart</button>
          <a href="index.html" class="btn"><button class="secondary">Back</button></a>
        </div>

        <hr/>
        <h3>Reviews</h3>
        <div id="reviews">
          ${reviews.length ? reviews.map(r => `
            <div style="margin-bottom:10px;">
              <strong>${r.name}</strong> • ★${r.rating} <span class="muted">(${new Date(r.createdAt).toLocaleDateString()})</span>
              <div>${r.comment || ''}</div>
            </div>
          `).join('') : '<p class="muted">No reviews yet.</p>'}
        </div>

        <h4>Add a review</h4>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <input id="rname" placeholder="Your name"/>
          <input id="rrating" type="number" min="1" max="5" placeholder="Rating (1-5)"/>
        </div>
        <textarea id="rcomment" rows="3" placeholder="Comment (optional)" style="margin-top:8px;"></textarea>
        <div class="row" style="margin-top:8px;">
          <button id="submitReview" class="secondary">Submit Review</button>
        </div>
        <p id="reviewMsg" class="muted"></p>
      </div>
    </div>
  `;

  document.getElementById('add').onclick = () => { addToCart(product, 1); alert('Added to cart.'); };

  document.getElementById('submitReview').onclick = async () => {
    const name = document.getElementById('rname').value.trim();
    const rating = Number(document.getElementById('rrating').value);
    const comment = document.getElementById('rcomment').value.trim();
    const msg = document.getElementById('reviewMsg');
    try {
      await API.post(`/api/products/${id}/reviews`, { name, rating, comment });
      msg.textContent = 'Thanks! Your review was submitted.';
      renderProduct(); // reload to show it
    } catch (e) {
      msg.textContent = e.message;
    }
  };
}

renderProduct().catch(err => {
  document.getElementById('content').innerHTML = `<p class="muted">${err.message}</p>`;
});
