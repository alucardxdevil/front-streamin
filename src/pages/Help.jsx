import React, { useState } from "react";
import styled from "styled-components";
import {
  HelpOutline,
  SearchOutlined,
  PlayCircleOutline,
  AccountCircleOutlined,
  CloudUploadOutlined,
  SecurityOutlined,
  MonetizationOnOutlined,
  SettingsOutlined,
  ExpandMore,
  ExpandLess,
  SupportAgentOutlined,
  EmailOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  max-width: 900px;
  margin: 80px auto;
  padding: 40px 24px;
  color: ${({ theme }) => theme.text || "#fff"};
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
  font-size: 36px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 600px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  max-width: 600px;
  margin: 0 auto;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 550px;
  margin: 24px auto 0;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.textSoft || "#aaa"};
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
`;

const CategoryCard = styled.div`
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 14px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: #e43c62;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(228, 60, 98, 0.15);
  }
`;

const CategoryIcon = styled.div`
  font-size: 36px;
  color: #e43c62;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const CategoryDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 48px;
`;

const FAQItem = styled.div`
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  transition: all 0.3s ease;
`;

const FAQQuestion = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: background 0.2s ease;

  &:hover {
    background-color: rgba(228, 60, 98, 0.06);
  }
`;

const FAQAnswer = styled.div`
  padding: ${({ open }) => (open ? "0 20px 16px" : "0 20px")};
  max-height: ${({ open }) => (open ? "300px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  line-height: 1.6;
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
`;

const QuickLinkCard = styled(Link)`
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.text || "#fff"};
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  transition: all 0.3s ease;

  &:hover {
    border-color: #e43c62;
    background-color: rgba(228, 60, 98, 0.05);
  }
`;

const QuickLinkIcon = styled.div`
  color: #e43c62;
  display: flex;
  align-items: center;
`;

const QuickLinkText = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuickLinkTitle = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const QuickLinkDesc = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-top: 4px;
`;

const ContactBanner = styled.div`
  background: linear-gradient(135deg, #e43c62 0%, #4a3aff 100%);
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
`;

const ContactTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 10px;
`;

const ContactText = styled.p`
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 20px;
`;

const ContactButton = styled(Link)`
  display: inline-block;
  padding: 12px 32px;
  background-color: white;
  color: #e43c62;
  font-weight: bold;
  font-size: 15px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
`;

const Help = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const categories = [
    { icon: <PlayCircleOutline style={{ fontSize: 40 }} />, title: t("videoPlayback"), desc: t("videoPlaybackDesc") },
    { icon: <AccountCircleOutlined style={{ fontSize: 40 }} />, title: t("myAccount"), desc: t("myAccountDesc") },
    { icon: <CloudUploadOutlined style={{ fontSize: 40 }} />, title: t("uploadContent"), desc: t("uploadContentDesc") },
    { icon: <SecurityOutlined style={{ fontSize: 40 }} />, title: t("securityPrivacy"), desc: t("securityPrivacyDesc") },
    { icon: <MonetizationOnOutlined style={{ fontSize: 40 }} />, title: t("monetization"), desc: t("monetizationDesc") },
    { icon: <SettingsOutlined style={{ fontSize: 40 }} />, title: t("generalSettings"), desc: t("generalSettingsDesc") },
  ];

  const faqData = [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
    { question: t("faq5Q"), answer: t("faq5A") },
    { question: t("faq6Q"), answer: t("faq6A") },
    { question: t("faq7Q"), answer: t("faq7A") },
    { question: t("faq8Q"), answer: t("faq8A") },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>
          <HelpOutline style={{ fontSize: 40, color: "#e43c62" }} />
          {t("helpCenter")}
        </Title>
        <Subtitle>{t("helpSubtitle")}</Subtitle>
        <SearchBar>
          <SearchOutlined style={{ color: "#aaa" }} />
          <SearchInput
            type="text"
            placeholder={t("searchHelp")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>

      <SectionTitle>
        <MenuBookOutlined /> {t("helpCategories")}
      </SectionTitle>
      <CategoriesGrid>
        {filteredCategories.map((cat, index) => (
          <CategoryCard key={index}>
            <CategoryIcon>{cat.icon}</CategoryIcon>
            <CategoryTitle>{cat.title}</CategoryTitle>
            <CategoryDesc>{cat.desc}</CategoryDesc>
          </CategoryCard>
        ))}
      </CategoriesGrid>

      <SectionTitle>
        <HelpOutline /> {t("faq")}
      </SectionTitle>
      <FAQContainer>
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((item, index) => (
            <FAQItem key={index}>
              <FAQQuestion onClick={() => toggleFAQ(index)}>
                {item.question}
                {openFAQ === index ? <ExpandLess /> : <ExpandMore />}
              </FAQQuestion>
              <FAQAnswer open={openFAQ === index}>{item.answer}</FAQAnswer>
            </FAQItem>
          ))
        ) : (
          <Subtitle style={{ textAlign: "center", marginTop: "10px" }}>
            {t("noResults")} "{searchTerm}"
          </Subtitle>
        )}
      </FAQContainer>

      <SectionTitle>{t("quickLinks")}</SectionTitle>
      <QuickLinksGrid>
        <QuickLinkCard to="/support">
          <QuickLinkIcon>
            <SupportAgentOutlined style={{ fontSize: 32 }} />
          </QuickLinkIcon>
          <QuickLinkText>
            <QuickLinkTitle>{t("techSupport")}</QuickLinkTitle>
            <QuickLinkDesc>{t("techSupportDesc")}</QuickLinkDesc>
          </QuickLinkText>
        </QuickLinkCard>
        <QuickLinkCard to="/contact">
          <QuickLinkIcon>
            <EmailOutlined style={{ fontSize: 32 }} />
          </QuickLinkIcon>
          <QuickLinkText>
            <QuickLinkTitle>{t("contactUs")}</QuickLinkTitle>
            <QuickLinkDesc>{t("contactUsDesc")}</QuickLinkDesc>
          </QuickLinkText>
        </QuickLinkCard>
        <QuickLinkCard to="/terms">
          <QuickLinkIcon>
            <MenuBookOutlined style={{ fontSize: 30 }} />
          </QuickLinkIcon>
          <QuickLinkText>
            <QuickLinkTitle>{t("termsConditions")}</QuickLinkTitle>
            <QuickLinkDesc>{t("termsConditionsDesc")}</QuickLinkDesc>
          </QuickLinkText>
        </QuickLinkCard>
      </QuickLinksGrid>

      <ContactBanner>
        <ContactTitle>{t("notFoundAnswer")}</ContactTitle>
        <ContactText>{t("supportTeamAvailable")}</ContactText>
        <ContactButton to="/support">{t("contactSupport")}</ContactButton>
      </ContactBanner>
    </Container>
  );
};

export default Help;
