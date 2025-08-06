import React, { useState, useEffect } from "react";
import "./sheetControlPanel.css";

export default function SheetControlPanel({ owner, appName, sheetName, onClose }) {
  const [schema, setSchema] = useState(null);
  const [saving, setSaving] = useState(false);
  const baseURL = "https://gshell.cloud";

  useEffect(() => {
    fetch(`${baseURL}/sheet/${appName}/${sheetName}/schema`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(json => setSchema(json.schema))
      .catch(err => console.error("❌ Failed to load schema:", err));
  }, [owner, appName, sheetName]);

  const toggleSheetAccess = (role, action) => {
    const updated = { ...schema };
    updated.sheetAccess[role][action] = !updated.sheetAccess[role][action];
    setSchema(updated);
  };

  const toggleColumnAccess = (role, column, action) => {
    const updated = { ...schema };
    updated.columnAccess[role][column][action] = !updated.columnAccess[role][column][action];
    setSchema(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/update-schema`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates: schema })  // ✅ Fix here!
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ Schema saved successfully!");
      } else {
        alert("❌ Failed to save: " + json.message);
      }
    } catch (err) {
      console.error("❌ Error saving schema:", err);
      alert("Error saving schema.");
    }
    setSaving(false);
  };

  if (!schema) return <div className="sheet-control-panel">Loading schema...</div>;

  return (
    <div className="sheet-control-panel">
      <h2>🛡 Sheet Access Control for {sheetName}</h2>

      {Object.keys(schema.sheetAccess || {}).map(role => (
        <div key={role} className="access-role">
          <h3>🔐 {role}</h3>
          {["read", "write", "delete"].map(action => (
            <label key={action} className="checkbox-row">
              <input
                type="checkbox"
                checked={schema.sheetAccess[role][action]}
                onChange={() => toggleSheetAccess(role, action)}
              />
              {action}
            </label>
          ))}
        </div>
      ))}

      <hr style={{ margin: "1rem 0" }} />

      <h2>📊 Column Access</h2>

      {Object.keys(schema.columnAccess || {}).map(role => (
        <div key={role} className="access-role">
          <h3>👥 {role}</h3>
          <table className="column-access-table">
            <thead>
              <tr>
                <th>Column</th>
                <th>Read</th>
                <th>Write</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(schema.columnAccess[role] || {}).map(column => (
                <tr key={column}>
                  <td>{column}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={schema.columnAccess[role][column]?.read}
                      onChange={() => toggleColumnAccess(role, column, "read")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={schema.columnAccess[role][column]?.write}
                      onChange={() => toggleColumnAccess(role, column, "write")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button onClick={onClose} style={{ backgroundColor: "#ddd", padding: "0.5rem 1rem" }}>Close</button>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: "#22c55e", color: "white", padding: "0.5rem 1rem" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
