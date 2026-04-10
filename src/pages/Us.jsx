import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import {
  ExpandMore,
  ExpandLess,
  RocketLaunch,
  RecordVoiceOver,
  OndemandVideo,
  MonetizationOn,
  Stars,
  Shield,
  ContactMail,
} from "@mui/icons-material";

const Container = styled.div`
  padding: 20px 30px;
  padding-bottom: 200px;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  background: ${({ theme }) => theme.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.text || "#fff"};
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 32px;
  text-align: center;
  max-width: 640px;
`;

const LastUpdated = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 24px;
  text-align: center;
  font-style: italic;
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 12px;
  padding: 0;
  margin-bottom: 12px;
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  transition: all 0.3s ease;

  &:hover {
    border-color: #e43c62;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SectionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  color: #e43c62;
  display: flex;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text || "#fff"};
  margin: 0;
`;

const SectionNumber = styled.span`
  font-size: 12px;
  color: #e43c62;
  font-weight: 700;
  background: rgba(228, 60, 98, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
`;

const SectionContent = styled.div`
  padding: ${({ $isOpen }) => ($isOpen ? "0 20px 20px 52px" : "0 20px 0 52px")};
  max-height: ${({ $isOpen }) => ($isOpen ? "3200px" : "0")};
  opacity: ${({ $isOpen }) => ($isOpen ? "1" : "0")};
  overflow: hidden;
  transition: all 0.4s ease;
`;

const Paragraph = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  line-height: 1.7;
  margin-bottom: 12px;
`;

const BulletList = styled.ul`
  padding-left: 20px;
  margin-bottom: 12px;
`;

const BulletItem = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  line-height: 1.7;
  margin-bottom: 6px;
`;

const HighlightBox = styled.div`
  background: rgba(228, 60, 98, 0.1);
  border-left: 3px solid #e43c62;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  margin: 12px 0;
`;

const HighlightText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.text || "#fff"};
  line-height: 1.6;
  margin: 0;
`;

const ExpandIcon = styled.div`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
`;

const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  max-width: 800px;
`;

const FooterText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  line-height: 1.6;
`;

const ContactLink = styled.a`
  color: #e43c62;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Us = () => {
  const [openSections, setOpenSections] = useState(new Set([0]));
  const { t } = useLanguage();

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const sections = [
    {
      icon: <RocketLaunch />,
      title: t("usSecWhatTitle"),
      content: (
        <>
          <Paragraph>{t("usSecWhatP1")}</Paragraph>
          <Paragraph>{t("usSecWhatP2")}</Paragraph>
          <HighlightBox>
            <HighlightText>{t("usSecWhatHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <RecordVoiceOver />,
      title: t("usSecFreedomTitle"),
      content: (
        <>
          <Paragraph>{t("usSecFreedomP1")}</Paragraph>
          <Paragraph>{t("usSecFreedomP2")}</Paragraph>
        </>
      ),
    },
    {
      icon: <OndemandVideo />,
      title: t("usSecExperienceTitle"),
      content: (
        <>
          <Paragraph>{t("usSecExperienceP1")}</Paragraph>
          <Paragraph>{t("usSecExperienceP2")}</Paragraph>
        </>
      ),
    },
    {
      icon: <MonetizationOn />,
      title: t("usSecMoneyTitle"),
      content: (
        <>
          <Paragraph>{t("usSecMoneyP1")}</Paragraph>
          <Paragraph>{t("usSecMoneyP2")}</Paragraph>
        </>
      ),
    },
    {
      icon: <Stars />,
      title: t("usSecCreatorsTitle"),
      content: (
        <>
          <Paragraph>{t("usSecCreatorsP1")}</Paragraph>
          <Paragraph>{t("usSecCreatorsP2")}</Paragraph>
        </>
      ),
    },
    {
      icon: <Shield />,
      title: t("usSecLimitsTitle"),
      content: (
        <>
          <Paragraph>{t("usSecLimitsP1")}</Paragraph>
          <Paragraph>{t("usSecLimitsIntroList")}</Paragraph>
          <BulletList>
            <BulletItem>{t("usSecLimitsItemThreat")}</BulletItem>
            <BulletItem>{t("usSecLimitsItemViolence")}</BulletItem>
            <BulletItem>{t("usSecLimitsItemNudity")}</BulletItem>
            <BulletItem>{t("usSecLimitsItemPorn")}</BulletItem>
            <BulletItem>{t("usSecLimitsItemRacism")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("usSecLimitsP2")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <ContactMail />,
      title: t("usSecContactTitle"),
      content: (
        <>
          <Paragraph>{t("usSecContactP1")}</Paragraph>
          <BulletList>
            <BulletItem>
              <ContactLink href="mailto:support@stream-in.com">
                support@stream-in.com
              </ContactLink>
            </BulletItem>
            <BulletItem>
              <ContactLink href="mailto:legal@stream-in.com">
                legal@stream-in.com
              </ContactLink>
            </BulletItem>
          </BulletList>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Title>{t("usAboutPageTitle")}</Title>
      <Subtitle>{t("usAboutPageSubtitle")}</Subtitle>
      <LastUpdated>{t("usAboutPageBetaLine")}</LastUpdated>

      {sections.map((section, index) => {
        const isOpen = openSections.has(index);
        return (
          <SectionCard key={index}>
            <SectionHeader onClick={() => toggleSection(index)}>
              <SectionHeaderLeft>
                <SectionNumber>{String(index + 1).padStart(2, "0")}</SectionNumber>
                <SectionIcon>{section.icon}</SectionIcon>
                <SectionTitle>{section.title}</SectionTitle>
              </SectionHeaderLeft>
              <ExpandIcon>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ExpandIcon>
            </SectionHeader>
            <SectionContent $isOpen={isOpen}>{section.content}</SectionContent>
          </SectionCard>
        );
      })}

      <Footer>
        <FooterText>{t("usAboutFooter")}</FooterText>
      </Footer>
    </Container>
  );
};

export default Us;
