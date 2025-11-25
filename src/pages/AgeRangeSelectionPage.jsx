import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/age-range-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { useUserPreferences } from '@/contexts';

export default function AgeRangeSelectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ageRange, setAgeRange } = useUserPreferences();

  // Convert context string to number for comparison (backwards compatibility)
  const selectedAge = ageRange ? parseInt(ageRange) : null;


  const handleAgeSelect = (ageId) => {
    setAgeRange(ageId.toString());
  };

  const isReady = () => {
    return selectedAge !== null;
  };

  const handleNext = () => {
    if (!isReady()) return;
    console.log('Selected age range:', ageRange);
    navigate('/mbti-selection');
  };

  const handleSkip = () => {
    console.log('User skipped age selection');
    navigate('/home');
  };

  return (
    <PreferencePageLayout
      title={<span dangerouslySetInnerHTML={{ __html: t('onboarding.age.title') }} />}
      subtitle={t('onboarding.age.subtitle')}
      onNext={handleNext}
      onSkip={handleSkip}
      isReady={isReady()}
      progressSteps={4}
      activeSteps={1}
      customStyles={styles}
    >
      {/* Age Selection Grid */}
        <div className={styles.ageGrid}>
          {/* Top Row */}
          <div className={styles.ageRow}>
            {/* Under 20 */}
            <div className={styles.ageOption}>
              <button
                className={`${styles.ageButton} ${selectedAge === 19 ? styles.selected : ''}`}
                onClick={() => handleAgeSelect(19)}
              >
                <div className={styles.ageContent}>
                  <span className={styles.ageNumber}>20</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.2506C11.81 21.2506 11.62 21.1806 11.47 21.0306L5.4 14.9606C5.11 14.6706 5.11 14.1906 5.4 13.9006C5.69 13.6106 6.17 13.6106 6.46 13.9006L12 19.4406L17.54 13.9006C17.83 13.6106 18.31 13.6106 18.6 13.9006C18.89 14.1906 18.89 14.6706 18.6 14.9606L12.53 21.0306C12.38 21.1806 12.19 21.2506 12 21.2506Z" fill="#7D848D"/>
                    <path d="M12 21.0805C11.59 21.0805 11.25 20.7405 11.25 20.3305V3.50049C11.25 3.09049 11.59 2.75049 12 2.75049C12.41 2.75049 12.75 3.09049 12.75 3.50049V20.3305C12.75 20.7405 12.41 21.0805 12 21.0805Z" fill="#7D848D"/>
                  </svg>
                </div>
              </button>
              <span className={styles.ageLabel}>{t('onboarding.age.ranges.under20')}</span>
            </div>

            {/* 20s */}
            <div className={styles.ageOption}>
              <button
                className={`${styles.ageButton} ${selectedAge === 20 ? styles.selected : ''}`}
                onClick={() => handleAgeSelect(20)}
              >
                <span className={styles.ageNumber}>20</span>
              </button>
              <span className={styles.ageLabel}>{t('onboarding.age.ranges.20s')}</span>
            </div>

            {/* 30s */}
            <div className={styles.ageOption}>
              <button
                className={`${styles.ageButton} ${selectedAge === 30 ? styles.selected : ''}`}
                onClick={() => handleAgeSelect(30)}
              >
                <span className={styles.ageNumber}>30</span>
              </button>
              <span className={styles.ageLabel}>{t('onboarding.age.ranges.30s')}</span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className={styles.ageRow}>
            {/* 40s */}
            <div className={styles.ageOption}>
              <button
                className={`${styles.ageButton} ${selectedAge === 40 ? styles.selected : ''}`}
                onClick={() => handleAgeSelect(40)}
              >
                <span className={styles.ageNumber}>40</span>
              </button>
              <span className={styles.ageLabel}>{t('onboarding.age.ranges.40s')}</span>
            </div>

            {/* 50+ */}
            <div className={styles.ageOption}>
              <button
                className={`${styles.ageButton} ${selectedAge === 50 ? styles.selected : ''}`}
                onClick={() => handleAgeSelect(50)}
              >
                <div className={styles.ageContent}>
                  <span className={styles.ageNumber}>50</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.07 10.3199C17.88 10.3199 17.69 10.2499 17.54 10.0999L12 4.55994L6.46 10.0999C6.17 10.3899 5.69 10.3899 5.4 10.0999C5.11 9.80994 5.11 9.32994 5.4 9.03994L11.47 2.96994C11.76 2.67994 12.24 2.67994 12.53 2.96994L18.6 9.03994C18.89 9.32994 18.89 9.80994 18.6 10.0999C18.46 10.2499 18.26 10.3199 18.07 10.3199Z" fill="#7D848D"/>
                    <path d="M12 21.2499C11.59 21.2499 11.25 20.9099 11.25 20.4999V3.66992C11.25 3.25992 11.59 2.91992 12 2.91992C12.41 2.91992 12.75 3.25992 12.75 3.66992V20.4999C12.75 20.9099 12.41 21.2499 12 21.2499Z" fill="#7D848D"/>
                  </svg>
                </div>
              </button>
              <span className={styles.ageLabel}>{t('onboarding.age.ranges.over50')}</span>
            </div>
          </div>
        </div>
    </PreferencePageLayout>
  );
}
