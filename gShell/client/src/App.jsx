// App.jsx
import Terminal from './Terminal'
import IntegrationsPage from './pages/IntegrationsPage'
import CommandOverlay from './components/CommandOverlay'; 
import DocsPage from './pages/docsPage';
import SettingsPage from './pages/SettingsPage';

import './styles/App.css'
import './utils/toast.css';

import NavBar from './components/navBar'; // Local component

import { Routes, Route } from 'react-router-dom'
import { showToast } from './utils/toast';
import { useState } from 'react';


export default function App() {

  const [isDark, setIsDark] = useState(false);
  const [showCommandOverlay, setShowCommandOverlay] = useState(false);
  const toggleCommandOverlay = () => setShowCommandOverlay(prev => !prev);
  
   function toggleTheme() {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.body.className = newTheme ? 'dark' : 'light'; // ⬅️ this sets a GLOBAL class
  }

  
  return (
    <>
      {/* ✅ Always visible across pages */}
      <NavBar 
      toggleTheme={toggleTheme} 
    />
    {/* 🧠 This is the missing render step */}
    {showCommandOverlay && <CommandOverlay toggleCommandOverlay={toggleCommandOverlay} />}
    {/* ✅ Page content switches here based on route */}
      <Routes>
        <Route path="/" element={<Terminal isDark={isDark} setIsDark={setIsDark} toggleCommandOverlay={toggleCommandOverlay} />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  )
}

window.showToast = showToast;
