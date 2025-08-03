import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/nickname-setup-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import BackButton from '@/components/ui/buttons/BackButton';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function NicknameSetupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState(null); // null, 'available', 'taken'

  const handleBack = () => {
    navigate(-1);
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock logic - for demo purposes
      const isTaken = nickname.toLowerCase() === 'admin' || nickname.toLowerCase() === 'test';
      setDuplicateCheckResult(isTaken ? 'taken' : 'available');
    } catch (error) {
      console.error('Duplicate check failed:', error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleNext = () => {
    if (isValidNickname && duplicateCheckResult === 'available') {
      console.log('Proceeding with nickname:', nickname);
      navigate('/terms');
    }
  };

  const isValidNickname = nickname.trim().length >= 2;
  const canProceed = isValidNickname && duplicateCheckResult === 'available';

  return (
    <Container className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} />
      </div>

      <Stack spacing="md" className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            MOHE에 사용할<br />
            닉네임을 입력해주세요
          </h1>
        </div>

        <Stack spacing="sm" className={styles.form}>
          <div className={styles.inputContainer}>
            <FormInput
              label="닉네임"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={handleNicknameChange}
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

          {duplicateCheckResult && (
            <div className={`${styles.resultMessage} ${
              duplicateCheckResult === 'available' ? styles.success : styles.error
            }`}>
              {duplicateCheckResult === 'available' 
                ? '사용 가능한 닉네임입니다.' 
                : '이미 사용중인 닉네임입니다.'}
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
      </Stack>
    </Container>
  );
}