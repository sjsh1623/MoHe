import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/password-setup-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function PasswordSetupPage() {
  const { goToHome } = useAuthNavigation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // Get temp user ID and nickname from session storage
    const tempId = sessionStorage.getItem('temp_user_id');
    const setupNickname = sessionStorage.getItem('setup_nickname');
    
    if (tempId && setupNickname) {
      setTempUserId(tempId);
      setNickname(setupNickname);
    } else {
      // If missing data, redirect back to signup
      navigate('/signup');
    }
  }, [navigate]);


  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear password errors when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear confirm password errors when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('8자 이상');
    }
    
    if (!/[A-Za-z]/.test(password)) {
      errors.push('영문 포함');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('숫자 포함');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자 포함');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      newErrors.password = `비밀번호는 ${passwordErrors.join(', ')}이 필요합니다.`;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!tempUserId || !nickname) {
      setErrors({ submit: '사용자 정보가 부족합니다. 다시 회원가입을 진행해주세요.' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await authService.setupProfile(tempUserId, nickname, password);
      console.log('Profile setup successful:', result);
      
      // Clean up session storage
      sessionStorage.removeItem('signup_email');
      sessionStorage.removeItem('temp_user_id');
      sessionStorage.removeItem('setup_nickname');
      
      // Check if user needs to complete preferences or can go straight to home
      if (result.user && result.user.isProfileComplete) {
        navigate('/home');
      } else {
        // User needs to complete profile setup (MBTI, preferences, etc.)
        navigate('/age-range');
      }
    } catch (error) {
      console.error('Profile setup failed:', error);
      setErrors({ submit: error.message || '프로필 설정에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid) {
      handleSubmit();
    }
  };

  const isFormValid = password.trim() && confirmPassword.trim() && 
                     validatePassword(password).length === 0 && 
                     password === confirmPassword;

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={
          <>
            MOHE에 사용할<br />
            비밀번호를 입력해주세요
          </>
        }
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <Stack spacing="lg" className={styles.form}>
          <FormInput
            label="비밀번호"
            type="password"
            placeholder="영문, 숫자, 특수문자"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            error={errors.password}
          />

          <FormInput
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 한번 더 입력해주세요"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onKeyPress={handleKeyPress}
            error={errors.confirmPassword}
          />

          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}

          <PrimaryButton 
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
            variant={!isFormValid ? 'disabled' : 'primary'}
          >
            {isSubmitting ? '설정 중...' : '시작하기'}
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}