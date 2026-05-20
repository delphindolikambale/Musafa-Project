// --- CORRECTION DE SÉCURITÉ POUR SOCKJS ---
window.global = window;

import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- PRÉ-CHARGEMENT DU THÈME POUR ÉVITER LE FLASH BLANC ---
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)