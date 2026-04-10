import axios from "axios";
import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LogoImg from "../img/logo.png";
import { useLanguage } from "../utils/LanguageContext";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: ${({ theme }) => theme.bg || "#000"};
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 16px;
  background: ${({ theme }) => theme.bgLighter || "#171717"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.35s ease;
`;

const Logo = styled.img`
  height: 48px;
  margin-bottom: 8px;
  object-fit: contain;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
  text-align: center;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSoft || "#888"};
  display: flex;
  align-items: center;
  & svg {
    font-size: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 44px;
  background: ${({ theme }) => theme.bg || "rgba(0,0,0,0.3)"};
  border: 1.5px solid ${({ theme }) => theme.soft || "rgba(255,255,255,0.12)"};
  border-radius: 10px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  &:focus {
    border-color: #0b67dc;
    box-shadow: 0 0 0 3px rgba(11, 103, 220, 0.15);
  }
  &::placeholder {
    color: ${({ theme }) => theme.textSoft || "rgba(255,255,255,0.4)"};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSoft || "#888"};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  & svg {
    font-size: 20px;
  }
  &:hover {
    color: ${({ theme }) => theme.text || "#fff"};
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #0b67dc 0%, #5fa8ff 100%);
  margin-top: 8px;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextLink = styled.span`
  display: block;
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #5fa8ff;
  cursor: pointer;
  &:hover {
    color: #0b67dc;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  color: #e94560;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.35);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  color: #2ecc71;
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
`;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => (searchParams.get("token") || "").trim(), [searchParams]);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (tokenMissing) {
      setError(t("resetPasswordTokenMissing"));
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (password !== confirm) {
      setError(t("resetPasswordPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || t("resetPasswordInvalidLink");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Logo src={LogoImg} alt="stream-in" />
        <Title>{t("resetPasswordPageTitle")}</Title>
        <Subtitle>{t("resetPasswordPageSubtitle")}</Subtitle>

        {tokenMissing && !success && (
          <ErrorMessage>{t("resetPasswordTokenMissing")}</ErrorMessage>
        )}
        {success && (
          <SuccessMessage>{t("resetPasswordSuccess")}</SuccessMessage>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <InputGroup>
              <InputIcon>
                <LockOutlinedIcon />
              </InputIcon>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordSignin")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={tokenMissing || loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </PasswordToggle>
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <LockOutlinedIcon />
              </InputIcon>
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder={t("confirmPassword")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={tokenMissing || loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </PasswordToggle>
            </InputGroup>

            <PrimaryButton type="submit" disabled={loading || tokenMissing}>
              {loading ? t("resetPasswordSaving") : t("resetPasswordSubmit")}
            </PrimaryButton>
          </form>
        )}

        <TextLink onClick={() => navigate("/signin")}>
          {t("backToSignIn")}
        </TextLink>
      </Card>
    </PageWrapper>
  );
};

export default ResetPassword;
