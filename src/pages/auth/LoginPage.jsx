import React, {useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/auth/login-page.module.css';

import {Stack} from '@/components/ui/layout';
import FormInput from '@/components/ui/inputs/FormInput';
import Checkbox from '@/components/ui/inputs/Checkbox';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SocialButtons from '@/components/ui/buttons/SocialButton';
import TextLink from '@/components/ui/links/TextLink';
import {AuthContainer, AuthTitle} from '@/components/auth';
import {useAuthNavigation} from '@/hooks/useAuthNavigation';
import { useBackButton } from '@/contexts/BackButtonContext';
import { useAuth } from '@/contexts';
import { PROTECTED_ROUTES } from '@/hooks/useAuthGuard';

export default function LoginPage() {
    const { t } = useTranslation();
    const {goToForgotPassword} = useAuthNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const { setBackClickHandler, clearBackClickHandler } = useBackButton();
    const { isAuthenticated, isLoading: authLoading, login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handlerSetRef = useRef(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            console.log('User already authenticated, redirecting to /home');
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

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
            console.log('Attempting login with:', { email: formData.email.trim(), password: '***' });
            const result = await login(formData.email.trim(), formData.password);
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
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            setError(error.message || t('auth.login.errors.loginFailed'));
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
                    <span dangerouslySetInnerHTML={{ __html: t('auth.login.title') }} />
                }
                titleClassName={styles.title}
            />

            <Stack spacing="sm">
                    <FormInput
                        label={t('auth.login.emailLabel')}
                        type="email"
                        placeholder={t('auth.login.emailPlaceholder')}
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />

                    <FormInput
                        label={t('auth.login.passwordLabel')}
                        type="password"
                        placeholder={t('auth.login.passwordPlaceholder')}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />

                    <Checkbox
                        checked={rememberMe}
                        onChange={setRememberMe}
                        label={t('auth.login.rememberMe')}
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
                        {isLoading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
                    </PrimaryButton>

                    <div className={styles.divider}>
                        <span className={styles.dividerLine} />
                        <span className={styles.dividerText}>또는</span>
                        <span className={styles.dividerLine} />
                    </div>

                    <SocialButtons onError={setError} />

                    <div className={styles.linksContainer}>
                        <Link to="/signup" className={styles.link}>
                            {t('auth.login.signup')}
                        </Link>
                        <span className={styles.separator}>|</span>
                        <button
                            onClick={goToForgotPassword}
                            className={styles.link}
                        >
                            {t('auth.login.forgotPassword')}
                        </button>
                    </div>
                </Stack>
        </AuthContainer>
    );
}
