// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.jsx';
import './index.css';

// ✅ Import CartProvider from your context file
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider> {/* ✅ Wrap App in CartProvider */}
      <App />
    </CartProvider>
  </StrictMode>
);
