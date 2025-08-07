import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/transportation-selection-page.module.css';
import PreferencePageLayout from '@/components/layout/PreferencePageLayout';
import { useUserPreferences } from '@/contexts';
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
    const { transportationMethod, setTransportationMethod } = useUserPreferences();

    const handleTransportationSelect = (transportationId) => {
        setTransportationMethod(transportationId);
    };

    const isReady = () => {
        return transportationMethod !== '';
    };

    const handleNext = () => {
        if (!isReady()) return;
        console.log('Selected transportation:', transportationMethod);
        navigate('/hello');
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
            isReady={isReady()}
            progressSteps={4}
            activeSteps={4}
            customStyles={styles}
        >
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