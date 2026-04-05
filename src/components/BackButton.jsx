import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { useLanguage } from "../utils/LanguageContext";

const rotate180 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;

const ButtonContainer = styled.div`
  position: fixed;
  top: 60px;
  left: 15px;
  z-index: 99;
  
  @media (max-width: 768px) {
    top: 56px;
    left: 10px;
  }
`;

const BackButtonCircle = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  
  svg {
    font-size: 18px;
    transition: transform 0.5s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 15px rgba(255, 62, 108, 0.3);
    
    svg {
      transform: rotate(180deg);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    svg {
      font-size: 16px;
    }
  }
`;

export const BackButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <ButtonContainer>
      <BackButtonCircle onClick={handleBack} title={t("back")}>
        <BiArrowBack />
      </BackButtonCircle>
    </ButtonContainer>
  );
};

export default BackButton;
