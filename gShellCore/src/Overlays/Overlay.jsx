import React from 'react';
import './OverlayStyles/overlay.css';

export default function Overlay({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div
      className="default-overlay-container"
      onClick={onClose}
    >
      <div
        className="default-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
