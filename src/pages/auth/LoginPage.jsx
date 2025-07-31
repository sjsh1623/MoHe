import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '@/styles/pages/auth/login-page.module.css';

import {Container, Stack} from '@/components/ui/layout';
import BackButton from '@/components/ui/buttons/BackButton';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLink from '@/components/ui/links/TextLink';

export default function LoginPage() {
    const navigate = useNavigate();
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

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogin = () => {
        // TODO: Implement login logic
        console.log('Login attempt:', formData);
    };

    const handleForgotPassword = () => {
        // TODO: Navigate to forgot password page
        console.log('Forgot password clicked');
    };

    const isFormValid = formData.email.trim() && formData.password.trim();

    return (
        <Container className={styles.pageContainer}>
            <div className={styles.header}>
                <BackButton onClick={handleBack}/>
            </div>

            <Stack spacing="xl" className={styles.content}>
                <h1 className={styles.title}>
                    MOHE 계정으로<br/>
                    로그인
                </h1>

                <Stack spacing="lg">
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

                <Stack spacing="lg" align="center" className={styles.actions}>
                    <PrimaryButton
                        disabled={!isFormValid}
                        onClick={handleLogin}
                    >
                        로그인
                    </PrimaryButton>

                    <TextLink onClick={handleForgotPassword}>
                        비밀번호를 잊으셨나요?
                    </TextLink>
                </Stack>
            </Stack>
        </Container>
    );
}