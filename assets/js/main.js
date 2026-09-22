// Persewaan Alat Fitness - Main JS
// Domain: https://persewaanalatfitnes.com/

// WA: Semarang vs luar Semarang (Solo/Jogja)
const WA_SEMARANG = '6285727285244'; // 0857-2728-5244
const WA_LUAR_SEMARANG = '62895340632600'; // 0895-3406-32600

function getWaNumber(kota) {
  if (!kota) return WA_SEMARANG;
  const k = kota.toLowerCase();
  if (k.includes('semarang')) return WA_SEMARANG;
  return WA_LUAR_SEMARANG;
}

function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('close-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });
}

function formatRupiah(num) {
  if (num === null || num === undefined || num === 0 || num === '') return '–';
  return 'Rp ' + Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatPriceRange(min, max) {
  if (!min && !max) return '–';
  if (!max || max === min) return formatRupiah(min);
  return formatRupiah(min) + ' – ' + formatRupiah(max);
}

function displayPrice(p, period) {
  if (period === 'daily') return formatRupiah(p.priceDaily);
  if (period === 'weekly') return formatPriceRange(p.priceWeekly, p.priceWeeklyMax);
  if (period === 'monthly') return formatPriceRange(p.priceMonthly, p.priceMonthlyMax);
  return '–';
}

function sewaPriceHint(p) {
  if (p.priceMonthly) return p.priceMonthly;
  if (p.priceWeekly) return p.priceWeekly;
  if (p.priceDaily) return p.priceDaily;
  return 0;
}

async function loadProducts() {
  try {
    const res = await fetch('assets/js/products.json');
    if (!res.ok) throw new Error('Failed to load products');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function loadReviews() {
  try {
    const res = await fetch('assets/js/reviews.json');
    if (!res.ok) throw new Error('Failed to load reviews');
    const data = await res.json();
    return data.filter(r => r.visible !== false);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  const products = await loadProducts();
  const featured = products.filter(p => p.featured).slice(0, 6);
  container.innerHTML = featured.map(p => `
    <div class="product-card glass-card overflow-hidden">
      <div class="relative h-48 overflow-hidden">
        <img src="${p.image}" alt="Sewa ${p.name} Semarang Solo Jogja" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute top-3 left-3 stock-available">${p.stock === 'tersedia' ? 'Tersedia' : p.stock}</span>
      </div>
      <div class="p-5">
        <p class="text-xs text-zinc-400 uppercase tracking-wide mb-1">${p.category}</p>
        <h3 class="font-bold text-lg mb-2">${p.name}</h3>
        <p class="text-zinc-400 text-sm mb-3 line-clamp-2">${p.description}</p>
        <div class="space-y-1 mb-4 text-sm">
          <div class="flex justify-between"><span class="text-zinc-500">Mingguan</span><span class="font-semibold">${displayPrice(p,'weekly')}</span></div>
          <div class="flex justify-between"><span class="text-zinc-500">Bulanan</span><span class="font-semibold text-accent">${displayPrice(p,'monthly')}</span></div>
        </div>
        <button onclick="sewaWhatsApp('${p.name.replace(/'/g, "\\'")}', ${sewaPriceHint(p)})" class="btn-energy w-full text-center text-sm">
          Sewa via WhatsApp
        </button>
      </div>
    </div>
  `).join('');
}

async function renderAllProducts(filter = 'all') {
  const container = document.getElementById('all-products');
  if (!container) return;
  const products = await loadProducts();
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-center text-zinc-400 col-span-full py-12">Tidak ada produk di kategori ini.</p>';
    return;
  }
  container.innerHTML = filtered.map(p => `
    <div class="product-card glass-card overflow-hidden" data-category="${p.category}">
      <div class="relative h-52 overflow-hidden">
        <img src="${p.image}" alt="Sewa ${p.name} di Semarang, Solo, Jogja" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute top-3 left-3 ${p.stock === 'tersedia' ? 'stock-available' : p.stock === 'disewa' ? 'stock-rented' : 'stock-maintenance'}">
          ${p.stock === 'tersedia' ? 'Tersedia' : p.stock === 'disewa' ? 'Disewa' : 'Maintenance'}
        </span>
      </div>
      <div class="p-5">
        <p class="text-xs text-zinc-400 uppercase tracking-wide mb-1">${p.category}</p>
        <h3 class="font-bold text-lg mb-2">${p.name}</h3>
        <p class="text-zinc-400 text-sm mb-3 line-clamp-2">${p.description}</p>
        <div class="space-y-1 mb-4 text-sm">
          <div class="flex justify-between"><span class="text-zinc-500">Harian</span><span class="font-semibold">${displayPrice(p,'daily')}</span></div>
          <div class="flex justify-between"><span class="text-zinc-500">Mingguan</span><span class="font-semibold">${displayPrice(p,'weekly')}</span></div>
          <div class="flex justify-between"><span class="text-zinc-500">Bulanan</span><span class="font-semibold text-accent">${displayPrice(p,'monthly')}</span></div>
        </div>
        <button onclick="sewaWhatsApp('${p.name.replace(/'/g, "\\'")}', ${sewaPriceHint(p)})" class="btn-energy w-full text-center text-sm" ${p.stock !== 'tersedia' ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
          ${p.stock === 'tersedia' ? 'Sewa Sekarang' : 'Tidak Tersedia'}
        </button>
      </div>
    </div>
  `).join('');
}

function initProductFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  if (!pills.length) return;
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderAllProducts(pill.dataset.filter);
    });
  });
}

