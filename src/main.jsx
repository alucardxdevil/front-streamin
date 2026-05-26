import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { persistor, store } from './redux/store';
import './utils/axiosConfig';
import { initCsrf } from './utils/csrf';

const root = ReactDOM.createRoot(document.getElementById('root'));

initCsrf().finally(() => {
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
});
