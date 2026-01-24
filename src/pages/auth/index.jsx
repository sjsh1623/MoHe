import React, { useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '@/styles/pages/auth/auth-page.module.css';

import {StandardButton, SocialButtons} from '@/components/ui/buttons';
import logoHeader from '@/assets/image/logo-header.svg';
import { authService } from '@/services/authService';

export default function AuthPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkExistingSession = async () => {
            const isLoggedIn = authService.isAuthenticated();
            if (isLoggedIn) {
                const restored = await authService.tryRestoreSession();
                if (restored) {
                    navigate('/home', { replace: true });
                }
            }
        };

        checkExistingSession();
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    const handleSignup = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    const handleExplore = (e) => {
        e.preventDefault();
        navigate('/home');
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header with explore button */}
            <header className={styles.header}>
                <div className={styles.headerSpacer} />
                <button onClick={handleExplore} className={styles.exploreBtn}>
                    둘러보기
                </button>
            </header>

            {/* Main Content */}
            <main className={styles.content}>
                {/* Logo & Tagline */}
                <div className={styles.brandSection}>
                    <img src={logoHeader} alt="MOHE" className={styles.logo} draggable={false} />
                    <p className={styles.tagline}>MBTI 기반 맞춤 장소 추천</p>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionSection}>
                    <StandardButton onClick={handleLogin}>
                        MOHE 계정으로 시작하기
                    </StandardButton>

                    <div className={styles.divider}>
                        <span className={styles.dividerLine}></span>
                        <span className={styles.dividerText}>또는</span>
                        <span className={styles.dividerLine}></span>
                    </div>

                    <SocialButtons/>

                    <button
                        className={styles.signupLink}
                        onClick={handleSignup}
                        type="button"
                    >
                        계정이 없으신가요? <span className={styles.signupHighlight}>회원가입</span>
                    </button>
                </div>
            </main>
        </div>
    );
}