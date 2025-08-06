import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { addRow, addColumn } from "../utils/sheetControls";
import { useNavigate } from 'react-router-dom';
import { allowedTypes, typeLabels } from "../utils/columnTypes.mjs";

import ColumnSettingsOverlay from "../Overlays/ColumnSettingsOverlay";
import SmartLinkConfigBox from "../components/SmartLink";
import AutomationOverlay from "../Overlays/AutomationOverlay";
import "../styles/sheetViewer.css";
import GroupedListOverlay from "../Overlays/GroupedListOverlay"; // ✅ Import the modal
import SyncUsersOverlay from "../Overlays/SyncUsersOverlay";
import RealtimeOverlay from "../Overlays/RealtimeOverlay";
import SmartInput from "../components/SmartInput";



import editColumnIcon from "../assets/editColumn.png";
import eyeIcon from "../assets/eyeIcon.svg";
import syncIcon from "../assets/sync.svg";
import automationIcon from "../assets/sheetAutomation.svg";
import sheetControlIcon from "../assets/privacy.png";
import SheetControlPanel from "../components/sheetControlPanel";
import realtimeIcon from "../assets/realtime.svg";

export default function SheetViewer() {
  const navigate = useNavigate();
  const [showSheetControlPanel, setShowSheetControlPanel] = useState(false);
  const { appName, sheetName } = useParams();
  const [editingCell, setEditingCell] = useState(null); // { rowId, key, value }
  const [viewingImage, setViewingImage] = useState(null);
  const [preFilledGroupedList, setPreFilledGroupedList] = useState([]);

  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [newColumnType, setNewColumnType] = useState("text");
  const [columnTypes, setColumnTypes] = useState({});
  const [cellErrors, setCellErrors] = useState({});
  const [newColumnError, setNewColumnError] = useState("");
  const [showAutomationOverlay, setShowAutomationOverlay] = useState(false);
  const [showGroupedListEditor, setShowGroupedListEditor] = useState(false);
  const [editingListMeta, setEditingListMeta] = useState({
    rowId: null,
    key: "",
    value: []
  });
  const [showListInput, setShowListInput] = useState(false);
  const [listInputMeta, setListInputMeta] = useState({ rowId: null, key: null, value: [] });
  const [listSubType, setListSubType] = useState("normal"); // "normal" | "grouped"
  const [columnStep, setColumnStep] = useState("chooseType"); // "chooseType" or "name"
  const [listTypes, setListTypes] = useState({});

  const [showSyncUsersOverlay, setShowSyncUsersOverlay] = useState(false);

  //SmartLink Feature
  const [enableSmartLink, setEnableSmartLink] = useState(false);
  const [targetSheet, setTargetSheet] = useState('');
  const [identifierColumn, setIdentifierColumn] = useState('');
  const [displayFields, setDisplayFields] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [linkTargetSheet, setLinkTargetSheet] = useState("");
  const [linkIdentifier, setLinkIdentifier] = useState("");
  const [linkDisplayFields, setLinkDisplayFields] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [owner, setOwner] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [showRealtime, setShowRealtime] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]); // Array of row IDs
  const [rowSelectMode, setRowSelectMode] = useState(false); // Row selection mode
  const baseURL = "https://gshell.cloud";



  useEffect(() => {
    fetch(`${baseURL}/user/me`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.owner) {
          setOwner(json.owner);
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch owner:", err);
      });
  }, []);
  

  useEffect(() => {
    if (!appName || !sheetName) return;
    fetch(`${baseURL}/sheet/${appName}/${sheetName}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        if (!json.success) return setError(json.message);
        setRows(json.data || []);
        if (json.data && json.data.length > 0) {
          setHeaders(Object.keys(json.data[0]));
        } else {
          setHeaders([]);
        }
  
        // 🧠 Replace these:
        // setColumnTypes(json.columnTypes || {});
        // setListTypes(json.listTypes || {});
  
        // 🧼 With this cleaned-up version:
        setColumnTypes(Object.fromEntries(
          Object.entries(json.columnTypes || {}).map(([k, v]) => [k.toLowerCase(), v])
        ));
        setListTypes(Object.fromEntries(
          Object.entries(json.listTypes || {}).map(([k, v]) => [k.toLowerCase(), v])
        ));
      })
      .catch(err => setError(err.message));
  }, [appName, sheetName]);
  

useEffect(() => {
  if (!appName || !sheetName) return;

  const fetchSheetAndSchema = async () => {
    try {
      console.log("🔄 Loading sheet data and schema...");
      
      // 🧾 Fetch sheet data AND schema in parallel
      const [sheetRes, schemaRes] = await Promise.all([
        fetch(`${baseURL}/sheet/${appName}/${sheetName}`, {
          credentials: 'include'
        }),
        fetch(`${baseURL}/sheet/${appName}/${sheetName}/schema`, {
          credentials: 'include'
        })
      ]);

      const [sheetJson, schemaJson] = await Promise.all([
        sheetRes.json(),
        schemaRes.json()
      ]);

      // Handle sheet data
      if (!sheetJson.success) {
        setError(sheetJson.message);
        return;
      }

      setRows(sheetJson.data || []);
      if (sheetJson.data && sheetJson.data.length > 0) {
        setHeaders(Object.keys(sheetJson.data[0]));
      } else {
        setHeaders([]);
      }

      // Handle schema data (prioritize schema over sheet data for column types)
      if (schemaJson.success && schemaJson.schema) {
        const schema = schemaJson.schema;
        const columnTypes = schema.columnTypes || {};
        const listTypes = schema.listTypes || {};

        console.log("📋 Loaded column types from schema:", columnTypes);
        console.log("📋 Loaded list types from schema:", listTypes);

        // 🧼 Set column types (no need to normalize case - keep original)
        setColumnTypes(columnTypes);
        setListTypes(listTypes);
      } else {
        console.warn("⚠️ Failed to load schema, falling back to sheet data");
        // Fallback to sheet data if schema fails
        setColumnTypes(sheetJson.columnTypes || {});
        setListTypes(sheetJson.listTypes || {});
      }

    } catch (err) {
      console.error("❌ Error loading sheet data:", err);
      setError(err.message);
    }
  };

  fetchSheetAndSchema();
}, [appName, sheetName]);

  
  useEffect(() => {
    fetch(`${baseURL}/sheet/list`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.apps?.[appName]) {
          setSheets(json.apps[appName]);
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch sheets:", err);
      });
  }, [appName]);




  function handleEditByIndex(rowIndex, key, newValue) {
    const row = rows?.[rowIndex];
    if (!row || !row.id) {
      console.warn("⚠️ Invalid row at index", rowIndex);
      return;
    }
  
    const rowId = row.id;
    handleEdit(rowId, key, newValue); // 🧠 Calls your existing edit logic
  }
  

async function handleEdit(rowId, key, rawValue) {
  // ✅ FIXED: Remove .toLowerCase() to match renderTable logic
  const type = columnTypes?.[key] || "text";  // ← Changed from columnTypes?.[key.toLowerCase()]
  let newValue = rawValue;

  // Validation based on type
  if (type === "number" && isNaN(Number(newValue))) {
    setCellErrors(prev => ({
      ...prev,
      [`${rowId}-${key}`]: "❗ Please enter a number"
    }));
    return;
  }

  // Clear error if valid
  setCellErrors(prev => {
    const updated = { ...prev };
    delete updated[`${rowId}-${key}`];
    return updated;
  });

  // Auto-cast based on schema type
  if (type === "number") {
    const parsed = parseFloat(rawValue);
    newValue = isNaN(parsed) ? null : parsed;
  } else if (type === "bool") {
    newValue = rawValue === "true" || rawValue === true ? true : false;
  }

  console.log("🔍 Making edit request:", { rowId, key, rawValue, type, newValue });

  // 🚀 MISSING PART: Actually send the data to server
  try {
    const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/${rowId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        updates: {
          [key]: newValue
        }
      })
    });

    const json = await res.json();
    
    if (!json.success) {
      alert("❌ Failed to update cell: " + json.message);
      return;
    }

    // ✅ Update frontend state after successful server update
    setRows(prev => {
      return prev.map(row => {
        if (row.id === rowId) {
          return { ...row, [key]: newValue };
        }
        return row;
      });
    });

    console.log("✅ Cell updated successfully:", { rowId, key, newValue });

  } catch (error) {
    console.error("❌ Error updating cell:", error);
    alert("❌ Error updating cell: " + error.message);
  }
}


  async function handleDelete() {
    if (selectedCells.length === 0) return;
    
    // Convert uniqueId back to rowId for the API call
    const apiCells = selectedCells.map(cell => ({
      rowId: cell.rowId,
      key: cell.key
    }));
    
    console.log("📤 Sending to bulkClear:", apiCells);
  
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/bulkClear`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ updates: apiCells })
      });
  
      const json = await res.json();
      if (!json.success) {
        alert("❌ Failed to clear cells: " + json.message);
        return;
      }
  
      // Group selected cells by rowId
      const cellsByRow = apiCells.reduce((acc, cell) => {
        if (!acc[cell.rowId]) acc[cell.rowId] = [];
        acc[cell.rowId].push(cell.key);
        return acc;
      }, {});
  
      // Update frontend state
      setRows(prev => {
        return prev.map(row => {
          const rowCells = cellsByRow[row.id];
          if (!rowCells) return row; // Row not affected
  
          // Get all non-id keys in the row
          const allDataKeys = Object.keys(row).filter(key => key !== 'id');
          
          // Check if all data fields were selected for clearing
          const clearingAllFields = allDataKeys.every(key => rowCells.includes(key));
          
          if (clearingAllFields) {
            // This row should be completely removed - return null and filter later
            return null;
          } else {
            // Just clear the selected fields
            const updatedRow = { ...row };
            rowCells.forEach(key => {
              updatedRow[key] = "";
            });
            return updatedRow;
          }
        }).filter(row => row !== null); // Remove null entries (deleted rows)
      });
  
      setSelectedCells([]);
      console.log(`✅ Updated frontend: cleared cells and removed complete rows`);
      
    } catch (err) {
      alert("❌ Error during bulk clear: " + err.message);
    }
  }

  async function handleAddRow() {
    try {
      // ✅ Don't generate ID on client - let server use Date.now()
      const newRow = {}; // Empty row, server will assign timestamp ID
      
      const result = await addRow(appName, sheetName, newRow);
      if (result.success) {
        const fixedRow = { ...result.data };
        headers.forEach(h => {
          if (columnTypes[h] === "bool" && fixedRow[h] === undefined) {
            fixedRow[h] = false;
          }
        });
        
        setRows(prev => [...(prev || []), fixedRow]);
        if (result.data && Object.keys(result.data).length > 0) {
          setHeaders(prev => {
            const currentHeaders = prev || [];
            const newKeys = Object.keys(result.data);
            return [...new Set([...currentHeaders, ...newKeys])];
          });
        }
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      alert("❌ Failed to add row: " + error.message);
    }
  }
  
  async function handleAddColumn() {
    if (!newColumn.trim()) {
      setNewColumnError("❗ Column name required");
      return;
    }
  
    if (!allowedTypes.includes(newColumnType)) {
      setNewColumnError("❗ Invalid column type");
      return;
    }
  
    try {
      const options = {};

      // 🧠 If list type, handle list options
      if (newColumnType === "list") {
        options.listType = listSubType;
        if (listSubType === "grouped") {
          options.defaultGroups = preFilledGroupedList;
        }
      }
      
      // ✅ Allow SmartLink for any column type (not just list)
      if (enableSmartLink) {
        if (!linkTargetSheet || !linkIdentifier) {
          setNewColumnError("❗ SmartLink requires both Target Sheet and Identifier Column");
          return;
        }
      
        options.smartLink = {
          targetSheet: linkTargetSheet,
          targetApp: appName,
          refColumn: linkIdentifier,
          displayColumns: linkDisplayFields,
          storeMode: "reference"
        };
      }
      
      
      console.log("🧪 Sending addColumn with options:", options);
  
      const result = await addColumn(appName, sheetName, newColumn.trim(), newColumnType, options);
  
      setNewColumnError("");
  
      if (result.success) {
        setRows(prev => (prev || []).map(row => ({ ...row, [newColumn.trim()]: "" })));
        setHeaders(prev => {
          const currentHeaders = prev || [];
          return [...new Set([...currentHeaders, newColumn.trim()])];
        });
  
        setNewColumn("");
        setNewColumnType("text");
        setEnableSmartLink(false);
        setLinkTargetSheet("");
        setLinkIdentifier("");
        setLinkDisplayFields([]);
        setShowAddColumnModal(false);
      } else {
        setNewColumnError("❌ " + result.message);
      }
    } catch (error) {
      setNewColumnError("❌ Error adding column: " + error.message);
    }
  }

  
  async function handleSaveAutomation(automationRule) {
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/appendSheetAutomation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ automation: automationRule }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        alert("✅ Automation rule saved!");
        // Optional: refresh schema or UI here
      } else {
        alert("❌ Failed to save automation: " + data.message);
      }
    } catch (err) {
      console.error("❌ Error saving automation:", err);
      alert("❌ Unexpected error while saving automation.");
    }
  };
  

  async function columnsOfSheet(appName, targetSheetName) {
    console.log("🧪 Fetching schema from:", `/sheet/${appName}/${targetSheetName}/schema`);

    const res = await fetch(`${baseURL}/sheet/${appName}/${targetSheetName}/schema`, {
      credentials: 'include'
    });
    
    const json = await res.json();

    if (json.success && json.schema?.columnTypes) {
      return Object.keys(json.schema.columnTypes);
    }

    return [];
  }

  function goBack() {
    navigate(-1);
  }


