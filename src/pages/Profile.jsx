import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import styled, { keyframes } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaTimes, FaCheck, FaSearchPlus } from "react-icons/fa";
import { UploadProfile } from "../components/UploadProfile";
import axios from "axios";
import defaultProfile from "../img/profileUser.png";
import { useLanguage } from "../utils/LanguageContext";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 0;
  background: ${({ theme }) => theme.bg || "#181818"};
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  @media (min-width: 769px) {
    flex-direction: row;
    min-height: calc(100vh - 60px);
  }
`;

const LeftImageContainer = styled.div`
  flex: 0.5;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    min-height: 250px;
  }

  @media (min-width: 769px) {
    min-height: calc(100vh - 60px);
  }
`;

const LeftImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
  min-height: 200px;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ContentContainer = styled.div`
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  justify-content: flex-start;
  gap: 12px;
  padding: 28px 26px 24px;
  background:
    linear-gradient(165deg, rgba(11, 103, 220, 0.16), rgba(11, 103, 220, 0.03) 45%, rgba(20, 20, 20, 0.88) 100%),
    ${({ theme }) => theme.bgLighter || "rgba(30,30,30,0.85)"};
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin: 16px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.4);
  max-width: 640px;
  width: 100%;
  animation: ${fadeIn} 0.6s ease;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.22);
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    margin: -30px 16px 20px;
    padding: 20px 16px;
    max-height: none;
    overflow-y: visible;
  }
`;

const ProfileImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid rgba(11, 103, 220, 0.9);
  object-fit: cover;
  margin-top: 4px;
  box-shadow:
    0 0 0 5px rgba(11, 103, 220, 0.2),
    0 10px 24px rgba(11, 103, 220, 0.25);
  transition: transform 0.3s ease;
  cursor: zoom-in;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-top: 0;
  }

  &:hover {
    transform: scale(1.04);
  }
`;

const ProfileImageWrapper = styled.button`
  position: relative;
  border: 0;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  cursor: zoom-in;

  &:hover > span {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ProfileImageZoomHint = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 8px 0 4px;
  flex-wrap: wrap;
`;

const CardButton = styled.button`
  background: linear-gradient(135deg, rgba(11, 103, 220, 0.92), rgba(11, 103, 220, 0.72));
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 14px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 8px 20px rgba(11, 103, 220, 0.35);
    background: linear-gradient(135deg, rgba(11, 103, 220, 1), rgba(11, 103, 220, 0.8));
  }
`;

const ChannelDetail = styled.div`
  text-align: center;
  margin-bottom: 6px;
`;

const ChannelName = styled.h1`
  font-weight: 600;
  font-size: 27px;
  margin: 0;
  background: linear-gradient(135deg, #d1d1d1, #999);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 6px 0 2px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    gap: 16px;
    margin: 12px 0;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 10px 16px;
  text-align: center;
  color: ${({ theme }) => theme.text || "#fff"};
  border: 1px solid rgba(255, 255, 255, 0.09);
  min-width: 100px;
  flex: 1;
  max-width: 180px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0px 8px 20px rgba(11, 103, 220, 0.25);
  }

  @media (max-width: 768px) {
    min-width: 80px;
    padding: 10px 14px;
    max-width: 140px;
  }

  @media (max-width: 480px) {
    min-width: 70px;
    padding: 8px 10px;
    max-width: 100px;
  }
`;

const StatNumber = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 2px;
  color: #0b67dc;

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #b0b0b0;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const DescriptionContainer = styled.div`
  max-height: 190px;
  overflow-y: auto;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  background: ${({ theme }) => theme.bg || "rgba(255,255,255,0.04)"};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 16px;
  line-height: 1.7;
  font-weight: 500;
  color: ${({ theme }) => theme.text || "#e6e6e6"};
  box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.25);

  @media (min-width: 1024px) {
    min-height: 230px;
    max-height: 320px;
    font-size: 16px;
    line-height: 1.7;
    padding: 18px;
  }

  @media (max-width: 480px) {
    width: 100%;
    font-size: 15px;
  }
`;

const SocialLinksContainer = styled.div`
  width: 100%;
  margin: 2px auto 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px;
  }
`;

const SocialTitle = styled.h3`
  font-size: 16px;
  color: ${({ theme }) => theme.text || "#fff"};
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const SocialLinksRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 20px;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  ${({ platform }) => {
    switch (platform) {
      case 'twitter':
        return `&:hover { background: #1DA1F2; color: #fff; }`;
      case 'instagram':
        return `&:hover { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: #fff; }`;
      case 'facebook':
        return `&:hover { background: #4267B2; color: #fff; }`;
      case 'website':
        return `&:hover { background: #00c2ff; color: #fff; }`;
      default:
        return '';
    }
  }}
`;

const EditSocialButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.text || "#fff"};
  }
`;

const SocialEditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const SocialInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #00c2ff;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SocialButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const SaveButton = styled.button`
  background: #00c2ff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #00a3cc;
    transform: translateY(-2px);
  }
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 20px;
  transition: background 0.25s ease, transform 0.25s ease;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    position: relative;
    right: auto;
    top: auto;
    margin-top: 16px;
    width: 100%;
    justify-content: center;
  }
