import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import styles from '@/styles/components/layout/app-shell.module.css';

const APP_MAX_WIDTH = 428;
const EDGE_TO_EDGE_ROUTES = new Set(['/hello']);

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
  const location = useLocation();
  const useEdgeToEdgeBackground = EDGE_TO_EDGE_ROUTES.has(location.pathname);

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

  const shellClassName = [
    styles.appShell,
    useEdgeToEdgeBackground ? styles.edgeToEdge : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClassName} {...props}>
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
