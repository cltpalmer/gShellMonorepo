
import './changeApp.css';
import { useEffect, useState } from 'react';

export default function ChangeApp({ selectedApp, setSelectedApp }) {
    
  const baseURL = "https://gshell.cloud";

    const [apps, setApps] = useState([]);

    useEffect(() => {
      async function fetchApps() {
        try {
          const res = await fetch(`${baseURL}/sheet/list`, {
            credentials: "include",
          });
          const data = await res.json();
  
          const appNames = Object.keys(data.apps); // Extract app names only
          setApps(appNames);
        } catch (err) {
          console.error("❌ Failed to fetch apps:", err);
        }
      }
  
      fetchApps();
    }, []);
  
    
    
    
    return (
      <div className="change-app">
      <select 
      value={selectedApp}
      onChange={(e) => setSelectedApp(e.target.value)}
      className="change-app-btn">
        <option value="">Select App</option>
        {apps.map((appName) => (
          <option key={appName} value={appName}>
            {appName}
          </option>
        ))}
      </select>
    
      </div>
    );
  }
  