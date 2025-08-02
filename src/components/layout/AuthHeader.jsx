import React from 'react';
import styles from '@/styles/components/header/auth-header.module.css';
import {useNavigate} from "react-router-dom";

export default function AuthHeader() {
    const navigate = useNavigate();
    const handleSkip = (e) => {
        e.preventDefault();
        console.log('Navigating to /home');
        navigate('/home');
    };

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>MOHE</h1>
            <button onClick={handleSkip} className={styles.exploreBtn}>둘러보기</button>
        </header>
    );
}