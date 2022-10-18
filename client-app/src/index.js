import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PayloadProvider from './common/token';
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PayloadProvider>
      <App />
  </PayloadProvider>
  </React.StrictMode >
);