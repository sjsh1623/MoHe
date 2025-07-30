import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import AuthPage from "@/pages/auth/index.jsx";
import React from 'react';
import {BrowserRouter} from 'react-router-dom';


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthPage/>
    </BrowserRouter>
)
