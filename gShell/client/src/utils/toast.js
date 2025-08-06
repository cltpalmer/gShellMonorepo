// toast.js
export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `simple-toast toast-${type}`;
    toast.innerText = message;
  
    document.body.appendChild(toast);
  
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });
  
    // Remove toast after duration
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300); // wait for fade-out
    }, duration);
  }
  