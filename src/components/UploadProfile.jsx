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
import { useSelector } from "react-redux";

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

/* =======================
   ⚛️ COMPONENT
======================= */

export const UploadProfile = ({ setOpen }) => {
  const [img, setImg] = useState(null);
  const [imgBanner, setImgBanner] = useState(null);
  const [imgPorc, setImgPorc] = useState(0);
  const [imgBannerPorc, setImgBannerPorc] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [inputs, setInputs] = useState({});

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const isUploading =
    (imgPorc > 0 && imgPorc < 100) ||
    (imgBannerPorc > 0 && imgBannerPorc < 100);

  const handleChanges = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        type === "img"
          ? setImgPorc(Math.round(progress))
          : setImgBannerPorc(Math.round(progress));
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
    img && uploadFile(img, "img");
  }, [img]);

  useEffect(() => {
    imgBanner && uploadFile(imgBanner, "imgBanner");
  }, [imgBanner]);

  const handleUpload = async () => {
    const res = await axios.put(`/users/${currentUser._id}`, inputs);
    setOpen(false);
    res.status === 200 && navigate("/signin");
  };

  return (
    <Container>
      <Modal>
        <Header>
          <Title>Edit profile</Title>
          <Close onClick={() => setOpen(false)}>✕</Close>
        </Header>

        <Section>
          <Label>Profile image</Label>
          {previewImg && <Preview src={previewImg} />}
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
          <Label>Username</Label>
          <Input
            name="name"
            placeholder="Your public name"
            onChange={handleChanges}
          />
        </Section>

        <Section>
          <Label>Description</Label>
          <Textarea
            rows={4}
            name="descriptionAccount"
            placeholder="Write something about you…"
            onChange={handleChanges}
          />
        </Section>

        <Section>
          <Label>Banner image</Label>
          {previewBanner && <Preview src={previewBanner} />}
          <UploadBox>
            {imgBannerPorc > 0 && imgBannerPorc < 100 && (
              <ProgressBar value={imgBannerPorc}>
                <div />
              </ProgressBar>
            )}
            {imgBannerPorc === 100 && <CompleteText>✔ Complete</CompleteText>}
            {imgBannerPorc === 0 && "Click to upload banner (JPG, PNG)"}
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && !file.type.match(/image\/(jpeg|png)/)) {
                  alert("Solo se permiten archivos JPG y PNG");
                  return;
                }
                setImgBanner(file);
                setPreviewBanner(URL.createObjectURL(file));
              }}
            />
          </UploadBox>
        </Section>

        <SaveButton disabled={isUploading} onClick={handleUpload}>
          {isUploading ? "Uploading..." : "Save changes"}
        </SaveButton>
      </Modal>
    </Container>
  );
};

// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import {
//   getStorage,
//   ref,
//   uploadBytesResumable,
//   getDownloadURL,
// } from "firebase/storage";
// import app from "../firebase";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// /* =======================
//    🎨 STYLED COMPONENTS
// ======================= */

// const Container = styled.div`
//   position: fixed;
//   inset: 0;
//   background: rgba(0, 0, 0, 0.65);
//   backdrop-filter: blur(6px);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 200;
// `;

// const Modal = styled.div`
//   width: 600px;
//   max-height: 90vh;
//   background: ${({ theme }) => theme.bgLighter || "#181818"};
//   color: ${({ theme }) => theme.text || "#fff"};
//   border-radius: 20px;
//   padding: 28px;
//   display: flex;
//   flex-direction: column;
//   gap: 24px;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
//   animation: scaleIn 0.25s ease;

//   @keyframes scaleIn {
//     from {
//       opacity: 0;
//       transform: scale(0.95);
//     }
//     to {
//       opacity: 1;
//       transform: scale(1);
//     }
//   }
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const Title = styled.h2`
//   font-size: 22px;
//   font-weight: 600;
// `;

