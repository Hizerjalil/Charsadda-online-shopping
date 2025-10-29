
// main.js - handles product fetching, filtering, modal, cart interactions, pagination, theme
const API = 'https://fakestoreapi.com/products';
let products = [];
let filtered = [];
let currentPage = 1;
const perPage = 12;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);


function showToast(message, timeout=3000){
  const container = document.getElementById('toastContainer');
  if(!container) return;
  const el = document.createElement('div');
  el.className = 'toast-card mb-2';
  el.innerHTML = `<div class="d-flex align-items-center gap-2"><strong>✅</strong><div>${message}</div></div>`;
  container.appendChild(el);
  setTimeout(()=>{ el.style.transition = 'opacity .3s ease'; el.style.opacity = '0'; setTimeout(()=> el.remove(), 300); }, timeout);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchProducts();
  setupUI();
});

function initTheme(){
  const theme = localStorage.getItem('theme') || 'light';
  applyTheme(theme);
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
  });
}

function applyTheme(t){
  if(t==='dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', t);
  document.getElementById('themeToggle').textContent = t==='dark' ? '☀️' : '🌙';
}

function setupUI(){
  $('#year').textContent = new Date().getFullYear();
  $('#priceRange').addEventListener('input', e => {
    $('#priceLabel').textContent = '$' + e.target.value;
    filterProducts();
  });
  $('#searchInput').addEventListener('input', ()=> filterProducts());
  $('#categoryFilter').addEventListener('change', ()=> filterProducts());
  document.getElementById('cartCount').textContent = getCartCount();
}

function fetchProducts(){
  showSpinner(true);
  fetch(API).then(r=>r.json()).then(data=>{
    products = data.map(p => ({...p, colorOptions: generateColors()}));
    filtered = products.slice();
    populateCategories();
    renderProducts();
    showSpinner(false);
  }).catch(err=>{
    console.error(err);
    showSpinner(false);
    document.getElementById('products').innerHTML = '<div class="col-12 text-danger">Failed to fetch products.</div>';
  });
}

function showSpinner(v){
  document.getElementById('spinner').style.display = v ? 'block' : 'none';
}

function populateCategories(){
  const cats = Array.from(new Set(products.map(p=>p.category)));
  const sel = $('#categoryFilter');
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = capitalize(c);
    sel.appendChild(opt);
  });
}

function filterProducts(){
  const max = Number($('#priceRange').value) || 9999;
  const q = $('#searchInput').value.trim().toLowerCase();
  const cat = $('#categoryFilter').value;
  filtered = products.filter(p=>{
    return p.price <= max &&
      (cat==='all' || p.category===cat) &&
      (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  });
  currentPage = 1;
  renderProducts();
}

function renderProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '';
  const start = (currentPage-1)*perPage;
  const pageItems = filtered.slice(start, start+perPage);
  if(pageItems.length===0){
    container.innerHTML = '<div class="col-12 text-center text-muted">No products match the filters.</div>';
    renderPagination();
    return;
  }
  pageItems.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card product-card h-100 p-3">
        <div class="d-flex align-items-center justify-content-center" style="height:180px;">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" class="img-fluid" style="max-height:160px; object-fit:contain;">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title" title="${escapeHtml(p.title)}">${shorten(p.title,60)}</h5>
          <p class="small-muted mb-2">${p.category}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div><strong>$${p.price.toFixed(2)}</strong></div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary view-btn" data-id="${p.id}">View</button>
              <button class="btn btn-sm btn-primary add-btn" data-id="${p.id}">Add</button>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  });
  renderPagination();
  // attach events
  $$('.add-btn').forEach(b=>b.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    const prod = products.find(x=>x.id===id);
    addToCart({...prod, selectedColor: prod.colorOptions[0]});
    flashBadge();
  }));
  $$('.view-btn').forEach(b=>b.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    openModal(id);
  }));
  document.getElementById('cartCount').textContent = getCartCount();
}

