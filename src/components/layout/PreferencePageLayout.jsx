import React from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/preference-page-base.module.css';
import BackButton from '@/components/ui/buttons/BackButton';

export default function PreferencePageLayout({
  title,
  subtitle,
  children,
  onNext,
  onSkip,
  isReady,
  progressSteps = 4,
  activeSteps = 1,
  nextButtonText = '다음',
  skipButtonText = '여기까지만 알려줄게요',
  showSkipButton = true,
  customStyles = {}
}) {
  // Helper function to get class name (base style with optional custom override)
  const getClassName = (baseClass) => {
    const baseClassName = styles[baseClass];
    const customClassName = customStyles[baseClass];
    return customClassName || baseClassName;
  };

  return (
    <div className={getClassName('container')}>
      <div className={getClassName('content')}>
        {/* Header */}
        <header className={getClassName('header')}>
          <BackButton />
        </header>

        {/* Main Content Area */}
        <div className={getClassName('mainContent')}>
          {/* Content Header */}
          <div className={getClassName('contentHeader')}>
            <h1 className={getClassName('title')}>
              {title}
            </h1>
            <p className={getClassName('subtitle')}>
              {subtitle}
            </p>
          </div>

          {/* Dynamic Content */}
          {children}
        </div>

        {/* Progress Bar */}
        <div className={getClassName('progressContainer')}>
          {Array.from({ length: progressSteps }, (_, index) => (
            <div 
              key={index}
              className={`${getClassName('progressStep')} ${
                index < activeSteps ? getClassName('active') : ''
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button 
          className={`${getClassName('nextButton')} ${isReady ? getClassName('ready') : ''}`} 
          onClick={onNext}
          disabled={!isReady}
        >
          {nextButtonText}
        </button>

        {/* Skip Button */}
        {showSkipButton && (
          <button className={getClassName('skipButton')} onClick={onSkip}>
            {skipButtonText}
          </button>
        )}
      </div>
    </div>
  );
}

PreferencePageLayout.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onNext: PropTypes.func.isRequired,
  onSkip: PropTypes.func,
  isReady: PropTypes.bool.isRequired,
  progressSteps: PropTypes.number,
  activeSteps: PropTypes.number,
  nextButtonText: PropTypes.string,
  skipButtonText: PropTypes.string,
  showSkipButton: PropTypes.bool,
  customStyles: PropTypes.object
};