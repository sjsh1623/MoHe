import React, { useState, useEffect } from 'react';
import { buildImageUrl } from '@/utils/image';

export default function ImageTestPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const testImageName = '10000_파스토보이_월계점_1.jpg';

  useEffect(() => {
    const url = buildImageUrl(testImageName);
    setImageUrl(url);
    console.log('🖼️ Testing image URL:', url);
    console.log('📦 VITE_IMAGE_BASE_URL:', import.meta.env.VITE_IMAGE_BASE_URL);
  }, []);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully!');
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', imageUrl);
    console.error('Error details:', e);
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #007AFF', paddingBottom: '10px' }}>
        🖼️ 이미지 로딩 테스트 (HMR 활성화됨)
      </h1>

      <div style={{
        background: '#f0f8ff',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #007AFF'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#007AFF' }}>환경 변수</h2>
        <code style={{
          display: 'block',
          background: '#fff',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          wordBreak: 'break-all'
        }}>
          VITE_IMAGE_BASE_URL: {import.meta.env.VITE_IMAGE_BASE_URL || '(비어있음)'}
        </code>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>빌드된 이미지 URL</h2>
        <code style={{
          display: 'block',
          background: '#fff',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          wordBreak: 'break-all'
        }}>
          {imageUrl}
        </code>
      </div>

      <div style={{
        background: imageLoaded ? '#d4edda' : imageError ? '#f8d7da' : '#fff3cd',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: imageLoaded ? '1px solid #28a745' : imageError ? '1px solid #dc3545' : '1px solid #ffc107'
      }}>
        <h2 style={{
          margin: '0 0 10px 0',
          color: imageLoaded ? '#155724' : imageError ? '#721c24' : '#856404'
        }}>
          {imageLoaded ? '✅ 이미지 로드 성공!' : imageError ? '❌ 이미지 로드 실패' : '⏳ 이미지 로딩 중...'}
        </h2>
        {imageError && (
          <p style={{ margin: '10px 0', color: '#721c24' }}>
            이미지를 불러올 수 없습니다. 다음을 확인하세요:
            <ul style={{ marginLeft: '20px' }}>
              <li>이미지 프로세서가 실행 중인가요? (http://localhost:5200)</li>
              <li>URL이 올바른가요? {imageUrl}</li>
              <li>파일이 존재하나요? {testImageName}</li>
            </ul>
          </p>
        )}
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333' }}>테스트 이미지</h2>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="테스트 이미지"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              marginTop: '20px'
            }}
          />
        )}
      </div>

      <div style={{
        background: '#e7f3ff',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #007AFF'
      }}>
        <h2 style={{ color: '#007AFF', margin: '0 0 10px 0' }}>🔥 HMR 테스트</h2>
        <p style={{ margin: 0 }}>
          이 텍스트를 수정하고 저장하면 페이지가 자동으로 새로고침됩니다!
        </p>
        <p style={{
          margin: '10px 0 0 0',
          padding: '10px',
          background: '#fff',
          borderRadius: '4px',
          fontWeight: 'bold',
          color: '#007AFF'
        }}>
          HMR 작동 확인: ✨ 변경사항이 즉시 반영됩니다!
        </p>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #6c757d'
      }}>
        <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>📊 시스템 정보</h2>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>프로토콜:</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{window.location.protocol}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>호스트:</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{window.location.hostname}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>포트:</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{window.location.port}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>전체 URL:</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', wordBreak: 'break-all' }}>
                {window.location.href}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>User Agent:</td>
              <td style={{ padding: '8px', fontSize: '12px', wordBreak: 'break-all' }}>
                {navigator.userAgent}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
