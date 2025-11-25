import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/mbti-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import {useUserPreferences} from '@/contexts';

export default function MBTISelectionPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { mbtiState, updateMBTILetter, getMBTIString, isMBTIComplete } = useUserPreferences();

    // Animation state
    const [isUpdating, setIsUpdating] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    // Destructure MBTI state for easier access
    const { extroversion, sensing, thinking, judging } = mbtiState;


    const handleLetterSelect = (category, letter) => {
        // Check if MBTI was complete before this change
        const wasComplete = isMBTIComplete();

        // Update the letter using context
        updateMBTILetter(category, letter);

        // Check if MBTI becomes complete after this change
        // We need to calculate this manually since state updates are async
        let willBeComplete = false;
        const currentState = { ...mbtiState };
        switch (category) {
            case 'EI':
                currentState.extroversion = letter;
                break;
            case 'SN':
                currentState.sensing = letter;
                break;
            case 'TF':
                currentState.thinking = letter;
                break;
            case 'JP':
                currentState.judging = letter;
                break;
        }
        willBeComplete = currentState.extroversion && currentState.sensing && currentState.thinking && currentState.judging;

        // Trigger update animation for any change
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 300);

        // Trigger completion animation if MBTI just became complete
        if (!wasComplete && willBeComplete) {
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 600);
        }
    };

    const getCurrentMBTI = () => {
        return getMBTIString();
    };

    const getCurrentDescription = () => {
        const currentMBTI = getCurrentMBTI();
        if (currentMBTI.length === 4) {
            return MBTI_DESCRIPTIONS[currentMBTI] || '당신만의 독특한 성격 유형이에요! 다양한 경험을 통해 자신만의 여행 스타일을 찾아보세요.';
        }
        return '자신만의 여행 스타일을 찾아보세요';
    };

    const isReady = () => {
        return isMBTIComplete();
    };

    const handleNext = () => {
        if (!isReady()) return;
        const mbti = getCurrentMBTI();
        console.log('Selected MBTI:', mbti);
        navigate('/space-preference');
    };

    const handleSkip = () => {
        console.log('User skipped MBTI selection');
        navigate('/home');
    };

    return (
        <PreferencePageLayout
            title={<>MBTI를 알려주면,<br/>추천이 쉬워져요</>}
            subtitle="아래에서 내 MBTI를 직접 선택해보세요"
            onNext={handleNext}
            onSkip={handleSkip}
            isReady={isReady()}
            progressSteps={4}
            activeSteps={2}
            customStyles={styles}
        >
            {/* MBTI Selection Grid */}
                    <div className={styles.mbtiGrid}>
                        {/* Row 1: E/I and S/N */}
                        <div className={styles.mbtiRow}>
                            <button
                                className={`${styles.mbtiLetter} ${extroversion === 'E' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('EI', 'E')}
                            >
                                E
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${sensing === 'S' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('SN', 'S')}
                            >
                                S
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${thinking === 'T' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('TF', 'T')}
                            >
                                T
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${judging === 'P' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('JP', 'P')}
                            >
                                P
                            </button>
                        </div>

                        {/* Row 2: I and N */}
                        <div className={styles.mbtiRow}>
                            <button
                                className={`${styles.mbtiLetter} ${extroversion === 'I' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('EI', 'I')}
                            >
                                I
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${sensing === 'N' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('SN', 'N')}
                            >
                                N
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${thinking === 'F' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('TF', 'F')}
                            >
                                F
                            </button>
                            <button
                                className={`${styles.mbtiLetter} ${judging === 'J' ? styles.selected : styles.unselected}`}
                                onClick={() => handleLetterSelect('JP', 'J')}
                            >
                                J
                            </button>
                        </div>
                    </div>

                    {/* MBTI Display */}
                    <div className={`${styles.mbtiDisplay} ${isUpdating ? styles.update : ''} ${justCompleted ? styles.complete : ''}`}>
                        {getCurrentMBTI()}
                    </div>

                    {/* Description */}
                    <div className={`${styles.description} ${isUpdating ? styles.fadeIn : ''}`}>
                        {getCurrentDescription()}
                    </div>
        </PreferencePageLayout>
    );
}
