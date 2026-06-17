import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../utils/LanguageContext";
import { useSelector } from "react-redux";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import Navbbar from "./Navbbar";
import LogoDark from "../img/logo-dark.png";
import LogoLight from "../img/logo-light.png";
import defaultProfile from '../img/profileUser.png'

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.navBg || "#0d0d0d"};
  height: 60px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    height: 56px;
    overflow: hidden;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  width: 100%;

  @media (max-width: 768px) {
    position: relative;
    padding: 0 10px;
    gap: 0;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    flex: 0 1 auto;
    gap: 2px;
    z-index: 2;
    max-width: calc(50% - 24px);
  }
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;

  @media (max-width: 768px) {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    flex: none;
    width: auto;
    z-index: 3;
    pointer-events: none;

    & a,
    & > * {
      pointer-events: auto;
    }
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  min-width: 0;

  @media (max-width: 768px) {
    flex: 0 1 auto;
    margin-left: auto;
    gap: 6px;
    z-index: 2;
    max-width: calc(50% - 24px);
  }

  @media (max-width: 400px) {
    gap: 4px;
  }
`;

const ImgLogo = styled.img`
  height: 100px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    height: 44px;
    width: auto;
    max-width: 120px;
    object-fit: contain;
    flex-shrink: 0;
  }

  @media (max-width: 400px) {
    height: 38px;
    max-width: 96px;
  }
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bgLighter || "#1a1a1a"};
  border: 1px solid ${({ theme }) => theme.navBorder || "#333"};
  border-radius: 25px;
  padding: 5px 10px;
  max-width: 300px;
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Input = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text || "white"};
  flex: 1;
  padding: 8px;
  font-size: 14px;
`;

const SearchIconWrapper = styled.div`
  color: ${({ theme }) => theme.accent || "#e94560"};
  cursor: pointer;
  font-size: 28px;
  display: none;
  transition: all 0.3s ease;

  &:hover {
    color: #ff3e6c;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.bgLighter || "#1a1a1a"};
    font-size: 22px;
    flex-shrink: 0;
  }
`;

const CloseIconWrapper = styled.div`
  color: ${({ theme }) => theme.accent || "#e94560"};
  cursor: pointer;
  font-size: 24px;
  display: none;
  transition: all 0.3s ease;

  &:hover {
    color: #ff3e6c;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.bgLighter || "#1a1a1a"};
  }
`;

// Mobile Search Bar
const MobileSearchContainer = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: ${({ theme }) => theme.navBg || "#0d0d0d"};
  z-index: 20;
  align-items: center;
  padding: 0 16px;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    display: ${({ show }) => (show ? "flex" : "none")};
    height: 56px;
    padding: 0 10px;
  }
`;

const MobileSearchInput = styled.input`
  flex: 1;
  height: 42px;
  background-color: ${({ theme }) => theme.bgLighter || "#1a1a1a"};
  border: 1px solid ${({ theme }) => theme.navBorder || "#333"};
  border-radius: 25px;
  padding: 0 20px;
  color: ${({ theme }) => theme.text || "white"};
  font-size: 16px;
  outline: none;
  margin-left: 10px;

  &::placeholder {
    color: #888;
  }
`;

const Button = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.accent || "#e74c3c"};
  color: ${({ theme }) => theme.accent || "#e74c3c"};
  display: flex;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.accent || "#e74c3c"};
  color: ${({ theme }) => theme.accent || "#e74c3c"};
  font-weight: 500;
  font-size: 14px;
  border-radius: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;
  display: none;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    display: flex;
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 10px;
    white-space: nowrap;
    line-height: 1.2;
    flex-shrink: 0;
  }

  @media (max-width: 380px) {
    padding: 5px 8px;
    font-size: 11px;
  }
`;

const SettingsIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.accent || "#e94560"};
    background-color: ${({ theme }) => theme.soft || "#333"};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.text || "white"};
  font-weight: 500;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 0;
    gap: 0;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.accent || "#e94560"};

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    border-width: 2px;
  }
`;

const UploadIcon = styled(AiOutlineVideoCameraAdd)`
  font-size: 28px;
  color: #e94560;
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 24px;
    width: 36px;
    height: 36px;
    min-width: 36px;
    padding: 6px;
    box-sizing: border-box;
  }
`;

const NameChannel = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

const Navbar = ({ themeMode, setThemeMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useLanguage();
  const logoSrc = theme.isLightTheme ? LogoLight : LogoDark;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${q}`);
      setQ("");
      setShowMobileSearch(false);
    }
  };

  const handleMobileSearch = () => {
    if (q.trim()) {
      navigate(`/search?q=${q}`);
      setQ("");
      setShowMobileSearch(false);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <>
      <Container>
        <Wrapper>
          <Left>
            <Navbbar />
            <ImgLogo key={themeMode} src={logoSrc} alt="Logo de stream-In" onClick={() => navigate(`/`)} />
          </Left>

          <Center>
            {currentUser && (
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <User>
                  <Avatar src={currentUser.img || defaultProfile} alt={`Foto de perfil de ${currentUser.name}`} />
                  <NameChannel>{currentUser.name}</NameChannel>
                </User>
              </Link>
            )}
          </Center>

          {/* Parte derecha: Buscador + Botón login o upload */}
          <Right>
            <Search>
              <Input
                placeholder={t("search")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <SearchOutlinedIcon onClick={() => navigate(`/search?q=${q}`)} style={{ color: "#e94560", cursor: "pointer" }} />
            </Search>

            {/* Mobile Search Icon */}
            <SearchIconWrapper onClick={toggleMobileSearch}>
              <SearchOutlinedIcon />
            </SearchIconWrapper>

            {currentUser ? (
              <UploadIcon onClick={() => navigate("/upload")} title={t("upload")} />
            ) : (
              <>
                <Link to="/signin" style={{ textDecoration: "none" }}>
                  <Button>
                    {t("login")}
                  </Button>
                </Link>
                <MobileButton onClick={() => navigate("/signin")}>
                  {t("login")}
                </MobileButton>
              </>
            )}
            <SettingsIcon onClick={() => navigate("/settings")} title={t("settings")}>
              <SettingsOutlinedIcon style={{ fontSize: 22 }} />
            </SettingsIcon>
          </Right>
        </Wrapper>
      </Container>

      {/* Mobile Search Bar */}
      <MobileSearchContainer show={showMobileSearch}>
        <CloseIconWrapper onClick={toggleMobileSearch}>
          <CloseOutlinedIcon />
        </CloseIconWrapper>
        <MobileSearchInput
          placeholder={`${t("search")}...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <SearchOutlinedIcon 
          onClick={handleMobileSearch} 
          style={{ 
            color: "#e94560", 
            cursor: "pointer", 
            fontSize: 28,
            marginLeft: 10
          }} 
        />
      </MobileSearchContainer>
    </>
  );
};

export default Navbar;
