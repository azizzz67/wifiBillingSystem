import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import NetworkFlowApp from './NetworkFlowApp';

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <BrowserRouter>
            <NetworkFlowApp />
        </BrowserRouter>
    </React.StrictMode>,
);
