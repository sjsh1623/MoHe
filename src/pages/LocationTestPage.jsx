import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import Container from '@/components/ui/layout/Container';

/**
 * 위치 정보 테스트 페이지
 * iOS와 웹에서 위치 정보가 어떻게 동작하는지 확인
 */
const LocationTestPage = () => {
  const [logs, setLogs] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const testPlatformDetection = () => {
    addLog('=== 플랫폼 감지 테스트 ===', 'header');
    addLog(`Capacitor.isNativePlatform(): ${Capacitor.isNativePlatform()}`);
    addLog(`Capacitor.getPlatform(): ${Capacitor.getPlatform()}`);
    addLog(`navigator.userAgent: ${navigator.userAgent}`);
  };

  const testCapacitorGeolocation = async () => {
    addLog('=== Capacitor Geolocation 테스트 ===', 'header');
    setError(null);
    setLocation(null);

    try {
      // 1. 권한 확인
      addLog('1️⃣ 권한 상태 확인 중...');
      const permissionStatus = await Geolocation.checkPermissions();
      addLog(`권한 상태: ${JSON.stringify(permissionStatus)}`);

      // 2. 권한 요청 (필요한 경우)
      if (permissionStatus.location !== 'granted') {
        addLog('2️⃣ 권한 요청 중...');
        const requestResult = await Geolocation.requestPermissions();
        addLog(`권한 요청 결과: ${JSON.stringify(requestResult)}`);

        if (requestResult.location === 'denied') {
          throw new Error('위치 권한이 거부되었습니다.');
        }
      }

      // 3. 위치 정보 가져오기
      addLog('3️⃣ 위치 정보 가져오는 중...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      addLog(`위치 수신 성공! 위도: ${position.coords.latitude}, 경도: ${position.coords.longitude}`, 'success');
      addLog(`정확도: ${position.coords.accuracy}m`);
      addLog(`전체 데이터: ${JSON.stringify(position.coords)}`);

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

    } catch (err) {
      const errorMessage = `에러 발생: ${err.message || JSON.stringify(err)}`;
      addLog(errorMessage, 'error');
      setError(err.message || '알 수 없는 에러');
      console.error('Capacitor Geolocation Error:', err);
    }
  };

  const testWebGeolocation = () => {
    addLog('=== Web Geolocation API 테스트 ===', 'header');
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      addLog('Web Geolocation API를 사용할 수 없습니다.', 'error');
      return;
    }

    addLog('위치 정보 요청 중...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        addLog(`위치 수신 성공! 위도: ${position.coords.latitude}, 경도: ${position.coords.longitude}`, 'success');
        addLog(`정확도: ${position.coords.accuracy}m`);

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (err) => {
        const errorMessage = `에러 발생: ${err.message} (코드: ${err.code})`;
        addLog(errorMessage, 'error');
        setError(err.message);
        console.error('Web Geolocation Error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLogs = () => {
    setLogs([]);
    setLocation(null);
    setError(null);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'header': return '#0066cc';
      case 'success': return '#00aa00';
      case 'error': return '#cc0000';
      default: return '#333333';
    }
  };

  return (
    <Container>
      <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>📍 위치 정보 테스트</h1>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={testPlatformDetection}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            플랫폼 확인
          </button>

          <button
            onClick={testCapacitorGeolocation}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Capacitor 테스트
          </button>

          <button
            onClick={testWebGeolocation}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Web API 테스트
          </button>

          <button
            onClick={clearLogs}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그 지우기
          </button>
        </div>

        {location && (
          <div style={{
            padding: '15px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ 위치 정보 수신 성공</h3>
            <p style={{ margin: '5px 0' }}>위도: {location.latitude}</p>
            <p style={{ margin: '5px 0' }}>경도: {location.longitude}</p>
            <p style={{ margin: '5px 0' }}>정확도: {location.accuracy}m</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>❌ 에러 발생</h3>
            <p style={{ margin: '5px 0' }}>{error}</p>
          </div>
        )}

        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>로그:</h3>
          {logs.length === 0 ? (
            <p style={{ color: '#999' }}>버튼을 클릭하여 테스트를 시작하세요.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '5px 0',
                  borderBottom: '1px solid #e0e0e0',
                  color: getLogColor(log.type),
                  fontWeight: log.type === 'header' ? 'bold' : 'normal'
                }}
              >
                <span style={{ color: '#999', marginRight: '10px' }}>[{log.timestamp}]</span>
                {log.message}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>💡 사용 방법</h3>
          <ol style={{ margin: '0', paddingLeft: '20px' }}>
            <li>먼저 "플랫폼 확인" 버튼을 눌러 현재 환경 확인</li>
            <li>"Capacitor 테스트" 버튼을 눌러 네이티브 위치 API 테스트</li>
            <li>에러가 발생하면 로그에서 상세 내용 확인</li>
            <li>Xcode 콘솔에서도 동일한 로그 확인 가능</li>
          </ol>
        </div>
      </div>
    </Container>
  );
};

export default LocationTestPage;
