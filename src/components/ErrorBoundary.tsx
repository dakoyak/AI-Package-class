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
  padding: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const ErrorCard = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.large};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.8;
`;

const ReloadButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
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
