document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('error-message');
  const cartCount = document.getElementById('cart-count');
  const toastContainer = document.getElementById('toast-container');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutForm = document.getElementById('checkoutForm');
  const cartItemsBox = document.getElementById('cart-items');
  const closeCheckout = document.getElementById('closeCheckout');
  const openCartBtn = document.getElementById('openCartBtn');

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const paymentMethod = document.getElementById('paymentMethod');
  const paymentInfo = document.getElementById('paymentInfo');

  const SELLER_PHONE = '6289615170747';
  const BANK_NUMBERS = {
    BCA: "123-456-7890 a.n. TokoKu",
    BRI: "987-654-3210 a.n. TokoKu",
    BNI: "456-789-1230 a.n. TokoKu",
    DANA: "0896-1517-0747 a.n. TokoKu"
  };

  let products = [];
  let cart = [];
  const API_URL = 'https://fakestoreapi.com/products';

  async function fetchProducts() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      products = data;
      populateCategories();
      renderProducts(products);
    } catch (err) {
      errorMessage.classList.remove('hidden');
    } finally {
      loader.style.display = 'none';
    }
  }

  function populateCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(option);
    });
  }

  function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    productsToRender.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col';
      card.innerHTML = `
        <div class="p-4 h-48 flex items-center justify-center">
          <img src="${p.image}" alt="${p.title}" class="max-h-full max-w-full object-contain">
        </div>
        <div class="p-4 border-t flex flex-col flex-grow">
          <span class="text-xs text-gray-500">${p.category}</span>
          <h3 class="font-semibold text-gray-800 mt-1 flex-grow">${p.title.substring(0, 45)}...</h3>
          <div class="mt-3 flex justify-between items-center">
            <p class="text-lg font-bold text-blue-600">Rp ${(p.price * 15000).toLocaleString('id-ID')}</p>
            <button class="add bg-blue-100 text-blue-700 rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-200" data-id="${p.id}">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  function filterProducts() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const filtered = products.filter(p => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSearch = p.title.toLowerCase().includes(searchText);
      return matchesCategory && matchesSearch;
    });
    renderProducts(filtered);
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg mb-2';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
  }

  function addToCart(id) {
    const product = products.find(p => p.id == id);
    if (!product) return;
    const existing = cart.find(i => i.id == id);
    if (existing) existing.qty++;
    else cart.push({id: product.id, title: product.title, image: product.image, price: Math.round(product.price * 15000), qty:1});
    updateCartCount();
    showToast('Ditambahkan ke keranjang!');
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartItemsBox.innerHTML = `<p class="text-gray-500 text-center">Keranjang masih kosong.</p>`;
      return;
    }
    cartItemsBox.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center border-b py-3';
      div.innerHTML = `
        <div class="flex items-center gap-2 w-2/3">
          <img src="${item.image}" class="w-10 h-10 object-contain rounded">
          <div>
            <p class="text-gray-800 text-sm font-medium">${item.title.substring(0, 35)}...</p>
            <p class="text-xs text-gray-500">Rp ${item.price.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="decrease bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-gray-700" data-id="${item.id}">-</button>
          <span class="font-semibold text-gray-700">${item.qty}</span>
          <button class="increase bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-gray-700" data-id="${item.id}">+</button>
          <button class="remove text-red-500 ml-2" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      cartItemsBox.appendChild(div);
    });
    const totalEl = document.createElement('div');
    totalEl.className = 'text-right font-bold mt-3';
    totalEl.textContent = `Total: Rp ${total.toLocaleString('id-ID')}`;
    cartItemsBox.appendChild(totalEl);
  }

  cartItemsBox.addEventListener('click', (e) => {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;
    const item = cart.find(i => i.id == id);
    if (!item) return;
    if (e.target.closest('.increase')) item.qty++;
    else if (e.target.closest('.decrease')) {
      item.qty--; 
      if (item.qty <= 0) cart = cart.filter(i => i.id != id);
    } else if (e.target.closest('.remove')) cart = cart.filter(i => i.id != id);
    renderCartItems();
    updateCartCount();
  });

  function openCheckout() {
    renderCartItems();
    checkoutModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    checkoutModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function showConfirmPopup(orderText, finalAction) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4';
    overlay.innerHTML = `
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <h3 class="text-xl font-bold mb-3 text-green-700">Chat on WhatsApp with +62 89615170747</h3>
        <p class="text-gray-700 mb-4">Periksa kembali pesananmu sebelum melanjutkan ke WhatsApp.</p>
        <div class="text-left bg-gray-50 border rounded-lg p-3 mb-4 text-sm text-gray-800 overflow-y-auto max-h-48">
          ${orderText.replace(/\n/g, "<br>")}
        </div>
        <div class="flex justify-center gap-3">
          <button id="confirmWA" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <i class="fab fa-whatsapp"></i> Open App
          </button>
          <button id="cancelWA" class="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Batal</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancelWA').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#confirmWA').addEventListener('click', () => { overlay.remove(); finalAction(); });
  }

  function openWhatsApp(orderText) {
    const url = `https://api.whatsapp.com/send?phone=${SELLER_PHONE}&text=${encodeURIComponent(orderText)}`;
    window.open(url, '_blank');
  }

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const addr = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const method = paymentMethod.value;

    if (!name || !addr || !phone || !method || cart.length === 0) {
      alert('Mohon isi semua data, pilih metode pembayaran, dan tambahkan produk.');
      return;
    }

    let text = `*PESANAN BARU*\nNama: ${name}\nAlamat: ${addr}\nNo. HP: ${phone}\nMetode: ${method}\n\n*Rincian Produk:*\n`;
    cart.forEach((item,i)=>{text+=`${i+1}. ${item.title.substring(0,25)}... (${item.qty}x) - Rp ${(item.price*item.qty).toLocaleString('id-ID')}\n`;});
    const total = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
    text += `\n*Total:* Rp ${total.toLocaleString('id-ID')}\n`;

    if(method !== 'COD') text += `\nMohon transfer ke nomor: ${BANK_NUMBERS[method]}\nSetelah transfer, screenshot dan kirim via WhatsApp.\n`;
    text += '\nTerima kasih 🙏';

    showConfirmPopup(text, () => { openWhatsApp(text); cart=[]; updateCartCount(); closeCheckoutModal(); });
  });

  paymentMethod.addEventListener('change', () => {
    const method = paymentMethod.value;
    if(method && method !== 'COD') {
      paymentInfo.classList.remove('hidden');
      paymentInfo.textContent = `Mohon transfer ke nomor: ${BANK_NUMBERS[method]} dan kirim screenshot bukti transfer di WhatsApp.`;
    } else {
      paymentInfo.classList.add('hidden');
    }
  });

  productGrid.addEventListener('click', e => { const btn = e.target.closest('.add'); if(btn) addToCart(btn.dataset.id); });
  openCartBtn.addEventListener('click', openCheckout);
  closeCheckout.addEventListener('click', closeCheckoutModal);
  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);

  fetchProducts();
});
