import React from 'react';
import styles from '@/styles/components/buttons/standard-button.module.css';

export default function StandardButton({ children, onClick }) {
    return (
        <button className={styles.btn} onClick={onClick}>
            {children}
        </button>
    );
}