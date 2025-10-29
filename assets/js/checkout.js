
// checkout.js - display products and handle submission
document.addEventListener('DOMContentLoaded', ()=> {
  document.getElementById('year3').textContent = new Date().getFullYear();
  renderCheckoutProducts();
  document.getElementById('checkoutForm').addEventListener('submit', submitForm);
});

function renderCheckoutProducts(){
  const area = document.getElementById('checkoutProducts');
  const cart = JSON.parse(localStorage.getItem('cart_v1')||'[]');
  if(cart.length===0){
    area.innerHTML = '<div class="alert alert-info">Your cart is empty. <a href="index.html">Shop now</a></div>';
    document.getElementById('checkoutTotal').textContent = '0.00';
    document.getElementById('checkoutForm').style.display = 'none';
    return;
  }
  let html = '<ul class="list-group">';
  let total = 0;
  cart.forEach(item=>{
    total += item.qty * item.price;
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <div><strong>${item.title}</strong><div class="small text-muted">Qty: ${item.qty} · Color: <span style="display:inline-block;width:14px;height:14px;background:${item.selectedColor || '#ffffff'};border-radius:3px;margin-left:6px;"></span></div></div>
      <div>$${(item.price*item.qty).toFixed(2)}</div>
    </li>`;
  });
  html += '</ul>';
  area.innerHTML = html;
  document.getElementById('checkoutTotal').textContent = total.toFixed(2);
}

function submitForm(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if(!name){ alert('Please enter your name'); return; }
  // mock processing
  alert('Payment successful! Thank you, ' + name);
  localStorage.removeItem('cart_v1');
  window.location.href = 'index.html';
}
