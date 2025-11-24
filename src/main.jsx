import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import '@/i18n'; // i18n 초기화
import AnimatedRoutes from '@/components/ui/transitions/AnimatedRoutes.jsx';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {UserPreferencesProvider} from '@/contexts';
import { BackButtonProvider } from '@/contexts/BackButtonContext';
import GlobalBackButtonWrapper from '@/components/ui/layout/GlobalBackButtonWrapper';
import GlobalFloatingButton from '@/components/ui/layout/GlobalFloatingButton';
import GlobalMessageInput from '@/components/ui/layout/GlobalMessageInput';
import { AppShell } from '@/components/ui/layout';
import { initializeWebViewOptimizations } from '@/utils/webviewOptimizations';
import ErrorBoundary from '@/components/ErrorBoundary';


// Initialize WebView optimizations
initializeWebViewOptimizations();

// Load API test utilities in development


createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <BackButtonProvider>
                <UserPreferencesProvider>
                    <AppShell>
                        <AnimatedRoutes />
                    </AppShell>

                    {/* Global UI elements anchored via shell offsets */}
                    <GlobalBackButtonWrapper />
                    <GlobalFloatingButton />
                    <GlobalMessageInput />
                </UserPreferencesProvider>
            </BackButtonProvider>
        </BrowserRouter>
    </ErrorBoundary>
)
