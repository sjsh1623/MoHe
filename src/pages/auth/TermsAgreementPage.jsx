import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/auth/terms-agreement-page.module.css';

import { Container, Stack } from '@/components/ui/layout';
import BackButton from '@/components/ui/buttons/BackButton';
import TermsList from '@/components/ui/lists/TermsList';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

const TERMS_DATA = [
  {
    id: 'service-terms',
    label: '서비스 이용약관 동의 (필수)',
    required: true,
    hasDetails: true,
    checked: false
  },
  {
    id: 'privacy-policy',
    label: '개인정보 수집 및 이용 동의 (선택)',
    required: false,
    hasDetails: true,
    checked: false
  },
  {
    id: 'location-terms',
    label: '위치 정보 이용약관 동의 (선택)',
    required: false,
    hasDetails: true,
    checked: false
  },
  {
    id: 'age-verification',
    label: '만 14세 이상입니다',
    required: true,
    hasDetails: false,
    checked: false
  }
];

export default function TermsAgreementPage() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState(TERMS_DATA);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAgreementChange = (id, checked) => {
    setAgreements(prev => 
      prev.map(agreement => 
        agreement.id === id 
          ? { ...agreement, checked }
          : agreement
      )
    );
  };

  const handleAllAgreeChange = (checked) => {
    setAgreements(prev => 
      prev.map(agreement => ({ ...agreement, checked }))
    );
  };

  const handleViewTerms = (id) => {
    // TODO: Navigate to terms detail page or open modal
    console.log('View terms for:', id);
  };

  const handleNext = () => {
    // TODO: Navigate to next step in signup flow
    console.log('Proceeding with agreements:', agreements);
    // Example: navigate('/signup/profile') or similar
  };

  // Check if required terms are agreed
  const requiredTermsAgreed = agreements
    .filter(term => term.required)
    .every(term => term.checked);

  return (
    <Container className={styles.pageContainer}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} />
      </div>

      <Stack spacing="md" className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            모해<br />
            약관 동의
          </h1>
          <p className={styles.description}>
            모해 서비스 시작 가입을 위해<br />
            정보 제공에 동의해주세요
          </p>
        </div>

        <div className={styles.termsSection}>
          <TermsList
            agreements={agreements}
            onAgreementChange={handleAgreementChange}
            onAllAgreeChange={handleAllAgreeChange}
            onViewTerms={handleViewTerms}
          />
        </div>

        <div className={styles.buttonSection}>
          <PrimaryButton 
            disabled={!requiredTermsAgreed}
            onClick={handleNext}
            variant={!requiredTermsAgreed ? 'disabled' : 'primary'}
          >
            다음
          </PrimaryButton>
        </div>
      </Stack>
    </Container>
  );
}