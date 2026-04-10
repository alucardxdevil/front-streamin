import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import {
  ExpandMore,
  ExpandLess,
  Gavel,
  Security,
  Person,
  Block,
  Update,
  ContactMail,
  Copyright,
  Public,
  Description,
  PermMedia,
  TrendingUp,
  Business,
  PrivacyTip,
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
  max-width: 600px;
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
  max-height: ${({ $isOpen }) => ($isOpen ? "2000px" : "0")};
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
  margin-top: 40px;
  text-align: center;
  max-width: 800px;
  width: 100%;
`;

const FooterText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  line-height: 1.6;
  margin-bottom: 16px;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;

  &:hover {
    color: #e43c62;
    text-decoration: underline;
  }
`;

const ContactLink = styled.a`
  color: #e43c62;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Terms = () => {
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
      icon: <Gavel />,
      title: t("acceptanceOfTerms"),
      content: (
        <>
          <Paragraph>{t("acceptTermsContent")}</Paragraph>
          <HighlightBox>
            <HighlightText>{t("acceptTermsHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Public />,
      title: t("siteUsage"),
      content: (
        <>
          <Paragraph>{t("serviceDescContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("serviceDescItem1")}</BulletItem>
            <BulletItem>{t("serviceDescItem2")}</BulletItem>
            <BulletItem>{t("serviceDescItem3")}</BulletItem>
            <BulletItem>{t("serviceDescItem4")}</BulletItem>
          </BulletList>
          <Paragraph>{t("serviceDescFooter")}</Paragraph>
        </>
      ),
    },
    {
      icon: <PermMedia />,
      title: t("userContent"),
      content: (
        <>
          <Paragraph>{t("prohibitedConductContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("prohibitedItem1")}</BulletItem>
            <BulletItem>{t("prohibitedItem2")}</BulletItem>
            <BulletItem>{t("prohibitedItem3")}</BulletItem>
            <BulletItem>{t("prohibitedItem4")}</BulletItem>
            <BulletItem>{t("prohibitedItem5")}</BulletItem>
            <BulletItem>{t("prohibitedItem6")}</BulletItem>
            <BulletItem>{t("prohibitedItem7")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("prohibitedFooter")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Copyright />,
      title: t("intellectualProperty"),
      content: (
        <>
          <Paragraph>{t("contentIPContent")}</Paragraph>
          <Paragraph>{t("contentIPCommit")}</Paragraph>
          <BulletList>
            <BulletItem>{t("contentIPItem1")}</BulletItem>
            <BulletItem>{t("contentIPItem2")}</BulletItem>
            <BulletItem>{t("contentIPItem3")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("contentIPHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Security />,
      title: t("siteSecurity"),
      content: (
        <>
          <Paragraph>{t("privacyContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("privacyItem1")}</BulletItem>
            <BulletItem>{t("privacyItem2")}</BulletItem>
            <BulletItem>{t("privacyItem3")}</BulletItem>
            <BulletItem>{t("privacyItem4")}</BulletItem>
          </BulletList>
          <Paragraph>{t("privacyFooter")}</Paragraph>
        </>
      ),
    },
    {
      icon: <Block />,
      title: t("accountSuspension"),
      content: (
        <>
          <Paragraph>{t("userAccountsContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("userAccountsItem1")}</BulletItem>
            <BulletItem>{t("userAccountsItem2")}</BulletItem>
            <BulletItem>{t("userAccountsItem3")}</BulletItem>
            <BulletItem>{t("userAccountsItem4")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("userAccountsHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Business />,
      title: t("liabilityLimitation"),
      content: (
        <>
          <Paragraph>{t("liabilityContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("liabilityItem1")}</BulletItem>
            <BulletItem>{t("liabilityItem2")}</BulletItem>
            <BulletItem>{t("liabilityItem3")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("liabilityHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Update />,
      title: t("termsModifications"),
      content: (
        <>
          <Paragraph>{t("termsModContent")}</Paragraph>
          <BulletList>
            <BulletItem>{t("termsModItem1")}</BulletItem>
            <BulletItem>{t("termsModItem2")}</BulletItem>
            <BulletItem>{t("termsModItem3")}</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("termsModFooter")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <TrendingUp />,
      title: t("applicableLaw"),
      content: (
        <>
          <Paragraph>{t("contactDisputesHighlight")}</Paragraph>
        </>
      ),
    },
    {
      icon: <ContactMail />,
      title: t("contactSection"),
      content: (
        <>
          <Paragraph>{t("contactDisputesContent")}</Paragraph>
          <BulletList>
            <BulletItem>
              📧 Soporte:{" "}
              <ContactLink href="mailto:support@stream-in.com">
                support@stream-in.com
              </ContactLink>
            </BulletItem>
            <BulletItem>
              ⚖️ Legal:{" "}
              <ContactLink href="mailto:legal@stream-in.com">
                legal@stream-in.com
              </ContactLink>
            </BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>{t("contactDisputesHighlight")}</HighlightText>
          </HighlightBox>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Title>{t("termsAndConditions")}</Title>
      <Subtitle>
        {t("termsPageSubtitle")}
      </Subtitle>
      <LastUpdated>{t("termsDate")}</LastUpdated>

      {sections.map((section, index) => (
        <SectionCard key={index}>
          <SectionHeader onClick={() => toggleSection(index)}>
            <SectionHeaderLeft>
              <SectionIcon>{section.icon}</SectionIcon>
              <div>
                <SectionTitle>{section.title}</SectionTitle>
              </div>
              <SectionNumber>{index + 1}</SectionNumber>
            </SectionHeaderLeft>
            <ExpandIcon>
              {openSections.has(index) ? <ExpandLess /> : <ExpandMore />}
            </ExpandIcon>
          </SectionHeader>
          <SectionContent $isOpen={openSections.has(index)}>
            {section.content}
          </SectionContent>
        </SectionCard>
      ))}

      <Footer>
        <FooterText>
          © 2026 stream-in. {t("allRightsReserved")}. stream-in {t("isAStreamingPlatform")}(reproductor de video) {t("propertyOf")} <b>stream-in Media Inc y DNA's Interactive.</b>
        </FooterText>

        <SocialLinks>
          <SocialLink
            href="https://facebook.com/streamin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Facebook</span>
          </SocialLink>
          <SocialLink
            href="https://x.com/stream_inMedia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Twitter/X</span>
          </SocialLink>
          <SocialLink
            href="https://instagram.com/streamin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Instagram</span>
          </SocialLink>
          <SocialLink
            href="https://youtube.com/streamin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>YouTube</span>
          </SocialLink>
        </SocialLinks>

        <FooterText style={{ marginTop: "24px" }}>
          {t("haveQuestions")}{" "}
          <ContactLink href="/support">{t("contactUs")}</ContactLink>
        </FooterText>
      </Footer>
    </Container>
  );
};

export default Terms;
