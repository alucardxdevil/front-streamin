import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 60px 24px;
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.text || "#fff"};
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    padding: 30px 16px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 32px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  background-color: ${({ theme }) => theme.bg || "#15151f"};
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 16px;
  outline: none;
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.soft || "#444"};
  background-color: ${({ theme }) => theme.bg || "#15151f"};
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 16px;
  resize: vertical;
  min-height: 150px;
  outline: none;
`;

const Button = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  background-color: #4a3aff;
  color: white;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background-color: #382ae8;
  }
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ type }) => (type === "success" ? "lightgreen" : "#ff6464")};
  text-align: center;
`;

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí puedes usar EmailJS, Formspree, Axios con tu backend, etc.
    if (!formData.name || !formData.email || !formData.message) {
      setResponse({
        type: "error",
        text: t("allFieldsRequired"),
      });
      return;
    }

    setResponse({
      type: "success",
      text: t("messageSent"),
    });
    setFormData({ name: "", email: "", subject: "", message: "" });

    // Aquí iría tu lógica real de envío
  };

  return (
    <Container>
      <Title>{t("contactTitle")}</Title>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Input
          type="text"
          name="name"
          placeholder={t("yourName")}
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          type="email"
          name="email"
          placeholder={t("yourEmail")}
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="subject"
          placeholder={t("subject")}
          value={formData.subject}
          onChange={handleChange}
        />
        <Textarea
          name="message"
          placeholder={t("writeMessage")}
          value={formData.message}
          onChange={handleChange}
        />
        <Button type="submit">{t("send")}</Button>
        {response && <Message type={response.type}>{response.text}</Message>}
      </form>
    </Container>
  );
};

export default Contact;
