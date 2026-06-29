import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/style.css';

// import.meta.env.BASE_URL = '/webcuaban/' khi build cho GitHub Pages,
// = '/' khi chạy local. Bỏ slash cuối để khớp với basename của Router.
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
