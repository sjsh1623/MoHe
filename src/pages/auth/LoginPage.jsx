import React, {useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '@/styles/pages/auth/login-page.module.css';

import {Stack} from '@/components/ui/layout';
import FormInput from '@/components/ui/inputs/FormInput';
import Checkbox from '@/components/ui/inputs/Checkbox';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLink from '@/components/ui/links/TextLink';
import {AuthContainer, AuthTitle} from '@/components/auth';
import {useAuthNavigation} from '@/hooks/useAuthNavigation';
import { useBackButton } from '@/contexts/BackButtonContext';
import { PROTECTED_ROUTES } from '@/hooks/useAuthGuard';
import { authService } from '@/services/authService';

export default function LoginPage() {
    const {goToForgotPassword} = useAuthNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const { setBackClickHandler, clearBackClickHandler } = useBackButton();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handlerSetRef = useRef(false);

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

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

            // Save or remove email based on rememberMe checkbox
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email.trim());
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Clear history and navigate to home
            // This prevents users from going back to login page
            window.history.replaceState(null, '', '/home');
            navigate('/home', { replace: true });
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

    useEffect(() => {
        const fromPath = location.state?.from;
        const isProtectedRoute = typeof fromPath === 'string' && PROTECTED_ROUTES.some(route => fromPath.startsWith(route));

        if (!isProtectedRoute) {
            if (handlerSetRef.current) {
                clearBackClickHandler();
                handlerSetRef.current = false;
            }
            return;
        }

        // Only set handler once per mount to prevent infinite loops
        if (!handlerSetRef.current) {
            // Force back button to go home (replace entry) instead of retrying protected route
            const handleBackToHome = () => {
                navigate('/home', { replace: true });
            };

            setBackClickHandler(handleBackToHome);
            handlerSetRef.current = true;
        }

        return () => {
            if (handlerSetRef.current) {
                clearBackClickHandler();
                handlerSetRef.current = false;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.from]);

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

                    <Checkbox
                        checked={rememberMe}
                        onChange={setRememberMe}
                        label="다음에도 기억하기"
                        variant="minimal"
                        className={styles.rememberMeCheckbox}
                    />

                    {error && (
                        <p className={styles.errorMessage} role="alert">
                            {error}
                        </p>
                    )}
                </Stack>

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
