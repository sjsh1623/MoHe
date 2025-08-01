import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import AnimatedRoutes from '@/components/ui/transitions/AnimatedRoutes.jsx';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            minHeight: '100vh',
            background: 'white'
        }}>
            <AnimatedRoutes />
        </div>
    </BrowserRouter>
)
