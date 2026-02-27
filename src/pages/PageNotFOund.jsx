import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 60px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

const Message = styled.p`
  font-size: 20px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.textSoft};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  text-decoration: underline;
  margin-top: 10px;
`;

export default function NotFound() {
  return (
    <Container>
      <Title>404</Title>
      <Message>Page not found</Message>
      <StyledLink to="/">Go back to home</StyledLink>
    </Container>
  );
}
