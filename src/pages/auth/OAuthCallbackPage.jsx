import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { socialAuthService } from '@/services/socialAuthService';
import { authService } from '@/services/authService';
import styles from '@/styles/pages/auth/oauth-callback.module.css';

export default function OAuthCallbackPage() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateAuthState } = useAuth();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`${provider} 로그인이 취소되었습니다`);
        setIsProcessing(false);
        return;
      }

      if (!code || !state) {
        setError('잘못된 인증 응답입니다');
        setIsProcessing(false);
        return;
      }

      try {
        const authData = await socialAuthService.handleOAuthCallback(provider, code, state);

        // Store auth data
        authService.setAuthData(authData);

        // Update auth context
        updateAuthState();

        // Navigate to appropriate page
        if (authData.user?.isOnboardingCompleted) {
          navigate('/home', { replace: true });
        } else {
          navigate('/age-selection', { replace: true });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || '로그인에 실패했습니다');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [provider, searchParams, navigate, updateAuthState]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className={styles.errorTitle}>로그인 실패</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => navigate('/login', { replace: true })}
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loadingCard}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>
          {isProcessing ? '로그인 처리 중...' : '잠시만 기다려주세요...'}
        </p>
      </div>
    </div>
  );
}
