import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '@/styles/pages/auth/auth-page.module.css';

import {Container, Stack} from '@/components/ui/layout';
import {StandardButton, SocialButtons} from '@/components/ui/buttons';
import AuthHeader from '@/components/layout/AuthHeader';
import loginImage from '@/assets/image/login_image.png';
import { authService } from '@/services/authService';

export default function AuthPage() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    const handleSignup = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    const handleGuestBrowse = (e) => {
        e.preventDefault();
        // Create guest session and navigate to home
        authService.createGuestSession();
        navigate('/home');
    };

    return (
        <Container className={styles.pageContainer}>
            <Stack spacing="lg" align="center" className={styles.content}>
                <AuthHeader/>
                <img className={styles.illustration} src={loginImage} alt="MOHE Login Illustration"/>
                <StandardButton onClick={handleLogin}>
                    MOHE 아이디로 로그인
                </StandardButton>
                <SocialButtons/>
                <button
                    className={styles.signupLink}
                    onClick={handleSignup}
                    type="button"
                >
                    회원가입
                </button>
                <button
                    className={styles.guestBrowseLink}
                    onClick={handleGuestBrowse}
                    type="button"
                >
                    로그인 없이 둘러보기
                </button>
            </Stack>
        </Container>
    );
}