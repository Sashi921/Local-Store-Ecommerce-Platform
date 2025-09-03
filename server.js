const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const SUPPORT_FILE = path.join(DATA_DIR, 'support.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Seed products if missing
  try { await fs.access(PRODUCTS_FILE); }
  catch {
    const seed = [
      {
        id: "p1",
        name: "Fresh Apples (1kg)",
        description: "Crisp and sweet farm-fresh apples.",
        price: 120,
        category: "Grocery",
        image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=800",
        stock: 50
      },
      {
        id: "p2",
        name: "Organic Milk (1L)",
        description: "Locally sourced organic cow milk.",
        price: 65,
        category: "Dairy",
        image: "https://images.unsplash.com/photo-1541976076758-347942db1970?q=80&w=800",
        stock: 100
      },
      {
        id: "p3",
        name: "Brown Bread",
        description: "Whole wheat brown bread, soft and fresh.",
        price: 45,
        category: "Bakery",
        image: "https://images.unsplash.com/photo-1604909052715-8f7a5a0302d5?q=80&w=800",
        stock: 40
      },
      {
        id: "p4",
        name: "Coconut Oil (500ml)",
        description: "Cold-pressed pure coconut oil.",
        price: 220,
        category: "Household",
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=800",
        stock: 30
      },
      {
        id: "p5",
        name: "Dark Chocolate (90g)",
        description: "70% cocoa, rich & bitter-sweet.",
        price: 99,
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1548907040-4baa42d10929?q=80&w=800",
        stock: 70
      }
    ];
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(seed, null, 2));
  }

  // Create empty files if missing
  for (const file of [ORDERS_FILE, REVIEWS_FILE, SUPPORT_FILE]) {
    try { await fs.access(file); }
    catch { await fs.writeFile(file, JSON.stringify([], null, 2)); }
  }
}

async function readJSON(file) {
  const txt = await fs.readFile(file, 'utf-8');
  return JSON.parse(txt || '[]');
}
async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// ---------- API routes ----------

// GET /api/products?category=&q=&minPrice=&maxPrice=&sort=price_asc|price_desc|name
app.get('/api/products', async (req, res) => {
  const { category, q, minPrice, maxPrice, sort } = req.query;
  let products = await readJSON(PRODUCTS_FILE);

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    const term = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));

  if (sort === 'price_asc') products.sort((a,b)=>a.price-b.price);
  if (sort === 'price_desc') products.sort((a,b)=>b.price-a.price);
  if (sort === 'name') products.sort((a,b)=>a.name.localeCompare(b.name));

  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const products = await readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Reviews
app.get('/api/products/:id/reviews', async (req, res) => {
  const all = await readJSON(REVIEWS_FILE);
  const list = all.filter(r => r.productId === req.params.id);
  res.json(list);
});

app.post('/api/products/:id/reviews', async (req, res) => {
  const { name, rating, comment } = req.body || {};
  if (!name || !rating) return res.status(400).json({ message: 'Name and rating required' });

  const all = await readJSON(REVIEWS_FILE);
  const review = {
    id: uuidv4(),
    productId: req.params.id,
    name,
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  all.push(review);
  await writeJSON(REVIEWS_FILE, all);
  res.status(201).json(review);
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart items required' });
  }

  const products = await readJSON(PRODUCTS_FILE);
  const orders = await readJSON(ORDERS_FILE);

  // Validate & compute total
  let total = 0;
  for (const it of items) {
    const p = products.find(x => x.id === it.productId);
    if (!p) return res.status(400).json({ message: `Invalid product: ${it.productId}` });
    if (it.qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
    if (p.stock < it.qty) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
    total += p.price * it.qty;
  }

  // Deduct stock
  for (const it of items) {
    const idx = products.findIndex(x => x.id === it.productId);
    products[idx].stock -= it.qty;
  }
  await writeJSON(PRODUCTS_FILE, products);

  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(), // short tracking id
    items,
    total,
    status: 'PLACED',
    customer: {
      name: customer?.name || 'Guest',
      email: customer?.email || '',
      address: customer?.address || '',
      phone: customer?.phone || ''
    },
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  await writeJSON(ORDERS_FILE, orders);
  res.status(201).json(order);
});

app.get('/api/orders/:id', async (req, res) => {
  const orders = await readJSON(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id.toUpperCase());
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// (Optional simple admin) update order status
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body || {};
  const orders = await readJSON(ORDERS_FILE);
  const idx = orders.findIndex(o => o.id === req.params.id.toUpperCase());
  if (idx === -1) return res.status(404).json({ message: 'Order not found' });
  orders[idx].status = status || orders[idx].status;
  await writeJSON(ORDERS_FILE, orders);
  res.json(orders[idx]);
});

// Support messages
app.post('/api/support', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!message) return res.status(400).json({ message: 'message required' });
  const all = await readJSON(SUPPORT_FILE);
  const m = { id: uuidv4(), name: name || 'Guest', email: email || '', message, createdAt: new Date().toISOString() };
  all.push(m);
  await writeJSON(SUPPORT_FILE, all);
  res.status(201).json({ ok: true });
});

// ---------- start ----------
ensureDataFiles().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
