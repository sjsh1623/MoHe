import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/nickname-setup-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function NicknameSetupPage() {
  const { goToTerms } = useAuthNavigation();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState(null); // null, 'available', 'taken'
  const [tempUserId, setTempUserId] = useState('');

  useEffect(() => {
    // Get temp user ID from session storage
    const tempId = sessionStorage.getItem('temp_user_id');
    if (tempId) {
      setTempUserId(tempId);
    } else {
      // If no temp user ID, redirect back to signup
      navigate('/signup');
    }
  }, [navigate]);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    // Reset duplicate check when nickname changes
    if (duplicateCheckResult) {
      setDuplicateCheckResult(null);
    }
  };

  const handleDuplicateCheck = async () => {
    if (!nickname.trim()) return;
    
    console.log('Checking nickname duplicate for:', nickname);
    setIsCheckingDuplicate(true);
    
    try {
      const response = await authService.checkNickname(nickname.trim());
      const isAvailable = response?.isAvailable ?? response?.available;
      setDuplicateCheckResult(isAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('Duplicate check failed:', error);
      setDuplicateCheckResult('error');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleNext = () => {
    if (!tempUserId) {
      navigate('/signup');
      return;
    }

    if (isValidNickname && duplicateCheckResult === 'available') {
      console.log('Proceeding with nickname:', nickname);
      // Store nickname for later use
      sessionStorage.setItem('setup_nickname', nickname);
      navigate('/terms');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValidNickname && duplicateCheckResult === 'available') {
      handleNext();
    }
  };

  const isValidNickname = nickname.trim().length >= 2;
  const canProceed = isValidNickname && duplicateCheckResult === 'available';

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={
          <>
            MOHE에 사용할<br />
            닉네임을 입력해주세요
          </>
        }
        titleClassName={styles.title}
        wrapperClassName={styles.titleSection}
      />

        <Stack spacing="sm" className={styles.form}>
          <div className={styles.inputContainer}>
            <FormInput
              label="닉네임"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={handleNicknameChange}
              onKeyPress={handleKeyPress}
              className={styles.nicknameInput}
            />
            <button 
              className={`${styles.duplicateCheckButton} ${
                isValidNickname ? styles.enabled : styles.disabled
              }`}
              onClick={handleDuplicateCheck}
              disabled={!isValidNickname || isCheckingDuplicate}
            >
              {isCheckingDuplicate ? '확인중...' : '중복확인'}
            </button>
          </div>

          {duplicateCheckResult && duplicateCheckResult !== 'error' && (
            <div className={`${styles.resultMessage} ${
              duplicateCheckResult === 'available' ? styles.success : styles.error
            }`}>
              {duplicateCheckResult === 'available' 
                ? '사용 가능한 닉네임입니다.' 
                : '이미 사용중인 닉네임입니다.'}
            </div>
          )}

          {duplicateCheckResult === 'error' && (
            <div className={`${styles.resultMessage} ${styles.error}`}>
              닉네임 중복 확인 중 오류가 발생했습니다.
            </div>
          )}

          <PrimaryButton 
            disabled={!canProceed}
            onClick={handleNext}
            variant={!canProceed ? 'disabled' : 'primary'}
          >
            다음
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}
