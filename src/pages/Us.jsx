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
  MonetizationOn,
  Update,
  ContactMail,
  Shield,
  Copyright,
  Warning,
  Public,
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
      icon: <Gavel />,
      title: t("acceptanceOfTermsUs"),
      content: (
        <>
          <Paragraph>
            Al acceder y utilizar stream-in, aceptas estos Términos y Condiciones
            en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos
            que no utilices la plataforma.
          </Paragraph>
          <HighlightBox>
            <HighlightText>
              📌 El uso continuado de stream-in después de cualquier modificación
              constituye tu aceptación de los términos actualizados.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Public />,
      title: t("serviceDescription"),
      content: (
        <>
          <Paragraph>
            stream-in es una plataforma de streaming que permite a los usuarios:
          </Paragraph>
          <BulletList>
            <BulletItem>Subir, compartir y descubrir contenido de audio (podcasts, música, etc.)</BulletItem>
            <BulletItem>Crear y personalizar perfiles de creador</BulletItem>
            <BulletItem>Interactuar con otros usuarios y creadores</BulletItem>
            <BulletItem>Acceder a herramientas de monetización para creadores elegibles</BulletItem>
          </BulletList>
          <Paragraph>
            Nos reservamos el derecho de modificar, suspender o descontinuar
            cualquier aspecto del servicio en cualquier momento, con o sin previo
            aviso.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <Person />,
      title: t("userAccounts"),
      content: (
        <>
          <Paragraph>
            Para utilizar ciertas funciones de stream-in, necesitarás crear una
            cuenta. Al hacerlo, te comprometes a:
          </Paragraph>
          <BulletList>
            <BulletItem>Proporcionar información veraz y actualizada</BulletItem>
            <BulletItem>Mantener la seguridad de tu contraseña y credenciales</BulletItem>
            <BulletItem>Ser responsable de toda actividad bajo tu cuenta</BulletItem>
            <BulletItem>Notificarnos inmediatamente sobre cualquier uso no autorizado</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              ⚠️ Nos reservamos el derecho de suspender o eliminar cuentas que
              violen estos términos o que permanezcan inactivas por períodos
              prolongados.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Copyright />,
      title: t("contentAndIP"),
      content: (
        <>
          <Paragraph>
            Tú conservas los derechos sobre el contenido que subes a stream-in.
            Sin embargo, al publicar contenido, nos otorgas una licencia
            mundial, no exclusiva, libre de regalías para usar, reproducir,
            modificar, distribuir y mostrar dicho contenido dentro de la
            plataforma.
          </Paragraph>
          <Paragraph>Te comprometes a que tu contenido:</Paragraph>
          <BulletList>
            <BulletItem>Es original o tienes los derechos necesarios para compartirlo</BulletItem>
            <BulletItem>No infringe derechos de autor, marcas registradas u otros derechos de terceros</BulletItem>
            <BulletItem>No contiene material difamatorio, obsceno o ilegal</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              🎵 Si subes música o audio que no es tuyo, asegúrate de contar con
              las licencias correspondientes. stream-in no se hace responsable
              por infracciones de derechos de autor cometidas por usuarios.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Block />,
      title: t("prohibitedConduct"),
      content: (
        <>
          <Paragraph>
            Para mantener stream-in como un espacio seguro y respetuoso, está
            prohibido:
          </Paragraph>
          <BulletList>
            <BulletItem>Subir contenido que promueva odio, violencia o discriminación</BulletItem>
            <BulletItem>Acosar, intimidar o amenazar a otros usuarios</BulletItem>
            <BulletItem>Usar la plataforma para actividades ilegales o fraudulentas</BulletItem>
            <BulletItem>Intentar hackear, descompilar o interferir con los sistemas de stream-in</BulletItem>
            <BulletItem>Crear múltiples cuentas para evadir restricciones</BulletItem>
            <BulletItem>Distribuir spam, malware o contenido engañoso</BulletItem>
            <BulletItem>Suplantar la identidad de otra persona o entidad</BulletItem>
          </BulletList>
          <Paragraph>
            Las violaciones pueden resultar en la suspensión o eliminación
            permanente de tu cuenta, sin previo aviso.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <MonetizationOn />,
      title: t("monetizationAndPayments"),
      content: (
        <>
          <Paragraph>
            stream-in ofrece opciones de monetización para creadores elegibles.
            Los términos específicos incluyen:
          </Paragraph>
          <BulletList>
            <BulletItem>Los ingresos se calculan según las métricas de la plataforma</BulletItem>
            <BulletItem>Los pagos se procesan según el calendario establecido</BulletItem>
            <BulletItem>stream-in se reserva el derecho de modificar las tasas de monetización</BulletItem>
            <BulletItem>Los creadores son responsables de sus obligaciones fiscales</BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              💰 Los detalles específicos de monetización se encuentran en el
              Acuerdo de Creador, que complementa estos términos generales.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Security />,
      title: t("privacyAndData"),
      content: (
        <>
          <Paragraph>
            Tu privacidad es importante para nosotros. Recopilamos y procesamos
            datos personales de acuerdo con nuestra Política de Privacidad, que
            incluye:
          </Paragraph>
          <BulletList>
            <BulletItem>Información de registro (nombre, email, etc.)</BulletItem>
            <BulletItem>Datos de uso y preferencias</BulletItem>
            <BulletItem>Información técnica del dispositivo</BulletItem>
            <BulletItem>Cookies y tecnologías similares</BulletItem>
          </BulletList>
          <Paragraph>
            Implementamos medidas de seguridad técnicas y organizativas para
            proteger tu información. Sin embargo, ningún sistema es 100% seguro
            y no podemos garantizar la seguridad absoluta de tus datos.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <Shield />,
      title: t("liabilityLimitationUs"),
      content: (
        <>
          <Paragraph>
            stream-in se proporciona "tal cual" y "según disponibilidad". En la
            máxima medida permitida por la ley:
          </Paragraph>
          <BulletList>
            <BulletItem>
              No garantizamos que el servicio sea ininterrumpido, seguro o libre
              de errores
            </BulletItem>
            <BulletItem>
              No somos responsables por pérdidas indirectas, incidentales o
              consecuentes
            </BulletItem>
            <BulletItem>
              Nuestra responsabilidad total no excederá el monto que hayas
              pagado a stream-in en los últimos 12 meses
            </BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              🛡️ Esta limitación aplica en la máxima medida permitida por la
              legislación aplicable en tu jurisdicción.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
    {
      icon: <Warning />,
      title: t("indemnification"),
      content: (
        <>
          <Paragraph>
            Aceptas indemnizar y mantener indemne a stream-in, sus directores,
            empleados y afiliados de cualquier reclamación, daño, pérdida o
            gasto (incluyendo honorarios legales) que surja de:
          </Paragraph>
          <BulletList>
            <BulletItem>Tu uso de la plataforma</BulletItem>
            <BulletItem>Tu violación de estos términos</BulletItem>
            <BulletItem>Tu violación de derechos de terceros</BulletItem>
            <BulletItem>El contenido que publiques en stream-in</BulletItem>
          </BulletList>
        </>
      ),
    },
    {
      icon: <Update />,
      title: t("termsModificationsUs"),
      content: (
        <>
          <Paragraph>
            Podemos actualizar estos términos periódicamente. Cuando lo hagamos:
          </Paragraph>
          <BulletList>
            <BulletItem>Publicaremos la versión actualizada en esta página</BulletItem>
            <BulletItem>Actualizaremos la fecha de "última modificación"</BulletItem>
            <BulletItem>
              Para cambios significativos, te notificaremos por email o mediante
              un aviso destacado en la plataforma
            </BulletItem>
          </BulletList>
          <Paragraph>
            Te recomendamos revisar estos términos regularmente para estar al
            tanto de cualquier cambio.
          </Paragraph>
        </>
      ),
    },
    {
      icon: <ContactMail />,
      title: t("contactAndDisputes"),
      content: (
        <>
          <Paragraph>
            Si tienes preguntas sobre estos términos o necesitas reportar un
            problema, puedes contactarnos a través de:
          </Paragraph>
          <BulletList>
            <BulletItem>
              Email: <ContactLink href="mailto:legal@stream-in.com">legal@stream-in.com</ContactLink>
            </BulletItem>
            <BulletItem>
              Soporte: <ContactLink href="mailto:support@stream-in.com">support@streamin.com</ContactLink>
            </BulletItem>
          </BulletList>
          <HighlightBox>
            <HighlightText>
              ⚖️ Cualquier disputa se resolverá primero mediante negociación de
              buena fe. Si no se alcanza un acuerdo, se someterá a arbitraje
              vinculante según las leyes aplicables de la jurisdicción
              correspondiente.
            </HighlightText>
          </HighlightBox>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Title>{t("termsTitleUs")}</Title>
      <Subtitle>
        {t("termsSubtitleUs")}
      </Subtitle>
      <LastUpdated>{t("lastUpdatedUs")}</LastUpdated>

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
        <FooterText>
          © 2026 stream-in. Todos los derechos reservados. Si tienes dudas sobre
          estos términos, no dudes en{" "}
          <ContactLink href="mailto:legal@streamin.com">contactarnos</ContactLink>.
        </FooterText>
      </Footer>
    </Container>
  );
};

export default Us;
