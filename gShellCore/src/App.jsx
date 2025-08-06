import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import NavBar from '../../../shared/components/navBar';

import Dashboard from './pages/Dashboard';
import AppSheets from './pages/appSheets';
import SheetViewer from './pages/SheetViewer';
import Integrations from './pages/Integrations';

export default function App() {
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app/:appName" element={<AppSheets />} />
        <Route path="/sheet/:appName/:sheetName" element={<SheetViewer />} />
        <Route path="/integrations" element={<Integrations />} />
      </Routes>
    </div>
  );
}

