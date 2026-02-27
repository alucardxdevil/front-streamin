import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 40px 24px;
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.text || "#fff"};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 32px;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 16px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-bottom: 20px;
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

const Select = styled.select`
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
  background-color: #e43c62;
  color: white;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background-color: #d23155;
  }
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ type }) => (type === "success" ? "lightgreen" : "#ff6464")};
  text-align: center;
`;

const Support = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    details: "",
  });
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.details
    ) {
      setResponse({
        type: "error",
        text: t("completeAllFields"),
      });
      return;
    }

    // Aquí iría tu lógica real de envío
    setResponse({
      type: "success",
      text: t("requestSubmitted"),
    });
    setFormData({ name: "", email: "", category: "", details: "" });
  };

  return (
    <Container>
      <Title>{t("technicalSupport")}</Title>
      <Subtitle>{t("supportSubtitle")}</Subtitle>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Input
          type="text"
          name="name"
          placeholder={t("name")}
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          type="email"
          name="email"
          placeholder={t("email")}
          value={formData.email}
          onChange={handleChange}
        />
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">{t("selectProblemType")}</option>
          <option value="error-video">{t("errorPlayingVideo")}</option>
          <option value="cuenta">{t("accountProblems")}</option>
          <option value="subida">{t("uploadProblems")}</option>
          <option value="otro">{t("other")}</option>
        </Select>
        <Textarea
          name="details"
          placeholder={t("describeProblem")}
          value={formData.details}
          onChange={handleChange}
        />
        <Button type="submit">{t("sendRequest")}</Button>
        {response && <Message type={response.type}>{response.text}</Message>}
      </form>
    </Container>
  );
};

export default Support;
