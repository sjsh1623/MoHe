import React from 'react';
import {Link} from 'react-router-dom';
import styles from '@/styles/pages/auth/auth-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import { StandardButton, SocialButtons } from '@/components/ui/buttons';
import AuthHeader from '@/components/layout/AuthHeader';
import loginImage from '@/assets/image/login_image.png';

export default function AuthPage() {
    return (
        <Container className={styles.pageContainer}>
            <Stack spacing="lg" align="center" className={styles.content}>
                <AuthHeader/>
                <img className={styles.illustration} src={loginImage} alt="MOHE Login Illustration"/>
                <StandardButton onClick={() => window.location.href = '/login'}>
                    MOHE 아이디로 로그인
                </StandardButton>
                <SocialButtons/>
                <Link className={styles.signupLink} to={"/signup"}>
                    회원가입
                </Link>
            </Stack>
        </Container>
    );
}