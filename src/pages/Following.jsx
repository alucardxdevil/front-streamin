import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BiArrowBack, BiUser } from "react-icons/bi";
import { FaUsers, FaUserFriends } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLanguage } from "../utils/LanguageContext";

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Contenedor principal
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bg};
  min-height: 100vh;
  padding-top: 80px;
  
  @media (max-width: 768px) {
    padding: 10px;
    padding-top: 70px;
  }
`;

// Header con gradiente
const HeaderSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(11, 103, 220, 0.1), 
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;

  svg {
    font-size: 40px;
    color: #0b67dc;
    -webkit-text-fill-color: initial;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    svg {
      font-size: 28px;
    }
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSoft};
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
  
  svg {
    color: #0b67dc;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  background: ${({ primary, theme }) => primary 
    ? 'linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)'
    : theme.soft};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(11, 103, 220, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

// Grid de usuarios
const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjeta de usuario
const UserCard = styled.div`
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${({ index }) => index * 0.05}s;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(11, 103, 220, 0.2);
  }
`;

const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
`;

const Banner = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${UserCard}:hover & {
    transform: scale(1.1);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: -40px auto 0;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.bg};
  overflow: hidden;
  background: ${({ theme }) => theme.soft};
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  
  svg {
    font-size: 36px;
    color: white;
  }
`;

const UserInfo = styled.div`
  padding: 16px;
  text-align: center;
`;

const UserName = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const UserStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 12px;
`;

const UserDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const FollowButton = styled.button`
  background: ${({ following, theme }) => following 
    ? theme.soft 
    : 'linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(11, 103, 220, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};
  
  svg {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.text};
  }
  
  p {
    font-size: 14px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: ${({ theme }) => theme.text};
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid ${({ theme }) => theme.soft};
    border-top-color: #0b67dc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  p {
    margin-top: 20px;
    font-size: 16px;
    color: ${({ theme }) => theme.textSoft};
  }
`;

const Following = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const res = await axios.get(`/users/following/${currentUser._id}`, {
          headers: { Authorization: `Bearer ${currentUser.accessToken}` }
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching following users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [currentUser]);

  const handleUserClick = (user) => {
    navigate(`/profileUser/${user.slug || user._id}`);
  };

  const handleUnfollow = async (e, userId) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      await axios.put(`/users/unfol/${userId}`, {}, {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` }
      });
      
      // Actualizar la lista removiendo el usuario
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner" />
          <p>{t("loadingProfiles")}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!currentUser) {
    return (
      <PageContainer>
        <EmptyState>
          <FaUserFriends />
          <h3>{t("loginToSeeFollowing")}</h3>
          <p>{t("canManageProfiles")}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <FaUsers />
          {t("followingPageTitle")}
        </Title>
        
        <Description>{t("yourListOfFavoriteCreators")}</Description>
        
        <MetaInfo>
          <MetaItem>
            <FaUserFriends />
            {users.length} {t("profilesCount")}
          </MetaItem>
          <MetaItem>
            <BiUser />
            {t("recentlyUpdated")}
          </MetaItem>
        </MetaInfo>
        
        <ActionButtons>
          <Button onClick={() => navigate(-1)}>
            <BiArrowBack />
            {t("back")}
          </Button>
        </ActionButtons>
      </HeaderSection>

      {users.length === 0 ? (
        <EmptyState>
          <FaUserFriends />
          <h3>{t("noFollowAnyProfileYet")}</h3>
          <p>{t("exploreAndFollowYourFavoriteCreators")}</p>
        </EmptyState>
      ) : (
        <UserGrid>
          {users.map((user, index) => (
            <UserCard 
              key={user._id}
              index={index}
              onClick={() => handleUserClick(user)}
            >
              <BannerContainer>
                {user.imgBanner ? (
                  <Banner 
                    src={user.imgBanner} 
                    alt={user.name}
                  />
                ) : (
                  <Banner 
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800"
                    alt={t("defaultBanner")}
                  />
                )}
              </BannerContainer>
              
              <AvatarContainer>
                {user.img ? (
                  <Avatar src={user.img} alt={user.name} />
                ) : (
                  <DefaultAvatar>
                    <BiUser />
                  </DefaultAvatar>
                )}
              </AvatarContainer>
              
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserStats>
                  <span>{user.follows || 0} {t("followers")}</span>
                  {user.totalViews && (
                    <span>{user.totalViews.toLocaleString()} {t("views")}</span>
                  )}
                </UserStats>
                {user.descriptionAccount && (
                  <UserDescription>{user.descriptionAccount}</UserDescription>
                )}
                <FollowButton 
                  following={true}
                  onClick={(e) => handleUnfollow(e, user._id)}
                >
                  <FaUserFriends />
                  {t("following")}
                </FollowButton>
              </UserInfo>
            </UserCard>
          ))}
        </UserGrid>
      )}
    </PageContainer>
  );
};

export default Following;