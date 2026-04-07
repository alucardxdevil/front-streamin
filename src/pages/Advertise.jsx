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

  ${({ popular }) => popular && `
    border-color: #0b67dc;
    background: linear-gradient(135deg, rgba(11, 103, 220, 0.1) 0%, transparent 100%);

    &::before {
      content: 'Más Popular';
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
    }
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
        <HeroTitle>Anuncia tu Negocio en Stream-In</HeroTitle>
        <HeroSubtitle>
          Llega a miles de espectadores potenciales con publicidad en video. 
          Promociona tus productos, servicios o marca de manera efectiva y measurable.
        </HeroSubtitle>
      </HeroSection>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatNumber>50K+</StatNumber>
          <StatLabel>Usuarios únicos</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>200K+</StatNumber>
          <StatLabel>Vistas mensuales</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>85%</StatNumber>
          <StatLabel>Tasa de retención</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>24/7</StatNumber>
          <StatLabel>Disponibilidad</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Beneficios */}
      <SectionTitle>
        <TrendingUpIcon /> ¿Por qué publicidad en Stream-In?
      </SectionTitle>
      <SectionGrid>
        <FeatureCard>
          <FeatureIcon>
            <VisibilityIcon />
          </FeatureIcon>
          <FeatureTitle>Gran Exposición</FeatureTitle>
          <FeatureDesc>
            Tu anuncio llega a una audiencia activa y comprometida. 
            Todos los usuarios vienen a buscar contenido de entretenimiento.
          </FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PeopleIcon />
          </FeatureIcon>
          <FeatureTitle>Público Diverso</FeatureTitle>
          <FeatureDesc>
            Alcance demográfico amplio. Desde jóvenes hasta adultos, 
            todos disfrutando de contenido en español.
          </FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PlayArrowIcon />
          </FeatureIcon>
          <FeatureTitle>Anuncios en Video</FeatureTitle>
          <FeatureDesc>
            Formatos publicitarios que no interrumpen la experiencia. 
            Anuncios integrados naturalmente en el contenido.
          </FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <MonetizationOnOutlinedIcon />
          </FeatureIcon>
          <FeatureTitle>Precios Accesibles</FeatureTitle>
          <FeatureDesc>
            Planes diseñados para todos los presupuestos. 
            Desde的小企业 hasta grandes marcas.
          </FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <StarOutlineIcon />
          </FeatureIcon>
          <FeatureTitle>Alta Calidad</FeatureTitle>
          <FeatureDesc>
            Reproducción sin interrupciones. Tus anuncios se ven profesionales 
            y atractivos en cualquier dispositivo.
          </FeatureDesc>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>
            <PlayCircleOutlineIcon />
          </FeatureIcon>
          <FeatureTitle>Medible</FeatureTitle>
          <FeatureDesc>
            Dashboard completo con estadísticas detalladas. 
            Ve el rendimiento de tus campañas en tiempo real.
          </FeatureDesc>
        </FeatureCard>
      </SectionGrid>

      {/* Planes */}
      <PricingSection>
        <SectionTitle style={{ textAlign: 'center', justifyContent: 'center' }}>
          <MonetizationOnOutlinedIcon /> Planes de Publicidad
        </SectionTitle>
        <PricingGrid>
          <PricingCard>
            <PriceName>Básico</PriceName>
            <PriceAmount>$19<span>/semana</span></PriceAmount>
            <PriceFeatures>
              <PriceFeature><CheckCircleOutlinedIcon /> 1000 impresiones</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Anuncio de 15 segundos</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Posición: pre-roll</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Soporte por email</PriceFeature>
            </PriceFeatures>
            <CTAButton onClick={() => currentUser ? navigate('/contact') : navigate('/login')}>
              {currentUser ? 'Contratar' : 'Iniciar sesión'}
            </CTAButton>
          </PricingCard>

          <PricingCard popular>
            <PriceName>Profesional</PriceName>
            <PriceAmount>$49<span>/semana</span></PriceAmount>
            <PriceFeatures>
              <PriceFeature><CheckCircleOutlinedIcon /> 5000 impresiones</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Anuncio de 30 segundos</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Posición: medio del video</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Reporte semanal</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Soporte prioritario</PriceFeature>
            </PriceFeatures>
            <CTAButton primary onClick={() => currentUser ? navigate('/contact') : navigate('/login')}>
              {currentUser ? 'Contratar' : 'Iniciar sesión'}
            </CTAButton>
          </PricingCard>

          <PricingCard>
            <PriceName>Empresarial</PriceName>
            <PriceAmount>$99<span>/semana</span></PriceAmount>
            <PriceFeatures>
              <PriceFeature><CheckCircleOutlinedIcon /> 15000 impresiones</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Anuncio de 60 segundos</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Posición: mejor lugar</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Dashboard dedicado</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Soporte 24/7</PriceFeature>
              <PriceFeature><CheckCircleOutlinedIcon /> Creatives incluidos</PriceFeature>
            </PriceFeatures>
            <CTAButton onClick={() => currentUser ? navigate('/contact') : navigate('/login')}>
              {currentUser ? 'Contratar' : 'Iniciar sesión'}
            </CTAButton>
          </PricingCard>
        </PricingGrid>
      </PricingSection>

      {/* FAQ */}
      <FAQSection>
        <SectionTitle>Preguntas Frecuentes</SectionTitle>
        
        <FAQItem>
          <summary>¿Cómo funciona la publicidad en Stream-In?</summary>
          <p>
            Subimos tu video publicitario y lo mostramos a nuestros usuarios antes, durante o después del contenido.
            Solo pagas por las impresiones reales.
          </p>
        </FAQItem>

        <FAQItem>
          <summary>¿Qué formatos de anuncio aceptan?</summary>
          <p>
            Aceptamos videos en MP4, MOV o AVI. Recomendamos resolución mínima de 720p para mejor calidad.
            También puedes enviarnos tu素材 y nosotros lo producimos.
          </p>
        </FAQItem>

        <FAQItem>
          <summary>¿Puedo targeted mi audiencia?</summary>
          <p>
            Sí, puedes seleccionar categorías de contenido, ubicaciones geográficas y demographics.
            También tenemos opciones de retargeting para llegado usuarios que já visitaron tu sitio.
          </p>
        </FAQItem>

        <FAQItem>
          <summary>¿Cuánto tiempo dura configurar una campaña?</summary>
          <p>
            Una vez aprobado tu contenido, la campaña está lista en 24-48 horas.
            Recibirás un reporte semanal con el rendimiento.
          </p>
        </FAQItem>

        <FAQItem>
          <summary>¿Puedo cancelar en cualquier momento?</summary>
          <p>
            Sí, sin compromisos a largo plazo. Puedes pausar o cancelar tu campaña cuando quieras desde tu dashboard.
          </p>
        </FAQItem>
      </FAQSection>

      {/* Contact */}
      <ContactSection>
        <SectionTitle>¿Necesitas ayuda?</SectionTitle>
        <HeroSubtitle>
          Nuestro equipo está listo para ayudarte a crear la campaña perfecta para tu negocio.
        </HeroSubtitle>
        <ContactOptions>
          <ContactButton href="https://wa.me/529961234567" target="_blank" whatsapp>
            <WhatsAppIcon /> WhatsApp
          </ContactButton>
          <ContactButton href="mailto:publicidad@stream-in.com" email>
            <EmailOutlinedIcon /> Email
          </ContactButton>
        </ContactOptions>
      </ContactSection>

      {!currentUser && (
        <LoginPrompt>
          <SectionTitle>¿Listo para comenzar?</SectionTitle>
          <HeroSubtitle style={{ margin: '16px 0' }}>
            Crea una cuenta gratis y empieza a publicitar hoy mismo.
          </HeroSubtitle>
          <CTAButton primary onClick={() => navigate('/register')}>
            Crear cuenta gratis <ArrowForwardIcon style={{ marginLeft: 8 }} />
          </CTAButton>
        </LoginPrompt>
      )}
    </PageContainer>
  );
};

export default Advertise;