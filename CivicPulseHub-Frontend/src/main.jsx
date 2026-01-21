import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Fix for "global is not defined" in Vite
import { Buffer } from "buffer";
window.global = window;
window.Buffer = Buffer;



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
