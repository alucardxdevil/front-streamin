import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/** Grid compartido: Home, Tendencias y grids similares */
export const VideoCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 14px;
  width: 100%;
  animation: ${fadeIn} 0.45s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

/** Grid más amplio solo para Home */
export const HomeVideoCardGrid = styled(VideoCardGrid)`
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 18px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

/** Lista vertical: recomendaciones en sidebar */
export const VideoCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const VideoCardSkeleton = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid rgba(255, 255, 255, 0.06);

  &::before {
    content: '';
    display: block;
    aspect-ratio: 16 / 9;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.soft} 25%,
      ${({ theme }) => theme.bgLighter} 50%,
      ${({ theme }) => theme.soft} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s infinite;
  }

  &::after {
    content: '';
    display: block;
    height: 56px;
    margin: 10px 12px 12px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.soft} 25%,
      ${({ theme }) => theme.bgLighter} 50%,
      ${({ theme }) => theme.soft} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s infinite;
  }
`;
