// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import './index.css'

// ✅ Import CartProvider from your context file
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> {/* ✅ Wrap App in CartProvider */}
      <App />
    </CartProvider>
  </React.StrictMode>,
)
