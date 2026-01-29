import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../index.css';
import { ToastProvider } from '@shared/context';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Failed to find the root element');
}

// Force unregister service workers in dev mode to prevent stale PWA issues
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
            console.log('Unregistered service worker:', registration);
        }
    });
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </React.StrictMode>
);

