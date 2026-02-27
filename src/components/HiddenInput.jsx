import React from 'react';
import styled from 'styled-components';

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
  const fileInputRef = React.createRef();

  // const handleButtonClick = () => {
  //   fileInputRef.current.click();
  // };

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     console.log(file.name);
  //   }
  // };

  return (
    <div>
      <HiddenInput
        type='file'
        ref={fileInputRef}
        // onChange={handleFileChange}
      />
      <StyledButton>
        Subir Archivo
      </StyledButton>
    </div>
  );
};

export default FileInputButton;