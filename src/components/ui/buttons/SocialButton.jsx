import React from 'react';
import { Stack } from '@/components/ui/layout';
import styles from '@/styles/components/buttons/social-button.module.css';

function SocialButton({ provider, children, ...props }) {
  return (
    <button 
      className={`${styles.btn} ${styles[provider]}`} 
      aria-label={`${provider === 'naver' ? '네이버' : '카카오'} 로그인`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function SocialButtons() {
    return (
        <Stack spacing="lg" align="center">
            <div className={styles.buttonGroup}>
                <SocialButton provider="naver">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M10.8491 8.56267L4.91687 0H0V16H5.15088V7.436L11.0831 16H16V0H10.8491V8.56267Z"
                            fill="white"
                        />
                    </svg>
                </SocialButton>
                <SocialButton provider="kakao">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.00005 0.599976C4.0292 0.599976 3.05176e-05 3.71293 3.05176e-05 7.55226C3.05176e-05 9.94 1.55843 12.0449 3.93155 13.2969L2.93306 16.9445C2.84484 17.2668 3.21344 17.5237 3.49649 17.3369L7.87337 14.4482C8.24273 14.4838 8.61811 14.5046 9.00005 14.5046C13.9705 14.5046 18 11.3918 18 7.55226C18 3.71293 13.9705 0.599976 9.00005 0.599976Z"
                            fill="black"
                        />
                    </svg>
                </SocialButton>
            </div>
        </Stack>
    );
}