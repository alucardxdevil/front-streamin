import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { getSidebarData } from "./SidebarData";
import "../App.css";
import LogoNav from "../img/logo-signin.png";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useLanguage } from "../utils/LanguageContext";

const Overlay = styled.div`
  display: ${({ sidebar }) => (sidebar ? "block" : "none")};
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
`;

const ImgLogo = styled.img`
  margin-left: 15px;
  height: 90px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const NavText = styled.li`
  display: flex;
  align-items: center;
  padding-left: 20px;
  list-style: none;
  height: 50px;

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.text || "#ddd"};
    font-size: 17px;
    width: 100%;
    gap: 15px;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 6px;
    transition: background-color 0.3s, color 0.3s;

    &:hover {
      background-color: ${({ theme }) => theme.accent || "#e94560"};
      color: #fff;
      transform: translateX(8px);
    }
  }
`;

const MenuBars = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.text || "white"};
  padding: 10px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const NavMenu = styled.nav`
  width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? "0" : "-100%")};
  transition: 0.4s ease-in-out;
  z-index: 1200;
  background-color: ${({ theme }) => theme.navBg || "#111"};
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    width: 85%;
    max-width: 280px;
  }
`;

const Navbar = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
`;

const NavbarToggle = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
`;

const NavMenuItems = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.border || "#333"} transparent;

  /* Chrome/Edge/Safari scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border || "#333"};
    border-radius: 3px;
  }
`;

const BottomLinks = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.border || "#333"};
  background-color: ${({ theme }) => theme.navBg || "#111"};
  flex-shrink: 0;
`;

const BottomLink = styled.span`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 8px 10px;
  border-radius: 6px;

  &:hover {
    color: #0b67dc;
    background-color: rgba(11, 103, 220, 0.1);
  }
`;

function Navbbar() {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { t } = useLanguage();

  const toggleSidebar = () => setSidebar((prev) => !prev);
  const closeSidebar = () => setSidebar(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const sidebarData = getSidebarData(t);


  return (
    <>
      <Navbar>
        <MenuBars onClick={toggleSidebar}>
          <FaIcons.FaBars />
        </MenuBars>
      </Navbar>

      <Overlay sidebar={sidebar} onClick={closeSidebar} />

      <NavMenu sidebar={sidebar}>
        <NavbarToggle>
          <MenuBars onClick={toggleSidebar}>
            <AiIcons.AiOutlineClose />
          </MenuBars>
          <ImgLogo src={LogoNav} onClick={() => navigate("/contact")} />
        </NavbarToggle>

        <NavMenuItems>
          {sidebarData
            .filter((item) => !item.authRequired || currentUser)
            .map((item, index) => {
              return (
                <NavText key={index}>
                  <Link to={item.path} onClick={closeSidebar}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </NavText>
              );
            })}
        </NavMenuItems>

        <BottomLinks>
          <BottomLink onClick={() => { closeSidebar(); navigate("/advertise"); }}>{t("advertise")}</BottomLink>
          <BottomLink onClick={() => { closeSidebar(); navigate("/terms"); }}>{t("terms")}</BottomLink>
          <BottomLink onClick={() => { closeSidebar(); navigate("/help"); }}>{t("help")}</BottomLink>
          <BottomLink onClick={() => { closeSidebar(); navigate("/us"); }}>{t("us")}</BottomLink>
        </BottomLinks>
      </NavMenu>
    </>
  );
}

export default Navbbar;