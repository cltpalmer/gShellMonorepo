// IntegrationViewOverlay.jsx
import React, { useEffect, useState } from 'react';
import Overlay from './Overlay';
import {showToast} from '../components/Toast';
import {fetchCodes} from '../pages/Integrations';

import './OverlayStyles/IntegrationViewOverlay.css';

export default function IntegrationViewOverlay({ show, onClose, code, data }) {
  const [autoAdd, setAutoAdd] = useState(false);
  const [sheetList, setSheetList] = useState([]);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [showSheetPopup, setShowSheetPopup] = useState(false);
  const baseURL = "https://gshell.cloud";

  useEffect(() => {
    if (!show || !data) return;
    setAutoAdd(data.autoAddSheets);
    setSheetList(data.sheets || []);
  }, [show, data]);

  useEffect(() => {
    if (!data || !data.app) return;
  
    async function loadAvailableSheets() {
      try {
        const res = await fetch(`${baseURL}/sheet/list`, { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.apps?.[data.app]) {
          setAvailableSheets(json.apps[data.app].sheets || []);
        }
        
      } catch (err) {
        console.error("❌ Failed to load available sheets:", err);
      }
    }
  
    loadAvailableSheets();
  }, [data]);

  const updateAutoAdd = async (value) => {
    try {
      const res = await fetch(`${baseURL}/user/update-integration-code/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates: { autoAddSheets: value } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("✅ Updated autoAddSheets");
    } catch (err) {
      console.error("❌ Failed to update autoAdd:", err);
    }
  };

  async function removeSheet(sheetName) {
    const res = await fetch(`${baseURL}/user/integration/${code}/remove-sheet`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sheetName })
    });
  
    const json = await res.json();
    if (json.success) {
      showToast("✅ Sheet removed from integration");
      fetchCodes();
    } else {
      alert("❌ Failed: " + json.message);
    }
  }

  async function handleSave() {
    const payload = {
      sheetName: selectedSheet,
    };
  
    const res = await fetch(`${baseURL}/user/integration/${code}/add-sheet`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  
    const json = await res.json();
    if (json.success) {
        fetchCodes();
        onClose();
    } else {
      alert("❌ Failed to add integration");
    }
  }

  // Get the sheets to display (first 3 if there are more than 3)
  const displayedSheets = (data?.sheets || []).slice(0, 3);
  const hasMoreSheets = (data?.sheets?.length || 0) > 3;



  
  return (
    <Overlay show={show} onClose={onClose}>
      <div className="integration-overlay-header">
            <h2>Integration Settings: {data?.app}</h2>
      </div>

      <div className="integration-view-overlay">
      {code && (
  <div className="access-key-box">
    <div className="access-key-box-code">
    <p><strong>Access Key:</strong> <code>{code}</code></p>
    <button
      className="copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(`${code}`);
        showToast("📋 Copied access key!");
      }}
    >
      📋 Copy
    </button>
    </div>
    <label className="custom-checkbox">
  <input
    type="checkbox"
    checked={autoAdd}
    onChange={(e) => {
      const val = e.target.checked;
      setAutoAdd(val);
      updateAutoAdd(val);
    }}
  />
  <span className="checkmark"></span>
  <p>Auto-add new sheets on creation</p>
</label>
  </div>
)}

<div className="integration-sheet-container">

<div className="integration-sheet-list-wrapper">
  <div className="integration-sheet-list">
    {displayedSheets.map((sheet, i) => (
      <div key={i} className="sheet-row">
        <span className="sheet-name">{sheet}</span>
        <button className="trash-btn" onClick={() => removeSheet(sheet)}>🗑️</button>
      </div>
    ))}
  </div>
  
  {hasMoreSheets && (
    <button
      className="toggle-sheet-view-btn"
      onClick={() => setShowSheetPopup(true)}
    >
      🔽 View All ({data?.sheets?.length || 0})
    </button>
  )}
</div>

<div className="integration-sheet-select">
  <div className="integration-sheet-select-label">
<label>manual add</label>
</div>
<select className="integration-sheet-select-dropdown" value={selectedSheet} onChange={e => setSelectedSheet(e.target.value)}>
  <option value="">   select sheet  </option>
  {(availableSheets || []).map(sheet => (
    <option key={sheet} value={sheet}>{sheet}</option>
  ))}
</select>

<button 
className="add-sheet-btn" 
onClick={handleSave}
disabled={!selectedSheet}
>
  ➕ Add Sheet
</button>
</div>

</div>

{/* Mini Sheet Popup */}
{showSheetPopup && (
  <div className="sheet-popup-overlay" onClick={() => setShowSheetPopup(false)}>
    <div className="sheet-popup" onClick={(e) => e.stopPropagation()}>
      <div className="sheet-popup-header">
        <h3>All Sheets ({data?.sheets?.length || 0})</h3>
        <button className="close-popup-btn" onClick={() => setShowSheetPopup(false)}>
          ✕
        </button>
      </div>
      <div className="sheet-popup-list">
        {(data?.sheets || []).map((sheet, i) => (
          <div key={i} className="sheet-popup-row">
            <span className="sheet-popup-name">{sheet}</span>
            <button 
              className="trash-btn-popup" 
              onClick={() => {
                removeSheet(sheet);
                setShowSheetPopup(false);
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    
</div>
    </Overlay>
  );
}