const handleCellClick = (rowId, key, currentValue, rowIndex) => {
  if (selectMode) {
    // Use rowIndex + rowId combination for unique identification
    const uniqueId = `${rowIndex}-${rowId}`;
    const alreadySelected = selectedCells.some(
      cell => cell.uniqueId === uniqueId && cell.key === key
    );
    setSelectedCells(prev =>
      alreadySelected
        ? prev.filter(cell => !(cell.uniqueId === uniqueId && cell.key === key))
        : [...prev, { rowId, key, uniqueId }]
    );
    return;
  }

  // ✅ FIXED: Remove .toLowerCase() to match renderTable logic
  const type = columnTypes?.[key];        // ← Changed from key.toLowerCase()
  const listType = listTypes?.[key];      // ← Changed from key.toLowerCase()
  
  const value = currentValue ?? "";
  console.log("💬 Clicked Cell:", { key, type, listType, value });
  
  // 🧱 If it's a grouped list, open editor modal
  if (type === "list" && listType === "grouped") {
    let groups = [];

    // Preserve structure if editing
    if (Array.isArray(value) && value.every(v => v?.name && Array.isArray(v?.options))) {
      groups = value;
    }

    console.log("🧱 Opening grouped list editor");
    setEditingListMeta({ rowId, key, value: groups });
    setShowGroupedListEditor(true);
    return;
  }

  // 📝 For text, number, list (non-grouped) - allow inline editing
  // ❌ REMOVED: Image handling (since we have visible file input)
  if (type !== "bool" && type !== "image") {
    console.log("✅ Setting editing cell:", { rowId, key, value });
    setEditingCell({ rowId, key, value, rowIndex });
  }
  
  // Note: bool and image types don't trigger inline editing
  // - bool uses checkbox directly
  // - image uses visible file input directly
};
  


  const handleCellSave = (newValue) => {
    if (editingCell) {
      const { rowId, key, value: oldValue } = editingCell;
      
      if (newValue !== oldValue) {
        handleEdit(rowId, key, newValue);
      }
      
      setEditingCell(null);
    }
  };



  const handleCellCancel = () => {
    setEditingCell(null);
  };

