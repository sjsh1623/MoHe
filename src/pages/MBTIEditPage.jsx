import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/mbti-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { userService } from '@/services/apiService';

export default function MBTIEditPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [mbtiState, setMbtiState] = useState({
        extroversion: null,
        sensing: null,
        thinking: null,
        judging: null
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [originalMBTI, setOriginalMBTI] = useState('');

    // Load current MBTI from server
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await userService.getProfile();
                if (response.success && response.data?.user?.mbti) {
                    const mbti = response.data.user.mbti;
                    setOriginalMBTI(mbti);
                    setMbtiState({
                        extroversion: mbti[0] || null,
                        sensing: mbti[1] || null,
                        thinking: mbti[2] || null,
                        judging: mbti[3] || null
                    });
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };

        loadProfile();
    }, []);

    const { extroversion, sensing, thinking, judging } = mbtiState;

    const handleLetterSelect = (category, letter) => {
        const wasComplete = isMBTIComplete();

        const newState = { ...mbtiState };
        switch (category) {
            case 'EI':
                newState.extroversion = letter;
                break;
            case 'SN':
                newState.sensing = letter;
                break;
            case 'TF':
                newState.thinking = letter;
                break;
            case 'JP':
                newState.judging = letter;
                break;
        }

        setMbtiState(newState);

        const willBeComplete = newState.extroversion && newState.sensing && newState.thinking && newState.judging;

        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 300);

        if (!wasComplete && willBeComplete) {
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 600);
        }
    };

    const getMBTIString = () => {
        return `${extroversion || '-'}${sensing || '-'}${thinking || '-'}${judging || '-'}`;
    };

    const getCurrentDescription = () => {
        const currentMBTI = getMBTIString();
        if (currentMBTI.length === 4 && !currentMBTI.includes('-')) {
            return '선택한 MBTI로 업데이트됩니다';
        }
        return 'MBTI를 선택해주세요';
    };

    const isMBTIComplete = () => {
        return !!(extroversion && sensing && thinking && judging);
    };

    const isReady = () => {
        return isMBTIComplete();
    };

    const hasChanges = () => {
        const currentMBTI = getMBTIString();
        return currentMBTI !== originalMBTI && !currentMBTI.includes('-');
    };

    const handleSave = async () => {
        if (!isReady()) return;

        const mbti = getMBTIString();
        try {
            setIsSaving(true);
            const response = await userService.updateProfile({ mbti });
            if (response.success) {
                navigate('/profile-settings');
            } else {
                console.error('Failed to update MBTI:', response.message);
            }
        } catch (err) {
            console.error('Failed to save MBTI:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile-settings');
    };

    return (
        <PreferencePageLayout
            title={<>MBTI 수정</>}
            subtitle="변경할 MBTI를 선택해주세요"
            onNext={handleSave}
            onSkip={handleCancel}
            isReady={isReady() && hasChanges()}
            progressSteps={0}
            activeSteps={0}
            customStyles={styles}
            nextButtonText={isSaving ? '저장 중...' : '저장'}
            skipButtonText="취소"
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
                {getMBTIString()}
            </div>

            {/* Description */}
            <div className={`${styles.description} ${isUpdating ? styles.fadeIn : ''}`}>
                {getCurrentDescription()}
            </div>
        </PreferencePageLayout>
    );
}
