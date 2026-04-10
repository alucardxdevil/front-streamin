import React from "react";
import styled from "styled-components";

const Bar = styled.div`
  margin-top: 60px;
  min-height: 44px;
  width: 100%;
  background: linear-gradient(90deg, #1f2937 0%, #7c2d12 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: sticky;
  top: 60px;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;

  @media (max-width: 768px) {
    margin-top: 56px;
    top: 56px;
    padding: 10px 12px;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1300px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Message = styled.p`
  margin: 0;
  color: #fff3cd;
  font-size: 14px;
  text-align: center;
`;

const DonationButton = styled.a`
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #ffffff;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }
`;

const BetaNoticeBar = ({ donationUrl = "https://example.com/donate" }) => {
  return (
    <Bar>
      <Content>
        <Message>
          Stream-In esta en version beta. Si quieres apoyar el mantenimiento de la
          plataforma, puedes hacer una donacion o contribucion.
        </Message>
        <DonationButton
          href={donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ir a plataforma de donacion"
        >
          Apoyar proyecto
        </DonationButton>
      </Content>
    </Bar>
  );
};

export default BetaNoticeBar;
