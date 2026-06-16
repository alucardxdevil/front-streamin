import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { persistor, store } from './redux/store';
import './index.css';
import './utils/axiosConfig';
import { initCsrf } from './utils/csrf';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Disparamos el fetch del token CSRF en paralelo (fire-and-forget). El
// interceptor de axios reintenta automáticamente cualquier mutación que llegue
// antes de que el token esté disponible, así que no necesitamos bloquear el
// primer render por esto. Ahorra 150–600 ms de FCP en visita en frío.
initCsrf();

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
