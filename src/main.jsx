import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import AnimatedRoutes from '@/components/ui/transitions/AnimatedRoutes.jsx';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <AnimatedRoutes />
        </div>
    </BrowserRouter>
)
