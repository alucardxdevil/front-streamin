import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaVideo } from "react-icons/fa";

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
  animation: scaleIn 0.25s ease;

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
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

  &:hover {
    color: ${({ theme }) => theme.text || "#fff"};
  }
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
  color: ${({ theme }) => theme.text || "#fff"};
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

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.text || "#fff"};
  }
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
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.textSoft || "#aaa"};

  &:hover {
    border-color: ${({ theme }) => theme.accent || "#3ea6ff"};
    color: ${({ theme }) => theme.accent || "#3ea6ff"};
    background: rgba(62, 166, 255, 0.1);
  }

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
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  background: ${({ theme }) => theme.bg || "#202020"};

  &:hover {
    border-color: ${({ theme }) => theme.accent || "#ff3e6c"};
    color: ${({ theme }) => theme.accent || "#ff3e6c"};
    background: rgba(255, 62, 108, 0.1);
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
    transition: width 0.3s ease;
  }
`;

const CompleteText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
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
  const [previewImg, setPreviewImg] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

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
        });
        setTags(res.data.tags || []);
        setPreviewImg(res.data.imgUrl);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando video:", err);
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

  const uploadFile = (file, type) => {
    const storage = getStorage(app);
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (type === "videoUrl") {
          setVideoPorc(Math.round(progress));
        } else {
          setImgPorc(Math.round(progress));
        }
      },
      console.error,
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setInputs((prev) => ({ ...prev, [type]: url }));
        });
      },
    );
  };

  useEffect(() => {
    if (img) {
      uploadFile(img, "imgUrl");
      setPreviewImg(URL.createObjectURL(img));
    }
  }, [img]);

  useEffect(() => {
    if (video) {
      uploadFile(video, "videoUrl");
    }
  }, [video]);

  const isUploading = (imgPorc > 0 && imgPorc < 100) || (videoPorc > 0 && videoPorc < 100);

  const handleSave = async () => {
    try {
      const res = await axios.put(`/videos/${videoId}`, { ...inputs, tags });
      setOpen(false);
      if (res.status === 200) {
        navigate(0);
      }
    } catch (err) {
      console.error("Error guardando video:", err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Modal>
          <div style={{ textAlign: "center", padding: "40px" }}>
            Cargando...
          </div>
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

        {/* Video actual */}
        <Section>
          <Label>Video actual</Label>
          <CurrentVideo>
            <VideoIcon>
              <FaVideo />
            </VideoIcon>
            <VideoInfo>
              <VideoTitle>{inputs.title || "Video sin título"}</VideoTitle>
              {originalData?.duration && (
                <VideoDuration>
                  Duración: {Math.floor(originalData.duration / 60)}:{String(originalData.duration % 60).padStart(2, '0')}
                </VideoDuration>
              )}
            </VideoInfo>
          </CurrentVideo>
        </Section>

        {/* Cambiar video */}
        <Section>
          <Label>Reemplazar video</Label>
          {videoPorc > 0 && videoPorc < 100 && (
            <VideoProgressBar value={videoPorc}>
              <div />
            </VideoProgressBar>
          )}
          {videoPorc === 100 && <CompleteText>✔ Video cargado completamente</CompleteText>}
          {videoPorc === 0 && (
            <VideoUploadBox>
              <FaCloudUploadAlt style={{ fontSize: "32px", marginBottom: "8px" }} />
              <div>Click para seleccionar un nuevo video</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Formatos soportados: MP4, WebM, MKV
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/x-matroska"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setVideo(file);
                  }
                }}
              />
            </VideoUploadBox>
          )}
        </Section>

        {/* Thumbnail */}
        <Section>
          <Label>Miniatura (imagen)</Label>
          {previewImg && <PreviewImage src={previewImg} />}
          {imgPorc > 0 && imgPorc < 100 && (
            <ProgressBar value={imgPorc}>
              <div />
            </ProgressBar>
          )}
          {imgPorc === 100 && <CompleteText>✔ Imagen cargada completamente</CompleteText>}
          {imgPorc === 0 && (
            <UploadBox>
              Click para cambiar imagen (JPG, PNG)
              <input
                type="file"
                accept="image/jpeg, image/jpg, image/png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && !file.type.match(/image\/(jpeg|png)/)) {
                    alert("Solo se permiten archivos JPG y PNG");
                    return;
                  }
                  setImg(file);
                }}
              />
            </UploadBox>
          )}
        </Section>

        <Section>
          <Label>Título</Label>
          <Input
            name="title"
            placeholder="Título del video"
            value={inputs.title || ""}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Descripción</Label>
          <Textarea
            rows={4}
            name="description"
            placeholder="Describe tu video..."
            value={inputs.description || ""}
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Etiquetas (tags)</Label>
          <Input
            placeholder="música, tutorial, react"
            value={tags.join(", ")}
            onChange={handleTags}
          />
        </Section>

        <SaveButton disabled={isUploading} onClick={handleSave}>
          {isUploading ? "Guardando..." : "Guardar cambios"}
        </SaveButton>
      </Modal>
    </Container>
  );
};

export default EditVideo;
