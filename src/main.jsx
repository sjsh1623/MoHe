import {createRoot} from 'react-dom/client'
import '@/styles/global.css'
import AuthPage from "@/pages/auth/index.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";
import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </BrowserRouter>
)
