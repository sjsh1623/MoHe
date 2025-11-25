import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/auth/terms-agreement-page.module.css';

import { AuthContainer, AuthTitle } from '@/components/auth';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import TermsList from '@/components/ui/lists/TermsList';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { termsService } from '@/services/apiService';

export default function TermsAgreementPage() {
  const { t } = useTranslation();
  const { goToPasswordSetup } = useAuthNavigation();

  const FALLBACK_TERMS = [
    {
      id: 'service-terms',
      label: t('auth.terms.items.serviceTerms'),
      required: true,
      hasDetails: true,
      checked: false
    },
    {
      id: 'privacy-policy',
      label: t('auth.terms.items.privacyPolicy'),
      required: false,
      hasDetails: true,
      checked: false
    },
    {
      id: 'location-terms',
      label: t('auth.terms.items.locationTerms'),
      required: false,
      hasDetails: true,
      checked: false
    },
    {
      id: 'age-verification',
      label: t('auth.terms.items.ageVerification'),
      required: true,
      hasDetails: false,
      checked: false
    }
  ];
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
          <span dangerouslySetInnerHTML={{ __html: t('auth.terms.title') }} />
        }
        subtitle={
          <span dangerouslySetInnerHTML={{ __html: t('auth.terms.subtitle') }} />
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
            {isLoading ? t('auth.terms.loading') : t('auth.terms.nextButton')}
          </PrimaryButton>
        </div>
    </AuthContainer>
  );
}
