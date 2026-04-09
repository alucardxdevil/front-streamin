import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled, { keyframes } from "styled-components";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LogoImg from "../img/logo.png";
import { useLanguage } from "../utils/LanguageContext";

/* ============= Animations ============= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ============= Layout ============= */
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg || "#000"};
  color: ${({ theme }) => theme.text || "#fff"};
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 900px) {
    padding: 24px 16px;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${({ theme }) => theme.bgLighter || "#171717"};
  border-left: 1px solid ${({ theme }) => theme.soft || "#333"};
  animation: ${fadeIn} 0.6s ease 0.15s both;

  @media (max-width: 900px) {
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.soft || "#333"};
    padding: 32px 16px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 540px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border: 1px solid ${({ theme }) => theme.soft || "rgba(255,255,255,0.08)"};
  margin: auto;

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 440px;
    min-height: auto;
  }
`;

/* ============= Form Elements ============= */
const FormBox = styled.div`
  width: 100%;
  max-width: 340px;
`;

const Logo = styled.img`
  height: 56px;
  margin-bottom: 8px;
  object-fit: contain;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 28px;
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
  padding: 14px 14px 14px 44px;
  background: ${({ theme }) => theme.bg || "rgba(0,0,0,0.3)"};
  border: 1.5px solid ${({ theme }) => theme.soft || "rgba(255,255,255,0.12)"};
  border-radius: 10px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  outline: none;

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
  background-size: 200% 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(11, 103, 220, 0.35);
    animation: ${shimmer} 1.5s ease infinite;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  max-width: 340px;
  padding: 14px;
  border: 1.5px solid ${({ theme }) => theme.soft || "rgba(255,255,255,0.15)"};
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme }) => theme.text || "#fff"};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s ease;

  & svg {
    font-size: 22px;
    color: #db4437;
  }

  &:hover {
    background: rgba(219, 68, 55, 0.08);
    border-color: #db4437;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(219, 68, 55, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ForgotLink = styled.span`
  display: block;
  text-align: right;
  font-size: 13px;
  color: #5fa8ff;
  cursor: pointer;
  margin-bottom: 20px;
  margin-top: -8px;
  transition: color 0.2s;

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
  animation: ${fadeIn} 0.3s ease;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  width: 100%;
  max-width: 340px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.soft || "rgba(255,255,255,0.1)"};
  }
`;

const DividerText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft || "#888"};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BottomText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-top: 24px;
  text-align: center;
`;

const BottomLink = styled.span`
  color: #5fa8ff;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #0b67dc;
    text-decoration: underline;
  }
`;

const PanelTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text || "#fff"};
  text-align: center;
`;

const PanelSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 28px;
  text-align: center;
  max-width: 280px;
`;

const ForgotModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: ${fadeIn} 0.25s ease;
`;

const ForgotBox = styled.div`
  background: ${({ theme }) => theme.bgLighter || "#171717"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  margin: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.3s ease;
`;

const ForgotTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const ForgotText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 1.5px solid ${({ theme }) => theme.soft || "rgba(255,255,255,0.15)"};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme }) => theme.text || "#fff"};
  background: transparent;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const PrimaryButtonSmall = styled(PrimaryButton)`
  flex: 1;
  margin-top: 0;
`;

/* ============= Component ============= */
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await axios.post("/auth/signin", { email, password });
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
      dispatch(loginFailure());
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    dispatch(loginStart());
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post("/auth/google", {
        name: result.user.displayName,
        email: result.user.email,
        img: result.user.photoURL,
      });
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      setError("Failed to sign in with Google.");
      dispatch(loginFailure());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  const handleForgotPassword = async () => {
    setForgotError("");
    const normalizedEmail = forgotEmail.trim();
    if (!normalizedEmail) {
      setForgotError("Please enter your email.");
      return;
    }

    setForgotLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email: normalizedEmail });
      setForgotSent(true);
      setForgotEmail(normalizedEmail);
    } catch (err) {
      const data = err?.response?.data;
      const message = data?.message || "Could not send recovery email.";
      const details =
        typeof data?.details === "string"
          ? data.details
          : data?.details
          ? JSON.stringify(data.details)
          : "";
      const status = data?.status ? ` (status ${data.status})` : "";
      setForgotError(`${message}${status}${details ? ` — ${details}` : ""}`);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>

      <PageWrapper>
        <ContentContainer>
          {/* Left: Email Login */}
          <LeftPanel>
            <FormBox>
              <Logo src={LogoImg} alt="stream-in" />
              <Title>{t("signinTitle")}</Title>
              <Subtitle>{t("signinSubtitle")}</Subtitle>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <InputGroup>
                <InputIcon>
                  <EmailOutlinedIcon />
                </InputIcon>
                <Input
                  type="email"
                  placeholder={t("emailSignin")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </InputGroup>

              <InputGroup>
                <InputIcon>
                  <LockOutlinedIcon />
                </InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordSignin")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
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

              <ForgotLink onClick={() => setShowForgot(true)}>
                {t("forgotPassword")}
              </ForgotLink>

              <PrimaryButton onClick={handleLogin} disabled={loading}>
                {loading ? t("signinInButton") : t("signInButton")}
              </PrimaryButton>

              <BottomText>
                {t("dontHaveAccount")}{" "}
                <BottomLink onClick={() => navigate("/register")}>
                  {t("registerHere")}
                </BottomLink>
              </BottomText>
            </FormBox>
          </LeftPanel>

          {/* Right: Google Login */}
          <RightPanel>
            <PanelTitle>{t("googleTitle")}</PanelTitle>
            <PanelSubtitle>
              {t("googleSubtitle")}
            </PanelSubtitle>

            <GoogleButton onClick={signInWithGoogle}>
              <GoogleIcon />
              {t("signInWithGoogle")}
            </GoogleButton>

            <Divider>
              <DividerText>{t("or")}</DividerText>
            </Divider>

            <BottomText style={{ marginTop: 0 }}>
              {t("areYouNew")}{" "}
              <BottomLink onClick={() => navigate("/register")}>
                {t("createAccountSignin")}
              </BottomLink>
            </BottomText>
          </RightPanel>
        </ContentContainer>
      </PageWrapper>

      {/* Forgot Password Modal */}
      {showForgot && (
        <ForgotModal onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setForgotError(""); }}>
          <ForgotBox onClick={(e) => e.stopPropagation()}>
            {!forgotSent ? (
              <>
                <ForgotTitle>{t("resetPassword")}</ForgotTitle>
                <ForgotText>
                  {t("resetPasswordSubtitle")}
                </ForgotText>
                {forgotError && <ErrorMessage>{forgotError}</ErrorMessage>}
                <InputGroup>
                  <InputIcon>
                    <EmailOutlinedIcon />
                  </InputIcon>
                  <Input
                    type="email"
                    placeholder={t("emailSignin")}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleForgotPassword();
                    }}
                  />
                </InputGroup>
                <ButtonRow>
                  <SecondaryButton
                    onClick={() => {
                      setShowForgot(false);
                      setForgotEmail("");
                      setForgotError("");
                    }}
                  >
                    {t("cancelButton")}
                  </SecondaryButton>
                  <PrimaryButtonSmall onClick={handleForgotPassword} disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : t("sendResetLink")}
                  </PrimaryButtonSmall>
                </ButtonRow>
              </>
            ) : (
              <>
                <ForgotTitle>{t("checkEmail")}</ForgotTitle>
                <ForgotText>
                  {t("forgotTextOne")} <strong>{forgotEmail},</strong>{t("forgotTextTwo")}
                </ForgotText>
                <PrimaryButton
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                    setForgotEmail("");
                    setForgotError("");
                  }}
                >
                  {t("gotIt")}
                </PrimaryButton>
              </>
            )}
          </ForgotBox>
        </ForgotModal>
      )}
    </>
  );
};

export default SignIn;
