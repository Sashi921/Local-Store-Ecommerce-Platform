document.getElementById('track').onclick = async () => {
  const id = document.getElementById('trackId').value.trim();
  const el = document.getElementById('trackResult');
  if (!id) return alert('Enter an order ID.');

  try {
    const order = await API.get(`/api/orders/${id}`);
    const itemsHtml = order.items.map(it => `<li>${it.productId} × ${it.qty}</li>`).join('');
    el.innerHTML = `
      <div class="card">
        <div class="row"><strong>Order:</strong> <span class="kbd">${order.id}</span></div>
        <div class="row"><strong>Status:</strong> <span class="badge">${order.status}</span></div>
        <div class="row"><strong>Total:</strong> <span class="price">₹${order.total}</span></div>
        <p class="muted">Placed on ${new Date(order.createdAt).toLocaleString()}</p>
        <ul>${itemsHtml}</ul>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<p class="muted">${e.message}</p>`;
  }
};

document.getElementById('sendSupport').onclick = async () => {
  const name = document.getElementById('supportName').value;
  const email = document.getElementById('supportEmail').value;
  const message = document.getElementById('supportMsg').value;
  const resEl = document.getElementById('supportResult');

  try {
    await API.post('/api/support', { name, email, message });
    resEl.textContent = 'Message sent. Our team will reach out soon.';
    document.getElementById('supportMsg').value = '';
  } catch (e) {
    resEl.textContent = e.message;
  }
};
