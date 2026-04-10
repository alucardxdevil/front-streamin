import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import { useLocation } from "react-router-dom";

const Bar = styled.div`
  margin-top: 60px;
  min-height: 36px;
  width: 100%;
  background: linear-gradient(90deg, #1f2937 0%, #7c2d12 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: sticky;
  top: 60px;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;

  @media (max-width: 768px) {
    display: ${({ $hideOnMobile }) => ($hideOnMobile ? "none" : "flex")};
    margin-top: 56px;
    top: 56px;
    min-height: 34px;
    padding: 4px 10px;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1300px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Message = styled.p`
  margin: 0;
  color: #fff3cd;
  font-size: 13px;
  text-align: center;
`;

const DonationButton = styled.a`
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #ffffff;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }
`;

const BetaNoticeBar = ({ donationUrl = "https://ko-fi.com/streamincom" }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const barRef = useRef(null);
  const hideOnMobile = /^\/video\/[^/]+/.test(location.pathname);

  useEffect(() => {
    const barEl = barRef.current;
    if (!barEl) return undefined;

    const updateHeightVar = () => {
      const height = Math.ceil(barEl.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty(
        "--beta-notice-height",
        `${height}px`,
      );
    };

    updateHeightVar();
    const resizeObserver = new ResizeObserver(updateHeightVar);
    resizeObserver.observe(barEl);
    window.addEventListener("resize", updateHeightVar);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeightVar);
      document.documentElement.style.setProperty("--beta-notice-height", "0px");
    };
  }, []);

  return (
    <Bar ref={barRef} $hideOnMobile={hideOnMobile}>
      <Content>
        <Message>{t("betaBannerMessage")}</Message>
        <DonationButton
          href={donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("betaBannerDonate")}
        >
          {t("betaBannerDonate")}
        </DonationButton>
      </Content>
    </Bar>
  );
};

export default BetaNoticeBar;
