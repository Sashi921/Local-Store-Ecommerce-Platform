function renderCartTable() {
  const cart = getCart();
  const wrap = document.getElementById('cartTableWrapper');

  if (!cart.length) {
    wrap.innerHTML = `<p class="muted">Your cart is empty. <a href="index.html">Shop now</a>.</p>`;
    return;
  }

  const rows = cart.map(it => `
    <tr>
      <td style="display:flex; align-items:center; gap:10px;">
        <img src="${it.image}" alt="${it.name}" style="width:56px;height:56px;object-fit:cover;"/>
        ${it.name}
      </td>
      <td>₹${it.price}</td>
      <td>
        <input type="number" min="1" value="${it.qty}" style="width:80px;"
          onchange="updateQty('${it.productId}', this.value); renderCartTable();"/>
      </td>
      <td>₹${it.price * it.qty}</td>
      <td><button class="danger" onclick="removeFromCart('${it.productId}'); renderCartTable();">Remove</button></td>
    </tr>
  `).join('');

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  wrap.innerHTML = `
    <table class="table">
      <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th colspan="3" style="text-align:right;">Total</th><th>₹${total}</th><th></th></tr></tfoot>
    </table>
  `;
}

document.getElementById('checkout').onclick = async () => {
  const cart = getCart();
  if (!cart.length) return alert('Your cart is empty.');

  const orderResult = document.getElementById('orderResult');
  try {
    const customer = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value
    };
    const items = cart.map(it => ({ productId: it.productId, qty: it.qty }));
    const order = await API.post('/api/orders', { items, customer });
    clearCart();
    renderCartTable();
    orderResult.innerHTML = `✅ Order placed! Your Order ID is <strong>${order.id}</strong> (total ₹${order.total}). Track it on the <a href="order.html">Track Order</a> page.`;
  } catch (e) {
    orderResult.textContent = e.message;
  }
};

document.getElementById('clear').onclick = () => { clearCart(); renderCartTable(); };

renderCartTable();