// const Close = styled.button`
//   border: none;
//   background: transparent;
//   color: ${({ theme }) => theme.textSoft || "#aaa"};
//   font-size: 22px;
//   cursor: pointer;

//   &:hover {
//     color: ${({ theme }) => theme.text || "#fff"};
//   }
// `;

// const Section = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 12px;
// `;

// const Label = styled.span`
//   font-size: 14px;
//   font-weight: 500;
//   color: ${({ theme }) => theme.textSoft || "#aaa"};
// `;

// const Input = styled.input`
//   background: ${({ theme }) => theme.bg || "#202020"};
//   border: 1px solid ${({ theme }) => theme.soft || "#333"};
//   border-radius: 12px;
//   padding: 12px;
//   color: ${({ theme }) => theme.text || "#fff"};
//   font-size: 15px;

//   &:focus {
//     outline: none;
//     border-color: ${({ theme }) => theme.text || "#fff"};
//   }
// `;

// const Textarea = styled.textarea`
//   background: ${({ theme }) => theme.bg || "#202020"};
//   border: 1px solid ${({ theme }) => theme.soft || "#333"};
//   border-radius: 12px;
//   padding: 12px;
//   color: ${({ theme }) => theme.text || "#fff"};
//   resize: none;
//   font-size: 15px;

//   &:focus {
//     outline: none;
//     border-color: ${({ theme }) => theme.text || "#fff"};
//   }
// `;

// const UploadBox = styled.label`
//   border: 1px dashed ${({ theme }) => theme.soft || "#444"};
//   border-radius: 14px;
//   padding: 18px;
//   text-align: center;
//   cursor: pointer;
//   transition: border 0.2s ease;
//   color: ${({ theme }) => theme.textSoft || "#aaa"};

//   &:hover {
//     border-color: ${({ theme }) => theme.text || "#fff"};
//     color: ${({ theme }) => theme.text || "#fff"};
//   }

//   input {
//     display: none;
//   }
// `;

// const ProgressBar = styled.div`
//   width: 100%;
//   height: 6px;
//   background: ${({ theme }) => theme.soft || "#333"};
//   border-radius: 6px;
//   overflow: hidden;

//   div {
//     height: 100%;
//     width: ${({ value }) => value}%;
//     background: linear-gradient(90deg, #3ea6ff, #6f6cff);
//     transition: width 0.3s ease;
//   }
// `;

// const SaveButton = styled.button`
//   margin-top: 10px;
//   padding: 14px;
//   border-radius: 14px;
//   border: none;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   background: linear-gradient(135deg, #3ea6ff, #6f6cff);
//   color: #fff;

//   &:hover {
//     opacity: 0.9;
//   }
// `;

// export const UploadProfile = ({ setOpen }) => {
//   const [img, setImg] = useState(null);
//   const [imgBanner, setImgBanner] = useState(null);
//   const [imgPorc, setImgPorc] = useState(0);
//   const [imgBannerPorc, setImgBannerPorc] = useState(0);
//   const [inputs, setInputs] = useState({});

//   const { currentUser } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const handleChanges = (e) => {
//     setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const uploadFile = (file, type) => {
//     const storage = getStorage(app);
//     const fileName = `${Date.now()}_${file.name}`;
//     const storageRef = ref(storage, fileName);
//     const uploadTask = uploadBytesResumable(storageRef, file);

//     uploadTask.on(
//       "state_changed",
//       (snapshot) => {
//         const progress =
//           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

//         type === "img"
//           ? setImgPorc(Math.round(progress))
//           : setImgBannerPorc(Math.round(progress));
//       },
//       (error) => console.error(error),
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//           setInputs((prev) => ({ ...prev, [type]: downloadURL }));
//         });
//       },
//     );
//   };

//   useEffect(() => {
//     img && uploadFile(img, "img");
//   }, [img]);

