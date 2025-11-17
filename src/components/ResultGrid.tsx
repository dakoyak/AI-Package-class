import styled from 'styled-components';
import { useState } from 'react';

interface ResultGridProps {
  images: string[];
  columns?: number;
}

const GridContainer = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 100%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    gap: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.sm};
    /* Ensure grid fits within viewport at 1920x1080 */
    max-height: calc(100vh - 300px);
  }
`;

const ImageWrapper = styled.div<{ $delay: number }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  animation: fadeIn 0.4s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}s;
  opacity: 0;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  min-width: 300px;
  min-height: 300px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    min-width: 200px;
    min-height: 200px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tv}) {
    /* Ensure images are clearly visible on TV display */
    min-width: 300px;
    min-height: 300px;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.medium};
  font-weight: 600;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  opacity: 0.8;
`;

const PlaceholderIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  opacity: 0.6;
`;

const ImageIndex = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
  background-color: rgba(255, 215, 0, 0.9);
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.sizes.small};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const ResultGrid: React.FC<ResultGridProps> = ({ 
  images, 
  columns = 3 
}) => {
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setLoadErrors(prev => new Set(prev).add(index));
  };

  // Calculate optimal columns based on number of images
  const optimalColumns = images.length < columns ? images.length : columns;

  return (
    <GridContainer $columns={optimalColumns} data-testid="result-grid">
      {images.map((imageUrl, index) => (
        <ImageWrapper 
          key={index}
          $delay={index * 0.08}
        >
          <ImageIndex>{index + 1}</ImageIndex>
          {loadErrors.has(index) ? (
            <PlaceholderImage>
              <PlaceholderIcon>🖼️</PlaceholderIcon>
              <div>이미지를 불러올 수 없습니다</div>
            </PlaceholderImage>
          ) : (
            <StyledImage
              src={imageUrl}
              alt={`AI 생성 결과 ${index + 1}`}
              onError={() => handleImageError(index)}
              loading="lazy"
            />
          )}
        </ImageWrapper>
      ))}
    </GridContainer>
  );
};
