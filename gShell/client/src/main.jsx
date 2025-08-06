import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/App.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IntegrationsPage from './pages/IntegrationsPage'
import Terminal from './Terminal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
