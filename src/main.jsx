import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { LocalizationProvider } from './context/LocalizationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocalizationProvider>
        <App />
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
