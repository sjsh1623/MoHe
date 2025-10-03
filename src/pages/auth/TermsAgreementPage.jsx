import React, { useEffect, useState } from 'react';
import styles from '@/styles/pages/auth/terms-agreement-page.module.css';

import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import TermsList from '@/components/ui/lists/TermsList';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { termsService } from '@/services/apiService';

const FALLBACK_TERMS = [
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
  const { goToPasswordSetup } = useAuthNavigation();
  const [agreements, setAgreements] = useState(FALLBACK_TERMS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTerms = async () => {
      setIsLoading(true);
      try {
        const response = await termsService.listTerms();
        if (!active) return;
        if (response.success && Array.isArray(response.data?.terms)) {
          const mapped = response.data.terms.map(term => ({
            id: term.id,
            label: term.title,
            required: Boolean(term.required),
            hasDetails: term.hasDetails ?? true,
            checked: false,
          }));
          if (mapped.length > 0) {
            setAgreements(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load terms from API, falling back to defaults.', err);
        // keep fallback data so the user can continue onboarding.
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadTerms();
    return () => {
      active = false;
    };
  }, []);

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

  const handleViewTerms = async (id) => {
    try {
      const response = await termsService.getTermDetail(id);
      if (response.success) {
        const { title, content } = response.data || {};
        alert(`${title || '약관'}\n\n${content || '약관 전문이 아직 준비되지 않았습니다.'}`);
      }
    } catch (err) {
      console.warn('Failed to load terms detail:', err);
      alert('약관 내용을 불러오지 못했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleNext = () => {
    console.log('Proceeding with agreements:', agreements);
    goToPasswordSetup();
  };

  // Check if required terms are agreed
  const requiredTermsAgreed = agreements
    .filter(term => term.required)
    .every(term => term.checked);

  return (
    <AuthContainer 
      pageClassName={styles.pageContainer}
      contentClassName={styles.content}
    >
      <AuthTitle
        title={
          <>
            모해<br />
            약관 동의
          </>
        }
        subtitle={
          <>
            모해 서비스 시작 가입을 위해<br />
            정보 제공에 동의해주세요
          </>
        }
        titleClassName={styles.title}
        subtitleClassName={styles.description}
        wrapperClassName={styles.titleSection}
      />

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
            disabled={!requiredTermsAgreed || isLoading}
            onClick={handleNext}
            variant={!requiredTermsAgreed ? 'disabled' : 'primary'}
          >
            {isLoading ? '약관 확인 중...' : '다음'}
          </PrimaryButton>
        </div>
    </AuthContainer>
  );
}
