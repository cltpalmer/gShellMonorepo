// ColumnSettingsOverlay.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import Overlay from "./Overlay";
import SmartLinkEditor from "./SmartLinkEditor";

import "./OverlayStyles/ColumnSettingsOverlay.css";


export default function ColumnSettingsOverlay({ show, onClose, appName, sheetName, selectedColumn, setSelectedColumn }) {
  const [listColumns, setListColumns] = useState([]);
  const [appendSettings, setAppendSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [allColumns, setAllColumns] = useState([]);
  const baseURL = "https://gshell.cloud";



  useEffect(() => {
    if (!show) return;

    async function fetchSchema() {
      setLoading(true);
      try {
        const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/schema`, {
          credentials: "include"
        });
        const json = await res.json();

        if (json.success && json.schema) {
          const columnTypes = json.schema.columnTypes || {};
          const appendConfig = json.schema.appendOnUpdate || {};

          console.log("📋 Schema appendOnUpdate config:", appendConfig);

          const listCols = Object.entries(columnTypes)
            .filter(([key, type]) => type === "list")
            .map(([key]) => key);

          console.log("📋 List columns found:", listCols);

          setListColumns(listCols);
          
          // Initialize append settings - explicitly set false for undefined values
          const initialSettings = {};
          listCols.forEach(col => {
            initialSettings[col] = Boolean(appendConfig[col]);
          });
          
          console.log("📋 Initial append settings:", initialSettings);
          setAppendSettings(initialSettings);

          setAllColumns(Object.keys(json.schema.columnTypes || {})); // 🌟 Save all column keys
        }
      } catch (err) {
        console.error("❌ Failed to fetch schema:", err);
        alert("❌ Failed to load column settings: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchema();
  }, [show, appName, sheetName]);


  function toggleAppend(column) {
    console.log(`🔄 Toggling append for column: ${column}`);
    setAppendSettings(prev => {
      const newSettings = {
        ...prev,
        [column]: !prev[column]
      };
      console.log(`📋 New append settings:`, newSettings);
      return newSettings;
    });
  }


  async function saveSettings() {
    try {
      console.log("💾 Saving append settings:", appendSettings);
      
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/update-schema`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          updates: {
            appendOnUpdate: appendSettings
          }
        })
      });
      
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      console.log("✅ Schema updated successfully");
      onClose();
    } catch (err) {
      console.error("❌ Failed to update schema:", err);
      alert("❌ Failed to update schema: " + err.message);
    }
  }







  if (loading) {
    return (
      <Overlay show={show} onClose={onClose}>
        <h2>⚙️ Column Settings</h2>
        <p>Loading...</p>
      </Overlay>
    );
  }

  return (
<Overlay show={show} onClose={onClose}>
<div className="column-settings-header">
    <h2 className="column-settings-title">⚙️ Column Settings</h2>
  </div>
<div className="column-settings-wrapper">


  <div className="column-settings-section">
    <h3>🔁 Append Settings (List Columns)</h3>

    {listColumns.length === 0 ? (
      <p className="column-settings-empty">No list columns found in this sheet.</p>
    ) : (
      <>
        <p className="column-settings-instruction">
          Enable appending to list columns on update:
        </p>
        <div className="column-checkbox-group">
          {listColumns.map((col) => (
            <label key={col} className="column-settings-label">
              <input
                type="checkbox"
                className="column-checkbox"
                checked={Boolean(appendSettings[col])}
                onChange={() => toggleAppend(col)}
              />
              Append to <code className="column-code">{col}</code> on update
              {appendSettings[col] && (
                <span className="column-checkmark"> ✓</span>
              )}
            </label>
          ))}
          <button className="column-settings-save-btn" onClick={saveSettings}>
            Save Changes
          </button>
        </div>
      </>
    )}
  </div>


  {/* Right: SmartLink Section */}
  <div className="column-settings-section-smartlink-section">
    <h3>🔗 SmartLink Settings</h3>
    <p>Set or update SmartLink relationships for individual columns.</p>

    <h4>🧠 Choose a column to configure:</h4>

<select
  value={selectedColumn || ""}
  onChange={(e) => setSelectedColumn(e.target.value)}
  style={{
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%",
    maxWidth: "300px",
    marginBottom: "1rem"
  }}
>
  <option value="">-- Select a column --</option>
  {allColumns.map((col) => (
    <option key={col} value={col}>
      {col}
    </option>
  ))}
</select>


    {selectedColumn && (
      <SmartLinkEditor
        appName={appName}
        sheetName={sheetName}
        columnName={selectedColumn}
        onClose={() => setSelectedColumn(null)}
      />
    )}
  </div>
</div>



</Overlay>

  );
}