import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/transportation-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { useUserPreferences } from '@/contexts';
import { userService } from '@/services/apiService';
import { authService } from '@/services/authService';
import busImage from '@/assets/image/bus.png';
import carImage from '@/assets/image/car.png';

const TRANSPORTATION_OPTIONS = [
    {
        id: 'public',
        title: '대중교통',
        image: busImage
    },
    {
        id: 'car',
        title: '자동차',
        image: carImage
    }
];

export default function TransportationSelectionPage() {
    const navigate = useNavigate();
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
            setError(err.message || '선호도 저장 중 오류가 발생했습니다.');
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
            title="어떻게 이동하시나요?"
            subtitle="이동 수단에 따라 추천 장소가 달라져요"
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