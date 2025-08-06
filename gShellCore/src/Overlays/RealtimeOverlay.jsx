// ✅ FULL VERSION: RealtimeOverlay.jsx

import React, { useState } from "react";
import {showToast} from "../components/Toast";

import Overlay from "./Overlay";

import "./OverlayStyles/RealtimeOverlay.css";

export default function RealtimeOverlay({ show, onClose, appName, sheetName }) {
  const [selectedMode, setSelectedMode] = useState("onUpdate");
  const [targetField, setTargetField] = useState(""); // 👈 new
  const [eventName, setEventName] = useState("");     // 👈 new
  const baseURL = "https://gshell.cloud";

  const handleConfirm = async () => {
    try {
      const realtimeConfig = {
        [selectedMode]: true,
      };

      // 🧠 Add targeting only if filled
      if (targetField.trim()) {
        realtimeConfig.target = "user";
        realtimeConfig.targetField = targetField.trim();
      }

      if (eventName.trim()) {
        realtimeConfig.event = eventName.trim();
      }

      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/update-schema`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          updates: {
            realtime: realtimeConfig
          }
        })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast ("Realtime " + selectedMode + " enabled!");
      onClose();
    } catch (err) {
      showToast ("❌ Failed to enable realtime: " + err.message);
    }
  };

  return (
    <Overlay show={show} onClose={onClose}>
      <h2>⚡ Enable Realtime</h2>

      <div className="RealtimeOverlay-field">
        <label>Select mode:</label>
        <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
          <option value="onAdd">onAdd</option>
          <option value="onUpdate">onUpdate</option>
          <option value="onDelete">onDelete</option>
        </select>
      </div>

      <div className="RealtimeOverlay-field">
        <label>Target Field (optional):</label>
        <input
          type="text"
          placeholder="e.g. receiver_uuid"
          value={targetField}
          onChange={(e) => setTargetField(e.target.value)}
        />
      </div>

      <div className="RealtimeOverlay-field">
        <label>Custom Event Name (optional):</label>
        <input
          type="text"
          placeholder="e.g. friend_requests_onAdd"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </div>

      <div className="button-row">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
        <button className="confirm-btn" onClick={handleConfirm}>Enable</button>
      </div>
    </Overlay>
  );
}
