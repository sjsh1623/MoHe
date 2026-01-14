import React, { useState } from 'react';
import { Stack } from '@/components/ui/layout';
import { socialAuthService } from '@/services/socialAuthService';
import styles from '@/styles/components/buttons/social-button.module.css';

const PROVIDER_LABELS = {
  kakao: '카카오',
  google: '구글',
};

function SocialButton({ provider, onClick, disabled, children, ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[provider]} ${disabled ? styles.disabled : ''}`}
      aria-label={`${PROVIDER_LABELS[provider] || provider} 로그인`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default function SocialButtons({ onError }) {
  const [isLoading, setIsLoading] = useState(null);

  const handleKakaoLogin = async () => {
    if (isLoading) return;
    setIsLoading('kakao');
    try {
      await socialAuthService.loginWithKakao();
    } catch (error) {
      console.error('Kakao login error:', error);
      onError?.(error.message || '카카오 로그인에 실패했습니다');
      setIsLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading('google');
    try {
      await socialAuthService.loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error.message || '구글 로그인에 실패했습니다');
      setIsLoading(null);
    }
  };

  return (
    <Stack spacing="lg" align="center">
      <div className={styles.buttonGroup}>
        <SocialButton
          provider="kakao"
          onClick={handleKakaoLogin}
          disabled={isLoading !== null}
        >
          {isLoading === 'kakao' ? (
            <div className={styles.spinner} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.00005 0.599976C4.0292 0.599976 3.05176e-05 3.71293 3.05176e-05 7.55226C3.05176e-05 9.94 1.55843 12.0449 3.93155 13.2969L2.93306 16.9445C2.84484 17.2668 3.21344 17.5237 3.49649 17.3369L7.87337 14.4482C8.24273 14.4838 8.61811 14.5046 9.00005 14.5046C13.9705 14.5046 18 11.3918 18 7.55226C18 3.71293 13.9705 0.599976 9.00005 0.599976Z"
                fill="black"
              />
            </svg>
          )}
        </SocialButton>
        <SocialButton
          provider="google"
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
        >
          {isLoading === 'google' ? (
            <div className={styles.spinner} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
          )}
        </SocialButton>
      </div>
    </Stack>
  );
}

// Export individual button for custom usage
export { SocialButton };
