/* AppSheets.jsx */
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import removeSheetIcon from '../assets/removeSheet.svg';
import uploadApp from '../assets/uploadapp.svg';
import appIcon from '../assets/appIcon.svg';

import ConfirmOverlay from '../Overlays/confirmOverlay';
import '../styles/appSheets.css';

export default function AppSheets() {

  const navigate = useNavigate();

  const { appName } = useParams();

  const [sheets, setSheets] = useState([]);
  const [error, setError] = useState('');
  const [sheetNameInput, setSheetNameInput] = useState('');
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(appName);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [appData, setAppData] = useState(null); // Add this line
  const [isHovered, setIsHovered] = useState(false);




  const fileInputRef = useRef();


  const baseURL = "https://gshell.cloud";



  function triggerAppImageUpload() {
    fileInputRef.current?.click();
  }
  
  
  useEffect(() => {
    if (!appName) return;
  
    fetch(`${baseURL}/sheet/list`, {
      credentials: 'include'
    })
      .then(async res => {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (!res.ok || !json.success) {
            setError(json.message || 'Something went wrong');
          } else {
            // ✅ Store the full app data
            const currentAppData = json.apps?.[appName];
            setAppData(currentAppData);
            setSheets(currentAppData?.sheets || []);
          }
        } catch (e) {
          console.warn("❌ Invalid JSON:", text);
          setError('⚠️ Backend returned invalid response');
        }
      })
      .catch(err => setError(`❌ ${err.message}`));
  }, [appName]);




  async function handleCreateSheet(sheetName) {
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/createSheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          sheetName,
          columns: [
            { name: "task", type: "text" },
            { name: "done", type: "bool" }
          ]
        }),
      });
  
      const json = await res.json();
      if (json.success) {
        setSheets(prev => [...prev, sheetName]);
      } else {
        alert("❌ " + json.message);
      }
    } catch (err) {
      alert("❌ Failed: " + err.message);
    }
  }
  
  async function handleRename(oldAppName, newAppName) {
    // 🛑 Edge case guard
    if (!newAppName.trim() || oldAppName === newAppName.trim()) {
      setIsRenaming(false);
      return;
    }
  
    try {
      const res = await fetch(`${baseURL}/sheet/renameApp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldAppName, newAppName: newAppName.trim() })
      });
  
      const json = await res.json();
  
      if (!json.success) {
        alert("❌ Rename failed: " + json.message);
        return;
      }
  
      // ✅ Optional: update your UI if you keep app list in state
      setSheets(prev => prev.map(app =>
        app === oldAppName ? newAppName.trim() : app
      ));
      setIsRenaming(false);
      alert(json.message); // "✅ App renamed to 'newAppName'"
    } catch (err) {
      console.error("❌ Rename error:", err);
      alert("❌ Failed to rename app: " + err.message);
      // ✅ Automatically go back one screen
      navigate(-1);
    }
  }
  
  async function handleSheetDelete(sheetName) {
    console.log("📤 Sending to deleteSheet:", sheetName);
  
    try {
      const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/deleteSheet`, {
        method: "DELETE",
        credentials: "include"
      });
  
      const json = await res.json();
      if (!json.success) {
        alert("❌ Failed to delete sheet: " + json.message);
        return;
      }
  
      // ✅ Update frontend state
      setSheets(prev => prev.filter(sheet => sheet !== sheetName));
      setConfirmOpen(false);
      setSheetToDelete(null); // ✅ Add this

    } catch (err) {
      alert("❌ Error during delete sheet: " + err.message);
    }
  }
  
  function triggerRename() {
    setIsRenaming(true);
    setRenameValue(appName); // default it to current app name
  }

  async function handleAppImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    const res = await fetch(`${baseURL}/sheet/${appName}/upload-icon`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
  
    const json = await res.json();
    if (json.success) {
    }
  }



  const appIconUrl = appData?.imageUrl ? `${baseURL}${appData.imageUrl}` : uploadApp;  return (
    
    
    
    
    
    
    <div className="app-sheets-page">
      
      {error && <div className="app-sheets-error">{error}</div>}

      <div className="app-sheets-container">
        <div className="app-sheets-header">
          <div className="app-sheets-controls-row">
            <button  className="app-sheets-row-sheet-btn">DELETE</button>
            <button className="app-sheets-row-sheet-btn">DUPLICATE</button>
            <button className="app-sheets-row-sheet-btn" onClick={triggerRename}>RENAME</button>
            <button className="app-sheets-row-sheet-btn" onClick={() => setShowSheetModal(true)}>NEW SHEET</button>
          </div>
          <div className="app-sheets-title-row">

          <div className="app-sheets-icon-container" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <img
            src={appIconUrl}
            alt="App Icon"
            className="app-sheets-icon"
            onClick={triggerAppImageUpload}
            title="Click to change icon"
            style={{ cursor: "pointer" }}
          />
          {isHovered && (
            <div className="app-sheets-icon-hover">
              <img src={uploadApp} alt="App Icon" />
            </div>
          )}
</div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleAppImageUpload}
      style={{ display: "none" }}
    />
          <h2 className="app-sheets-title">

  /&nbsp;
  {isRenaming ? (
    <input
      className="app-rename-input"
      value={renameValue}
      placeholder={appName}
      autoFocus
      onChange={(e) => setRenameValue(e.target.value)}
      onBlur={() => {
        setIsRenaming(false);
        if (renameValue.trim() && renameValue !== appName) {
          handleRename(appName, renameValue.trim());
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setIsRenaming(false);
          if (renameValue.trim() && renameValue !== appName) {
            handleRename(appName, renameValue.trim());
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsRenaming(false);
          setRenameValue(appName);
        }
      }}
    />
  ) : (
    <span onClick={triggerRename}>{appName}</span>
  )}
</h2>
          </div>
        </div>

        <ul className="app-sheets-list">
          {sheets.map((sheetName) => (
            <li key={sheetName} className="sheet-list-item">
              <button className = "removeSheetBtn" title="Delete Sheet" onClick={() => {setSheetToDelete(sheetName); setConfirmOpen(true)}}>
                <img src={removeSheetIcon} alt="remove sheet" />
              </button>
              <span className="sheet-name">{sheetName}</span>
              <Link to={`/sheet/${appName}/${sheetName}`} className="view-link">
                view
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ConfirmOverlay
        show={confirmOpen}
        title="Delete Sheet"
        message={`Are you sure you want to delete "${sheetToDelete}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => handleSheetDelete(sheetToDelete)}
      />

      {showSheetModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Create New Sheet</h3>
      <input
        type="text"
        placeholder="Enter sheet name"
        value={sheetNameInput}
        onChange={(e) => setSheetNameInput(e.target.value)}
      />
      <div className="modal-buttons">
        <button
          onClick={async () => {
            const trimmed = sheetNameInput.trim();
            if (!trimmed) return alert("Please enter a valid sheet name.");
            await handleCreateSheet(trimmed);
            setShowSheetModal(false);
            setSheetNameInput('');
          }}
        >
          ✅ Confirm
        </button>
        <button onClick={() => setShowSheetModal(false)}>❌ Cancel</button>
      </div>
    </div>
  </div>
)}

          </div>
  );
}
