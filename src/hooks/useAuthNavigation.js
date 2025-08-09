import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for common auth navigation patterns
 * Provides consistent navigation methods used across auth pages
 */
export function useAuthNavigation() {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  
  const goToLogin = () => navigate('/login');
  
  const goToSignup = () => navigate('/signup');
  
  const goToEmailVerification = () => navigate('/verify-email');
  
  const goToPasswordSetup = () => navigate('/password-setup');
  
  const goToHome = () => navigate('/home');
  
  const goToForgotPassword = () => navigate('/forgot-password');
  
  const goToNicknameSetup = () => navigate('/nickname-setup');
  
  const goToTerms = () => navigate('/terms');

  return {
    navigate,
    goBack,
    goToLogin,
    goToSignup, 
    goToEmailVerification,
    goToPasswordSetup,
    goToHome,
    goToForgotPassword,
    goToNicknameSetup,
    goToTerms
  };
}