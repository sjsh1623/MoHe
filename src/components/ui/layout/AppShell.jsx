import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '@/styles/components/layout/app-shell.module.css';

const APP_MAX_WIDTH = 428;

function updateShellMetrics() {
  if (typeof window === 'undefined') {
    return;
  }
  const maxWidth = APP_MAX_WIDTH;
  const viewportWidth = window.innerWidth;
  const offset = Math.max((viewportWidth - Math.min(viewportWidth, maxWidth)) / 2, 0);

  document.documentElement.style.setProperty('--app-shell-max-width', `${maxWidth}px`);
  document.documentElement.style.setProperty('--app-shell-offset', `${offset}px`);
}

export default function AppShell({ children, className = '', ...props }) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    updateShellMetrics();
    window.addEventListener('resize', updateShellMetrics);

    return () => {
      window.removeEventListener('resize', updateShellMetrics);
    };
  }, []);

  return (
    <div className={`${styles.appShell} ${className}`} {...props}>
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};
