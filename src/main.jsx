import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css'   // 👈 agrega esta línea si falta

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
