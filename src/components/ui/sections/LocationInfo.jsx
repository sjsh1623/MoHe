import React from 'react';
import styles from '@/styles/pages/place-detail-page.module.css';

export default function LocationInfo({ address, carTime, busTime }) {
  return (
    <div className={styles.locationSection}>
      <div className={styles.locationRow}>
        <div className={styles.locationInfo}>
          <svg className={styles.locationIcon} viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6.67" r="2" stroke="#7D848D" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="6" stroke="#7D848D" strokeWidth="1.5"/>
          </svg>
          <span className={styles.locationText}>{address}</span>
        </div>

        {/* Transportation info if available */}
        {(carTime || busTime) && (
          <div className={styles.transportationRow}>
            {carTime && (
              <>
                <svg className={styles.carIcon} viewBox="0 0 16 16" fill="none">
                  <path d="M3 11h10M3 8h10M5 11v2M11 11v2" stroke="#7D848D" strokeWidth="1.5"/>
                </svg>
                <span className={styles.transportTime}>{carTime}</span>
              </>
            )}
            {busTime && (
              <>
                <svg className={styles.busIcon} viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="4" width="10" height="8" rx="1" stroke="#7D848D" strokeWidth="1.5"/>
                </svg>
                <span className={styles.transportTime}>{busTime}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
