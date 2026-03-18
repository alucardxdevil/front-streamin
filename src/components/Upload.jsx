import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { uploadToB2 } from "../utils/uploadB2";
import { useLanguage } from "../utils/LanguageContext";

/* =======================
   🎨 STYLED COMPONENTS
======================= */

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
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

/* =======================
   ⚛️ COMPONENT
======================= */

export const Upload = ({ setOpen }) => {
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
  const [imgPorc, setImgPorc] = useState(0);
  const [videoPorc, setVideoPorc] = useState(0);
  const [imgComplete, setImgComplete] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [imgData, setImgData] = useState(null);
  const [videoData, setVideoData] = useState(null);

  const isUploading =
    (imgPorc > 0 && imgPorc < 100) || (videoPorc > 0 && videoPorc < 100);

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
      setError(t("onlyJpgPngWebp"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("imageMax10Mb"));
      return;
    }
    setError(null);
    setImg(file);
    setImgComplete(false);
    setImgPorc(0);
    setPreviewImg(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/video\/(mp4|webm|x-matroska)/)) {
      setError(t("onlyMp4WebmMkv"));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError(t("videoMax500Mb"));
      return;
    }
    setError(null);
    setVideo(file);
    setVideoComplete(false);
    setVideoPorc(0);
    setPreviewVideo(URL.createObjectURL(file));
  };

  // Subir imagen directo a B2 al seleccionarla
  useEffect(() => {
    if (!img || imgComplete) return;
    uploadToB2(img, (progress) => setImgPorc(progress))
      .then((data) => {
        setImgData(data);
        setInputs((prev) => ({ ...prev, imgUrl: data.publicUrl }));
        setImgComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setImgPorc(0);
      });
  }, [img]);

  // Subir video directo a B2 al seleccionarlo
  useEffect(() => {
    if (!video || videoComplete) return;
    uploadToB2(video, (progress) => setVideoPorc(progress))
      .then((data) => {
        setVideoData(data);
        setInputs((prev) => ({ ...prev, videoUrl: data.publicUrl }));
        setVideoComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setVideoPorc(0);
      });
  }, [video]);

  const handleUpload = async () => {
    if (!imgData || !videoData) {
      setError(t("waitForUpload"));
      return;
    }
    try {
      const res = await axios.post(
        "/videos",
        {
          ...inputs,
          tags,
          imgKey: imgData.fileKey,
          videoKey: videoData.fileKey,
          fileType: "video",
          fileSize: video?.size || 0,
        },
        { withCredentials: true }
      );
      setOpen(false);
      if (res.status === 200) navigate(`/video/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t("errorSaving"));
    }
  };

  return (
    <Container>
      <Modal>
        <Header>
          <Title>{t("uploadVideo")}</Title>
          <Close onClick={() => setOpen(false)}>✕</Close>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        <Section>
          <Label>{t("thumbnailImage")}</Label>
          {previewImg && <PreviewImage src={previewImg} />}
          <UploadBox>
            {imgPorc > 0 && imgPorc < 100 && (
              <ProgressBar value={imgPorc}><div /></ProgressBar>
            )}
            {imgComplete && <CompleteText>✔ {t("imageUploaded")}</CompleteText>}
            {!imgComplete && imgPorc === 0 && t("clickToUploadImage")}
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleImgChange}
              disabled={imgComplete}
            />
          </UploadBox>
        </Section>

        <Section>
          <Label>{t("videoFile")}</Label>
          {previewVideo && <PreviewVideo src={previewVideo} controls />}
          <UploadBox>
            {videoPorc > 0 && videoPorc < 100 && (
              <ProgressBar value={videoPorc}><div /></ProgressBar>
            )}
            {videoComplete && <CompleteText>✔ {t("videoUploaded")}</CompleteText>}
            {!videoComplete && videoPorc === 0 && t("clickToUploadVideo")}
            <input
              type="file"
              accept="video/mp4, video/webm, video/x-matroska"
              onChange={handleVideoChange}
              disabled={videoComplete}
            />
          </UploadBox>
        </Section>

        <Section>
          <Label>{t("title")}</Label>
          <Input
            name="title"
            placeholder={t("videoTitlePlaceholder")}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>{t("description")}</Label>
          <Textarea
            rows={4}
            name="description"
            placeholder={t("descriptionPlaceholder")}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>{t("tags")}</Label>
          <Input placeholder={t("tagsPlaceholder")} onChange={handleTags} />
        </Section>

        <SaveButton
          disabled={isUploading || !imgComplete || !videoComplete}
          onClick={handleUpload}
        >
          {isUploading
            ? t("uploading")
            : !imgComplete || !videoComplete
            ? t("wait")
            : t("publish")}
        </SaveButton>
      </Modal>
    </Container>
  );
};

export default Upload;
