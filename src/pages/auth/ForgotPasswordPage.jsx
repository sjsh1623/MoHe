import React, { useState } from 'react';
import styles from '@/styles/pages/auth/forgot-password-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSendEmail = async () => {
    try {
      await authService.forgotPassword(email.trim());
      setEmailSent(true);
      alert('비밀번호 재설정 이메일이 전송되었습니다.');
    } catch (error) {
      console.error('Failed to send reset email:', error);
      alert(error.message || '비밀번호 재설정 이메일 전송에 실패했습니다.');
    }
  };

  const isValidEmail = email.trim() && email.includes('@');

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title="비밀번호를 잊으셨나요?"
        subtitle="재설정하려는 계정의 이메일 주소를 입력해주세요"
        titleClassName={styles.title}
        subtitleClassName={styles.description}
        wrapperClassName={styles.titleSection}
      />

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
    </AuthContainer>
  );
}
