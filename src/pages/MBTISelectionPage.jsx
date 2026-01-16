import React, {useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/mbti-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import {useUserPreferences} from '@/contexts';

export default function MBTISelectionPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { mbtiState, updateMBTILetter, getMBTIString, isMBTIComplete } = useUserPreferences();

    const [isUpdating, setIsUpdating] = useState(false);

    const { extroversion, sensing, thinking, judging } = mbtiState;

    const handleLetterSelect = (category, letter) => {
        updateMBTILetter(category, letter);
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 200);
    };

    const getCurrentMBTI = () => getMBTIString();
    const isReady = () => isMBTIComplete();

    // MBTI 성향 설명 가져오기
    const mbtiDescription = useMemo(() => {
        const mbti = getCurrentMBTI();
        if (!mbti || mbti.includes('-')) {
            return t('onboarding.mbti.defaultDescription');
        }
        const description = t(`onboarding.mbti.descriptions.${mbti}`, { defaultValue: null });
        return description || t('onboarding.mbti.fallbackDescription');
    }, [extroversion, sensing, thinking, judging, t]);

    const handleNext = () => {
        if (!isReady()) return;
        navigate('/space-preference');
    };

    const handleSkip = () => {
        navigate('/home');
    };

    return (
        <PreferencePageLayout
            title={<span dangerouslySetInnerHTML={{ __html: t('onboarding.mbti.title') }} />}
            subtitle={t('onboarding.mbti.subtitle')}
            onNext={handleNext}
            onSkip={handleSkip}
            isReady={isReady()}
            progressSteps={4}
            activeSteps={2}
            nextButtonText={t('common.next')}
            skipButtonText={t('common.skip')}
            customStyles={styles}
        >
            <div className={styles.mbtiContainer}>
                {/* MBTI Grid - Simple 4 columns */}
                <div className={styles.mbtiGrid}>
                    <div className={styles.column}>
                        <button
                            className={`${styles.letter} ${extroversion === 'E' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('EI', 'E')}
                        >E</button>
                        <button
                            className={`${styles.letter} ${extroversion === 'I' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('EI', 'I')}
                        >I</button>
                    </div>
                    <div className={styles.column}>
                        <button
                            className={`${styles.letter} ${sensing === 'S' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('SN', 'S')}
                        >S</button>
                        <button
                            className={`${styles.letter} ${sensing === 'N' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('SN', 'N')}
                        >N</button>
                    </div>
                    <div className={styles.column}>
                        <button
                            className={`${styles.letter} ${thinking === 'T' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('TF', 'T')}
                        >T</button>
                        <button
                            className={`${styles.letter} ${thinking === 'F' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('TF', 'F')}
                        >F</button>
                    </div>
                    <div className={styles.column}>
                        <button
                            className={`${styles.letter} ${judging === 'J' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('JP', 'J')}
                        >J</button>
                        <button
                            className={`${styles.letter} ${judging === 'P' ? styles.selected : ''}`}
                            onClick={() => handleLetterSelect('JP', 'P')}
                        >P</button>
                    </div>
                </div>

                {/* Result */}
                <div className={`${styles.result} ${isUpdating ? styles.pulse : ''}`}>
                    {getCurrentMBTI() || '----'}
                </div>

                {/* MBTI 성향 설명 */}
                <div className={`${styles.descriptionContainer} ${isUpdating ? styles.pulse : ''}`}>
                    <p className={styles.description}>
                        {mbtiDescription}
                    </p>
                </div>
            </div>
        </PreferencePageLayout>
    );
}
