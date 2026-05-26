import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  width: 100%;
`

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`

export default function PageLoader() {
  return (
    <Wrapper aria-label="Loading page" role="status">
      <Spinner />
    </Wrapper>
  )
}
