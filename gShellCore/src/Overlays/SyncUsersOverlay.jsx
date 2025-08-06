// components/Overlays/SyncUsersOverlay.jsx
import React, { useEffect, useState } from "react";
import Overlay from "./Overlay";
import "./OverlayStyles/SyncUsersOverlay.css";

export default function SyncUsersOverlay({ show, onClose, appName, sheetName }) {
  const [authFields, setAuthFields] = useState([]);
  const [sheetColumns, setSheetColumns] = useState([]);
  const [mappings, setMappings] = useState({}); // { authField: sheetColumn }
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [autoSync, setAutoSync] = useState(false);

  const baseURL = "https://gshell.cloud";

  useEffect(() => {
    if (!show) return;

    async function loadFields() {
      try {
        const [authRes, sheetRes] = await Promise.all([
          fetch(`${baseURL}/user/${appName}/auth-fields`, {
            credentials: "include",
          }),
          fetch(`${baseURL}/sheet/${appName}/${sheetName}/schema`, {
            credentials: "include",
          }),
        ]);

        const authJson = await authRes.json();
        const sheetJson = await sheetRes.json();

        if (authJson.success && authJson.fields) {
          // ✅ Exclude 'password', 'id', and 'apps' from selectable fields
          const authKeys = Object.keys(authJson.fields).filter(
            k => !["password", "id", "apps"].includes(k)
          );
          setAuthFields(authKeys);
        }

        if (sheetJson.success && sheetJson.schema?.columnTypes) {
          const cols = Object.keys(sheetJson.schema.columnTypes);
          setSheetColumns(cols);
        }
if (sheetJson.success && sheetJson.schema?.columnTypes) {
  const cols = Object.keys(sheetJson.schema.columnTypes);
  setSheetColumns(cols);
  
  // 🧠 Load toggle state from schema
  if ('autoSyncFromAuth' in sheetJson.schema) {
    setAutoSync(sheetJson.schema.autoSyncFromAuth === true);
  }
}

        setMappings({}); // reset mappings
        setSelectedFields(new Set()); // reset selected fields
      } catch (err) {
        console.error("❌ Failed to load auth or sheet fields:", err);
      }
    }

    loadFields();
  }, [show, appName, sheetName]);

  const handleMappingChange = (authField, sheetCol) => {
    setMappings(prev => ({
      ...prev,
      [authField]: sheetCol
    }));
  };

  async function updateAutoSyncSchema(value) {
    const filteredMappings = {};
    for (let field of selectedFields) {
      if (mappings[field]) {
        filteredMappings[field] = mappings[field];
      }
    }
  
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/update-schema`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          updates: {
            autoSyncFromAuth: value,
            autoSyncMap: value ? filteredMappings : undefined
          }
        })
      });
  
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      console.log(`✅ Schema updated: autoSyncFromAuth = ${value}`);
    } catch (err) {
      console.error("❌ Failed to update autoSync toggle in schema:", err);
    }
  }
  
  


  const handleSync = async () => {
    const filteredMappings = {};
    for (let field of selectedFields) {
      if (mappings[field]) {
        filteredMappings[field] = mappings[field];
      }
    }
  
    console.log("🔍 Current mappings:", mappings);
    console.log("🔍 Selected fields:", Array.from(selectedFields));
    console.log("🔍 Filtered mappings:", filteredMappings);
  
    try {
      // 🧠 Step 1: Fetch all auth users
      const authRes = await fetch(`${baseURL}/user/${appName}/auth`, {
        credentials: "include"
      });
      const authJson = await authRes.json();
      if (!authJson.success) throw new Error("Failed to fetch auth users");
      
      console.log("🔍 Raw auth users:", authJson.users); // Debug: see what we get from auth
  
      // 🧠 Step 2: Map users to selected sheet fields
      const users = authJson.users.map(user => {
        const row = {};
      
        // 🧠 Copy over selected mapped fields
        for (const [authField, sheetField] of Object.entries(filteredMappings)) {
          if (sheetField !== 'id') {
            row[sheetField] = user[authField];
          }
        }
      
        // ✅ FIXED: Use user.uuid instead of user.id
        row.uuid = user.uuid;
        
        console.log(`🔧 Mapped user ${user.username}: uuid=${user.uuid} -> row.uuid=${row.uuid}`);
      
        return row;
      });
      
  
      console.log("🔍 Syncing users:", users); // Debug log to see what's being sent
  
      // 🧠 Step 3: Send users to sync route
      const res = await fetch(`${baseURL}/user/${appName}/${sheetName}/sync-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ users })
      });
  
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
  
      alert(`✅ Synced ${json.rows} users`);
      onClose();
    } catch (err) {
      alert("❌ Sync failed: " + err.message);
    }
  };

  return (
    <Overlay show={show} onClose={onClose}>
      <h2>🔄 Sync Auth Users → "{sheetName}"</h2>

      <div className="sync-fields-list">
        <div className="mapping-header">
          <strong></strong>
          <strong>Auth Field</strong>
          <strong>→</strong>
          <strong>Destination Column</strong>
        </div>
        {authFields.map((field, i) => (
          <div className="mapping-row" key={i}>
            <input
              type="checkbox"
              checked={selectedFields.has(field)}
              onChange={() => {
                setSelectedFields(prev => {
                  const newSet = new Set(prev);
                  newSet.has(field) ? newSet.delete(field) : newSet.add(field);
                  return newSet;
                });
              }}
            />
            <span>{field}</span>
            <span>→</span>
            <select
              disabled={!selectedFields.has(field)}
              value={mappings[field] || ""}
              onChange={(e) => handleMappingChange(field, e.target.value)}
            >
              <option value="">-- Select column --</option>
              {sheetColumns.map(col => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="auto-sync-toggle">
  <label>
  <input
  type="checkbox"
  checked={autoSync}
  onChange={(e) => {
    const newVal = e.target.checked;
    setAutoSync(newVal);
    updateAutoSyncSchema(newVal); // 🔁 live update
  }}
/>

    🔁 Auto-sync new auth users into this sheet
  </label>
</div>

      <div className="button-row">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={handleSync}>
          Sync Selected Fields
        </button>
      </div>
    </Overlay>
  );
}