import axios from "axios";
import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import GoogleIcon from "@mui/icons-material/Google";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
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
  min-height: 580px;
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

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 16px 24px;
  display: flex;
  gap: 16px;
  z-index: 10;
`;

const TopLink = styled.span`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #0b67dc;
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
  border: 1.5px solid ${({ $error, theme }) =>
    $error ? "#e94560" : theme.soft || "rgba(255,255,255,0.12)"};
  border-radius: 10px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  outline: none;

  &:focus {
    border-color: ${({ $error }) => ($error ? "#e94560" : "#0b67dc")};
    box-shadow: 0 0 0 3px ${({ $error }) =>
      $error ? "rgba(233,69,96,0.15)" : "rgba(11,103,220,0.15)"};
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
  background: linear-gradient(135deg, #e94560 0%, #ff6b81 100%);
  background-size: 200% 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233, 69, 96, 0.35);
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

const SuccessMessage = styled.div`
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  color: #2ed573;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const FieldError = styled.span`
  display: block;
  font-size: 12px;
  color: #e94560;
  margin-top: -12px;
  margin-bottom: 12px;
  padding-left: 4px;
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

const PasswordStrength = styled.div`
  display: flex;
  gap: 4px;
  margin-top: -10px;
  margin-bottom: 14px;
`;

const StrengthBar = styled.div`
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: ${({ $active, $color }) =>
    $active ? $color : "rgba(255,255,255,0.1)"};
  transition: background 0.3s ease;
`;

/* ============= Component ============= */
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  const { t } = useLanguage();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const strengthColors = ["#e94560", "#ff9f43", "#feca57", "#2ed573"];
  const passwordStrength = getPasswordStrength(password);

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Username is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "At least 6 characters";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await axios.post("/auth/signup", { name, email, password });
      setSuccess("Account created successfully! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "";
      const errStr = typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg);

      if (errStr.includes("E11000") || errStr.includes("duplicate key")) {
        // Detect which field is duplicated
        if (errStr.includes("name")) {
          setFieldErrors((p) => ({
            ...p,
            name: "This username is already taken. Please choose another one.",
          }));
          setError("The username \"" + name + "\" is already in use. Please choose a different username.");
        } else if (errStr.includes("email")) {
          setFieldErrors((p) => ({
            ...p,
            email: "This email is already registered.",
          }));
          setError("An account with this email already exists. Try signing in instead.");
        } else {
          setError("This username or email is already registered. Please try with different information.");
        }
      } else {
        setError(
          typeof errMsg === "string" && errMsg.length > 0
            ? errMsg
            : "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
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
      setError("Failed to sign up with Google.");
      dispatch(loginFailure());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister(e);
  };

  return (
    <>

      <PageWrapper>
        <ContentContainer>
          {/* Left: Register Form */}
          <LeftPanel>
            <FormBox>
              <Logo src={LogoImg} alt="stream-in" />
              <Title>{t("registerTitle")}</Title>
              <Subtitle>{t("subtitleRegister")}</Subtitle>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <InputGroup>
                <InputIcon>
                  <PersonOutlineIcon />
                </InputIcon>
                <Input
                  type="text"
                  placeholder={t("userName")}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                  onKeyDown={handleKeyDown}
                  $error={!!fieldErrors.name}
                />
              </InputGroup>
              {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}

              <InputGroup>
                <InputIcon>
                  <EmailOutlinedIcon />
                </InputIcon>
                <Input
                  type="email"
                  placeholder={t("emailRegister")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onKeyDown={handleKeyDown}
                  $error={!!fieldErrors.email}
                />
              </InputGroup>
              {fieldErrors.email && (
                <FieldError>{fieldErrors.email}</FieldError>
              )}

              <InputGroup>
                <InputIcon>
                  <LockOutlinedIcon />
                </InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordRegister")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onKeyDown={handleKeyDown}
                  $error={!!fieldErrors.password}
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
              {fieldErrors.password && (
                <FieldError>{fieldErrors.password}</FieldError>
              )}

              {password && (
                <PasswordStrength>
                  {[0, 1, 2, 3].map((i) => (
                    <StrengthBar
                      key={i}
                      $active={i < passwordStrength}
                      $color={strengthColors[Math.min(passwordStrength - 1, 3)]}
                    />
                  ))}
                </PasswordStrength>
              )}

              <InputGroup>
                <InputIcon>
                  <LockOutlinedIcon />
                </InputIcon>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((p) => ({
                      ...p,
                      confirmPassword: undefined,
                    }));
                  }}
                  onKeyDown={handleKeyDown}
                  $error={!!fieldErrors.confirmPassword}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </PasswordToggle>
              </InputGroup>
              {fieldErrors.confirmPassword && (
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              )}

              <PrimaryButton onClick={handleRegister} disabled={loading}>
                {loading ? t("creatingAccount") : t("createAccount")}
              </PrimaryButton>

              <BottomText>
                {t("alreadyHaveAccount")}{" "}
                <BottomLink onClick={() => navigate("/signin")}>
                  {t("signinRegister")}
                </BottomLink>
              </BottomText>
            </FormBox>
          </LeftPanel>

          {/* Right: Google Sign Up */}
          <RightPanel>
            <PanelTitle>{t("quickSignUp")}</PanelTitle>
            <PanelSubtitle>
              {t("subtitleQuickSignUp")}
            </PanelSubtitle>

            <GoogleButton onClick={signUpWithGoogle}>
              <GoogleIcon />
              {t("signUpWithGoogle")}
            </GoogleButton>

            <Divider>
              <DividerText>{t("or")}</DividerText>
            </Divider>

            <BottomText style={{ marginTop: 0 }}>
              {t("alreadyAMember")}{" "}
              <BottomLink onClick={() => navigate("/signin")}>
                {t("signinRegister")}
              </BottomLink>
            </BottomText>
          </RightPanel>
        </ContentContainer>
      </PageWrapper>
    </>
  );
};

export default Register;
