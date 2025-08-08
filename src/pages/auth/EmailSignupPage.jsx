import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/email-signup-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function EmailSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailVerification = () => {
    console.log('Starting email verification for:', email);
    setIsVerifying(true);
    navigate('/verify-email');
  };

  const isValidEmail = email.trim() && email.includes('@') && email.includes('.');

  return (
    <Container className={styles.pageContainer}>

      <Stack spacing="md" className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            MOHE에 사용할<br />
            이메일을 입력해주세요
          </h1>
        </div>

        <Stack spacing="sm" className={styles.form}>
          <FormInput
            label="이메일 주소"
            type="email"
            placeholder="example@mohe.com"
            value={email}
            onChange={handleEmailChange}
          />

          <PrimaryButton 
            disabled={!isValidEmail || isVerifying}
            onClick={handleEmailVerification}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {isVerifying ? '인증 중...' : '이메일 인증하기'}
          </PrimaryButton>
        </Stack>
      </Stack>
    </Container>
  );
}