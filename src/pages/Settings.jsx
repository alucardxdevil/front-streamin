import React, { useState } from "react";
import styled from "styled-components";
import {
  DarkModeOutlined,
  LightModeOutlined,
  WbTwilightOutlined,
  FilterVintageOutlined,
  SmartToyOutlined,
  LanguageOutlined,
  NightsStayOutlined,
  PlayCircleOutline,
  NotificationsOutlined,
  SpeedOutlined,
  ViewCompactOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 40px 24px;
  color: ${({ theme }) => theme.text || "#fff"};
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    padding: 20px 16px;
    margin: 60px auto;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const SectionIcon = styled.div`
  color: ${({ theme }) => theme.accent || "#e94560"};
  display: flex;
  align-items: center;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 14px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  margin-bottom: 12px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.soft || "#333"};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SettingLabel = styled.span`
  font-size: 15px;
  font-weight: 500;
`;

const SettingDesc = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;

const ThemeOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 400px;
  justify-content: flex-end;

  @media (max-width: 600px) {
    max-width: 100%;
    justify-content: flex-start;
  }
`;

const ThemeOption = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  border: 2px solid ${({ $active, theme }) => ($active ? (theme.accent || "#e94560") : (theme.soft || "#444"))};
  background-color: ${({ $active, theme }) => ($active ? "rgba(233, 69, 96, 0.1)" : "transparent")};
  color: ${({ $active, theme }) => ($active ? (theme.accent || "#e94560") : (theme.text || "#fff"))};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent || "#e94560"};
  }
`;

const LangOptions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const LangOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid ${({ $active, theme }) => ($active ? (theme.accent || "#e94560") : (theme.soft || "#444"))};
  background-color: ${({ $active }) => ($active ? "rgba(233, 69, 96, 0.1)" : "transparent")};
  color: ${({ $active, theme }) => ($active ? (theme.accent || "#e94560") : (theme.text || "#fff"))};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent || "#e94560"};
  }
`;

const Toggle = styled.div`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background-color: ${({ $on, theme }) => ($on ? (theme.accent || "#e94560") : (theme.soft || "#444"))};
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
`;

const ToggleKnob = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 2px;
  left: ${({ $on }) => ($on ? "24px" : "2px")};
  transition: left 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  min-width: 70px;
  text-align: right;
