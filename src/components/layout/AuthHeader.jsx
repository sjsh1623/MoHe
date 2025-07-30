import React from 'react';
import styles from '@/styles/components/header/auth-header.module.css';

export default function AuthHeader() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>MOHE</h1>
            <button className={styles.exploreBtn}>둘러보기</button>
        </header>
    );
}