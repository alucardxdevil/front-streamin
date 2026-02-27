import React, { useEffect, useRef, useState } from "react";
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
  transition: border 0.2s ease;
  color: ${({ theme }) => theme.textSoft || "#aaa"};

  &:hover {
    border-color: ${({ theme }) => theme.text || "#fff"};
    color: ${({ theme }) => theme.text || "#fff"};
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
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);

  const navigate = useNavigate();

  const isUploading =
    (imgPorc > 0 && imgPorc < 100) || (videoPorc > 0 && videoPorc < 100);

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
        type === "imgUrl"
          ? setImgPorc(Math.round(progress))
          : setVideoPorc(Math.round(progress));
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
    img && uploadFile(img, "imgUrl");
  }, [img]);

  useEffect(() => {
    video && uploadFile(video, "videoUrl");
  }, [video]);

  const handleUpload = async () => {
    const res = await axios.post("/videos", { ...inputs, tags });
    setOpen(false);
    res.status === 200 && navigate(`/video/${res.data._id}`);
  };

  return (
    <Container>
      <Modal>
        <Header>
          <Title>Upload new video</Title>
          <Close onClick={() => setOpen(false)}>✕</Close>
        </Header>

        <Section>
          <Label>Thumbnail image</Label>
          {previewImg && <PreviewImage src={previewImg} />}
          <UploadBox>
            {imgPorc > 0 && imgPorc < 100 && (
              <ProgressBar value={imgPorc}>
                <div />
              </ProgressBar>
            )}
            {imgPorc === 100 && <CompleteText>✔ Complete</CompleteText>}
            {imgPorc === 0 && "Click to upload image (JPG, PNG)"}
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
                setPreviewImg(URL.createObjectURL(file));
              }}
            />
          </UploadBox>
        </Section>

        <Section>
          <Label>Video file</Label>
          {previewVideo && <PreviewVideo src={previewVideo} controls />}
          <UploadBox>
            {videoPorc > 0 && videoPorc < 100 && (
              <ProgressBar value={videoPorc}>
                <div />
              </ProgressBar>
            )}
            {videoPorc === 100 && <CompleteText>✔ Complete</CompleteText>}
            {videoPorc === 0 && "Click to upload video (MP4)"}
            <input
              type="file"
              accept="video/mp4, video/x-m4v"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && !file.type.match(/video\/(mp4|x-m4v)/)) {
                  alert("Solo se permiten archivos MP4");
                  return;
                }
                setVideo(file);
                setPreviewVideo(URL.createObjectURL(file));
              }}
            />
          </UploadBox>
        </Section>

        <Section>
          <Label>Title</Label>
          <Input
            name="title"
            placeholder="Video title"
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Description</Label>
          <Textarea
            rows={4}
            name="description"
            placeholder="Describe your video..."
            onChange={handleChange}
          />
        </Section>

        <Section>
          <Label>Tags</Label>
          <Input placeholder="music, tutorial, react" onChange={handleTags} />
        </Section>

        <SaveButton disabled={isUploading} onClick={handleUpload}>
          {isUploading ? "Uploading..." : "Publish video"}
        </SaveButton>
      </Modal>
    </Container>
  );
};
export default Upload;