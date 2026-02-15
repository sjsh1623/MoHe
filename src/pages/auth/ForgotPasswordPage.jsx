import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/auth/forgot-password-page.module.css';

import { Stack } from '@/components/ui/layout';
import { AuthContainer, AuthTitle } from '@/components/auth';
import FormInput from '@/components/ui/inputs/FormInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSendEmail = async () => {
    try {
      await authService.forgotPassword(email.trim());
      setEmailSent(true);
      alert(t('auth.forgotPassword.successMessage'));
    } catch (error) {
      console.error('Failed to send reset email:', error);
      alert(error.message || t('auth.forgotPassword.errorMessage'));
    }
  };

  const isValidEmail = email.trim() && email.includes('@');

  return (
    <AuthContainer
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={t('auth.forgotPassword.title')}
        subtitle={t('auth.forgotPassword.description')}
        titleClassName={styles.title}
        subtitleClassName={styles.description}
        wrapperClassName={styles.titleSection}
      />

        <Stack spacing="sm" className={styles.form}>
          <FormInput
            label={t('auth.forgotPassword.emailLabel')}
            type="email"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            value={email}
            onChange={handleEmailChange}
          />

          <PrimaryButton
            disabled={!isValidEmail || emailSent}
            onClick={handleSendEmail}
            variant={!isValidEmail ? 'disabled' : 'primary'}
          >
            {emailSent ? t('auth.forgotPassword.emailSent') : t('auth.forgotPassword.submitButton')}
          </PrimaryButton>
        </Stack>
    </AuthContainer>
  );
}
