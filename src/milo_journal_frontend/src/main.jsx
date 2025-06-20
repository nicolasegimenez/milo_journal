import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Test from './Test.jsx'
import './index.css'
import './output.css' 
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode> <App />  </StrictMode>,
)
