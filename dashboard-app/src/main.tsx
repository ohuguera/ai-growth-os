import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'cybercore-css/dist/cybercore.min.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
