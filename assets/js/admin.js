// Admin Dashboard JS - Persewaan Alat Fitness
// Password sederhana (ganti di production)

const ADMIN_PASSWORD = 'fitness2026';
const STORAGE_PRODUCTS = 'paf_products';
const STORAGE_REVIEWS = 'paf_reviews';
const STORAGE_AUTH = 'paf_auth';

// ========== Auth ==========
function checkAuth() {
  return localStorage.getItem(STORAGE_AUTH) === 'true';
}

function login(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(STORAGE_AUTH, 'true');
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(STORAGE_AUTH);
  showLogin();
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
}

function showAdmin() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  loadAdminData();
}

// ========== Data Helpers ==========
async function getProducts() {
  const local = localStorage.getItem(STORAGE_PRODUCTS);
  if (local) return JSON.parse(local);
  try {
    const res = await fetch('assets/js/products.json');
    const data = await res.json();
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(data));
    return data;
  } catch {
    return [];
  }
}

async function getReviews() {
  const local = localStorage.getItem(STORAGE_REVIEWS);
  if (local) return JSON.parse(local);
  try {
    const res = await fetch('assets/js/reviews.json');
    const data = await res.json();
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(data));
    return data;
  } catch {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(reviews));
}

function formatRupiah(num) {
  return 'Rp ' + Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ========== Render Products Table ==========
async function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  const products = await getProducts();

  tbody.innerHTML = products.map(p => `
    <tr>
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.image}" alt="" class="w-12 h-12 rounded object-cover">
          <div>
            <p class="font-semibold">${p.name}</p>
            <p class="text-xs text-zinc-500">${p.category}</p>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-sm">
        <div>H: ${formatRupiah(p.priceDaily)}</div>
        <div>M: ${formatRupiah(p.priceWeekly)}</div>
        <div>B: ${formatRupiah(p.priceMonthly)}</div>
      </td>
      <td class="py-3 px-4">
        <select onchange="updateStock(${p.id}, this.value)" class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm">
          <option value="tersedia" ${p.stock === 'tersedia' ? 'selected' : ''}>Tersedia</option>
          <option value="disewa" ${p.stock === 'disewa' ? 'selected' : ''}>Disewa</option>
          <option value="maintenance" ${p.stock === 'maintenance' ? 'selected' : ''}>Maintenance</option>
        </select>
      </td>
      <td class="py-3 px-4">
        <span class="text-xs ${p.featured ? 'text-lime-400' : 'text-zinc-500'}">${p.featured ? '★ Featured' : '-'}</span>
      </td>
      <td class="py-3 px-4">
        <div class="flex gap-2">
          <button onclick="editProduct(${p.id})" class="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
          <button onclick="deleteProduct(${p.id})" class="text-red-400 hover:text-red-300 text-sm">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ========== Render Reviews Table ==========
async function renderReviewsTable() {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;
  const reviews = await getReviews();

  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td class="py-3 px-4">
        <p class="font-semibold">${r.name}</p>
        <p class="text-xs text-zinc-500">${r.city}</p>
      </td>
      <td class="py-3 px-4">
        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
      </td>
      <td class="py-3 px-4 text-sm text-zinc-300 max-w-xs truncate">${r.text}</td>
      <td class="py-3 px-4">
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" ${r.visible !== false ? 'checked' : ''} onchange="toggleReviewVisible(${r.id}, this.checked)" class="rounded">
          <span class="text-xs">${r.visible !== false ? 'Tampil' : 'Sembunyi'}</span>
        </label>
      </td>
      <td class="py-3 px-4">
        <div class="flex gap-2">
          <button onclick="editReview(${r.id})" class="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
          <button onclick="deleteReview(${r.id})" class="text-red-400 hover:text-red-300 text-sm">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ========== Product CRUD ==========
async function updateStock(id, stock) {
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx].stock = stock;
    saveProducts(products);
  }
}

async function deleteProduct(id) {
  if (!confirm('Hapus produk ini?')) return;
  let products = await getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  renderProductsTable();
}

async function editProduct(id) {
  const products = await getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('product-id').value = p.id;
  document.getElementById('product-name').value = p.name;
  document.getElementById('product-category').value = p.category;
  document.getElementById('product-priceDaily').value = p.priceDaily;
  document.getElementById('product-priceWeekly').value = p.priceWeekly;
  document.getElementById('product-priceMonthly').value = p.priceMonthly;
  document.getElementById('product-stock').value = p.stock;
  document.getElementById('product-image').value = p.image;
  document.getElementById('product-description').value = p.description || '';
  document.getElementById('product-featured').checked = !!p.featured;

  document.getElementById('product-modal-title').textContent = 'Edit Produk';
  document.getElementById('product-modal').classList.remove('hidden');
}

function openAddProduct() {
  document.getElementById('product-id').value = '';
  document.getElementById('product-form').reset();
  document.getElementById('product-modal-title').textContent = 'Tambah Produk';
  document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const products = await getProducts();

  const data = {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value,
    priceDaily: Number(document.getElementById('product-priceDaily').value),
    priceWeekly: Number(document.getElementById('product-priceWeekly').value),
    priceMonthly: Number(document.getElementById('product-priceMonthly').value),
    stock: document.getElementById('product-stock').value,
    image: document.getElementById('product-image').value.trim(),
    description: document.getElementById('product-description').value.trim(),
    featured: document.getElementById('product-featured').checked,
    slug: document.getElementById('product-name').value.trim().toLowerCase().replace(/\s+/g, '-')
  };

  if (id) {
    const idx = products.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
    }
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, ...data });
  }

  saveProducts(products);
  closeProductModal();
  renderProductsTable();
}

// ========== Review CRUD ==========
async function toggleReviewVisible(id, visible) {
  const reviews = await getReviews();
  const idx = reviews.findIndex(r => r.id === id);
  if (idx !== -1) {
    reviews[idx].visible = visible;
    saveReviews(reviews);
    renderReviewsTable();
  }
}

async function deleteReview(id) {
  if (!confirm('Hapus review ini?')) return;
  let reviews = await getReviews();
  reviews = reviews.filter(r => r.id !== id);
  saveReviews(reviews);
  renderReviewsTable();
}

async function editReview(id) {
  const reviews = await getReviews();
  const r = reviews.find(x => x.id === id);
  if (!r) return;

  document.getElementById('review-id').value = r.id;
  document.getElementById('review-name').value = r.name;
  document.getElementById('review-city').value = r.city;
  document.getElementById('review-rating').value = r.rating;
  document.getElementById('review-text').value = r.text;
  document.getElementById('review-photo').value = r.photo || '';
  document.getElementById('review-visible').checked = r.visible !== false;

  document.getElementById('review-modal-title').textContent = 'Edit Review';
  document.getElementById('review-modal').classList.remove('hidden');
}

function openAddReview() {
  document.getElementById('review-id').value = '';
  document.getElementById('review-form').reset();
  document.getElementById('review-visible').checked = true;
  document.getElementById('review-modal-title').textContent = 'Tambah Review';
  document.getElementById('review-modal').classList.remove('hidden');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.add('hidden');
}

async function saveReview(e) {
  e.preventDefault();
  const id = document.getElementById('review-id').value;
  const reviews = await getReviews();

  const data = {
    name: document.getElementById('review-name').value.trim(),
    city: document.getElementById('review-city').value.trim(),
    rating: Number(document.getElementById('review-rating').value),
    text: document.getElementById('review-text').value.trim(),
    photo: document.getElementById('review-photo').value.trim(),
    visible: document.getElementById('review-visible').checked
  };

  if (id) {
    const idx = reviews.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      reviews[idx] = { ...reviews[idx], ...data };
    }
  } else {
    const newId = reviews.length ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    reviews.push({ id: newId, ...data });
  }

  saveReviews(reviews);
  closeReviewModal();
  renderReviewsTable();
}

// ========== Export / Import ==========
async function exportJSON() {
  const products = await getProducts();
  const reviews = await getReviews();
  const data = { products, reviews, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paf-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.products) saveProducts(data.products);
      if (data.reviews) saveReviews(data.reviews);
      alert('Import berhasil!');
      loadAdminData();
    } catch {
      alert('File JSON tidak valid.');
    }
  };
  reader.readAsText(file);
}

// ========== Tabs ==========
function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('bg-lime-500', 'text-black');
    b.classList.add('bg-zinc-800', 'text-zinc-300');
  });
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) {
    btn.classList.remove('bg-zinc-800', 'text-zinc-300');
    btn.classList.add('bg-lime-500', 'text-black');
  }
}

// ========== Load ==========
async function loadAdminData() {
  await renderProductsTable();
  await renderReviewsTable();
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    showAdmin();
  } else {
    showLogin();
  }

  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('password').value;
    if (login(pw)) {
      showAdmin();
    } else {
      document.getElementById('login-error').classList.remove('hidden');
    }
  });

  document.getElementById('product-form')?.addEventListener('submit', saveProduct);
  document.getElementById('review-form')?.addEventListener('submit', saveReview);
});