//   useEffect(() => {
//     imgBanner && uploadFile(imgBanner, "imgBanner");
//   }, [imgBanner]);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     const res = await axios.put(`/users/${currentUser._id}`, inputs);
//     setOpen(false);
//     res.status === 200 && navigate("/signin");
//   };

//   return (
//     <Container>
//       <Modal>
//         <Header>
//           <Title>Editar perfil</Title>
//           <Close onClick={() => setOpen(false)}>✕</Close>
//         </Header>

//         <Section>
//           <Label>Imagen de perfil</Label>
//           <UploadBox>
//             {imgPorc > 0 ? (
//               <ProgressBar value={imgPorc}>
//                 <div />
//               </ProgressBar>
//             ) : (
//               "Haz clic para subir imagen"
//             )}
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setImg(e.target.files[0])}
//             />
//           </UploadBox>
//         </Section>

//         <Section>
//           <Label>Nombre de usuario</Label>
//           <Input
//             name="name"
//             placeholder="Tu nombre público"
//             onChange={handleChanges}
//           />
//         </Section>

//         <Section>
//           <Label>Descripción</Label>
//           <Textarea
//             rows={4}
//             name="descriptionAccount"
//             placeholder="Cuéntanos algo sobre ti…"
//             onChange={handleChanges}
//           />
//         </Section>

//         <Section>
//           <Label>Banner</Label>
//           <UploadBox>
//             {imgBannerPorc > 0 ? (
//               <ProgressBar value={imgBannerPorc}>
//                 <div />
//               </ProgressBar>
//             ) : (
//               "Haz clic para subir banner"
//             )}
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setImgBanner(e.target.files[0])}
//             />
//           </UploadBox>
//         </Section>

//         <SaveButton onClick={handleUpload}>Guardar cambios</SaveButton>
//       </Modal>
//     </Container>
//   );
// };

// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import {
//   getStorage,
//   ref,
//   uploadBytesResumable,
//   getDownloadURL,
// } from "firebase/storage";
// import app from "../firebase";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const Container = styled.div`
//   width: 100%;
//   height: 100%;
//   position: fixed;
//   inset: 0;
//   background-color: rgba(0, 0, 0, 0.6);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 100;
// `;

// const Wrapper = styled.div`
//   width: 550px;
//   background: ${({ theme }) => theme.bgLighter || "rgba(30,30,30,0.9)"};
//   color: ${({ theme }) => theme.text || "#fff"};
//   padding: 28px;
//   display: flex;
//   flex-direction: column;
//   gap: 18px;
//   border-radius: 16px;
//   backdrop-filter: blur(12px);
//   box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.35);
//   position: relative;
//   animation: fadeIn 0.3s ease;

//   @keyframes fadeIn {
//     from {
//       opacity: 0;
//       transform: translateY(15px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
// `;

// const Close = styled.button`
//   position: absolute;
//   top: 14px;
//   right: 14px;
//   cursor: pointer;
//   background: transparent;
//   color: ${({ theme }) => theme.textSoft || "#aaa"};
//   font-size: 18px;
//   border: none;
//   border-radius: 50%;
//   width: 34px;
//   height: 34px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: background 0.25s ease;

//   &:hover {
//     background: rgba(255, 255, 255, 0.1);
//   }
// `;

// const Title = styled.h2`
//   text-align: center;
//   font-size: 22px;
//   font-weight: 600;
//   margin-bottom: 4px;
// `;

// const Input = styled.input`
//   border: 1px solid ${({ theme }) => theme.soft || "#444"};
//   color: ${({ theme }) => theme.text || "#fff"};
//   border-radius: 10px;
//   padding: 12px;
//   font-size: 15px;
//   background: ${({ theme }) => theme.bg || "rgba(255,255,255,0.05)"};
//   outline: none;
//   transition: border 0.25s ease, background 0.25s ease;

//   &:focus {
//     border: 1px solid ${({ theme }) => theme.text || "#fff"};
//     background: rgba(255, 255, 255, 0.07);
//   }
// `;