// Add this new function to handle row selection
const handleRowClick = (rowId, rowIndex) => {
  if (!rowSelectMode) return; // Only work in row select mode
  
  const alreadySelected = selectedRows.includes(rowId);
  setSelectedRows(prev =>
    alreadySelected
      ? prev.filter(id => id !== rowId)
      : [...prev, rowId]
  );
};


// Add this function to duplicate selected rows
async function handleDuplicateRows() {
  if (selectedRows.length === 0) return;

  try {
    const rowsToDuplicate = rows.filter(row => selectedRows.includes(row.id));
    
    console.log("🔄 Duplicating rows:", rowsToDuplicate);

    // Create new rows without IDs (server will assign new ones)
    const duplicatePromises = rowsToDuplicate.map(async (originalRow) => {
      const { id, ...rowData } = originalRow; // Remove ID
      
      const result = await addRow(appName, sheetName, rowData);
      if (result.success) {
        // Fix boolean fields if needed
        const fixedRow = { ...result.data };
        headers.forEach(h => {
          if (columnTypes[h] === "bool" && fixedRow[h] === undefined) {
            fixedRow[h] = false;
          }
        });
        return fixedRow;
      } else {
        throw new Error(result.message);
      }
    });

    const newRows = await Promise.all(duplicatePromises);
    
    // Add new rows to state
    setRows(prev => [...(prev || []), ...newRows]);
    
    // Clear selection and exit row select mode
    setSelectedRows([]);
    setRowSelectMode(false);
    
    console.log(`✅ Successfully duplicated ${newRows.length} rows`);
    
  } catch (error) {
    console.error("❌ Error duplicating rows:", error);
    alert("❌ Failed to duplicate rows: " + error.message);
  }
}



