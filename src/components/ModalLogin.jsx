import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLanguage } from "../utils/LanguageContext";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.bgLighter || "#111"};
  color: ${({ theme }) => theme.text || "#fff"};
  padding: 24px;
  border-radius: 12px;
  width: 340px;
  text-align: center;
  animation: scaleIn 0.3s ease forwards;

  @keyframes scaleIn {
    from {
      transform: scale(0.85);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Title = styled.h3`
  margin-bottom: 10px;
`;

const Text = styled.p`
  margin-bottom: 20px;
  font-size: 15px;
  color: #ccc;
`;

const ButtonPrimary = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: none;
  background: #0b67dc;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;

  &:hover {
    background: #0955b3;
  }
`;

const ButtonSecondary = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: transparent;
  color: #999;
  border: 1px solid #444;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;

  &:hover {
    color: #ccc;
    border-color: #666;
  }
`;

const LoginRequired = ({ open, onClose }) => {
  const { t } = useLanguage();
  if (!open) return null;

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <Title>{t("signInRequired")}</Title>
        <Text>{t("signInRequiredDesc")}</Text>

        <Link to="/signin" style={{ textDecoration: "none" }}>
          <ButtonPrimary>{t("signIn")}</ButtonPrimary>
        </Link>
        <ButtonSecondary onClick={onClose}>{t("cancel")}</ButtonSecondary>
      </ModalBox>
    </Backdrop>
  );
};

export default LoginRequired;
