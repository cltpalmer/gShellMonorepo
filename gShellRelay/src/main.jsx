// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DatabasePage from './pages/DatabasePage';
import TemplatesPage from './pages/TemplatesPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import AutomationsPage from './pages/AutomationsPage';
import Layout from './Layout';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<App />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/create" element={<CreateTemplatePage />} />
        <Route path="/create/:name" element={<CreateTemplatePage />} />
<Route path="/automations" element={<AutomationsPage />} /> 
      </Route>  
      </Routes>
    </Router>
  </React.StrictMode>
);