function sewaWhatsApp(namaAlat, hargaRef) {
  const hargaLabel = hargaRef ? formatRupiah(hargaRef) + ' (dari daftar harga)' : 'sesuai daftar harga';
  const text = `Halo Griya Fitnes, saya ingin sewa di persewaanalatfitnes.com:
• Alat: ${namaAlat}
• Referensi harga: ${hargaLabel}
• Durasi: [Harian / Mingguan / Bulanan]
• Kota: [Semarang / Solo / Jogja]
• Nama: [isi]
Mohon info ketersediaan & total harga. Terima kasih!`;
  const url = `https://wa.me/${WA_SEMARANG}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function initSewaForm() {
  const form = document.getElementById('sewa-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = form.nama.value.trim();
    const wa = form.wa.value.trim();
    const alat = form.alat.value;
    const durasi = form.durasi.value;
    const kota = form.kota.value;
    const tanggal = form.tanggal.value;
    const alamat = form.alamat.value.trim();
    const catatan = form.catatan ? form.catatan.value.trim() : '';
    if (!nama || !wa || !alat || !durasi || !kota) {
      alert('Mohon lengkapi data wajib (bertanda *).');
      return;
    }
    let text = `Halo Griya Fitnes (persewaanalatfitnes.com)! Saya ingin sewa:\n`;
    text += `• Nama: ${nama}\n`;
    text += `• No. WhatsApp: ${wa}\n`;
    text += `• Alat: ${alat}\n`;
    text += `• Durasi: ${durasi}\n`;
    text += `• Tanggal mulai: ${tanggal || '-'}\n`;
    text += `• Kota: ${kota}\n`;
    text += `• Alamat: ${alamat || '-'}\n`;
    if (catatan) text += `• Catatan: ${catatan}\n`;
    text += `\nMohon info ketersediaan & total harga. Terima kasih!`;
    const url = `https://wa.me/${getWaNumber(kota)}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
}

async function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;
  const reviews = await loadReviews();
  if (reviews.length === 0) {
    container.innerHTML = '<p class="text-center text-zinc-400">Belum ada review.</p>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="glass-card p-6 flex flex-col">
      <div class="flex items-center gap-1 mb-3">
        ${Array.from({length: 5}, (_, i) =>
          `<svg class="w-4 h-4 ${i < r.rating ? 'star-filled' : 'text-zinc-600'}" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`
        ).join('')}
      </div>
      <p class="text-zinc-300 text-sm flex-1 mb-4">"${r.comment}"</p>
      <div class="flex items-center gap-3 mt-auto">
        <div class="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center font-bold text-accent">${r.name.charAt(0)}</div>
        <div>
          <p class="font-semibold text-sm">${r.name}</p>
          <p class="text-xs text-zinc-500">${r.city || ''} · ${r.date || ''}</p>
        </div>
      </div>
    </div>
  `).join('');
}

async function populateAlatSelect() {
  const select = document.getElementById('alat');
  if (!select) return;
  const products = await loadProducts();
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
}

async function renderHargaTable() {
  const container = document.getElementById('harga-table-body');
  if (!container) return;
  const products = await loadProducts();
  container.innerHTML = products.map((p, i) => `
    <tr class="border-b border-white/5 hover:bg-white/5">
      <td class="py-3 px-3 text-zinc-500 text-sm">${i + 1}</td>
      <td class="py-3 px-3 font-semibold text-sm">${p.name}</td>
      <td class="py-3 px-3 text-sm text-zinc-300">${displayPrice(p,'daily')}</td>
      <td class="py-3 px-3 text-sm text-zinc-300">${displayPrice(p,'weekly')}</td>
      <td class="py-3 px-3 text-sm font-semibold text-accent">${displayPrice(p,'monthly')}</td>
      <td class="py-3 px-3">
        <button onclick="sewaWhatsApp('${p.name.replace(/'/g, "\\'")}', ${sewaPriceHint(p)})" class="text-xs px-3 py-1.5 rounded-lg bg-lime-500/15 text-accent hover:bg-lime-500/25 transition">Sewa</button>
      </td>
    </tr>
  `).join('');
}


function initFloatingWa() {
  const wrap = document.getElementById('floating-wa-wrap');
  const btn = document.getElementById('floating-wa-btn');
  if (!wrap || !btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFloatingWa();
  renderFeaturedProducts();
  renderAllProducts();
  initProductFilter();
  initSewaForm();
  renderReviews();
  populateAlatSelect();
  renderHargaTable();
});
