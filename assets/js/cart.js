
// cart.js - manages cart page (localStorage) — enhanced with color change support
document.addEventListener('DOMContentLoaded', ()=> {
  document.getElementById('year2').textContent = new Date().getFullYear();
  renderCart();
});

function renderCart(){
  const area = document.getElementById('cartArea');
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  if(cart.length===0){
    area.innerHTML = '<div class="alert alert-info">Your cart is empty. <a href="index.html" class="btn btn-link">Shop now</a></div>';
    document.getElementById('cartTotal').textContent = '0.00';
    document.getElementById('gotoCheckout').classList.add('disabled');
    return;
  }
  document.getElementById('gotoCheckout').classList.remove('disabled');
  let html = '<div class="list-group">';
  cart.forEach((item, idx)=>{
    html += `<div class="list-group-item d-flex gap-3 align-items-center">
      <img src="${item.image}" alt="${item.title}" style="width:80px;height:80px;object-fit:contain">
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${item.title}</h6>
            <div class="small text-muted">Color: <span id="colorPreview${idx}" style="display:inline-block;width:14px;height:14px;background:${item.selectedColor};border-radius:3px;margin-left:6px;"></span></div>
          </div>
          <div><strong>$${(item.price*item.qty).toFixed(2)}</strong></div>
        </div>
        <div class="mt-2 d-flex gap-2 align-items-center">
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},-1)">-</button>
          <input type="number" min="1" value="${item.qty}" onchange="setQty(${idx}, this.value)" style="width:70px" class="form-control form-control-sm">
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},1)">+</button>
          <button class="btn btn-sm btn-danger ms-3" onclick="removeItem(${idx})">Delete</button>
          <div class="ms-3 d-flex align-items-center">
            <label class="me-2 mb-0 small">Change color</label>
            <input type="color" value="${item.selectedColor || '#ffffff'}" onchange="changeColor(${idx}, this.value)">
          </div>
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  area.innerHTML = html;
  updateTotal();
}

function changeQty(idx, delta){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  renderCart();
}

function setQty(idx, val){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  cart[idx].qty = Math.max(1, Number(val) || 1);
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  renderCart();
}

function removeItem(idx){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  cart.splice(idx,1);
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  renderCart();
}

function changeColor(idx, color){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  cart[idx].selectedColor = color;
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  // update small preview swatch without re-rendering entire list
  const preview = document.getElementById('colorPreview'+idx);
  if(preview) preview.style.background = color;
}

function updateTotal(){
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  const total = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  document.getElementById('cartTotal').textContent = total.toFixed(2);
}
