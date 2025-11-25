import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/pages/transportation-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { useUserPreferences } from '@/contexts';
import { userService } from '@/services/apiService';
import { authService } from '@/services/authService';
import busImage from '@/assets/image/bus.png';
import carImage from '@/assets/image/car.png';

export default function TransportationSelectionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const TRANSPORTATION_OPTIONS = [
        {
            id: 'public',
            title: t('onboarding.transportation.options.public'),
            image: busImage
        },
        {
            id: 'car',
            title: t('onboarding.transportation.options.car'),
            image: carImage
        }
    ];
    const {
        transportationMethod,
        setTransportationMethod,
        mbtiState,
        ageRange,
        spacePreferences
    } = useUserPreferences();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTransportationSelect = (transportationId) => {
        setTransportationMethod(transportationId);
    };

    const isReady = () => {
        return transportationMethod !== '';
    };

    const handleNext = async () => {
        if (!isReady()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Check if user is authenticated
            const isAuthenticated = authService.isAuthenticated();

            if (isAuthenticated) {
                // Prepare preferences payload matching backend schema
                const preferences = {
                    mbti: mbtiState, // Send as object: { extroversion, sensing, thinking, judging }
                    ageRange: ageRange,
                    spacePreferences: Array.from(spacePreferences),
                    transportationMethod: transportationMethod
                };

                console.log('Saving preferences to backend:', preferences);

                // Save preferences to backend
                const preferencesResponse = await userService.updatePreferences(preferences);

                if (preferencesResponse.success) {
                    console.log('Preferences saved successfully:', preferencesResponse.data);

                    // Mark onboarding as complete
                    const onboardingResponse = await userService.completeOnboarding({});

                    if (onboardingResponse.success) {
                        console.log('Onboarding completed successfully');
                        navigate('/hello');
                    } else {
                        throw new Error('Failed to complete onboarding');
                    }
                } else {
                    throw new Error(preferencesResponse.message || 'Failed to save preferences');
                }
            } else {
                // For guest users, just navigate
                console.log('Guest user - skipping backend save');
                navigate('/hello');
            }
        } catch (err) {
            console.error('Error saving preferences:', err);
            setError(err.message || t('onboarding.transportation.errorSaving'));
            // Still navigate even if backend save fails (preferences are in localStorage)
            setTimeout(() => navigate('/hello'), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        console.log('User skipped transportation selection');
        navigate('/hello');
    };

    return (
        <PreferencePageLayout
            title={t('onboarding.transportation.title')}
            subtitle={t('onboarding.transportation.subtitle')}
            onNext={handleNext}
            onSkip={handleSkip}
            isReady={isReady() && !isLoading}
            progressSteps={4}
            activeSteps={4}
            customStyles={styles}
        >
            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#fee',
                    borderRadius: '8px',
                    color: '#c33'
                }}>
                    {error}
                </div>
            )}
            {/* Transportation Options */}
                    <div className={styles.optionsContainer}>
                        {TRANSPORTATION_OPTIONS.map((transport) => (
                            <button
                                key={transport.id}
                                className={`${styles.optionCard} ${
                                    transportationMethod === transport.id ? styles.selected : styles.unselected
                                }`}
                                onClick={() => handleTransportationSelect(transport.id)}
                            >
                                <div className={styles.iconContainer}>
                                    <img 
                                        src={transport.image} 
                                        alt={transport.title}
                                        className={styles.transportImage}
                                    />
                                </div>
                                <div className={styles.optionTitle}>{transport.title}</div>
                            </button>
                        ))}
                    </div>
        </PreferencePageLayout>
    );
}