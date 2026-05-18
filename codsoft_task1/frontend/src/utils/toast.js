let toastTimer;

export function toast(msg, type = 'success') {
  let el = document.getElementById('talenthub-toast');
  
  if (!el) {
    el = document.createElement('div');
    el.id = 'talenthub-toast';
    document.body.appendChild(el);
  }
  
  // Format message if it has line breaks
  el.innerHTML = msg.replace(/\n/g, '<br>');
  el.className = 'show ' + type;
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { 
    el.className = ''; 
  }, 4000);
}
