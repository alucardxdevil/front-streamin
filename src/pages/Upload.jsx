import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useVideoUpload from "../utils/useVideoUpload";
import { useLanguage } from "../utils/LanguageContext";
import {
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
} from "../constants/uploadLimits";

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.bg || "#000"};
  padding: 80px 20px 20px;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  background: ${({ theme }) => theme.bgLighter || "#181818"};
  color: ${({ theme }) => theme.text || "#fff"};
  border-radius: 20px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
`;

// Layout de dos columnas
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;

const Input = styled.input`
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  width: 100%;
`;

const Select = styled.select`
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  width: 100%;
`;

const Textarea = styled.textarea`
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
  resize: none;
  font-size: 15px;
  width: 100%;
  min-height: 100px;
`;

const UploadBox = styled.label`
  border: 1px dashed ${({ theme }) => theme.soft || "#444"};
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.text || "#fff"};
  }

  input {
    display: none;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.soft || "#333"};
  border-radius: 6px;
  overflow: hidden;

  div {
    height: 100%;
    width: ${({ value }) => value}%;
    background: linear-gradient(90deg, #3ea6ff, #6f6cff);
    transition: width 0.3s ease;
  }
`;

const CompleteText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: #ff5252;
  padding: 8px;
  background: rgba(255, 82, 82, 0.1);
  border-radius: 8px;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.soft || "#333"};
`;

const PreviewVideo = styled.video`
  width: 100%;
  max-height: 250px;
  border-radius: 12px;
  background: #000;
  border: 2px solid ${({ theme }) => theme.soft || "#333"};
`;

const SaveButton = styled.button`
  margin-top: 6px;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #3ea6ff, #6f6cff);
  color: #fff;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  width: 100%;
`;

const StatusText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BetaLimitsHint = styled.p`
  font-size: 12px;
  line-height: 1.45;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid ${({ theme }) => theme.soft || "#444"};
  border-top-color: #3ea6ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.text || "#fff"};
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;

export default function UploadPage() {
  const [imgFile, setImgFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const [inputs, setInputs] = useState({ classification: "A" });
  const [tags, setTags] = useState([]);
  const [localError, setLocalError] = useState(null);

  const { t } = useLanguage();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const {
    upload,
    cancel,
    state,
    uploadProgress,
    transcodeProgress,
    videoId,
    error: uploadError,
    isUploading,
    isProcessing,
    isReady,
    hasError,
  } = useVideoUpload();

  const error = localError || uploadError;

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTags = (e) => {
    setTags(e.target.value.split(",").map((tag) => tag.trim()));
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setLocalError(t("onlyJpgPngWebp"));
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setLocalError(t("imageMax10Mb"));
      return;
    }
    setLocalError(null);
    setImgFile(file);
    setPreviewImg(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/video\/(mp4|webm|x-matroska)/)) {
      setLocalError(t("onlyMp4WebmMkv"));
      return;
    }
    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      setLocalError(t("videoMax800Mb"));
      return;
    }
    setLocalError(null);
    setVideoFile(file);
    setPreviewVideo(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!imgFile || !videoFile) {
      setLocalError(t("waitForUpload"));
      return;
    }
    if (!inputs.title || !inputs.description) {
      setLocalError(t("titleAndDescriptionRequired") || "Título y descripción son requeridos");
      return;
    }

    setLocalError(null);

    try {
      await upload({
        videoFile,
        imageFile: imgFile,
        title: inputs.title,
        description: inputs.description,
        classification: inputs.classification,
        tags,
      });
    } catch (err) {
      console.error("[Upload] Error:", err.message);
    }
  };

  React.useEffect(() => {
    if (isReady && videoId) {
      navigate(`/video/${videoId}`);
    }
  }, [isReady, videoId, navigate]);

  const getButtonText = () => {
    if (isUploading) return `${t("uploading")} ${uploadProgress}%`;
    if (isProcessing) return `${t("processing") || "Procesando"} ${transcodeProgress}%`;
    if (isReady) return t("ready") || "¡Listo!";
    if (!imgFile || !videoFile) return t("wait");
    return t("publish");
  };

  const isButtonDisabled =
    isUploading || isProcessing || !imgFile || !videoFile || !inputs.title || !inputs.description;

  const getStatusMessage = () => {
    switch (state) {
      case "uploading":
        return t("uploadingToCloud") || "Subiendo archivo a la nube...";
      case "enqueuing":
        return t("preparingTranscode") || "Preparando transcodificación...";
      case "processing":
        return t("transcodingHLS") || "Transcodificando a HLS (múltiples calidades)...";
      case "ready":
        return t("videoReady") || "¡Video listo para reproducir!";
      case "error":
        return null;
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>{t("uploadVideo")}</Title>
        </Header>

        <BackLink onClick={() => navigate(-1)}>
          ← {t("back")}
        </BackLink>

        <BetaLimitsHint>{t("uploadBetaLimitsHint")}</BetaLimitsHint>

        {error && <ErrorText>{error}</ErrorText>}

        {statusMessage && (
          <StatusText>
            {(isUploading || isProcessing) && <Spinner />}
            {statusMessage}
          </StatusText>
        )}

        {isUploading && uploadProgress > 0 && (
          <ProgressBar value={uploadProgress}>
            <div />
          </ProgressBar>
        )}

        {isProcessing && transcodeProgress > 0 && (
          <ProgressBar value={transcodeProgress}>
            <div />
          </ProgressBar>
        )}

        <TwoColumnLayout>
          {/* LADO IZQUIERDO - Inputs */}
          <Column>
            <Section>
              <Label>{t("title")}</Label>
              <Input
                name="title"
                placeholder={t("videoTitlePlaceholder")}
                onChange={handleChange}
                disabled={isUploading || isProcessing}
              />
            </Section>

            <Section>
              <Label>{t("description")}</Label>
              <Textarea
                rows={4}
                name="description"
                placeholder={t("descriptionPlaceholder")}
                onChange={handleChange}
                disabled={isUploading || isProcessing}
              />
            </Section>

            <Section>
              <Label>{t("classification")}</Label>
              <Select
                name="classification"
                value={inputs.classification}
                onChange={handleChange}
                disabled={isUploading || isProcessing}
              >
                <option value="A">A - {t("classA")}</option>
                <option value="B">B - {t("classB")}</option>
                <option value="C">C - {t("classC")}</option>
                <option value="D">D - {t("classD")}</option>
              </Select>
            </Section>

            <Section>
              <Label>{t("tags")}</Label>
              <Input
                placeholder={t("tagsPlaceholder")}
                onChange={handleTags}
                disabled={isUploading || isProcessing}
              />
            </Section>

            <SaveButton disabled={isButtonDisabled} onClick={handleUpload}>
              {getButtonText()}
            </SaveButton>
          </Column>

          {/* LADO DERECHO - Previsualizaciones */}
          <Column>
            <PreviewContainer>
              <Section>
                <Label>{t("thumbnailImage")}</Label>
                {previewImg && <PreviewImage src={previewImg} />}
                <UploadBox>
                  {imgFile ? (
                    <>
                      <CompleteText>✔ {imgFile.name}</CompleteText>
                      <FileInfo>
                        {(imgFile.size / 1024 / 1024).toFixed(2)} MB
                      </FileInfo>
                    </>
                  ) : (
                    t("clickToUploadImage")
                  )}
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    onChange={handleImgChange}
                    disabled={isUploading || isProcessing}
                  />
                </UploadBox>
              </Section>

              <Section>
                <Label>{t("videoFile")}</Label>
                {previewVideo && <PreviewVideo src={previewVideo} controls />}
                <UploadBox>
                  {videoFile ? (
                    <>
                      <CompleteText>✔ {videoFile.name}</CompleteText>
                      <FileInfo>
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </FileInfo>
                    </>
                  ) : (
                    t("clickToUploadVideo")
                  )}
                  <input
                    type="file"
                    accept="video/mp4, video/webm, video/x-matroska"
                    onChange={handleVideoChange}
                    disabled={isUploading || isProcessing}
                  />
                </UploadBox>
              </Section>
            </PreviewContainer>
          </Column>
        </TwoColumnLayout>
      </Container>
    </PageContainer>
  );
}
