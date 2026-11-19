import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Polices auto-hébergées (font-display: swap) : Archivo (axe wdth, 125 % = Expanded) + Inter
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/inter/index.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
