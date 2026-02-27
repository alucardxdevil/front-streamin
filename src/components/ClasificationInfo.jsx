import React, { useState } from "react";
import styled from "styled-components";
import { TbSquareLetterA } from "react-icons/tb";
import { useLanguage } from "../utils/LanguageContext";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  position: relative; /* importante para que el tooltip se posicione */
  cursor: default;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: -110px; /* distancia del icono */
  left: 0;
  background: ${({ theme }) => theme.bgLighter || "#111"};
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 14px;
  padding: 10px;
  border-radius: 8px;
  width: 250px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  opacity: ${(props) => (props.show ? 1 : 0)};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transition: opacity 0.2s ease-in-out;
  z-index: 1000;
`;

export default function ClassificationInfo() {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  return (
    <Wrapper
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <p>{t("classification")}   {"  "}</p>
      <TbSquareLetterA style={{ fontSize: 30, color: "#fff" }} />
      <Tooltip show={show}>
        <p>
          {t("classificationInfo")}
        </p>
        <ul>
          <li>{t("classA")}</li>
          <li>{t("classB")}</li>
          <li>{t("classC")}</li>
          <li>{t("classD")}</li>
        </ul>
      </Tooltip>
    </Wrapper>
  );
}
