import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../utils/LanguageContext";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bg};
  min-height: 100vh;
  padding-top: 80px;
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 768px) {
    padding: 12px;
    padding-top: 70px;
  }
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    rgba(11, 103, 220, 0.15) 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.05), 
      transparent
    );
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 900;
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.textSoft};
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #0b67dc;
  }

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 32px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(11, 103, 220, 0.3);
    box-shadow: 0 12px 40px rgba(11, 103, 220, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(11, 103, 220, 0.2) 0%, rgba(255, 62, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  svg {
    font-size: 28px;
    color: #0b67dc;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const FeatureDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  line-height: 1.6;
`;

const PricingSection = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 40px;
  margin: 40px 0;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PopularBadge = styled.span`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #0b67dc 0%, #0b67dc 100%);
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const PricingCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.soft};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
  }

  ${({ popular }) =>
    popular &&
    `
    border-color: #0b67dc;
    background: linear-gradient(135deg, rgba(11, 103, 220, 0.1) 0%, transparent 100%);
  `}
`;

const PriceAmount = styled.div`
  font-size: 42px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 16px 0 8px;

  span {
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme }) => theme.textSoft};
  }
`;

const PriceName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const PriceFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
  text-align: left;
`;

const PriceFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;

  svg {
    color: #00c853;
    font-size: 18px;
  }
`;

const CTAButton = styled.button`
  width: 100%;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${({ primary }) => primary ? `
    background: linear-gradient(135deg, #0b67dc 0%, #0b67dc 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(11, 103, 220, 0.4);
    }
  ` : `
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};

    &:hover {
      background: ${({ theme }) => theme.bg};
    }
  `}
`;

const ContactSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    rgba(255, 62, 108, 0.1) 100%
  );
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  margin: 40px 0;

  @media (max-width: 768px) {
    padding: 32px 20px;
  }
`;

const ContactOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 32px;
  flex-wrap: wrap;
`;

const ContactButton = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  ${({ whatsapp }) => whatsapp ? `
    background: #25d430;
    color: white;

    &:hover {
      box-shadow: 0 8px 24px rgba(37, 211, 48, 0.4);
    }
  ` : `
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};

    &:hover {
      background: ${({ theme }) => theme.bg};
    }
  `}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin: 40px 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: 24px;
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #0b67dc;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

const FAQSection = styled.div`
  margin: 40px 0;
`;

const FAQItem = styled.details`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;

  summary {
    padding: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &::after {
      content: '+';
      font-size: 20px;
      color: #0b67dc;
    }
  }

  &[open] summary::after {
    content: '-';
  }

  p {
    padding: 0 20px 20px;
    color: ${({ theme }) => theme.textSoft};
    line-height: 1.6;
  }
`;

const LoginPrompt = styled.div`
  background: linear-gradient(135deg, rgba(11, 103, 220, 0.1) 0%, rgba(255, 62, 108, 0.05) 100%);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin: 32px 0;
