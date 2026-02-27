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
      title: "Aceptación de los Términos",
      content: (
        <>
          <Paragraph>
            Bienvenido a stream-in, una plataforma de streaming para compartir y disfrutar de contenido multimedia. Al acceder o usar nuestro sitio, aceptas estar bound por estos Términos y Condiciones de Uso (los "Términos"). Si no estás de acuerdo con alguna parte de estos Términos, te pedimos que no utilices nuestro servicio.
          </Paragraph>
          <HighlightBox>
            <HighlightText>
              📌 Al continuar usando stream-in después de cualquier modificación a estos Términos, aceptas los cambios.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Public />,
      title: "Uso del Sitio",
      content: (
        <>
          <Paragraph>
            stream-in proporciona una plataforma para que los usuarios suban, compartan y vean videos. Al usar el sitio, te comprometes a:
          </Paragraph>
          <BulletList>
            <BulletItem>Usar el servicio solo para fines legales</BulletItem>
            <BulletItem>No interferir con el funcionamiento normal del sitio</BulletItem>
            <BulletItem>No intentar acceder a áreas restringidas sin autorización</BulletItem>
            <BulletItem>Ser responsable de cualquier contenido que publiques</BulletItem>
          </BulletList>
        </>
      ),
    },
    {
      icon: <PermMedia />,
      title: "Contenido del Usuario",
      content: (
        <>
          <Paragraph>
            Los usuarios son responsables de asegurar que el contenido que suben a stream-in cumpla con todas las leyes aplicables y estos Términos y Condiciones. Estamos comprometidos con mantener un entorno seguro y respetuoso para todos.
          </Paragraph>
          <BulletList>
            <BulletItem>No publiques contenido que viole los derechos de autor o propiedad intelectual de terceros</BulletItem>
            <BulletItem>No publiques contenido obsceno, pornográfico, difamatorio o que incite a la violencia</BulletItem>
            <BulletItem>No publiques información personal de otros sin su consentimiento</BulletItem>
            <BulletItem>No publiques contenido que promueva discriminación, acoso o hostigamiento</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              ⚠️ stream-in se reserva el derecho de eliminar cualquier contenido que considere inapropiado o que viole estos términos.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Copyright />,
      title: "Propiedad Intelectual",
      content: (
        <>
          <Paragraph>
            Al subir contenido a stream-in, los usuarios otorgan automáticamente una licencia no exclusiva, transferible, sublicenciable, gratuita y mundial para que stream-in utilice, modifique, reproduzca, distribuya y muestre dicho contenido exclusivamente para el funcionamiento y promoción del sitio.
          </Paragraph>
          <Paragraph>
            stream-in respeta los derechos de propiedad intelectual de terceros y espera que los usuarios hagan lo mismo. Si crees que tu contenido ha sido usado de manera infractora, por favor contáctanos.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <Security />,
      title: "Seguridad del Sitio",
      content: (
        <>
          <Paragraph>
            Nos esforzamos por mantener stream-in seguro para todos los usuarios, pero debes tomar precauciones al usar el servicio.
          </Paragraph>
          <BulletList>
            <BulletItem>No intentes eludir las medidas de seguridad del sitio</BulletItem>
            <BulletItem>No uses el sitio de manera que pueda dañar, desactivar, sobrecargar o afectar su funcionamiento</BulletItem>
            <BulletItem>No intentes acceder a cuentas de otros usuarios</BulletItem>
            <BulletItem>Mantén segura tu información de inicio de sesión</BulletItem>
          </BulletList>
        </>
      ),
    },
    {
      icon: <Block />,
      title: "Suspensión o Terminación de Cuenta",
      content: (
        <>
          <Paragraph>
            stream-in se reserva el derecho de suspender o terminar la cuenta de cualquier usuario que viole estos Términos y Condiciones o cualquier política relacionada. También podemos eliminar cualquier contenido que consideremos inapropiado o que viole estos términos.
          </Paragraph>
          <Paragraph>
            Las suspensiones o terminaciones pueden ser temporales o permanentes, según la gravedad de la violación.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <Business />,
      title: "Limitación de Responsabilidad",
      content: (
        <>
          <Paragraph>
            stream-in no será responsable por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos que surjan del uso o la inability de usar el sitio.
          </Paragraph>
          <BulletList>
            <BulletItem>No garantizamos la disponibilidad continua, ininterrumpida o segura del sitio</BulletItem>
            <BulletItem>No garantizamos la exactitud, fiabilidad o completitud del contenido proporcionado por los usuarios</BulletItem>
            <BulletItem>Los videos y contenido son responsabilidad de sus autores</BulletItem>
            <BulletItem>stream-in actúa como plataforma de alojamiento y no revisa todos los contenidos</BulletItem>
          </BulletList>
        </>
      ),
    },
    {
      icon: <Update />,
      title: "Modificaciones a los Términos",
      content: (
        <>
          <Paragraph>
            stream-in se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los usuarios serán notificados de estos cambios mediante una publicación en el sitio o por otros medios razonables. El uso continuado del sitio después de dichas modificaciones constituirá la aceptación de los nuevos términos y condiciones.
          </Paragraph>
          <HighlightBox>
            <HighlightText>
              🔄 Recomendamos revisar estos Términos periódicamente para estar al tanto de cualquier cambio.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <TrendingUp />,
      title: "Ley Aplicable",
      content: (
        <>
          <Paragraph>
            Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de México sin tener en cuenta sus disposiciones sobre conflictos de leyes.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <ContactMail />,
      title: "Contacto",
      content: (
        <>
          <Paragraph>
            Si tienes alguna pregunta sobre estos Términos y Condiciones, por favor contáctanos a través de:
          </Paragraph>
          <BulletList>
            <BulletItem>📧 Correo electrónico: support@stream-in.com</BulletItem>
            <BulletItem>📞 Número de teléfono: +52 55 1234 5678</BulletItem>
            <BulletItem>📍 Dirección: Av. Reforma 123, Ciudad de México, CP 06600</BulletItem>
          </BulletList>
          <Paragraph>
            Estamos comprometidos a responder a tus consultas en un plazo máximo de 72 horas hábiles.
          </Paragraph>
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
      <LastUpdated>{t("lastUpdatedLabel")}: 22 de Febrero de 2026</LastUpdated>

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