function renderPagination(){
  const total = Math.ceil(filtered.length / perPage);
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';
  for(let i=1;i<=Math.max(1,total);i++){
    const li = document.createElement('li');
    li.className = 'page-item ' + (i===currentPage ? 'active' : '');
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (ev)=>{ ev.preventDefault(); currentPage=i; renderProducts(); });
    ul.appendChild(li);
  }
}

function openModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  $('#modalTitle').textContent = p.title;
  $('#modalImage').src = p.image;
  $('#modalDesc').textContent = p.description;
  $('#modalPrice').textContent = p.price.toFixed(2);
  $('#modalCategory').textContent = p.category;
  const sw = $('#colorSwatches');
  sw.innerHTML = '';
  p.colorOptions.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'color-swatch';
    el.style.background = c;
    el.title = c;
    el.addEventListener('click', ()=> {
      p.selectedColor = c;
      document.querySelectorAll('.color-swatch.active').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
    });
    sw.appendChild(el);
  });
  // mark first active
  if(sw.firstChild) sw.firstChild.classList.add('active');
  $('#modalAdd').onclick = ()=>{ addToCart({...p, selectedColor: p.selectedColor || p.colorOptions[0]}); flashBadge(); showToast('Item added to your cart successfully!'); const modal = bootstrap.Modal.getInstance(document.getElementById('productModal')); modal.hide(); };
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

function generateColors(){
  // random bright palette
  const palettes = [
    ['#ef4444','#f97316','#f59e0b','#eab308'],
    ['#10b981','#06b6d4','#3b82f6','#8b5cf6'],
    ['#ec4899','#db2777','#f472b6','#f97316'],
    ['#a3e635','#60a5fa','#7c3aed','#f97316']
  ];
  return palettes[Math.floor(Math.random()*palettes.length)];
}

function addToCart(product, qty=1){
  // ensure product has a selectedColor property
  if(!product.selectedColor) product.selectedColor = product.colorOptions?.[0] || '#ffffff';
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  const found = cart.find(c=>c.id===product.id && c.selectedColor===product.selectedColor);
  if(found) found.qty += qty;
  else cart.push({id:product.id, title:product.title, price:product.price, image:product.image, qty, selectedColor:product.selectedColor || product.colorOptions?.[0]});
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  document.getElementById('cartCount').textContent = getCartCount();
}

function getCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  return cart.reduce((s,i)=>s+i.qty,0);
}

function flashBadge(){
  const el = document.getElementById('cartCount');
  el.classList.add('badge-count');
  setTimeout(()=> el.classList.remove('badge-count'),800);
}

function capitalize(s){ return s[0].toUpperCase()+s.slice(1); }
function shorten(s,n){ return s.length>n ? s.slice(0,n-2)+'…' : s; }
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }


function renderSwatches(p){
  // render up to 4 swatches inline
  const colors = p.colorOptions || ['#ffffff','#f97316','#06b6d4','#7c3aed'];
  return colors.slice(0,4).map(c => `<span class="color-swatch-small" data-pid="${p.id}" data-color="${c}" style="background:${c}"></span>`).join('');
}


// Delegated click for swatches and update of product.selectedColor
document.addEventListener('click', function(e){
  const sw = e.target.closest('.color-swatch-small');
  if(sw){
    const pid = Number(sw.dataset.pid);
    const color = sw.dataset.color;
    const prod = products.find(x=>x.id===pid);
    if(prod) prod.selectedColor = color;
    // mark active visually
    document.querySelectorAll('.color-swatch-small[data-pid="'+pid+'"]').forEach(el => el.style.outline = '');
    sw.style.outline = '3px solid rgba(0,0,0,0.08)';
    e.preventDefault();
    return;
  }
});


// ensure cart count is updated
document.addEventListener('DOMContentLoaded', ()=>{ const c = document.getElementById('cartCount'); if(c) c.textContent = getCartCount(); });
