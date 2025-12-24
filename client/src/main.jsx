import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom' // 👈 Ye naya hai

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter> {/* 👈 Ye wrapper zaroori tha */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)