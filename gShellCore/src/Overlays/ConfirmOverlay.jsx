import "./OverlayStyles/confirmOverlay.css";

// components/Overlays/ConfirmOverlay.jsx
import React from 'react';
import Overlay from './Overlay';

export default function ConfirmOverlay({ show, onCancel, onConfirm, title, message }) {
  return (
<Overlay show={show} onClose={onCancel}>
  <div className="confirm-overlay-wrapper">
    <h2>{title || "Confirm Action"}</h2>
    <p>{message || "Are you sure you want to proceed?"}</p>

    <div className="button-row">
      <button onClick={onCancel} className="cancel-btn">Cancel</button>
      <button onClick={onConfirm} className="confirm-btn">Yes, Delete</button>
    </div>
  </div>
</Overlay>

  );
}
