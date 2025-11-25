import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/auth/email-verification-page.module.css';

import { AuthContainer, AuthTitle } from '@/components/auth';
import OTPInput from '@/components/ui/inputs/OTPInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function EmailVerificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isResending, setIsResending] = useState(false);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem('signup_email');
    const storedTempUserId = sessionStorage.getItem('temp_user_id');

    if (!signupEmail || !storedTempUserId) {
      // If no email or tempUserId, redirect back to signup
      console.error('Missing signup data:', { signupEmail, storedTempUserId });
      navigate('/signup');
      return;
    }

    setEmail(signupEmail);
    setTempUserId(storedTempUserId);
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCodeChange = (code) => {
    setVerificationCode(code);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    if (statusMessage) {
      setStatusMessage('');
    }
  };

  const handleCodeComplete = (code) => {
    // Auto-verify when all 5 digits are entered
    handleVerification(code);
  };

  const sendVerificationCode = async () => {
    const normalizedEmail = email?.trim();
    if (!normalizedEmail) {
      throw new Error(t('auth.verification.errors.noAuthInfo'));
    }

    const result = await authService.signup(normalizedEmail);
    if (result?.tempUserId) {
      sessionStorage.setItem('temp_user_id', result.tempUserId);
      setTempUserId(result.tempUserId);
    }

    setTimeLeft(TIMER_DURATION);
    setVerificationCode('');
    setOtpResetKey((prev) => prev + 1);
  };

  const handleVerification = async (code = verificationCode) => {
    if (statusMessage) {
      setStatusMessage('');
    }

    if (code.length !== 5) {
      setError(t('auth.verification.errors.invalidCode'));
      return;
    }

    if (!tempUserId) {
      setError(t('auth.verification.errors.noAuthInfo'));
      setTimeout(() => {
        sessionStorage.clear();
        navigate('/signup');
      }, 2000);
      return;
    }

    if (timeLeft <= 0) {
      try {
        await sendVerificationCode();
        setError(t('auth.verification.errors.codeExpired'));
      } catch (resendError) {
        console.error('Auto resend failed:', resendError);
        setError(t('auth.verification.errors.resendFailed'));
      }
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

      // Parse error message for better UX
      const errorMsg = error.message || t('auth.verification.errors.verificationFailed');
      if (errorMsg.includes('유효하지 않은 인증 요청')) {
        setError(t('auth.verification.errors.sessionExpired'));
        setTimeout(() => {
          sessionStorage.clear();
          navigate('/signup');
        }, 2000);
      } else if (errorMsg.includes('일치하지 않습니다')) {
        setError(t('auth.verification.errors.codeMismatch'));
        setVerificationCode('');
        setOtpResetKey((prev) => prev + 1);
      } else {
        setError(errorMsg);
        setVerificationCode('');
        setOtpResetKey((prev) => prev + 1);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    setError('');
    setStatusMessage(t('auth.verification.statusResent'));
    setTimeLeft(TIMER_DURATION);
    setVerificationCode('');
    setOtpResetKey((prev) => prev + 1);

    sendVerificationCode()
      .catch((error) => {
        console.error('Resend failed:', error);
        setStatusMessage('');
        setError(t('auth.verification.errors.resendFailed'));
      })
      .finally(() => {
        setIsResending(false);
      });
  };

  // Format timer display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = verificationCode.length === 5;

  return (
    <AuthContainer
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={t('auth.verification.title')}
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <p className={styles.description}>
          <span className={styles.emailHighlight}>{email}</span>
          {email && t('auth.verification.description')}
          {!email && t('auth.verification.descriptionNoEmail')}
          <br />
          <span className={styles.descriptionAccent}>{t('auth.verification.descriptionAccent')}</span>
        </p>

        <div
          className={[
            styles.timerRow,
            timeLeft <= 60 ? styles.timerRowWarning : '',
          ].join(' ')}
        >
          <span className={styles.timerLabel}>{t('auth.verification.timerLabel')}</span>
          <span className={styles.timerValue}>
            {timeLeft > 0 ? formatTime(timeLeft) : t('auth.verification.expired')}
          </span>
        </div>

        <div className={styles.otpSection}>
          <OTPInput
            length={5}
            value={verificationCode}
            onChange={handleCodeChange}
            onComplete={handleCodeComplete}
            hasError={Boolean(error)}
            focusResetKey={otpResetKey}
          />

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}
          {statusMessage && !error && (
            <div className={styles.statusMessage} role="status">
              {statusMessage}
            </div>
          )}
        </div>

        <div className={styles.buttonSection}>
          <PrimaryButton
            disabled={!isCodeComplete || isVerifying || timeLeft === 0}
            onClick={() => handleVerification()}
            variant={!isCodeComplete || timeLeft === 0 ? 'disabled' : 'primary'}
          >
            {isVerifying ? t('auth.verification.verifying') : t('auth.verification.nextButton')}
          </PrimaryButton>

          <button
            className={styles.resendButton}
            onClick={handleResendCode}
            disabled={isResending}
            type="button"
          >
            {isResending ? t('auth.verification.resending') : t('auth.verification.resendButton')}
          </button>
        </div>
    </AuthContainer>
  );
}
