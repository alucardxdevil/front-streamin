import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useVideoUpload from "../utils/useVideoUpload";
import { useLanguage } from "../utils/LanguageContext";

/* =======================
   🎨 STYLED COMPONENTS
======================= */

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 12px;
`;

const Modal = styled.div`
  width: 680px;
  max-width: 100%;
  max-height: 95vh;
  overflow-y: auto;
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

const Close = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 22px;
  cursor: pointer;
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
`;

const Textarea = styled.textarea`
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
  resize: none;
  font-size: 15px;
`;

const UploadBox = styled.label`
  border: 1px dashed ${({ theme }) => theme.soft || "#444"};
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft || "#aaa"};

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
  max-height: 160px;
  object-fit: cover;
  border-radius: 12px;
`;

const PreviewVideo = styled.video`
  width: 100%;
  max-height: 200px;
  border-radius: 12px;
  background: #000;
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
`;

const StatusText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  display: flex;
  align-items: center;
  gap: 8px;
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

/* =======================
   ⚛️ COMPONENT
======================= */

export const Upload = ({ setOpen }) => {
  // Archivos seleccionados (solo para preview local)
  const [imgFile, setImgFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Metadata del video
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);
  const [localError, setLocalError] = useState(null);

  const { t } = useLanguage();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Hook de upload + transcodificación HLS
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
    if (file.size > 10 * 1024 * 1024) {
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
    if (file.size > 500 * 1024 * 1024) {
      setLocalError(t("videoMax500Mb"));
      return;
    }
    setLocalError(null);
    setVideoFile(file);
    setPreviewVideo(URL.createObjectURL(file));
  };

  /**
   * Flujo completo de upload + transcodificación HLS:
   *  1. Sube miniatura a B2 (vía proxy del servidor)
   *  2. Obtiene presigned URL para el video
   *  3. Sube MP4 directamente a B2 (sin pasar por el servidor)
   *  4. Encola transcodificación en el backend (BullMQ + FFmpeg)
   *  5. Hace polling hasta que status === 'ready'
   *  6. Navega al video cuando está listo
   */
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
      const result = await upload({
        videoFile,
        imageFile: imgFile,
        title: inputs.title,
        description: inputs.description,
        tags,
      });

      // El hook hace polling automático. Cuando isReady === true,
      // el videoId estará disponible y podemos navegar.
      // La navegación se maneja en el useEffect de abajo.
    } catch (err) {
      // El error ya se maneja dentro del hook (state === 'error')
      console.error("[Upload] Error:", err.message);
    }
  };

  // Navegar al video cuando la transcodificación termine
  React.useEffect(() => {
    if (isReady && videoId) {
      setOpen(false);
      navigate(`/video/${videoId}`);
    }
  }, [isReady, videoId, navigate, setOpen]);

  // Determinar texto y estado del botón
  const getButtonText = () => {
    if (isUploading) return `${t("uploading")} ${uploadProgress}%`;
    if (isProcessing) return `${t("processing") || "Procesando"} ${transcodeProgress}%`;
    if (isReady) return t("ready") || "¡Listo!";
    if (!imgFile || !videoFile) return t("wait");
    return t("publish");
  };

  const isButtonDisabled =
    isUploading || isProcessing || !imgFile || !videoFile || !inputs.title || !inputs.description;

  // Determinar texto de estado
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
        return null; // Se muestra en ErrorText
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Container>
      <Modal>
        <Header>
          <Title>{t("uploadVideo")}</Title>
          <Close
            onClick={() => {
              if (isUploading || isProcessing) cancel();
              setOpen(false);
            }}
          >
            ✕
          </Close>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        {/* Estado de progreso */}
        {statusMessage && (
          <StatusText>
            {(isUploading || isProcessing) && <Spinner />}
            {statusMessage}
          </StatusText>
        )}

        {/* Barra de progreso de subida */}
        {isUploading && uploadProgress > 0 && (
          <ProgressBar value={uploadProgress}>
            <div />
          </ProgressBar>
        )}

        {/* Barra de progreso de transcodificación */}
        {isProcessing && transcodeProgress > 0 && (
          <ProgressBar value={transcodeProgress}>
            <div />
          </ProgressBar>
        )}

        <Section>
          <Label>{t("thumbnailImage")}</Label>
          {previewImg && <PreviewImage src={previewImg} />}
          <UploadBox>
            {imgFile ? (
              <CompleteText>✔ {imgFile.name}</CompleteText>
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
              <CompleteText>✔ {videoFile.name}</CompleteText>
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
      </Modal>
    </Container>
  );
};

export default Upload;
