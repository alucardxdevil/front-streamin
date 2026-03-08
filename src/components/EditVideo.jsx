import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaVideo } from "react-icons/fa";
import { uploadToB2 } from "../utils/uploadB2";

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
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

const CurrentVideo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.bg || "#202020"};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
`;

const VideoIcon = styled.div`
  font-size: 32px;
  color: ${({ theme }) => theme.accent || "#3ea6ff"};
`;

const VideoInfo = styled.div`
  flex: 1;
`;

const VideoTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  margin: 0;
`;

const VideoDuration = styled.span`
  font-size: 12px;
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

  input {
    display: none;
  }
`;

const VideoUploadBox = styled.label`
  border: 2px dashed ${({ theme }) => theme.soft || "#444"};
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  background: ${({ theme }) => theme.bg || "#202020"};

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
  }
`;

const VideoProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.soft || "#333"};
  border-radius: 6px;
  overflow: hidden;

  div {
    height: 100%;
    width: ${({ value }) => value}%;
    background: linear-gradient(90deg, #ff3e6c, #ff6b8a);
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

export const EditVideo = ({ setOpen, videoId }) => {
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
  const [imgPorc, setImgPorc] = useState(0);
  const [videoPorc, setVideoPorc] = useState(0);
  const [imgComplete, setImgComplete] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const res = await axios.get(`/videos/find/${videoId}`);
        setOriginalData(res.data);
        setInputs({
          title: res.data.title,
          description: res.data.description,
          imgUrl: res.data.imgUrl,
          videoUrl: res.data.videoUrl,
          imgKey: res.data.imgKey,
          videoKey: res.data.videoKey,
        });
        setTags(res.data.tags || []);
        setPreviewImg(res.data.imgUrl);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [videoId]);

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
      setError("Solo JPG, PNG, WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Máximo 10 MB");
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
      setError("Solo MP4, WebM, MKV");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Máximo 500 MB");
      return;
    }
    setError(null);
    setVideo(file);
    setVideoComplete(false);
    setVideoPorc(0);
  };

  useEffect(() => {
    if (!img || imgComplete) return;
    uploadToB2(img, (p) => setImgPorc(p))
      .then((data) => {
        setInputs((prev) => ({ ...prev, imgUrl: data.publicUrl, imgKey: data.fileKey }));
        setImgComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setImgPorc(0);
      });
  }, [img]);

  useEffect(() => {
    if (!video || videoComplete) return;
    uploadToB2(video, (p) => setVideoPorc(p))
      .then((data) => {
        setInputs((prev) => ({ ...prev, videoUrl: data.publicUrl, videoKey: data.fileKey }));
        setVideoComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setVideoPorc(0);
      });
  }, [video]);

  const isUploading =
    (imgPorc > 0 && imgPorc < 100) || (videoPorc > 0 && videoPorc < 100);

  const handleSave = async () => {
    try {
      const res = await axios.put(`/videos/${videoId}`, { ...inputs, tags }, {
        withCredentials: true,
      });
      setOpen(false);
      if (res.status === 200) navigate(0);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  if (loading) {
    return (
      <Container>
        <Modal>
          <div style={{ textAlign: "center", padding: "40px" }}>Cargando...</div>
        </Modal>
      </Container>
    );
  }

  return (
    <Container>
      <Modal>
        <Header>
          <Title>Editar video</Title>
          <Close onClick={() => setOpen(false)}>✕</Close>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        <Section>
          <Label>Video actual</Label>
          <CurrentVideo>
            <VideoIcon><FaVideo /></VideoIcon>
            <VideoInfo>
              <VideoTitle>{inputs.title || "Sin título"}</VideoTitle>
              {originalData?.duration && (
                <VideoDuration>
                  Duración:{" "}
                  {Math.floor(originalData.duration / 60)}:
                  {String(originalData.duration % 60).padStart(2, "0")}
                </VideoDuration>
              )}
            </VideoInfo>
          </CurrentVideo>
        </Section>

        <Section>
          <Label>Reemplazar video</Label>
          {videoPorc > 0 && videoPorc < 100 && (
            <VideoProgressBar value={videoPorc}><div /></VideoProgressBar>
          )}
          {videoComplete && <CompleteText>✔ Video cargado</CompleteText>}
          {!videoComplete && videoPorc === 0 && (
            <VideoUploadBox>
              <FaCloudUploadAlt style={{ fontSize: "32px", marginBottom: "8px" }} />
              <div>Click para seleccionar video</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>MP4, WebM, MKV</div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/x-matroska"
                onChange={handleVideoChange}
                disabled={videoComplete}
              />
            </VideoUploadBox>
          )}
        </Section>

        <Section>
          <Label>Miniatura</Label>
          {previewImg && <PreviewImage src={previewImg} />}
          {imgPorc > 0 && imgPorc < 100 && (
            <ProgressBar value={imgPorc}><div /></ProgressBar>
          )}
          {imgComplete && <CompleteText>✔ Imagen cargada</CompleteText>}
          {!imgComplete && imgPorc === 0 && (
            <UploadBox>
              Click para cambiar imagen
              <input
                type="file"
                accept="image/jpeg, image/jpg, image/png, image/webp"
                onChange={handleImgChange}
                disabled={imgComplete}
              />
            </UploadBox>
          )}
        </Section>

        <Section>
          <Label>Título</Label>
          <Input
            name="title"
            placeholder="Título"
            value={inputs.title || ""}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Descripción</Label>
          <Textarea
            rows={4}
            name="description"
            placeholder="Descripción"
            value={inputs.description || ""}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Etiquetas</Label>
          <Input
            placeholder="música, tutorial"
            value={tags.join(", ")}
            onChange={handleTags}
          />
        </Section>

        <SaveButton disabled={isUploading} onClick={handleSave}>
          {isUploading ? "Guardando..." : "Guardar"}
        </SaveButton>
      </Modal>
    </Container>
  );
};

export default EditVideo;
