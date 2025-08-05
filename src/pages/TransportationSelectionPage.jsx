import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/transportation-selection-page.module.css';
import BackButton from '@/components/ui/buttons/BackButton';
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
        navigate('/home');
    };

    const handleSkip = () => {
        console.log('User skipped transportation selection');
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
                            어떻게 이동하시나요?
                        </h1>
                        <p className={styles.subtitle}>
                            이동 수단에 따라 추천 장소가 달라져요
                        </p>
                    </div>

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
                </div>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
                    <div className={`${styles.progressStep} ${styles.active}`}></div>
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