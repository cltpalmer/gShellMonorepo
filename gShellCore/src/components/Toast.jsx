import React from 'react';
import ReactDOM from 'react-dom/client';
import '../components/Toast.css'; // 🎨 import your styles

let toastRoot = null;
let timeout = null;

// Toast component inside this file (not separate)
function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
}

// Create container <div id="toast-root"></div> if not already there
function createToastContainer() {
  if (!toastRoot) {
    const div = document.createElement('div');
    div.id = 'toast-root';
    document.body.appendChild(div);
    toastRoot = ReactDOM.createRoot(div);
  }
}

// 👑 GLOBAL FUNCTION — call this from anywhere!
export function showToast(message, duration = 2500) {
  createToastContainer();

  // Show the toast
  toastRoot.render(<Toast message={message} visible={true} />);

  // Clear previous timeout and set new one to hide
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    toastRoot.render(<Toast message={message} visible={false} />);
  }, duration);
}
