import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/email-signup-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function EmailSignupPage() {
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
      const result = await authService.signup(email.trim());
      console.log('Signup successful:', result);
      
      // Store email for verification step
      sessionStorage.setItem('signup_email', email.trim());
      
      // Navigate to email verification
      navigate('/verify-email');
    } catch (error) {
      console.error('Signup failed:', error);
      setError(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
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
          <>
            MOHE에 사용할<br />
            이메일을 입력해주세요
          </>
        }
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <Stack spacing="sm" className={styles.form}>
          <FormInput
            label="이메일 주소"
            type="email"
            placeholder="example@mohe.com"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />

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

          <PrimaryButton 
            disabled={!isValidEmail || isLoading}
            onClick={handleEmailSignup}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {isLoading ? '처리 중...' : '이메일 인증하기'}
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}