`;

const DangerZone = styled.div`
  width: 85%;
  margin: 18px auto 0;
  padding: 14px;
  border-radius: 12px;
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.25);
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const DangerTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const DangerText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: ${({ theme }) => theme.textSoft || "#bbb"};
`;

const DeleteAccountButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e74c3c;
  background: transparent;
  color: #e74c3c;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;

  &:hover {
    background: rgba(231, 76, 60, 0.12);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.bgLighter || "#111"};
  color: ${({ theme }) => theme.text || "#fff"};
  padding: 24px;
  border-radius: 12px;
  width: 360px;
  max-width: calc(100vw - 32px);
  text-align: center;
  box-shadow: 0px 12px 28px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px 0;
`;

const ModalText = styled.p`
  margin: 0 0 18px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft || "#ccc"};
  line-height: 1.45;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: ${({ theme }) => theme.text || "#fff"};
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalDangerButton = styled(ModalButton)`
  border-color: rgba(231, 76, 60, 0.65);
  color: #e74c3c;

  &:hover {
    background: rgba(231, 76, 60, 0.12);
  }
`;

const EmptySocialText = styled.p`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 14px;
  text-align: center;
  margin: 0;
`;

const PreviewProfileImage = styled.img`
  width: min(70vw, 460px);
  max-height: 78vh;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
