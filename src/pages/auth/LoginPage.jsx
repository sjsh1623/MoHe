import React, {useState} from 'react';
import styles from '@/styles/pages/auth/login-page.module.css';

import {Stack} from '@/components/ui/layout';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLink from '@/components/ui/links/TextLink';
import {AuthContainer, AuthTitle} from '@/components/auth';
import {useAuthNavigation} from '@/hooks/useAuthNavigation';

export default function LoginPage() {
    const {goToForgotPassword} = useAuthNavigation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleLogin = () => {
        // TODO: Implement login logic
        console.log('Login attempt:', formData);
    };

    const isFormValid = formData.email.trim() && formData.password.trim();

    return (
        <AuthContainer 
            pageClassName={styles.pageContainer}
            contentClassName={styles.content}
        >
            <AuthTitle 
                title={
                    <>
                        MOHE 계정으로<br/>
                        로그인
                    </>
                }
                titleClassName={styles.title}
            />

                <Stack spacing="sm">
                    <FormInput
                        label="이메일 주소"
                        type="email"
                        placeholder="example@mohae.com"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                    />

                    <FormInput
                        label="비밀번호"
                        type="password"
                        placeholder="영문, 숫자, 특수문자"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                    />
                </Stack>

                <Stack spacing="sm" align="center" className={styles.actions}>
                    <PrimaryButton
                        disabled={!isFormValid}
                        onClick={handleLogin}
                    >
                        로그인
                    </PrimaryButton>

                    <TextLink onClick={goToForgotPassword}>
                        비밀번호를 잊으셨나요?
                    </TextLink>
                </Stack>
        </AuthContainer>
    );
}