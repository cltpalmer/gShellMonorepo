// Fixed Dashboard component - sends owner and token as query parameters

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createApp } from '../utils/sheetControls';
import { showToast } from '../components/Toast';
import { getSession } from '@shared/utils/getSession';

import appIcon from '../assets/app.png';
import searchIcon from '../assets/search.png';
import uploadApp from '../assets/uploadapp.svg';
import nullAppIcon from '../assets/nullApp.svg';

import '../styles/dashboard.css';

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
  const baseURL = "https://api.gshell.cloud";

  // Helper function to get auth query parameters - THIS IS THE KEY FIX
  const getAuthQueryParams = () => {
    const authData = localStorage.getItem('userAuth');
    
    if (!authData) {
      console.log("❌ No auth data in localStorage");
      return null;
    }

    try {
      const userData = JSON.parse(authData);
      console.log("📦 User data for auth:", userData);
      
      if (!userData.owner) {
        console.log("❌ No owner in user data");
        return null;
      }

      // Your backend expects owner and token as query parameters
      // The token should be the base64 encoded userAuth data
      const token = btoa(authData); // Base64 encode the JSON string
      
      return {
        owner: userData.owner,
        token: token
      };
    } catch (err) {
      console.error("❌ Failed to parse auth data:", err);
      return null;
    }
  };

  // Helper to build URL with auth params
  const buildAuthenticatedURL = (endpoint) => {
    const authParams = getAuthQueryParams();
    
    if (!authParams) {
      return null;
    }

    const url = new URL(`${baseURL}${endpoint}`);
    url.searchParams.set('owner', authParams.owner);
    url.searchParams.set('token', authParams.token);
    
    return url.toString();
  };

  // Create cards
  const cards = Object.entries(apps).map(([appName, data]) => ({
    id: appName,
    title: appName,
    sheetCount: data.sheets.length,
    appImage: data.imageUrl ? `${baseURL}${data.imageUrl}` : nullAppIcon,
    isEmpty: false
  }));

  // Filter search
  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(search.toLowerCase())
  );

  // Fill out to 5-column grid
  const remainder = filteredCards.length % NUM_COLUMNS;
  const fillersNeeded = remainder === 0 ? 0 : NUM_COLUMNS - remainder;

  const paddedCards = [
    ...filteredCards,
    ...Array.from({ length: fillersNeeded }, (_, i) => ({
      id: `empty-${i}`,
      isEmpty: true
    }))
  ];

  // FIXED: loadSheets now sends owner and token as query parameters
  async function loadSheets() {
    setApps({});

    try {
      const authenticatedURL = buildAuthenticatedURL('/sheet/list');
      
      if (!authenticatedURL) {
        console.log("❌ No authentication available");
        alert("Please log in first");
        window.location.href = 'https://gshell.cloud'; // Adjust to your login page
        return;
      }

      console.log("🔐 Making authenticated request to:", authenticatedURL);

      const res = await fetch(authenticatedURL, {
        method: 'GET',
        credentials: 'include'
      });
        
      const json = await res.json();
      console.log("📡 API Response:", json);

      if (!json.success) {
        console.log("❌ API request failed:", json.message);
        if (res.status === 401 || res.status === 403) {
          console.log("❌ Authentication failed, clearing localStorage");
          localStorage.removeItem('userAuth');
          alert("Session expired. Please log in again.");
          window.location.href = 'https://gshell.cloud'; // Adjust to your login page
        } else {
          alert("Failed to load apps: " + json.message);
        }
        return;
      }

      setApps(json.apps);
      console.log("📦 Apps loaded successfully:", json.apps);

    } catch (err) {
      console.error("❌ Load sheets error:", err);
      alert("Failed to load apps. Please try again.");
    }
  }

  // FIXED: handleCreateApp with proper auth query parameters
  async function handleCreateApp() {
    console.log("📦 New app name:", newAppName);

    if (!newAppName.trim()) {
      alert("⚠️ Please enter a name for your app.");
      return;
    }

    try {
      // Assuming you have a create endpoint that also uses tokenAuth
      const authenticatedURL = buildAuthenticatedURL('/sheet/create');
      
      if (!authenticatedURL) {
        alert("❌ Please log in first");
        return;
      }

      const res = await fetch(authenticatedURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ appName: newAppName })
      });

      const json = await res.json();
      
      if (json.success) {
        alert(`✅ App "${newAppName}" created!`);
        setShowAddAppModal(false);
        setNewAppName("");
        await loadSheets(); // Refresh the list
      } else {
        alert("❌ " + json.message);
      }
    } catch (err) {
      console.error("❌ Create app error:", err);
      alert("❌ Failed to create app");
    }
  }

  // FIXED: deleteApp with proper auth query parameters
  async function deleteApp() {
    if (!selectedApp) return;
  
    const confirm = window.confirm(`Are you sure you want to delete "${selectedApp}"? This cannot be undone.`);
    if (!confirm) return;
  
    try {
      const authenticatedURL = buildAuthenticatedURL(`/sheet/deleteApp/${selectedApp}`);
      
      if (!authenticatedURL) {
        alert("❌ Please log in first");
        return;
      }

      const res = await fetch(authenticatedURL, {
        method: 'DELETE',
        credentials: 'include'
      });
  
      const json = await res.json();
  
      if (!json.success) {
        alert("❌ Failed to delete app: " + json.message);
        return;
      }
  
      alert(json.message);
      await loadSheets();
      setSelectedApp(null);
      setIsSelectionModeActive(false);
      showToast(`${selectedApp} deleted`);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("❌ Delete error: " + err.message);
    }
  }

  useEffect(() => {
    const session = getSession(); 
    console.log("📌 Session in Core Dashboard:", session);
    
    if (session && session.owner) {
      console.log("✅ Valid session found, loading sheets...");
      loadSheets();
    } else {
      console.log("❌ No valid session found");
      alert("Please log in first");
      window.location.href = 'https://gshell.cloud'; // Adjust to your login URL
    }
  }, []);

  const toggleAppSelection = () => {
    setIsSelectionModeActive(!isSelectionModeActive);
    if (isSelectionModeActive) {
      setSelectedApp(null);
    }
  };

  async function handleAppImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    
    const authenticatedURL = buildAuthenticatedURL(`/${selectedApp}/upload-icon`);
    
    if (!authenticatedURL) {
      alert("❌ Please log in first");
      return;
    }
    
    const res = await fetch(authenticatedURL, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
  
    const json = await res.json();
    if (json.success) {
      showToast("App icon updated");
      await loadSheets(); // Refresh to show new icon
    } else {
      alert("Failed to upload icon: " + json.message);
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
