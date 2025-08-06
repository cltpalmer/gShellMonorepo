// components/SmartLinkEditor.jsx
import React, { useState, useEffect } from "react";
import SmartLinkConfigBox from "../components/SmartLink";

import "./OverlayStyles/ColumnSettingsOverlay.css";

export default function SmartLinkEditor({ appName, sheetName, columnName, onClose }) {
  const [sheets, setSheets] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);

  const [enableSmartLink, setEnableSmartLink] = useState(false);
  const [linkTargetSheet, setLinkTargetSheet] = useState("");
  const [linkIdentifier, setLinkIdentifier] = useState("");
  const [linkDisplayFields, setLinkDisplayFields] = useState([]);
  const [storeMode, setStoreMode] = useState("reference");
  const baseURL = "https://gshell.cloud";

  // 🔁 Load available sheets
  async function loadSheets() {
    try {
      const res = await fetch(`${baseURL}/sheet/list`, {
        credentials: "include"
      });
      const json = await res.json();
      
      console.log("📋 Raw sheet list response:", json);
      
      if (json.success && json.apps) {
        // 🔧 FIX: Extract sheets for the current app
        const currentAppSheets = json.apps[appName] || [];
        console.log("📋 Sheets for current app:", currentAppSheets);
        setSheets(currentAppSheets);
      } else {
        console.warn("⚠️ Failed to load sheets:", json.message);
        setSheets([]);
      }
    } catch (err) {
      console.error("❌ Error loading sheets:", err);
      setSheets([]);
    }
  }

  // 📦 Fetch available columns from selected sheet
  async function fetchSheetColumns(targetAppName, sheetName) {
    try {
      // Handle both single parameter (sheetName) and dual parameter (appName, sheetName) calls
      const actualAppName = sheetName ? targetAppName : appName;
      const actualSheetName = sheetName || targetAppName;
      
      console.log("🔍 Fetching columns for:", { actualAppName, actualSheetName });
      
      const res = await fetch(`${baseURL}/sheet/${actualAppName}/${actualSheetName}/schema`, {
        credentials: "include"
      });
      const json = await res.json();
      
      console.log("📋 Schema response for", actualSheetName, ":", json);
      
      if (json.success && json.schema?.columnTypes) {
        const columns = Object.keys(json.schema.columnTypes);
        console.log("📋 Available columns:", columns);
        return columns;
      }
      
      console.warn("⚠️ No columnTypes found in schema");
      return [];
    } catch (err) {
      console.error("❌ Failed to fetch columns:", err);
      return [];
    }
  }

  // 🔄 Load when column is selected
  useEffect(() => {
    if (!columnName) return;
    
    console.log("🔄 Loading for column:", columnName);
    loadSheets();

    // Load existing SmartLink config for the column
    async function loadExisting() {
      try {
        const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/schema`, {
          credentials: "include"
        });
        const json = await res.json();
        
        console.log("📋 Current schema:", json.schema);
        
        const config = json.schema?.smartLinks?.[columnName];
        if (config) {
          console.log("📋 Found existing SmartLink config:", config);
          setEnableSmartLink(true);
          setLinkTargetSheet(config.targetSheet);
          setLinkIdentifier(config.refColumn);
          setLinkDisplayFields(config.displayColumns || []);
          setStoreMode(config.storeMode || "reference");
          
          // Load fields for the target sheet
          if (config.targetSheet) {
            const fields = await fetchSheetColumns(config.targetSheet);
            setAvailableFields(fields);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load existing SmartLink config:", err);
      }
    }

    loadExisting();
  }, [columnName, appName, sheetName]);




  // ✅ Save back to schema
  async function handleSave() {
    try {
      const updates = enableSmartLink
        ? {
            smartLinks: {
              [columnName]: {
                targetSheet: linkTargetSheet,
                refColumn: linkIdentifier,
                displayColumns: linkDisplayFields,
                storeMode,
              }
            }
          }
        : {
            smartLinks: {
              [columnName]: null // Disable if toggled off
            }
          };

      console.log("💾 Saving SmartLink updates:", updates);

      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/update-schema`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      alert("✅ SmartLink updated");
      onClose();
    } catch (err) {
      console.error("❌ Failed to update SmartLink:", err);
      alert("Failed to update: " + err.message);
    }
  }




return (
  <div className="smartlink-editor-box">
    <h4 className="smartlink-editor-title">
      🔗 Configure SmartLink for: <code>{columnName}</code>
    </h4>

    <SmartLinkConfigBox
      enableSmartLink={enableSmartLink}
      setEnableSmartLink={setEnableSmartLink}
      linkTargetSheet={linkTargetSheet}
      setLinkTargetSheet={setLinkTargetSheet}
      linkIdentifier={linkIdentifier}
      setLinkIdentifier={setLinkIdentifier}
      linkDisplayFields={linkDisplayFields}
      setLinkDisplayFields={setLinkDisplayFields}
      appName={appName}
      sheets={sheets}
      availableFields={availableFields}
      setAvailableFields={setAvailableFields}
      columnsOfSheet={fetchSheetColumns}
      storeMode={storeMode}
      setStoreMode={setStoreMode}
    />

    <div className="smartlink-editor-actions">
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleSave}>Save SmartLink</button>
    </div>

    <details className="smartlink-debug">
      <summary>Debug Info</summary>
      <pre>{JSON.stringify({
        appName,
        sheets,
        availableFields,
        enableSmartLink,
        linkTargetSheet,
        linkIdentifier
      }, null, 2)}</pre>
    </details>
  </div>
);

}