import connectIcon from "../assets/plugconnect.png";
import disconnectIcon from "../assets/plugdisconnect.png";
import viewAccessIcon from "../assets/viewaccess.svg";

import "../styles/integrationPage.css";

import IntegrationOverlay from '../Overlays/IntegrationOverlay';
import IntegrationViewOverlay from '../Overlays/IntegrationViewOverlay';
import ConfirmOverlay from '../Overlays/ConfirmOverlay';

import { useState, useEffect } from 'react';

import { showToast } from '../components/Toast';

export async function fetchCodes() {
  const baseURL = "https://gshell.cloud";

  const res = await fetch(`${baseURL}/user/my-integration-codes`, {
    credentials: 'include',
  });

  const json = await res.json();

  return json.success ? json.codes : {};
}





export default function Integrations() {
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [apps, setApps] = useState({});
  const [selectedAppName, setSelectedAppName] = useState(null);
  const [integrationMap, setIntegrationMap] = useState({});
  const currentAppName = selectedAppName;
  const [viewingCode, setViewingCode] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [showViewOverlay, setShowViewOverlay] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
const [appToDelete, setAppToDelete] = useState(null);





  useEffect(() => {
    loadApps();
    fetchCodes().then(setIntegrationMap); // 💡 clean!
  }, []);
  

  async function loadApps() {
    try {
      const res = await fetch(`${baseURL}/sheet/list`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setApps(json.apps); // { appName: [sheets] }
      }
    } catch (err) {
      console.error("❌ Failed to load apps:", err);
    }
  }

  function isAppIntegrated(appName) {
    return Object.values(integrationMap).some(integration => integration.app === appName);
  }


  async function handleDeleteIntegration() {
    if (!appToDelete) return;
  
    const codeToRemove = Object.entries(integrationMap).find(
      ([code, val]) => val.app === appToDelete
    )?.[0];
  
    if (!codeToRemove) {
      alert("Code not found for this app.");
      return;
    }
  
    try {
      const res = await fetch(`${baseURL}/user/remove-integration-code/${codeToRemove}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      const json = await res.json();
  
      if (json.success) {
        showToast("Integration removed.");
        setIntegrationMap(prev => {
          const updated = { ...prev };
          delete updated[codeToRemove];
          return updated;
        });
      } else {
        alert("Failed to remove integration.");
      }
    } catch (err) {
      console.error("❌ Failed to delete integration:", err);
      alert("Error removing integration.");
    } finally {
      setShowConfirm(false);
      setAppToDelete(null);
    }
  }
  
  






  return (
    <div className="integrations-page">
      <div className="integrations-container">
        <div className="integrations-content">
          <div className="integrations-content-body">

  {Object.entries(apps).map(([appName, sheets]) => {
    const integrated = isAppIntegrated(appName);
  
    return (
      <div
        key={appName}
        className={`integration-card ${integrated ? 'connected' : 'not-connected'}`}
      >
        {/* ⬅️ LEFT = Always disconnect/remove icon (different image based on state) */}
        <div className="integration-card-left">
        <img
  src={viewAccessIcon}
  alt="View Access"
  className={`status-icon ${integrated ? "status-connected" : "status-disconnected"}`}
  onClick={() => {
    const entry = Object.entries(integrationMap).find(
      ([code, val]) => val.app === appName
    );
    if (entry) {
      const [code, data] = entry;
      setViewingCode(code);
      setViewingData(data);
      setShowViewOverlay(true);
    }
  }}
/>

        </div>
  
        {/* 🧠 MIDDLE = APP INFO */}
        <div className="integration-card-middle">
        <div className={`integration-card-middle-title ${integrated ? 'connected' : 'disconnected'}`}>
            <h3>{appName}</h3>
          </div>
          <div className={`integration-card-middle-description ${integrated ? 'connected' : 'disconnected'}`}>
            <p>{integrated ? 'active' : 'inactive'}</p>
          </div>
        </div>
  
        {/* ➡️ RIGHT = Always connect icon (different image based on state) */}
        <div
  className={`integration-card-right ${integrated ? 'connected' : 'disconnected'}`}
  onClick={() => {
    if (integrated) {
      setAppToDelete(appName);
      setShowConfirm(true);
    } else {
      setSelectedAppName(appName);
      setShowAddIntegrationModal(true);
    }
  }}
  
  
>

        <img
          src={integrated ? connectIcon : disconnectIcon}
          alt="Connect"

          className={`action-icon ${integrated ? "action-remove" : "action-connect"}`}
        />
        </div>
      </div>
    );
  })}

          </div>
        </div>
      </div>

      <IntegrationOverlay
        show={showAddIntegrationModal}
        onClose={() => setShowAddIntegrationModal(false)}
        onSave={() => {
          console.log("🔗 Integration initiated");
          setShowAddIntegrationModal(false);
        }}
        app={selectedAppName}
        sheets="all"
        title={selectedAppName}
        message="begin generating your access key by clicking the button below |"
      />


      <IntegrationViewOverlay
  show={showViewOverlay}
  onClose={() => setShowViewOverlay(false)}
  code={viewingCode}
  data={viewingData}
/>

<ConfirmOverlay
  show={showConfirm}
  onCancel={() => {
    setShowConfirm(false);
    setAppToDelete(null);
  }}
  onConfirm={handleDeleteIntegration}
  title={`Disconnect ${appToDelete}?`}
  message={`Are you sure you want to disconnect integration with ${appToDelete}? This cannot be undone.`}
/>

    </div>
  );
}
