import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const ErrorCard = styled.div`
  background-color: white;
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
`;

const ErrorTitle = styled.h1`
  color: #1a1a1a;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const ErrorMessage = styled.p`
  color: #1a1a1a;
  font-size: 24px;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.8;
`;

const ReloadButton = styled.button`
  padding: 24px 32px;
  background-color: #87CEEB;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    // Reload the page to reset the application state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>앗! 문제가 발생했어요</ErrorTitle>
            <ErrorMessage>
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하면 문제가 해결될 수 있어요.
            </ErrorMessage>
            {this.state.error && (
              <ErrorMessage style={{ fontSize: '14px', opacity: 0.6 }}>
                오류 정보: {this.state.error.message}
              </ErrorMessage>
            )}
            <ReloadButton onClick={this.handleReload}>
              🔄 페이지 새로고침
            </ReloadButton>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