// const Description = styled.textarea`
//   border: 1px solid ${({ theme }) => theme.soft || "#444"};
//   color: ${({ theme }) => theme.text || "#fff"};
//   border-radius: 10px;
//   padding: 12px;
//   font-size: 15px;
//   background: ${({ theme }) => theme.bg || "rgba(255,255,255,0.05)"};
//   outline: none;
//   resize: none;
//   transition: border 0.25s ease, background 0.25s ease;

//   &:focus {
//     border: 1px solid ${({ theme }) => theme.text || "#fff"};
//     background: rgba(255, 255, 255, 0.07);
//   }
// `;

// const Button = styled.button`
//   border-radius: 10px;
//   border: none;
//   padding: 12px 20px;
//   font-weight: 500;
//   cursor: pointer;
//   background: ${({ theme }) => theme.soft || "#333"};
//   color: ${({ theme }) => theme.text || "#fff"};
//   font-size: 15px;
//   transition: background 0.25s ease, transform 0.25s ease;

//   &:hover {
//     background: ${({ theme }) => theme.textSoft || "#555"};
//     transform: translateY(-2px);
//   }
// `;

// const Label = styled.label`
//   font-size: 14px;
//   font-weight: 500;
//   color: ${({ theme }) => theme.textSoft || "#aaa"};
// `;

// export const UploadProfile = ({ setOpen }) => {
//   const [img, setImg] = useState(undefined);
//   const [imgBanner, setImgBanner] = useState(undefined);
//   const [imgPorc, setImgPorc] = useState(0);
//   const [imgBannerPorc, setImgBannerPorc] = useState(0);
//   const [inputs, setInputs] = useState({});
//   const { currentUser } = useSelector((state) => state.user);

//   const navigate = useNavigate();

//   const handleChanges = (e) => {
//     setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const uploadFile = (file, urlType) => {
//     const storage = getStorage(app);
//     const fileName = new Date().getTime() + file.name;
//     const storageRef = ref(storage, fileName);
//     const uploadTask = uploadBytesResumable(storageRef, file);

//     uploadTask.on(
//       "state_changed",
//       (snapshot) => {
//         const progress =
//           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         urlType === "img"
//           ? setImgPorc(Math.round(progress))
//           : setImgBannerPorc(Math.round(progress));
//       },
//       (error) => console.error(error),
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//           setInputs((prev) => ({ ...prev, [urlType]: downloadURL }));
//         });
//       }
//     );
//   };

//   useEffect(() => {
//     img && uploadFile(img, "img");
//   }, [img]);

//   useEffect(() => {
//     imgBanner && uploadFile(imgBanner, "imgBanner");
//   }, [imgBanner]);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     const res = await axios.put(`/users/${currentUser._id}`, { ...inputs });
//     setOpen(false);
//     res.status === 200 && navigate(`/signin`);
//   };

//   return (
//     <Container>
//       <Wrapper>
//         <Close onClick={() => setOpen(false)}>✕</Close>
//         <Title>Update Profile</Title>

//         <Label>Profile Image:</Label>
//         {imgPorc > 0 ? (
//           <span>Uploading: {imgPorc}%</span>
//         ) : (
//           <Input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setImg(e.target.files[0])}
//           />
//         )}

//         <Input
//           type="text"
//           placeholder="Username"
//           name="name"
//           onChange={handleChanges}
//         />

//         <Description
//           placeholder="Write a short description..."
//           name="descriptionAccount"
//           rows={6}
//           onChange={handleChanges}
//         />

//         <Label>Banner Image:</Label>
//         {imgBannerPorc > 0 ? (
//           <span>Uploading: {imgBannerPorc}%</span>
//         ) : (
//           <Input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setImgBanner(e.target.files[0])}
//           />
//         )}

//         <Button onClick={handleUpload}>Save Changes</Button>
//       </Wrapper>
//     </Container>
//   );
// };