`;

export const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [totalViews, setTotalViews] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [editingSocial, setEditingSocial] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser?.slug) return;

      try {
        // Update total views
        await axios.put(`/users/${currentUser.slug}/update-total-views`);
        
        // Get total views
        const viewsRes = await axios.get(`/users/${currentUser.slug}/total-views`);
        setTotalViews(viewsRes.data.totalViews || 0);

        // Get video count
        try {
          const videosRes = await axios.get(`/videos/second/${currentUser.slug}`);
          setVideoCount(videosRes.data?.length || 0);
        } catch (err) {
          console.log("No videos found for user");
          setVideoCount(0);
        }

        // Get social links from user data
        if (socialLinks) {
          setSocialLinks({
            twitter: currentUser.socialLinks.twitter || "",
            instagram: currentUser.socialLinks.instagram || "",
            facebook: currentUser.socialLinks.facebook || "",
            website: currentUser.socialLinks.website || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, [currentUser?.slug]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?._id) return;
    setDeleteAccountError("");
    setIsDeletingAccount(true);

    try {
      await axios.delete(`/users/${currentUser._id}`);
      try {
        await axios.post("/auth/logout");
      } catch (e) {
        // ignore logout failure after account deletion
      }
      dispatch(logout());
      setShowDeleteModal(false);
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteAccountError(error?.response?.data?.message || "Error");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSocialLinks = async () => {
    try {
      await axios.put(`/users/${currentUser._id}`, {
        socialLinks: {
          twitter: socialLinks.twitter,
          instagram: socialLinks.instagram,
          facebook: socialLinks.facebook,
          website: socialLinks.website
        }
      });
      setEditingSocial(false);
      // Refresh user data would require a Redux update or re-fetch
    } catch (error) {
      console.error("Error saving social links:", error);
    }
  };

  const hasSocialLinks = socialLinks.twitter || socialLinks.instagram || socialLinks.facebook || socialLinks.website;

  // Helper function to normalize URL - adds https:// if missing
  const normalizeUrl = (url) => {
    if (!url) return "";
    // If already has http:// or https://, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Add https:// for any other URL
    return `https://${url}`;
  };

  const leftImageUrl = currentUser?.imgBanner;
  const numFoll = currentUser?.followsProfile.length;

  return (
    <>
      <Container>
        <LeftImageContainer>
          <LeftImage
            src={
              leftImageUrl ||
              "https://f005.backblazeb2.com/file/streamin-videos/uploads/6958ed67bb26d62f7607e915/1775388233418-50c092e0-068d-40bd-bfcf-f3b3df9c960b.webp"
            }
            alt="Left Image"
          />
        </LeftImageContainer>

        <ContentContainer>
          <ProfileImageWrapper onClick={() => setShowProfilePreview(true)} aria-label="Preview profile image">
            <ProfileImage
              src={currentUser?.img || defaultProfile}
              alt="Profile"
            />
            <ProfileImageZoomHint>
              <FaSearchPlus />
            </ProfileImageZoomHint>
          </ProfileImageWrapper>
          <ButtonContainer>
            <CardButton onClick={() => setOpen(true)}>
              {t("change")} <FaPencilAlt size={14} />
            </CardButton>
            <Link to={"/myvideos"}>
              <CardButton>{t("filmLibrary")}</CardButton>
            </Link>
            <Link to={`/history/${currentUser?._id}`}>
              <CardButton>{t("playlist")}</CardButton>
            </Link>
          </ButtonContainer>

          <ChannelDetail>
            <ChannelName>{currentUser?.name}</ChannelName>
          </ChannelDetail>

          <StatsContainer>
            <StatCard>
              <StatNumber>{currentUser?.follows?.toLocaleString() || 0}</StatNumber>
              <StatLabel>{t("followers")}</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{totalViews?.toLocaleString() || 0}</StatNumber>
              <StatLabel>{t("views")}</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{videoCount > 0 ? videoCount.toLocaleString() : t("noVideos")}</StatNumber>
              <StatLabel>{videoCount === 1 ? t("video") : t("videos")}</StatLabel>
            </StatCard>
          </StatsContainer>

          <DescriptionContainer>
            {currentUser?.descriptionAccount}
          </DescriptionContainer>

          <SocialLinksContainer>
            <SocialTitle>{t("socialNetworks")}</SocialTitle>
            
            {editingSocial ? (
              <SocialEditForm>
                <SocialInput
                  type="text"
                  name="twitter"
                  placeholder={t("twitterUrl")}
                  value={socialLinks.twitter}
                  onChange={handleSocialLinkChange}
                />
                <SocialInput
                  type="text"
                  name="instagram"
                  placeholder={t("instagramUrl")}
                  value={socialLinks.instagram}
                  onChange={handleSocialLinkChange}
                />
                <SocialInput
                  type="text"
                  name="facebook"
                  placeholder={t("facebookUrl")}
                  value={socialLinks.facebook}
                  onChange={handleSocialLinkChange}
                />
                <SocialInput
                  type="text"
                  name="website"
                  placeholder={t("websiteUrl")}
                  value={socialLinks.website}
                  onChange={handleSocialLinkChange}
                />
                <SocialButtonsRow>
                  <CancelButton onClick={() => setEditingSocial(false)}>
                    <FaTimes style={{ marginRight: "4px" }} /> {t("cancel")}
                  </CancelButton>
                  <SaveButton onClick={handleSaveSocialLinks}>
                    <FaCheck style={{ marginRight: "4px" }} /> {t("save")}
                  </SaveButton>
                </SocialButtonsRow>
              </SocialEditForm>
            ) : (
              <>
                {hasSocialLinks ? (
                  <SocialLinksRow>
                    {socialLinks.twitter && (
                      <SocialLink href={normalizeUrl(socialLinks.twitter)} target="_blank" platform="twitter" title="Twitter">
                        <FaTwitter />
                      </SocialLink>
                    )}
                    {socialLinks.instagram && (
                      <SocialLink href={normalizeUrl(socialLinks.instagram)} target="_blank" platform="instagram" title="Instagram">
                        <FaInstagram />
                      </SocialLink>
                    )}
                    {socialLinks.facebook && (
                      <SocialLink href={normalizeUrl(socialLinks.facebook)} target="_blank" platform="facebook" title="Facebook">
                        <FaFacebook />
                      </SocialLink>
                    )}
                    {socialLinks.website && (
                      <SocialLink href={normalizeUrl(socialLinks.website)} target="_blank" platform="website" title="Website">
                        <FaGlobe />
                      </SocialLink>
                    )}
                  </SocialLinksRow>
                ) : (
                  <EmptySocialText>{t("noSocialNetworks")}</EmptySocialText>
                )}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                  <EditSocialButton onClick={() => setEditingSocial(true)}>
                    <FaPencilAlt size={12} /> {hasSocialLinks ? t("edit") : t("add")}
                  </EditSocialButton>
                </div>
              </>
            )}
          </SocialLinksContainer>

          <DangerZone>
            <DangerTitle>{t("deleteAccount")}</DangerTitle>
            <DangerText>{t("deleteAccountDesc")}</DangerText>
            <DeleteAccountButton onClick={() => setShowDeleteModal(true)} disabled={isDeletingAccount}>
              {t("deleteAccount")}
            </DeleteAccountButton>
          </DangerZone>

          <LogoutButton onClick={handleLogout}>{t("closeSession")}</LogoutButton>
        </ContentContainer>
      </Container>

      {open && <UploadProfile setOpen={setOpen} />}

      {showProfilePreview && (
        <Backdrop onClick={() => setShowProfilePreview(false)}>
          <PreviewProfileImage
            src={currentUser?.img || defaultProfile}
            alt="Profile Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </Backdrop>
      )}

      {showDeleteModal && (
        <Backdrop onClick={() => (isDeletingAccount ? null : setShowDeleteModal(false))}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{t("deleteConfirm")}</ModalTitle>
            <ModalText>
              {t("deleteConfirmDesc")}
              <br />
              <br />
              {t("deleteAccountDesc")}
            </ModalText>

            {deleteAccountError ? (
              <ModalText style={{ color: "#e74c3c", marginTop: "-6px" }}>{deleteAccountError}</ModalText>
            ) : null}

            <ModalButtons>
              <ModalButton onClick={() => setShowDeleteModal(false)} disabled={isDeletingAccount}>
                {t("cancel")}
              </ModalButton>
              <ModalDangerButton onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                {isDeletingAccount ? t("deletingAccount") : t("delete")}
              </ModalDangerButton>
            </ModalButtons>
          </ModalBox>
        </Backdrop>
      )}
    </>
  );
};
