import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  position: relative;
`;

const Text = styled.p`
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: ${(props) => (props.expand ? "none" : 3)};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonMore = styled.button`
  color: #5c07fc;
  cursor: pointer;
  font-weight: bold;
  margin-left: 6px;
`;

export const DescriptionMore = ({ fullContent }) => {
  const { t } = useLanguage();
  const [mostrarCompleto, setMostrarCompleto] = useState(false);
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      const maxHeight = lineHeight * 3; // 3 líneas
      if (textRef.current.scrollHeight > maxHeight) {
        setMostrarBoton(true);
      } else {
        setMostrarBoton(false);
      }
    }
    setMostrarCompleto(false);
  }, [fullContent]);

  const toggleMostrarCompleto = () => {
    setMostrarCompleto(!mostrarCompleto);
  };

  return (
    <Container>
      <Text ref={textRef} expand={mostrarCompleto}>
        {fullContent}
      </Text>
      {mostrarBoton && (
        <ButtonMore onClick={toggleMostrarCompleto}>
          {mostrarCompleto ? t("showLess") : t("showMore")}
        </ButtonMore>
      )}
    </Container>
  );
};
