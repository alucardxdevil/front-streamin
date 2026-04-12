import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/userSlice";
import { uploadToB2 } from "../utils/uploadB2";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 12px;
`;

const Modal = styled.div`
  width: 600px;
  max-width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.bgLighter || "#181818"};
  color: ${({ theme }) => theme.text || "#fff"};
  border-radius: 20px;
  padding: 24px;
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

const Input = styled.input`
  background: ${({ theme }) => theme.bg || "#202020"};
  border: 1px solid ${({ theme, error }) => error ? "#ff5252" : (theme.soft || "#333")};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: ${({ error }) => error ? "#ff5252" : "#3ea6ff"};
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

const SuccessText = styled.div`
  font-size: 13px;
  color: #4caf50;
  padding: 8px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
`;

const Preview = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 12px;
`;

const SaveButton = styled.button`
  margin-top: 8px;
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

const SlugPreview = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  margin-top: 4px;
`;

const ValidationMessage = styled.div`
  font-size: 12px;
  color: ${({ available }) => available ? "#4caf50" : "#ff5252"};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const UploadProfile = ({ setOpen }) => {
  const [img, setImg] = useState(null);
  const [imgBanner, setImgBanner] = useState(null);
  const [imgPorc, setImgPorc] = useState(0);
  const [imgBannerPorc, setImgBannerPorc] = useState(0);
  const [imgComplete, setImgComplete] = useState(false);
  const [imgBannerComplete, setImgBannerComplete] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nameChecking, setNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null);
  const { t } = useLanguage();

  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [imgData, setImgData] = useState(null);
  const [imgBannerData, setImgBannerData] = useState(null);

  const isUploading =
    (imgPorc > 0 && imgPorc < 100) ||
    (imgBannerPorc > 0 && imgBannerPorc < 100);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
    
    // Verificar disponibilidad del nombre cuando cambie
    if (name === 'name' && value.trim()) {
      checkNameAvailability(value.trim());
    } else if (name === 'name' && !value.trim()) {
      setNameAvailable(null);
    }
  };

  const checkNameAvailability = async (name) => {
    if (!name || name === currentUser?.name) {
      setNameAvailable(null);
      return;
    }
    
    setNameChecking(true);
    try {
      // Intentar actualizar con el nuevo nombre para verificar si está disponible
      // El backend retornará error 400 si el nombre ya existe
      await axios.put(`/users/${currentUser._id}`, { name }, {
        withCredentials: true,
        validateStatus: (status) => status < 500 // Aceptar 400 como respuesta válida
      }).then(res => {
        if (res.status === 200) {
          setNameAvailable(true);
        } else if (res.status === 400 && res.data?.message?.includes('taken')) {
          setNameAvailable(false);
        } else {
          setNameAvailable(null);
        }
      });
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('taken')) {
        setNameAvailable(false);
      } else {
        setNameAvailable(null);
      }
    } finally {
      setNameChecking(false);
    }
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setError(t("onlyJpgPngWebp"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("max5Mb"));
      return;
    }
    setError(null);
    setImg(file);
    setImgComplete(false);
    setImgPorc(0);
    setPreviewImg(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setError(t("onlyJpgPngWebp"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("max10Mb"));
      return;
    }
    setError(null);
    setImgBanner(file);
    setImgBannerComplete(false);
    setImgBannerPorc(0);
    setPreviewBanner(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!img || imgComplete) return;
    uploadToB2(img, (p) => setImgPorc(p))
      .then((data) => {
        setImgData(data);
        setInputs((prev) => ({ ...prev, img: data.publicUrl }));
        setImgComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setImgPorc(0);
      });
  }, [img]);

  useEffect(() => {
    if (!imgBanner || imgBannerComplete) return;
    uploadToB2(imgBanner, (p) => setImgBannerPorc(p))
      .then((data) => {
        setImgBannerData(data);
        setInputs((prev) => ({ ...prev, imgBanner: data.publicUrl }));
        setImgBannerComplete(true);
      })
      .catch((err) => {
        setError(err.message);
        setImgBannerPorc(0);
      });
  }, [imgBanner]);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleUpload = async () => {
    try {
      // Si hay un nombre nuevo, verificar disponibilidad primero
      if (inputs.name && inputs.name.trim()) {
        if (inputs.name.trim() !== currentUser?.name) {
          // Verificar que el nombre esté disponible
          setNameChecking(true);
          try {
            const checkRes = await axios.put(`/users/${currentUser._id}`, { name: inputs.name.trim() }, {
              withCredentials: true,
              validateStatus: () => true
            });
            
            if (checkRes.status === 400 && checkRes.data?.message?.includes('taken')) {
              setError(t("usernameTaken") || "This username is already taken");
              setNameChecking(false);
              return;
            }
          } catch (checkErr) {
            if (checkErr.response?.status === 400 && checkErr.response?.data?.message?.includes('taken')) {
              setError(t("usernameTaken") || "This username is already taken");
              setNameChecking(false);
              return;
            }
          }
          setNameChecking(false);
        }
      }
      
      const res = await axios.put(`/users/${currentUser._id}`, inputs, {
        withCredentials: true,
      });
      
      if (res.status === 200) {
        // Actualizar el usuario en Redux con los nuevos datos
        dispatch(loginSuccess(res.data));
        setSuccess(t("profileUpdated") || "Profile updated successfully!");
        
        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          setOpen(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("errorSaving"));
    }
  };

  const newSlug = inputs.name ? generateSlug(inputs.name) : (currentUser?.slug || '');
  const hasChanges = inputs.name || inputs.descriptionAccount || inputs.img || inputs.imgBanner;

  return (
    <Container>
      <Modal>
        <Header>
          <Title>{t("editProfile")}</Title>
          <Close onClick={() => setOpen(false)}>✕</Close>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}

        <Section>
          <Label>{t("profileImage")}</Label>
          {previewImg && <Preview src={previewImg} />}
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
          <Label>{t("name")}</Label>
          <Input 
            name="name" 
            placeholder={currentUser?.name || t("yourName")} 
            onChange={handleChanges}
            defaultValue={currentUser?.name || ''}
            error={nameAvailable === false}
          />
          {inputs.name && (
            <SlugPreview>
              stream-in.com/@{newSlug}
            </SlugPreview>
          )}
          {nameChecking && (
            <ValidationMessage available={null}>
              {t("checking") || "Checking availability..."}
            </ValidationMessage>
          )}
          {!nameChecking && nameAvailable === true && (
            <ValidationMessage available={true}>
              ✓ {t("usernameAvailable") || "Username available"}
            </ValidationMessage>
          )}
          {!nameChecking && nameAvailable === false && (
            <ValidationMessage available={false}>
              ✕ {t("usernameTaken") || "Username already taken"}
            </ValidationMessage>
          )}
        </Section>

        <Section>
          <Label>{t("description")}</Label>
          <Textarea
            rows={4}
            name="descriptionAccount"
            placeholder={t("aboutYou")}
            onChange={handleChanges}
            defaultValue={currentUser?.descriptionAccount || ''}
          />
        </Section>

        <Section>
          <Label>{t("banner")}</Label>
          {previewBanner && <Preview src={previewBanner} />}
          <UploadBox>
            {imgBannerPorc > 0 && imgBannerPorc < 100 && (
              <ProgressBar value={imgBannerPorc}><div /></ProgressBar>
            )}
            {imgBannerComplete && <CompleteText>✔ {t("bannerUploaded")}</CompleteText>}
            {!imgBannerComplete && imgBannerPorc === 0 && t("clickToUploadBanner")}
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleBannerChange}
              disabled={imgBannerComplete}
            />
          </UploadBox>
        </Section>

        <SaveButton 
          disabled={isUploading || nameChecking || nameAvailable === false} 
          onClick={handleUpload}
        >
          {isUploading ? t("uploading") : t("save")}
        </SaveButton>
      </Modal>
    </Container>
  );
};

export default UploadProfile;
