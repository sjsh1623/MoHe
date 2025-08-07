import React from 'react';
import { handleWebViewError } from '@/utils/webviewOptimizations';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    handleWebViewError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: 'white'
        }}>
          <h2 style={{
            color: '#333',
            fontSize: '18px',
            marginBottom: '16px',
            fontFamily: 'Inter, sans-serif'
          }}>
            앱에 문제가 발생했습니다
          </h2>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '24px',
            lineHeight: '1.4',
            fontFamily: 'Inter, sans-serif'
          }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              minHeight: '44px',
              touchAction: 'manipulation'
            }}
          >
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;