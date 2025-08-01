import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/email-verification-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import BackButton from '@/components/ui/buttons/BackButton';
import OTPInput from '@/components/ui/inputs/OTPInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLink from '@/components/ui/links/TextLink';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

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

    setIsVerifying(true);
    setError('');

    try {
      // TODO: Implement actual verification API call
      console.log('Verifying code:', code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, accept any 5-digit code
      if (code.length === 5) {
        // Success - navigate to next step
        navigate('/terms');
      } else {
        setError('인증번호가 올바르지 않습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend verification code
    console.log('Resending verification code...');
    alert('인증번호가 재전송되었습니다.');
  };

  const isCodeComplete = verificationCode.length === 5;

  return (
    <Container className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} />
      </div>

      <Stack spacing="md" className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            인증번호를 입력해주세요
          </h1>
          <p className={styles.description}>
            받은 편지함에서 확인 후 아래에 입력해주세요.
          </p>
        </div>

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
      </Stack>
    </Container>
  );
}