`;

const Advertise = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <CampaignOutlinedIcon style={{ fontSize: 64, color: '#0b67dc', marginBottom: 16 }} />
        <HeroTitle>{t("advertisePageHeroTitle")}</HeroTitle>
        <HeroSubtitle>{t("advertisePageHeroSubtitle")}</HeroSubtitle>
      </HeroSection>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatNumber>50K+</StatNumber>
          <StatLabel>{t("advertiseStatUniqueUsers")}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>200K+</StatNumber>
          <StatLabel>{t("advertiseStatMonthlyViews")}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>85%</StatNumber>
          <StatLabel>{t("advertiseStatRetentionRate")}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>24/7</StatNumber>
          <StatLabel>{t("advertiseStatAvailability")}</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Beneficios */}
      <SectionTitle>
        <TrendingUpIcon /> {t("advertiseWhySectionTitle")}
      </SectionTitle>
      <SectionGrid>
        <FeatureCard>
          <FeatureIcon>
            <VisibilityIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatExposureTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatExposureDesc")}</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PeopleIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatAudienceTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatAudienceDesc")}</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PlayArrowIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatVideoTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatVideoDesc")}</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <MonetizationOnOutlinedIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatPricingTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatPricingDesc")}</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <StarOutlineIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatQualityTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatQualityDesc")}</FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PlayCircleOutlineIcon />
          </FeatureIcon>
          <FeatureTitle>{t("advertiseFeatMeasurableTitle")}</FeatureTitle>
          <FeatureDesc>{t("advertiseFeatMeasurableDesc")}</FeatureDesc>
        </FeatureCard>
      </SectionGrid>

      {/* Planes */}
      <PricingSection>
        <SectionTitle style={{ textAlign: 'center', justifyContent: 'center' }}>
          <MonetizationOnOutlinedIcon /> {t("advertisePlansSectionTitle")}
        </SectionTitle>
        <PricingGrid>
          <PricingCard>
            <PriceName>{t("advertisePlanBasicName")}</PriceName>
            <PriceAmount>
              $19<span>{t("advertisePerWeek")}</span>
            </PriceAmount>
            <PriceFeatures>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanBasicF1")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanBasicF2")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanBasicF3")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanBasicF4")}
              </PriceFeature>
            </PriceFeatures>
            <CTAButton
              onClick={() => (currentUser ? navigate("/contact") : navigate("/login"))}
            >
              {currentUser ? t("advertiseCtaSubscribe") : t("signInButton")}
            </CTAButton>
          </PricingCard>

          <PricingCard popular>
            <PopularBadge>{t("advertisePopularBadge")}</PopularBadge>
            <PriceName>{t("advertisePlanProName")}</PriceName>
            <PriceAmount>
              $49<span>{t("advertisePerWeek")}</span>
            </PriceAmount>
            <PriceFeatures>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanProF1")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanProF2")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanProF3")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanProF4")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanProF5")}
              </PriceFeature>
            </PriceFeatures>
            <CTAButton
              primary
              onClick={() => (currentUser ? navigate("/contact") : navigate("/login"))}
            >
              {currentUser ? t("advertiseCtaSubscribe") : t("signInButton")}
            </CTAButton>
          </PricingCard>

          <PricingCard>
            <PriceName>{t("advertisePlanEnterpriseName")}</PriceName>
            <PriceAmount>
              $99<span>{t("advertisePerWeek")}</span>
            </PriceAmount>
            <PriceFeatures>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF1")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF2")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF3")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF4")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF5")}
              </PriceFeature>
              <PriceFeature>
                <CheckCircleOutlinedIcon /> {t("advertisePlanEntF6")}
              </PriceFeature>
            </PriceFeatures>
            <CTAButton
              onClick={() => (currentUser ? navigate("/contact") : navigate("/login"))}
            >
              {currentUser ? t("advertiseCtaSubscribe") : t("signInButton")}
            </CTAButton>
          </PricingCard>
        </PricingGrid>
      </PricingSection>

      {/* FAQ */}
      <FAQSection>
        <SectionTitle>{t("advertiseFaqTitle")}</SectionTitle>

        <FAQItem>
          <summary>{t("advertiseFaq1Q")}</summary>
          <p>{t("advertiseFaq1A")}</p>
        </FAQItem>

        <FAQItem>
          <summary>{t("advertiseFaq2Q")}</summary>
          <p>{t("advertiseFaq2A")}</p>
        </FAQItem>

        <FAQItem>
          <summary>{t("advertiseFaq3Q")}</summary>
          <p>{t("advertiseFaq3A")}</p>
        </FAQItem>

        <FAQItem>
          <summary>{t("advertiseFaq4Q")}</summary>
          <p>{t("advertiseFaq4A")}</p>
        </FAQItem>

        <FAQItem>
          <summary>{t("advertiseFaq5Q")}</summary>
          <p>{t("advertiseFaq5A")}</p>
        </FAQItem>
      </FAQSection>

      {/* Contact */}
      <ContactSection>
        <SectionTitle>{t("advertiseContactTitle")}</SectionTitle>
        <HeroSubtitle>{t("advertiseContactSubtitle")}</HeroSubtitle>
        <ContactOptions>
          <ContactButton href="https://wa.me/529961234567" target="_blank" whatsapp>
            <WhatsAppIcon /> {t("advertiseContactWhatsApp")}
          </ContactButton>
          <ContactButton href="mailto:publicidad@stream-in.com" email>
            <EmailOutlinedIcon /> {t("advertiseContactEmail")}
          </ContactButton>
        </ContactOptions>
      </ContactSection>

      {!currentUser && (
        <LoginPrompt>
          <SectionTitle>{t("advertiseReadyTitle")}</SectionTitle>
          <HeroSubtitle style={{ margin: "16px 0" }}>
            {t("advertiseReadySubtitle")}
          </HeroSubtitle>
          <CTAButton primary onClick={() => navigate("/register")}>
            {t("advertiseCreateFreeAccount")}{" "}
            <ArrowForwardIcon style={{ marginLeft: 8 }} />
          </CTAButton>
        </LoginPrompt>
      )}
    </PageContainer>
  );
};

export default Advertise;