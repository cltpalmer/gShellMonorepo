import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // for internal routing if needed
import { Link } from 'react-router-dom';
import { createApp } from '../utils/sheetControls';
import {showToast} from '../components/Toast';
import { getSession } from '@shared/utils/getSession';


import appIcon from '../assets/app.png';
import searchIcon from '../assets/search.png';
import uploadApp from '../assets/uploadapp.svg';
import nullAppIcon from '../assets/nullApp.svg';

import '../styles/dashboard.css'; // optional: move to module later

export default function Dashboard() {
  const [apps, setApps] = useState({});
  const [newAppName, setNewAppName] = useState("");
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);


  const NUM_COLUMNS = 5;

  const navigate = useNavigate();

  // 🧠 Create cards
  const cards = Object.entries(apps).map(([appName, data]) => ({
    id: appName,
    title: appName,
    sheetCount: data.sheets.length,
    appImage: data.imageUrl ? `${baseURL}${data.imageUrl}` : nullAppIcon,
    isEmpty: false
  }));
  

// 🧠 Filter search
  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(search.toLowerCase())
  );

// 🧮 Fill out to 5-column grid
  const remainder = filteredCards.length % NUM_COLUMNS;
  const fillersNeeded = remainder === 0 ? 0 : NUM_COLUMNS - remainder;

  const paddedCards = [
    ...filteredCards,
    ...Array.from({ length: fillersNeeded }, (_, i) => ({
    id: `empty-${i}`,
    isEmpty: true
  }))
];


const baseURL = "https://api.gshell.cloud";

useEffect(() => {
  const session = getSession(); 
  console.log("📌 Session in Core Dashboard:", session);
}, []);



  
  async function loadSheets() {
    setApps({});

    try {
        const res = await fetch(`${baseURL}/sheet/list`, {
            credentials: 'include'
        });
          
      const json = await res.json();

      if (!json.success) {
        return;
      }

      setApps(json.apps);
      console.log("📦 Apps loaded:", apps);

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    loadSheets();
  }, []);
  



  async function handleCreateApp() {
  console.log("📦 New app name:", newAppName);

  if (!newAppName.trim()) {
    alert("⚠️ Please enter a name for your app.");
    return;
  }

  const json = await createApp(newAppName);
  if (json.success) {
    alert(`✅ App "${newAppName}" created!`);
    window.location.href = `/sheet/${newAppName}/users`; // or whatever your route is
  } else {
    alert("❌ " + json.message);
  }
  }

  async function handleAppImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    const res = await fetch(`${baseURL}/${appName}/upload-icon`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
  
    const json = await res.json();
    if (json.success) {
      // 🖼️ Optionally save the URL to a sheet if needed
      updateAppMetadata(appName, { appImage: json.url });
    }
  }

  const toggleAppSelection = () => {
    setIsSelectionModeActive(!isSelectionModeActive);
    if (isSelectionModeActive) {
      setSelectedApp(null);
    }
  };

  async function deleteApp() {
      if (!selectedApp) return;
    
      const confirm = window.confirm(`Are you sure you want to delete "${selectedApp}"? This cannot be undone.`);
      if (!confirm) return;
    
      try {
        const res = await fetch(`${baseURL}/sheet/deleteApp/${selectedApp}`, {
          method: 'DELETE',
          credentials: 'include'
        });
    
        const json = await res.json();
    
        if (!json.success) {
          alert("❌ Failed to delete app: " + json.message);
          return;
        }
    
        alert(json.message);
        // Refresh the app list
        await loadSheets();
        setSelectedApp(null);
        setIsSelectionModeActive(false);
        showToast(`${selectedApp} deleted`);
      } catch (err) {
        console.error("❌ Delete failed:", err);
        alert("❌ Delete error: " + err.message);
      }
    }
    
  



  return (
      <div className="dashboard-wrapper">

{isSelectionModeActive && (
  <div className="select-toolbar">
    
    <button
      className="select-toolbar-btn-delete"
      onClick={deleteApp}
      disabled={!selectedApp}
    >
      Delete
    </button>

    <button
      className="select-toolbar-btn"
      onClick={() => navigate(`/app/${selectedApp}`)}
      disabled={!selectedApp}
    >
      Open
    </button>

  </div>
)}

                  <div className="dashboard-header-row">
          <h1 className="dashboard-title">gShell<span className="dashboard-title-core">Core/&gt; .</span></h1>
          
          <button
            className="dashboard-integrations-button"
            onClick={() => navigate('/integrations')}
          >
            Integrations
          </button>
        </div>

        <div className="app-input-container">
            <div className="app-input-wrapper">
                <input
                    type="text"
                    id="searchApps"
                    placeholder="Search apps..."
                    className="app-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button id="submitBtn" className="app-submit-inside-input">
                    <img src={searchIcon} alt="Search" />
                </button>
            </div>
            <button
              className={`select-app-btn ${
                isSelectionModeActive && selectedApp ? "has-selection" : ""
              }`}
              onClick={toggleAppSelection}
             >
              {isSelectionModeActive ? "Done" : "Select"}
            </button>

         </div>
        <div>

       <div className="dashboard-content">

          <div className="apps-grid">
        
         {paddedCards.map(({ id, title, sheetCount, appImage, isEmpty }) => (
            <div
              key={id}
              className={`app-card ${isEmpty ? "empty-card" : ""} ${selectedApp === title ? "selected" : ""}`}
              onClick={() => {
                if (isEmpty) return;
                
                if (isSelectionModeActive) {
                  setSelectedApp(selectedApp === title ? null : title);
                } else {
                  navigate(`/app/${title}`);
                }
                showToast(`${title} selected`);
              }}
            >
            {isEmpty ? (
              <div className="empty-card-content">
                <button className="empty-message" onClick={() => setShowAddAppModal(true)}>+</button>
              </div>
            ) : (
              <>
                <div className="app-card-title-column">
                  <img
                    className="app-card-image"
                    src={appImage}
                    alt={`${title} app`}
                  />
                  <span className="app-link">{title}</span>
                </div>
                <span className="sheet-badge">{sheetCount}</span>
              </>
            )}
          </div>
        ))}

        </div>
        
      </div>
      
        </div>
        {showAddAppModal && (
            <div className="app-overlay">
              <div className="app-modal">
                <div className="app-modal-content">
                <h3>Add New App</h3>
                <input
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="App Name"
                  className="app-column-input"
                />
                <div className="app-modal-buttons">
                  <button onClick={handleCreateApp} className="app-modal-btn">Confirm</button>
                  <button onClick={() => setShowAddAppModal(false)} className="app-modal-btn">Cancel</button>
                </div>
                </div>

              </div>
            </div>
          )}
    </div>

  );
}
