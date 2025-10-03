import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/email-verification-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import OTPInput from '@/components/ui/inputs/OTPInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLink from '@/components/ui/links/TextLink';
import { authService } from '@/services/authService';

export default function EmailVerificationPage() {
  const { goToNicknameSetup } = useAuthNavigation();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem('signup_email');
    if (signupEmail) {
      setEmail(signupEmail);
    } else {
      // If no email, redirect back to signup
      navigate('/signup');
    }

    const storedTempUserId = sessionStorage.getItem('temp_user_id');
    if (storedTempUserId) {
      setTempUserId(storedTempUserId);
    }
  }, [navigate]);

  const handleCodeChange = (code) => {
    setVerificationCode(code);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleCodeComplete = (code) => {
    // Auto-verify when all 5 digits are entered
    handleVerification(code);
  };

  const handleVerification = async (code = verificationCode) => {
    if (code.length !== 5) {
      setError('인증번호 5자리를 모두 입력해주세요.');
      return;
    }

    if (!tempUserId) {
      setError('인증 정보가 없습니다. 다시 회원가입을 시도해주세요.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await authService.verifyEmail(tempUserId, code);
      console.log('Verification successful:', result);
      
      // Success - navigate to nickname setup
      navigate('/nickname-setup');
    } catch (error) {
      console.error('Verification failed:', error);
      setError(error.message || '인증번호가 올바르지 않습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('이메일 정보가 없습니다.');
      return;
    }

    try {
      const result = await authService.signup(email);
      if (result?.tempUserId) {
        sessionStorage.setItem('temp_user_id', result.tempUserId);
        setTempUserId(result.tempUserId);
      }
      alert('인증번호가 재전송되었습니다.');
    } catch (error) {
      console.error('Resend failed:', error);
      setError('인증번호 재전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const isCodeComplete = verificationCode.length === 5;

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title="인증번호를 입력해주세요"
        subtitle="받은 편지함에서 확인 후 아래에 입력해주세요."
        titleClassName={styles.title}
        subtitleClassName={styles.description}
        wrapperClassName={styles.titleSection}
      />

        <div className={styles.otpSection}>
          <OTPInput
            length={5}
            value={verificationCode}
            onChange={handleCodeChange}
            onComplete={handleCodeComplete}
            className={error ? styles.errorState : ''}
          />
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

        </div>

        <div className={styles.buttonSection}>
          <PrimaryButton 
            disabled={!isCodeComplete || isVerifying}
            onClick={() => handleVerification()}
            variant={!isCodeComplete ? 'disabled' : 'primary'}
          >
            {isVerifying ? '확인 중...' : '다음'}
          </PrimaryButton>
          <TextLink onClick={handleResendCode}>
            인증번호 재전송
          </TextLink>
        </div>
    </AuthContainer>
  );
}
