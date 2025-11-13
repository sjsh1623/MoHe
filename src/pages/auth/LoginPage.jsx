import React, {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '@/styles/pages/auth/login-page.module.css';

import {Stack} from '@/components/ui/layout';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import {AuthContainer, AuthTitle} from '@/components/auth';
import {useAuthNavigation} from '@/hooks/useAuthNavigation';
import { authService } from '@/services/authService';

export default function LoginPage() {
    const {goToForgotPassword} = useAuthNavigation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleLogin = async () => {
        if (!isFormValid) return;

        setIsLoading(true);
        setError('');
        
        try {
            const result = await authService.login(formData.email.trim(), formData.password);
            console.log('Login successful:', result);
            
            // Check if user has completed profile setup
            if (result.user && result.user.isProfileComplete) {
                navigate('/home');
            } else {
                // User needs to complete profile setup
                navigate('/age-range');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && isFormValid) {
            handleLogin();
        }
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
                        placeholder="example@mohe.com"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />

                    <FormInput
                        label="비밀번호"
                        type="password"
                        placeholder="영문, 숫자, 특수문자"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                </Stack>

                {error && (
                    <div style={{ 
                        color: '#dc2626', 
                        fontSize: '14px', 
                        textAlign: 'center',
                        margin: '10px 0',
                        padding: '10px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px'
                    }}>
                        {error}
                    </div>
                )}

                <Stack spacing="sm" align="center" className={styles.actions}>
                    <PrimaryButton
                        disabled={!isFormValid || isLoading}
                        onClick={handleLogin}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </PrimaryButton>

                    <div className={styles.linksContainer}>
                        <Link to="/signup" className={styles.link}>
                            회원가입
                        </Link>
                        <span className={styles.separator}>|</span>
                        <button
                            onClick={goToForgotPassword}
                            className={styles.link}
                        >
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>
                </Stack>
        </AuthContainer>
    );
}