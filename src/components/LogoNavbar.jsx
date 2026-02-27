import React from "react";
import styled from "styled-components";
import LogoStream from "../img/logo.png";

// const Container = styled.div`
//   position: sticky;
//   top: 0;
//   background-color: #000000;
//   height: 56px;
// `;

// const Wrapper = styled.div`
//   display: inline-flex;
//   align-items: center;
//   justify-content: flex-end;
//   height: 120%;
//   padding: 10px 567px;
//   position: relative;
// `;

const Img = styled.img`
  height: 150px;
`;

const Logo = styled.div`
  display: flex;
  /* align-items: center; */
  gap: 5px;
  font-weight: bold;
  margin-bottom: 25px;
  color: white;
`;

const LogoNavbar = () => {
  // <Container>
    // <Wrapper>
      <Logo>
        <Img src={LogoStream} />
          Version Beta
      </Logo>
  //   </Wrapper>
  // </Container>        
}

export default LogoNavbar