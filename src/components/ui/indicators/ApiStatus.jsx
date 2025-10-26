import React, { useState, useEffect } from 'react';
import styles from '@/styles/components/ui/indicators/api-status.module.css';

export default function ApiStatus() {
  const [status, setStatus] = useState({
    backend: 'checking',
    static: 'checking',
    database: 'checking'
  });

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    // Check backend health
    try {
      const backendResponse = await fetch('http://localhost:8000/health');
      const backendData = await backendResponse.json();
      setStatus(prev => ({
        ...prev,
        backend: backendData.success ? 'connected' : 'error'
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'error' }));
    }

    // Check static server
    try {
      const staticResponse = await fetch('http://localhost:1000/images/places/2025/09/20655__Starbucks_Seoul_Wave_Art_Center.jpg', { method: 'HEAD' });
      setStatus(prev => ({
        ...prev,
        static: staticResponse.ok ? 'connected' : 'error'
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, static: 'error' }));
    }

    // Check database through backend
    try {
      const dbResponse = await fetch('http://localhost:8000/api/places?page=0&limit=1');
      setStatus(prev => ({
        ...prev,
        database: dbResponse.status === 500 ? 'partial' : 'connected'
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'error' }));
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'connected': return '✅';
      case 'partial': return '⚠️';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'connected': return '연결됨';
      case 'partial': return '부분 연결';
      case 'error': return '연결 안됨';
      default: return '확인 중';
    }
  };

  return (
    <div className={styles.apiStatus}>
      <div className={styles.statusItem}>
        <span className={styles.icon}>{getStatusIcon(status.backend)}</span>
        <span className={styles.label}>Backend API</span>
        <span className={styles.status}>{getStatusText(status.backend)}</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.icon}>{getStatusIcon(status.static)}</span>
        <span className={styles.label}>Static Images</span>
        <span className={styles.status}>{getStatusText(status.static)}</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.icon}>{getStatusIcon(status.database)}</span>
        <span className={styles.label}>Database</span>
        <span className={styles.status}>{getStatusText(status.database)}</span>
      </div>
    </div>
  );
}