function renderTable() {
  if (!headers.length) return <p className="empty-sheet">📭 Empty sheet</p>;

  return (
    <div className="table-container">
      <table className="sheet-table">
        <thead>
          <tr>
            {/* Add row selector column header */}
            {rowSelectMode && <th className="row-selector-header">Select</th>}
            {headers.map((h, i) => (
              <th key={h}>
                <div className="column-header">
                  <div className="col-letter">{String.fromCharCode(65 + i)}</div>
                  <div className="col-main">
                    <span className="col-name">{h}</span>
                    <img
                      className="col-icon"
                      src={editColumnIcon}
                      alt="Options"
                      title="Column Options"
                      onClick={() => {
                        setShowSettings(true);
                        setSelectedColumn(h);
                      }}
                    />
                  </div>
                  <div className="col-type">{columnTypes?.[h] || "text"}</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isRowSelected = rowSelectMode && selectedRows.includes(row.id);
            
            return (
              <tr 
                key={rowIndex}
                className={isRowSelected ? 'selected-row' : ''}
                onClick={() => handleRowClick(row.id, rowIndex)}
                style={{ cursor: rowSelectMode ? 'pointer' : 'default' }}
              >
                {/* Add row selector checkbox */}
                {rowSelectMode && (
                  <td className="row-selector-cell">
                    <input
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={() => handleRowClick(row.id, rowIndex)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {headers.map(key => {
                  const isCellSelected = selectMode && selectedCells.some(
                    cell => cell.rowIndex === rowIndex && cell.key === key
                  );
                  
                  return (
                    <td
                      key={key}
                      className={isCellSelected ? 'selected-cell' : ''}
                      onClick={(e) => {
                        if (!rowSelectMode) {
                          e.stopPropagation();
                          handleCellClick(row.id, key, row[key], rowIndex);
                        }
                      }}
                    >
                      {/* Your existing cell rendering logic stays the same */}
                      {editingCell && 
                       editingCell.rowIndex === rowIndex && 
                       editingCell.key === key ? (
                        <CellEditor
                          value={editingCell.value}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          columnKey={editingCell.key}
                          allRows={rows}
                        />
                      ) : (
                        <>
                          {columnTypes?.[key] === "bool" ? (
                            <input
                              type="checkbox"
                              checked={!!row[key]}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleEditByIndex(rowIndex, key, e.target.checked);
                              }}
                              disabled={rowSelectMode}
                            />
                          ) : columnTypes?.[key] === "image" ? (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              gap: '4px',
                              minHeight: '30px'
                            }}>
                              {row[key] && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingImage(row[key]);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                  title="View Image"
                                  disabled={rowSelectMode}
                                >
                                  <img src={eyeIcon} alt="View" width="20" height="20" />
                                </button>
                              )}
                              
                              <input
                                id={`fileInput-${row.id}-${key}`}
                                type="file"
                                accept="image/*"
                                style={{
                                  fontSize: '11px',
                                  padding: '2px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  maxWidth: '100px'
                                }}
                                disabled={rowSelectMode}
                                onChange={async (e) => {
                                  e.stopPropagation();
                                  const file = e.target.files[0];
                                  if (!file) return;
                                
                                  console.log("📤 Starting image upload for file:", file.name);
                                
                                  const formData = new FormData();
                                  formData.append("file", file);
                                
                                  try {
                                    const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/admin-upload`, {
                                      method: "POST",
                                      body: formData,
                                      credentials: "include"
                                    });
                                
                                    const json = await res.json();
                                    console.log("📥 Upload response:", json);
                                
                                    if (json.success && json.url) {
                                      console.log("✅ Upload successful, updating cell with URL:", json.url);
                                      handleEditByIndex(rowIndex, key, json.url);
                                    } else {
                                      console.error("❌ Upload failed:", json);
                                      alert("❌ Upload failed: " + (json.message || "Unknown error"));
                                    }
                                  } catch (error) {
                                    console.error("❌ Upload error:", error);
                                    alert("❌ Upload error: " + error.message);
                                  }
                                
                                  e.target.value = '';
                                }}
                              />
                            </div>
                          ) : (
                            typeof row[key] === 'object'
                              ? Array.isArray(row[key])
                                ? <code style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(row[key], null, 2)}</code>
                                : <code>{JSON.stringify(row[key])}</code>
                              : row[key] ?? ""
                          )}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {viewingImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt="Zoomed"
            style={{ maxHeight: "90%", maxWidth: "90%", borderRadius: "12px", boxShadow: "0 0 20px #000" }}
          />
        </div>
      )}
    </div>
  );
}

  return (
    <div className="sheet-viewer">
     <div className="controls">
            {selectMode && (
              <button onClick={handleDelete} className="delete-btn">DELETE</button>
            )}
            <button onClick={() => setSelectMode(prev => !prev)} className="select-btn">
              {selectMode ? 'Exit Select Mode' : 'Select Cells'}
            </button>

{/* Row selection controls */}
{rowSelectMode && (
    <button onClick={handleDuplicateRows} className="h-btn" disabled={selectedRows.length === 0}>
      Duplicate Rows ({selectedRows.length})
    </button>
  )}
  <button 
    onClick={() => {
      setRowSelectMode(prev => !prev);
      setSelectedRows([]); // Clear selection when toggling
    }} 
    className="select-btn"
  >
    {rowSelectMode ? 'Exit Row Select' : 'Select Rows'}
  </button>

            <button className="header-btn" onClick={() => setShowSheetControlPanel(true)}>
              <img src={sheetControlIcon} alt="eye" style={{ width: '10px', height: '10px' }} />
              Access Control
            </button>
            <button className="header-btn" onClick={() => setShowAutomationOverlay(true)}>
              <img src={automationIcon} alt="automation" style={{ width: '10px', height: '10px' }} />
              Automation
            </button>
            <button onClick={handleAddRow} className="header-btn">Add Row</button>
            <button
  onClick={() => {
    setShowAddColumnModal(true);
    setColumnStep("chooseType");
    setNewColumnType("text");
    setListSubType("normal");
    setNewColumn("");
  }}
  className="header-btn"
>
  Add Column
</button>
            <button onClick={() => setShowSyncUsersOverlay(true)} className="header-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={syncIcon} alt="sync" style={{ width: '10px', height: '10px' }} />
              Sync Users
            </button>
          </div>
      <div className="sheet-content">
        <div className="sheet-header">
          <h2 className="sheet-title">
            <span className="app-name" onClick={goBack}>{appName}</span>
            <span className="dot-divider" />
            <span className="sheet-name">/{sheetName}</span>
          </h2>
          {error && <p className="error-message">❌ {error}</p>}
          
          <button className="realtime-btn" onClick={() => setShowRealtime(true)}>
        <span>Realtime</span>
      <img className="realtime-icon" src={realtimeIcon} alt="realtime" />
     </button>

        </div>

        {renderTable()}
            
{showAddColumnModal && (
  <div className="overlay">
    <div className="modal">
      <h3>Add New Column</h3>

      {/* 🧩 STEP 1: Type + Subtype Selection */}
      {columnStep === "chooseType" && (
        <>
          <label>🧠 Choose Column Type:</label>
          <select
            value={newColumnType}
            onChange={(e) => setNewColumnType(e.target.value)}
            className="column-type-select"
          >
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] || type}
              </option>
            ))}
          </select>

          {newColumnType === "list" && (
            <div className="list-subtype-select" style={{ marginTop: "1rem" }}>
              <label>
                <input
                  type="radio"
                  value="normal"
                  checked={listSubType === "normal"}
                  onChange={() => setListSubType("normal")}
                />
                📝 Normal List
              </label>
              <label style={{ marginLeft: "1rem" }}>
                <input
                  type="radio"
                  value="grouped"
                  checked={listSubType === "grouped"}
                  onChange={() => setListSubType("grouped")}
                />
                🧱 Grouped List
              </label>
            </div>
          )}

          <div className="modal-buttons">
          <button
  className="btn"
  onClick={() => {
    if (newColumnType === "list" && listSubType === "grouped") {
      setShowGroupedListEditor(true); // 👈 Show overlay
    } else {
      setColumnStep("name"); // move to step 2 immediately
    }
  }}
>
  ➡ Next
</button>

          </div>
        </>
      )}

      {/* 🧩 STEP 2: Name + SmartLink (if list) */}
      {columnStep === "name" && (
  <>
    <label>📛 Column Name:</label>
    <input
      value={newColumn}
      onChange={(e) => setNewColumn(e.target.value)}
      placeholder="e.g. skills, interests"
      className="column-input"
    />

    {/* 🔁 Reusable SmartLink config component */}
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
      columnsOfSheet={columnsOfSheet}
    />

    {newColumnError && <div className="cell-error-msg">{newColumnError}</div>}

    <div className="modal-buttons">
      <button onClick={handleAddColumn} className="btn">✅ Confirm</button>
      <button onClick={() => setColumnStep("chooseType")} className="btn">⬅ Back</button>
      <button onClick={() => setShowAddColumnModal(false)} className="btn">❌ Cancel</button>
    </div>
  </>
)}

    </div>
  </div>
)}
 </div>


{showListInput && (
  <div className="overlay">
    <ListInputChooser
      onSubmit={(newList) => {
        handleEdit(listInputMeta.rowId, listInputMeta.key, newList);
        setShowListInput(false);
      }}
    />
  </div>
)}

{showAutomationOverlay && (
  <AutomationOverlay
    show={showAutomationOverlay}
    onClose={() => setShowAutomationOverlay(false)}
    onSave={handleSaveAutomation}
    defaultConfig={{ watchSheet: sheetName }}
  />
)}

{showGroupedListEditor && (
  <GroupedListOverlay
    show={showGroupedListEditor}
    onClose={() => setShowGroupedListEditor(false)}
    initialData={[]} // ← can be empty for creation
    onSave={(updatedList) => {
      // 💾 Store group list into local state before schema creation
      setPreFilledGroupedList(updatedList);
      setShowGroupedListEditor(false);
      setColumnStep("name"); // ✅ NOW go to naming step
    }}
  />
)}

{showSheetControlPanel && (
  <div className="overlay">
    <SheetControlPanel
      owner={owner}
      appName={appName}
      sheetName={sheetName}
      onClose={() => setShowSheetControlPanel(false)}
    />
  </div>
)}

{showSettings && (
  <ColumnSettingsOverlay
    show={showSettings}
    onClose={() => setShowSettings(false)}
    appName={appName}
    sheetName={sheetName}
    selectedColumn={selectedColumn}             // ✅ NEW
    setSelectedColumn={setSelectedColumn}  
    column={selectedColumn} // optional if you want to focus 1 column
  />
)}

{showRealtime && (
  <RealtimeOverlay
  show={showRealtime}
  onClose={() => setShowRealtime(false)}
  appName={appName}
  sheetName={sheetName}
/>

)}

{showSyncUsersOverlay && (
<SyncUsersOverlay
  show={showSyncUsersOverlay}
  onClose={() => setShowSyncUsersOverlay(false)}
  appName={appName}
  sheetName={sheetName}
/>
)}

    </div>
  );
}

function CellEditor({ value, onSave, onCancel, columnKey, allRows }) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        onSave(editValue); // ⬅️ Save on outside click
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editValue, onSave]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      ref={inputRef}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        border: '2px solid #007bff',
        borderRadius: '4px',
        padding: '2px',
        fontSize: 'inherit',
        fontFamily: 'inherit'
      }}
    >
<SmartInput
  value={editValue}
  onChange={setEditValue}
  columnKey={columnKey}
  allRows={allRows}
/>

    </div>
  );
}
