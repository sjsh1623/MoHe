import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/hello-page.module.css';
import surveyWelcomeImage from '@/assets/image/surveyWelcome.png';

export default function HelloPage() {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/home');
    };

    return (
        <div className={styles.container}>
            {/* Background gradient */}
            <div className={styles.background}>
                {/* Main content */}
                <div className={styles.content}>
                    {/* Title */}
                    <h1 className={styles.title}>이해했어요!</h1>
                    
                    {/* Subtitle */}
                    <p className={styles.subtitle}>
                        <span>이제 석현님에게 딱 맞는 장소를 </span>
                        <br />
                        <span>MOHE가 찾아볼게요 😊</span>
                    </p>
                    
                    {/* Illustration */}
                    <div className={styles.illustrationContainer}>
                        <img 
                            src={surveyWelcomeImage} 
                            alt="Survey welcome illustration"
                            className={styles.illustration}
                        />
                    </div>
                    
                    {/* Next button */}
                    <button className={styles.nextButton} onClick={handleNext}>
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
}