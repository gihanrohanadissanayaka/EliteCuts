import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppointmentProvider } from './context/AppointmentContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppointmentProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#262626',
                color: '#e8e8e8',
                border: '1px solid #404040',
              },
              success: {
                iconTheme: { primary: '#f59e0b', secondary: '#0a0a0a' },
              },
            }}
          />
        </AppointmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