`;

const Settings = ({ themeMode, setThemeMode }) => {
  const { language, setLanguage, t } = useLanguage();
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <Container>
      <Header>
        <Title>
          <SettingsOutlined style={{ fontSize: 36, color: "#e94560" }} />
          {t("settingsTitle")}
        </Title>
        <Subtitle>{t("settingsSubtitle")}</Subtitle>
      </Header>

      {/* theme */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <DarkModeOutlined />
          </SectionIcon>
          {t("appearance")}
        </SectionHeader>
        <Card>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("appearance")}</SettingLabel>
              <SettingDesc>{t("appearanceDesc")}</SettingDesc>
            </SettingInfo>
            <ThemeOptions>
              <ThemeOption
                $active={themeMode === "dark"}
                onClick={() => setThemeMode("dark")}
              >
                <DarkModeOutlined style={{ fontSize: 18 }} />
                {t("dark")}
              </ThemeOption>
              <ThemeOption
                $active={themeMode === "sunset"}
                onClick={() => setThemeMode("sunset")}
              >
                <NightsStayOutlined style={{ fontSize: 18 }} />
                {t("sunset")}
              </ThemeOption>
              <ThemeOption
                $active={themeMode === "light"}
                onClick={() => setThemeMode("light")}
              >
                <LightModeOutlined style={{ fontSize: 18 }} />
                {t("light")}
              </ThemeOption>
              <ThemeOption
                $active={themeMode === "vintage"}
                onClick={() => setThemeMode("vintage")}
              >
                <FilterVintageOutlined style={{ fontSize: 18 }} />
                {t("vintage")}
              </ThemeOption>
              <ThemeOption
                $active={themeMode === "cyberpunk"}
                onClick={() => setThemeMode("cyberpunk")}
              >
                <SmartToyOutlined style={{ fontSize: 18 }} />
                {t("cyberpunk")}
              </ThemeOption>
              <ThemeOption
                $active={themeMode === "sunrise"}
                onClick={() => setThemeMode("sunrise")}
              >
                <WbTwilightOutlined style={{ fontSize: 18 }} />
                {t("sunrise")}
              </ThemeOption>
            </ThemeOptions>
          </SettingRow>
        </Card>
      </Section>

      {/* Lenguage */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <LanguageOutlined />
          </SectionIcon>
          {t("languageSection")}
        </SectionHeader>
        <Card>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("languageSection")}</SettingLabel>
              <SettingDesc>{t("languageDesc")}</SettingDesc>
            </SettingInfo>
            <LangOptions>
              <LangOption
                $active={language === "en"}
                onClick={() => setLanguage("en")}
              >
                {t("english")}
              </LangOption>
              <LangOption
                $active={language === "pt"}
                onClick={() => setLanguage("pt")}
              >
                {t("portuguese")}
              </LangOption>
              <LangOption
                $active={language === "de"}
                onClick={() => setLanguage("de")}
              >
                {t("german")}
              </LangOption>
              <LangOption
                $active={language === "es"}
                onClick={() => setLanguage("es")}
              >
                {t("spanish")}
              </LangOption>
              <LangOption
                $active={language === "fr"}
                onClick={() => setLanguage("fr")}
              >
                {t("french")}
              </LangOption>
              <LangOption
                $active={language === "zh"}
                onClick={() => setLanguage("zh")}
              >
                {t("chinese")}
              </LangOption>
              <LangOption
                $active={language === "jp"}
                onClick={() => setLanguage("jp")}
              >
                {t("japanese")}
              </LangOption>
              <LangOption
                $active={language === "ru"}
                onClick={() => setLanguage("ru")}
              >
                {t("russian")}
              </LangOption>
              <LangOption
                $active={language === "it"}
                onClick={() => setLanguage("it")}
              >
                {t("italian")}
              </LangOption>
              <LangOption
                $active={language === "ko"}
                onClick={() => setLanguage("ko")}
              >
                {t("korean")}
              </LangOption>
              <LangOption
                $active={language === "ar"}
                onClick={() => setLanguage("ar")}
              >
                {t("arabic")}
              </LangOption>
              <LangOption
                $active={language === "hi"}
                onClick={() => setLanguage("hi")}
              >
                {t("hindi")}
              </LangOption>
            </LangOptions>
          </SettingRow>
        </Card>
      </Section>

      {/* Playing */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <PlayCircleOutline />
          </SectionIcon>
          {t("autoplay")}
        </SectionHeader>
        <Card>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("autoplay")}</SettingLabel>
              <SettingDesc>{t("autoplayDesc")}</SettingDesc>
            </SettingInfo>
            <ToggleWrapper>
              <ToggleLabel>
                {autoplay ? t("enabled") : t("disabled")}
              </ToggleLabel>
              <Toggle $on={autoplay} onClick={() => setAutoplay(!autoplay)}>
                <ToggleKnob $on={autoplay} />
              </Toggle>
            </ToggleWrapper>
          </SettingRow>
        </Card>
      </Section>

      {/* notifications */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <NotificationsOutlined />
          </SectionIcon>
          {t("notifications")}
        </SectionHeader>
        <Card>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("notifications")}</SettingLabel>
              <SettingDesc>{t("notificationsDesc")}</SettingDesc>
            </SettingInfo>
            <ToggleWrapper>
              <ToggleLabel>
                {notifications ? t("enabled") : t("disabled")}
              </ToggleLabel>
              <Toggle
                $on={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <ToggleKnob $on={notifications} />
              </Toggle>
            </ToggleWrapper>
          </SettingRow>
        </Card>
      </Section>

      {/* access */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <SpeedOutlined />
          </SectionIcon>
          {t("reducedMotion")}
        </SectionHeader>
        <Card>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("reducedMotion")}</SettingLabel>
              <SettingDesc>{t("reducedMotionDesc")}</SettingDesc>
            </SettingInfo>
            <ToggleWrapper>
              <ToggleLabel>
                {reducedMotion ? t("enabled") : t("disabled")}
              </ToggleLabel>
              <Toggle
                $on={reducedMotion}
                onClick={() => setReducedMotion(!reducedMotion)}
              >
                <ToggleKnob $on={reducedMotion} />
              </Toggle>
            </ToggleWrapper>
          </SettingRow>
          <SettingRow>
            <SettingInfo>
              <SettingLabel>{t("compactMode")}</SettingLabel>
              <SettingDesc>{t("compactModeDesc")}</SettingDesc>
            </SettingInfo>
            <ToggleWrapper>
              <ToggleLabel>
                {compactMode ? t("enabled") : t("disabled")}
              </ToggleLabel>
              <Toggle
                $on={compactMode}
                onClick={() => setCompactMode(!compactMode)}
              >
                <ToggleKnob $on={compactMode} />
              </Toggle>
            </ToggleWrapper>
          </SettingRow>
        </Card>
      </Section>
    </Container>
  );
};

export default Settings;
