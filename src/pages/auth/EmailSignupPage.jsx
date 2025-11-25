import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/auth/email-signup-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function EmailSignupPage() {
  const { t } = useTranslation();
  const { goToEmailVerification } = useAuthNavigation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleEmailSignup = async () => {
    if (!isValidEmail) return;

    setIsLoading(true);
    setError('');

    try {
      // Wait for API response before navigating
      const result = await authService.signup(email.trim());
      console.log('Signup successful:', result);

      // Store email and tempUserId
      sessionStorage.setItem('signup_email', email.trim());
      if (result?.tempUserId) {
        sessionStorage.setItem('temp_user_id', result.tempUserId);
      }

      // Navigate after successful signup
      navigate('/verify-email');
    } catch (error) {
      console.error('Signup failed:', error);
      setError(error.message || t('auth.signup.errors.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValidEmail) {
      handleEmailSignup();
    }
  };

  const isValidEmail = email.trim() && email.includes('@') && email.includes('.');

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={
          <span dangerouslySetInnerHTML={{ __html: t('auth.signup.title') }} />
        }
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <Stack spacing="sm" className={styles.form}>
          <FormInput
            label={t('auth.signup.emailLabel')}
            type="email"
            placeholder={t('auth.signup.emailPlaceholder')}
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          <PrimaryButton
            disabled={!isValidEmail || isLoading}
            onClick={handleEmailSignup}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {isLoading ? t('auth.signup.processing') : t('auth.signup.submitButton')}
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}
