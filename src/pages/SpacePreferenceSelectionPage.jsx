import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/space-preference-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { useUserPreferences } from '@/contexts';

export default function SpacePreferenceSelectionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { spacePreferences, toggleSpacePreference } = useUserPreferences();

    const SPACE_OPTIONS = [
        {
            id: 'workshop',
            title: t('onboarding.space.options.workshop.title'),
            description: t('onboarding.space.options.workshop.description')
        },
        {
            id: 'exhibition',
            title: t('onboarding.space.options.exhibition.title'),
            description: t('onboarding.space.options.exhibition.description')
        },
        {
            id: 'shopping',
            title: t('onboarding.space.options.shopping.title'),
            description: t('onboarding.space.options.shopping.description')
        },
        {
            id: 'nature',
            title: t('onboarding.space.options.nature.title'),
            description: t('onboarding.space.options.nature.description')
        },
        {
            id: 'lounge',
            title: t('onboarding.space.options.lounge.title'),
            description: t('onboarding.space.options.lounge.description')
        }
    ];

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
        navigate('/transportation-selection');
    };

    const handleSkip = () => {
        console.log('User skipped space preference selection');
        navigate('/home');
    };

    return (
        <PreferencePageLayout
            title={<span dangerouslySetInnerHTML={{ __html: t('onboarding.space.title') }} />}
            subtitle={t('onboarding.space.subtitle')}
            onNext={handleNext}
            onSkip={handleSkip}
            isReady={isReady()}
            progressSteps={4}
            activeSteps={3}
            customStyles={styles}
        >
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
        </PreferencePageLayout>
    );
}