import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import AnimatedRoutes from '@/components/ui/transitions/AnimatedRoutes.jsx';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {UserPreferencesProvider} from '@/contexts';
import { BackButtonProvider } from '@/contexts/BackButtonContext';
import GlobalBackButtonWrapper from '@/components/ui/layout/GlobalBackButtonWrapper';
import GlobalFloatingButton from '@/components/ui/layout/GlobalFloatingButton';
import { initializeWebViewOptimizations } from '@/utils/webviewOptimizations';
import ErrorBoundary from '@/components/ErrorBoundary';


// Initialize WebView optimizations
initializeWebViewOptimizations();

createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <BackButtonProvider>
                <UserPreferencesProvider>
                    {/* Global UI elements - positioned outside transformed container */}
                    <GlobalBackButtonWrapper />
                    <GlobalFloatingButton />
                    
                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        minHeight: '100vh',
                        height: '100vh',
                        background: 'white',
                        overflow: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'manipulation',
                        WebkitTransform: 'translate3d(0,0,0)', // Force hardware acceleration
                        transform: 'translate3d(0,0,0)'
                    }}>
                        {/* App content */}
                        <AnimatedRoutes />
                    </div>
                </UserPreferencesProvider>
            </BackButtonProvider>
        </BrowserRouter>
    </ErrorBoundary>
)
