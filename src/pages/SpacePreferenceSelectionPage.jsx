import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/space-preference-selection-page.module.css';
import BackButton from '@/components/ui/buttons/BackButton';
import {useUserPreferences} from '@/contexts';

const SPACE_OPTIONS = [
    {
        id: 'workshop',
        title: '공방 & 체험 공간',
        description: '무언가를 만드는 시간이 좋아요'
    },
    {
        id: 'exhibition',
        title: '전시회 & 박물관',
        description: '천천히 둘러보며 감상하는 게 좋아요'
    },
    {
        id: 'shopping',
        title: '편집숍 & 쇼핑몰',
        description: '내 취향을 발견하는 재미가 있어요'
    },
    {
        id: 'nature',
        title: '산책 & 자연 명소',
        description: '걷다 보면 생각이 정리돼요'
    },
    {
        id: 'lounge',
        title: '재즈바 & 라운지',
        description: '음악과 조명 속에 잠시 머물고 싶어요'
    }
];

export default function SpacePreferenceSelectionPage() {
    const navigate = useNavigate();
    const { spacePreferences, toggleSpacePreference } = useUserPreferences();

    const handleSpaceToggle = (spaceId) => {
        toggleSpacePreference(spaceId);
    };

    const isReady = () => {
        return spacePreferences.size > 0;
    };

    const handleNext = () => {
        if (!isReady()) return;
        const selectedSpacesList = Array.from(spacePreferences);
        console.log('Selected spaces:', selectedSpacesList);
        navigate('/home');
    };

    const handleSkip = () => {
        console.log('User skipped space preference selection');
        navigate('/home');
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <header className={styles.header}>
                    <BackButton />
                </header>

                {/* Main Content Area */}
                <div className={styles.mainContent}>
                    {/* Content Header */}
                    <div className={styles.contentHeader}>
                        <h1 className={styles.title}>
                            어디에서 시간을<br />
                            보내고 싶으신가요?
                        </h1>
                        <p className={styles.subtitle}>
                            마음 가는 공간을 자유롭게 선택해보세요
                        </p>
                    </div>

                    {/* Space Options */}
                    <div className={styles.optionsContainer}>
                        {SPACE_OPTIONS.map((space) => (
                            <button
                                key={space.id}
                                className={`${styles.optionCard} ${
                                    spacePreferences.has(space.id) ? styles.selected : styles.unselected
                                }`}
                                onClick={() => handleSpaceToggle(space.id)}
                            >
                                <div className={styles.optionTitle}>{space.title}</div>
                                <div className={styles.optionDescription}>{space.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={styles.progressStep}></div>
                </div>

                {/* Next Button */}
                <button 
                    className={`${styles.nextButton} ${isReady() ? styles.ready : ''}`} 
                    onClick={handleNext}
                    disabled={!isReady()}
                >
                    다음
                </button>

                {/* Skip Link */}
                <button className={styles.skipButton} onClick={handleSkip}>
                    여기까지만 알려줄게요
                </button>
            </div>
        </div>
    );
}