import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../utils/LanguageContext';

// Componentes estilizados
const HiddenInput = styled.input`
  display: none;
`;

const StyledButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

// Componente principal
const FileInputButton = () => {
  const { t } = useLanguage();
  const fileInputRef = React.createRef();

  return (
    <div>
      <HiddenInput
        type='file'
        ref={fileInputRef}
        // onChange={handleFileChange}
      />
      <StyledButton>
        {t("uploadFile")}
      </StyledButton>
    </div>
  );
};

export default FileInputButton;