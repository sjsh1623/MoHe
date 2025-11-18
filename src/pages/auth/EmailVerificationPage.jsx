import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/email-verification-page.module.css';

import { AuthContainer, AuthTitle } from '@/components/auth';
import OTPInput from '@/components/ui/inputs/OTPInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function EmailVerificationPage() {
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
      throw new Error('이메일 정보가 없습니다.');
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
      setError('인증번호 5자리를 모두 입력해주세요.');
      return;
    }

    if (!tempUserId) {
      setError('인증 정보가 없습니다. 처음부터 다시 시도해주세요.');
      setTimeout(() => {
        sessionStorage.clear();
        navigate('/signup');
      }, 2000);
      return;
    }

    if (timeLeft <= 0) {
      try {
        await sendVerificationCode();
        setError('인증코드가 만료되어 다시 보냈습니다. 다시 확인해주세요.');
      } catch (resendError) {
        console.error('Auto resend failed:', resendError);
        setError('인증번호 재전송에 실패했습니다. 다시 시도해주세요.');
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
      const errorMsg = error.message || '인증에 실패했습니다';
      if (errorMsg.includes('유효하지 않은 인증 요청')) {
        setError('인증 시간이 만료되었습니다. 처음부터 다시 시도해주세요.');
        setTimeout(() => {
          sessionStorage.clear();
          navigate('/signup');
        }, 2000);
      } else if (errorMsg.includes('일치하지 않습니다')) {
        setError('인증 코드가 일치하지 않습니다. 다시 확인해주세요.');
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
    setStatusMessage('인증코드를 재발송했습니다. 메일함을 확인해주세요.');
    setTimeLeft(TIMER_DURATION);
    setVerificationCode('');
    setOtpResetKey((prev) => prev + 1);

    sendVerificationCode()
      .catch((error) => {
        console.error('Resend failed:', error);
        setStatusMessage('');
        setError('인증번호 재전송에 실패했습니다. 다시 시도해주세요.');
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
        title={
	        <>
		       인증코드를 확인해주세요
	        </>
        }
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <p className={styles.description}>
          <span className={styles.emailHighlight}>{email}</span>
          {email && '로 인증 코드를 보냈습니다.'}
          {!email && '인증 코드를 보냈습니다.'}
          <br />
          <span className={styles.descriptionAccent}>메일함에서 인증번호를 확인해주세요.</span>
        </p>

        <div
          className={[
            styles.timerRow,
            timeLeft <= 60 ? styles.timerRowWarning : '',
          ].join(' ')}
        >
          <span className={styles.timerLabel}>남은 시간</span>
          <span className={styles.timerValue}>
            {timeLeft > 0 ? formatTime(timeLeft) : '만료됨'}
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
            {isVerifying ? '확인 중...' : '다음'}
          </PrimaryButton>

          <button
            className={styles.resendButton}
            onClick={handleResendCode}
            disabled={isResending}
            type="button"
          >
            {isResending ? '재전송 중...' : '인증번호 재전송'}
          </button>
        </div>
    </AuthContainer>
  );
}
