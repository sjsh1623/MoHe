import React, { useState } from 'react';
import styles from '@/styles/pages/auth/email-signup-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function EmailSignupPage() {
  const { goToEmailVerification } = useAuthNavigation();
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailVerification = () => {
    console.log('Starting email verification for:', email);
    setIsVerifying(true);
    goToEmailVerification();
  };

  const isValidEmail = email.trim() && email.includes('@') && email.includes('.');

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={
          <>
            MOHE에 사용할<br />
            이메일을 입력해주세요
          </>
        }
        titleClassName={styles.title}
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
            disabled={!isValidEmail || isVerifying}
            onClick={handleEmailVerification}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {isVerifying ? '인증 중...' : '이메일 인증하기'}
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}