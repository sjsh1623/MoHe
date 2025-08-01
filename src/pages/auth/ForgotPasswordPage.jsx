import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/forgot-password-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import BackButton from '@/components/ui/buttons/BackButton';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSendEmail = () => {
    // TODO: Implement password reset email logic
    console.log('Sending password reset email to:', email);
    setEmailSent(true);
    
    // Simulate email sending
    setTimeout(() => {
      alert('비밀번호 재설정 이메일이 전송되었습니다.');
    }, 1000);
  };

  const isValidEmail = email.trim() && email.includes('@');

  return (
    <Container className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} />
      </div>

      <Stack spacing="md" className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            비밀번호를 잊으셨나요?
          </h1>
          <p className={styles.description}>
            재설정하려는 계정의 이메일 주소를 입력해주세요
          </p>
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
            disabled={!isValidEmail || emailSent}
            onClick={handleSendEmail}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {emailSent ? '이메일 전송됨' : '이메일 전송'}
          </PrimaryButton>
        </Stack>
      </Stack>
    </Container>
  );
}