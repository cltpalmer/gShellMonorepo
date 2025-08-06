import '../styles/settingsPage.css';

import ProgressBar from '../components/ProgressBar';

import { useState, useEffect } from 'react';
import { formatMB } from '../utils/helpers';

import usernamehandle from '../assets/usernamehandle.svg';
import password from '../assets/password.svg';
import mailing from '../assets/mailing.svg';
import storageIcon from '../assets/storage.svg';
import stats from '../assets/stats.svg';
import reset from '../assets/reset.svg';
import meter from '../assets/meter.svg';

export default function SettingsPage() {
    const [tab, setTab] = useState('account');
    const [storage, setStorage] = useState({});
    
    const [activeField, setActiveField] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const limitMB = 5120; // 1GB limit
    const baseURL = "https://gshell.cloud";

     // Fetch storage
     useEffect(() => {
        async function fetchStorage() {
            const res = await fetch(`${baseURL}/user/storage-usage`, {
                credentials: 'include',
              });

            const json = await res.json();
            console.log("📦 Storage API:", json); // <--- See exact shape

            if (json.success) {
                setStorage(json); // store whole object: formatted + raw
            }
        }
        fetchStorage();
      }, []);
      
      // Fetch user
      useEffect(() => {
        async function fetchUser() {
          try {
            const res = await fetch(`${baseURL}/user/me`, {
              credentials: 'include'
            });
            const json = await res.json();
      
            console.log("✅ Logged in as:", json.owner);
            setUsername(json.owner);
            setEmail(json.email);
            setInputValue(json.owner); // autofill if desired
          } catch (error) {
            console.error("❌ Failed to fetch user:", error);
          }
        }
        fetchUser();
      }, []);
      
      // Auto-fill input value when field is selected
      useEffect(() => {
        if (!activeField) return;
      
        switch (activeField) {
          case 'username':
            setInputValue(username);
            break;
          case 'email':
            setInputValue(email);
            break;
          default:
            setInputValue('');
        }
      }, [activeField, username, email]);
      


      // Submit
      const handleSubmit = async (field, value) => {
        if (!value || value.trim() === "") {
          showToast("⚠️ Value cannot be empty", "error");
          return;
        }
      
        try {
          const res = await fetch(`${baseURL}/user/update-info`, {
            method: "PATCH",
            credentials: "include", // ✅ send session cookie
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ field, value }),
          });
      
          const data = await res.json();
      
          if (data.success) {
            showToast(`✅ ${field} updated to ${value}`, "success");
            if (field === "owner") {
              sessionStorage.setItem("owner", value); // optional sync
            }
          } else {
            showToast(`❌ ${data.message}`, "error");
          }
      
        } catch (err) {
          console.error("Update failed:", err);
          showToast("❌ Server error", "error");
        }
      };
      
      




    return (
        <div className="settings-page">

            <div className= "settings-wrapper">
            <div className="settings-header">
                <h1>Settings</h1>
            </div>
            <div className="settings-card">

                {/* Header */}
                <div className="settings-card-header">
                    <button
                        className={`settings-tab-button ${tab === 'account' ? 'active' : ''}`}
                        onClick={() => setTab('account')}
                    >
                        account
                    </button>
                    <button
                        className={`settings-tab-button ${tab === 'storage' ? 'active' : ''}`}
                        onClick={() => setTab('storage')}
                    >
                        storage
                    </button>
                    <button
                        className={`settings-tab-button ${tab === 'mailing' ? 'active' : ''}`}
                        onClick={() => setTab('mailing')}
                    >
                        mailing
                    </button>
                </div>
                {/* Header End */}

                {/* Account */}
                <div className={tab === 'account' ? "settings-account-content" : "hidden"}>
                    <div className="settings-account-boxes">
                    <div
                        className={`settings-account-box ${activeField === 'username' ? 'active-box' : ''}`}
                        onClick={() => setActiveField('username')}
                    >
                        <div className="settings-account-box-icon">
                        <img src={usernamehandle} alt="Username" />
                        </div>
                        <p>Username</p>
                    </div>
                    <div
                        className={`settings-account-box ${activeField === 'password' ? 'active-box' : ''}`}
                        onClick={() => setActiveField('password')}
                    >
                        <div className="settings-account-box-icon">
                        <img src={password} alt="Password" />
                        </div>
                        <p>Password</p>
                    </div>
                    <div
                        className={`settings-account-box ${activeField === 'email' ? 'active-box' : ''}`}
                        onClick={() => setActiveField('email')}
                    >
                        <div className="settings-account-box-icon">
                        <img src={mailing} alt="Email" />
                        </div>
                        <p>Email</p>
                    </div>
                    </div>
                    <div className="account-input-wrapper">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (activeField) {
        handleSubmit(activeField === 'username' ? 'owner' : activeField, inputValue);
        setActiveField(null); // optional reset
      }
    }}
  >
    {activeField && (
      <>
        <input
          type={activeField === 'password' ? 'password' : 'text'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Enter new ${activeField}`}
        />
        <button className="account-input-button" type="submit">
          update
        </button>
      </>
    )}
  </form>
</div>

                </div>
                {/* Account End */}


                {/* Storage */}
                <div className={tab === 'storage' ? "settings-storage-box" : "hidden"}>
                <div className="settings-storage-wrapper">
                        <div className="settings-storage-box-icon">
                         <img src={storageIcon} alt="Storage" />
                        </div>
                        <div className="settings-storage-box-content">
                            <div className="settings-storage-box-content-header">
                                <h2>{formatMB(storage.totalSizeMB || 0)} / {formatMB(limitMB)}</h2>
                            <button className="settings-upgrade-button">upgrade</button>
                            </div>
                            <ProgressBar value={storage.totalSizeMB || 0} max={limitMB} />
                            </div>
                        </div>

                        <div className="settings-storage-box-btns">

                            <div className="settings-storage-box-btn">
                            <div className="settings-storage-box-btn-icon">
                                <img src={stats} alt="Stats" />
                                </div>
                                <h2>stats</h2>
                        </div>

                        <div className="settings-storage-box-btn">
                            <div className="settings-storage-box-btn-icon">
                                <img src={reset} alt="Reset" />
                                </div>
                                <h2>reset</h2>
                        </div>

                        <div className="settings-storage-box-btn">
                            <div className="settings-storage-box-btn-icon">
                                <img src={meter} alt="Meter" />
                                </div>
                                <h2>limits</h2>
                            </div>

                        </div>
                </div>
                {/* Storage End */}


                {/* Mailing */}
                <div className={tab === 'mailing' ? "settings-mailing-content" : "hidden"}>
                    
                </div>
                {/* Mailing End */}

            </div>
            </div>
        </div>
    );
}