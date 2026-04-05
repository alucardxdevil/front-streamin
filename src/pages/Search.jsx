// src/pages/AdvancedSearch.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { Skeleton } from "@mui/material";
import { FaSearch, FaUserCircle, FaFilm, FaUsers, FaVideo } from "react-icons/fa";
import { BiArrowBack } from "react-icons/bi";
import defaultProfile from "../img/profileUser.png";
import Card from "../components/Card";
import { useDispatch, useSelector } from "react-redux";
import { follows } from '../redux/userSlice';
import { FaTimes } from "react-icons/fa";
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// ----------------- Styled -----------------
const Page = styled.div`
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
  padding: 32px;
  margin-bottom: 32px;
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
    padding: 20px;
    border-radius: 16px;
  }
`;

const SearchHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 600px;
  display: flex;
  gap: 12px;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  padding: 14px 18px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(11, 103, 220, 0.2);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #0b67dc;
    box-shadow: 0 4px 24px rgba(11, 103, 220, 0.3);
  }

  @media (max-width: 768px) {
    min-width: 100%;
    padding: 12px 14px;
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #0b67dc;
  font-size: 18px;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  
  &::placeholder {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const ClearButton = styled(FaTimes)`
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;

  svg {
    font-size: 32px;
    color: #0b67dc;
    -webkit-text-fill-color: initial;
  }
  
  @media (max-width: 768px) {
    font-size: 22px;
    svg {
      font-size: 24px;
    }
  }
`;

const Description = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.textSoft};
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
`;

// Tabs modernos
const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const Tab = styled.button`
  background: ${({ active, theme }) => active 
    ? 'linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)'
    : theme.soft};
  color: ${({ active }) => active ? '#fff' : 'inherit'};
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(11, 103, 220, 0.3);
  }
  
  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const TabCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
`;

const Section = styled.section`
  margin-bottom: 32px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  display: flex;
  gap: 10px;
  align-items: center;

  svg {
    color: #0b67dc;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Select = styled.select`
  background: ${({ theme }) => theme.soft};
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.text};
  padding: 10px 14px;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0b67dc;
  }

  &:focus {
    border-color: #0b67dc;
    box-shadow: 0 0 0 3px rgba(11, 103, 220, 0.2);
  }
`;

const ResultsCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

/* Users carousel */
const UserCarousel = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  gap: 20px;
  padding-bottom: 16px;
  margin-bottom: 16px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    gap: 14px;
    padding: 0 5px;
  }
`;

/* Videos grid */
const VideosGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  
  @media (max-width: 768px) {
    gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;

const UserCardCarousel = styled(Link)`
  flex: 0 0 200px;
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 20px;
  padding: 24px 16px;
  text-align: center;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${({ index }) => index * 0.05}s;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(11, 103, 220, 0.25);
  }

  @media (max-width: 768px) {
    flex: 0 0 150px;
    padding: 18px 12px;
  }
`;

const BigAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 8px;
  transform: translateY(-30px);
  border: 4px solid;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    transform: translateY(-22px);
  }
`;

const UserName = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  font-size: 15px;
  color: ${({ theme }) => theme.text};
  margin-top: -20px;
  margin-bottom: 6px;
`;

const FollowersCount = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CardButton = styled.button`
  background: ${({ following, theme }) => following 
    ? theme.soft 
    : 'linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(11, 103, 220, 0.4);
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};
  
  svg {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.4;
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

/* Loading skeleton styles */
const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.soft};
  border-radius: 20px;
  padding: 24px 16px;
  text-align: center;
`;

const SkeletonAvatar = styled(Skeleton)`
  margin: 0 auto !important;
  margin-top: 8px !important;
  transform: translateY(-30px) !important;
`;

const SkeletonText = styled(Skeleton)`
  margin: 8px auto !important;
`;

const SkeletonButton = styled(Skeleton)`
  margin-top: 12px !important;
  border-radius: 10px !important;
`;

// Load more button
const LoadMoreButton = styled.button`
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 32px auto 0;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(11, 103, 220, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// ---------------- Helper ----------------
const parseQuery = (search) => {
  const params = new URLSearchParams(search);
  return params.get("q") || "";
};

// ---------------- Component ----------------
export const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = parseQuery(location.search);
  const { t } = useLanguage();

  // input state (local controlled input)
  const [input, setInput] = useState(urlQuery);

  // data states
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);

  // ui states
  const [tab, setTab] = useState("all"); // all | users | videos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSort, setUserSort] = useState("relevance"); // followers
  const [videoSort, setVideoSort] = useState("relevance"); // views | recent
  const [videoPage, setVideoPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Keep input in sync with URL q (if user navigates with URL)
  useEffect(() => {
    setInput(urlQuery);
    // default fetch when URL changes:
    if (urlQuery) fetchAll(urlQuery, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Debounced input -> update URL (so results are shareable)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = input.trim();
      // navigate updates the URL; this triggers the location.search effect above
      if (trimmed !== urlQuery) {
        if (trimmed.length > 0)
          navigate(`?q=${encodeURIComponent(trimmed)}`, { replace: true });
        else navigate(location.pathname, { replace: true });
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Fetch helper (parallel)
  const fetchAll = async (q, page = 1, replace = false) => {
    if (!q) {
      setUsers([]);
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);
    // cancel previous
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // videos endpoint supports pagination: page param
      const [videosRes, usersRes] = await Promise.all([
        axios.get("/videos/search", {
          params: { q, page, sort: videoSort },
          signal,
        }),
        axios.get("/users/search", { params: { q, sort: userSort }, signal }),
      ]);

      const videosData = Array.isArray(videosRes.data)
        ? videosRes.data
        : videosRes.data.videos || [];
      const usersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users || [];

      // videos pagination handling
      if (page === 1 || replace) {
        setVideos(videosData);
      } else {
        setVideos((prev) => [...prev, ...videosData]);
      }
      setHasMoreVideos(videosData.length >= 12); // assume page size 12

      setUsers(usersData);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Search fetch error:", err);
      setError("Error fetching results");
    } finally {
      setLoading(false);
    }
  };

  // Manual "load more" for videos
  const loadMoreVideos = () => {
    const next = videoPage + 1;
    setVideoPage(next);
    fetchAll(parseQuery(location.search), next);
    setTab("videos");
  };

  // When sorting changes, re-fetch
  useEffect(() => {
    if (!parseQuery(location.search)) return;
    // re-fetch page 1 when sort changes
    setVideoPage(1);
    fetchAll(parseQuery(location.search), 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSort, videoSort]);

  // initial or url change fetch handled in effect above
  // but export a small search button too
  const onSubmit = (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length > 0) navigate(`?q=${encodeURIComponent(trimmed)}`);
    else navigate(location.pathname);
  };

  const handleSub = async (userId) => {
      try {
        if (currentUser.followsProfile.includes(userId)) {
          await axios.put(`/users/unfol/${userId}`);
        } else {
          await axios.put(`/users/fol/${userId}`);
        }
        dispatch(follows(userId));
      } catch (error) {
        console.error("Error updating follow status:", error);
      }
  };

  // derived
  const usersCount = users.length;
  const videosCount = videos.length;

  // Determine icon based on current tab
  const getTabIcon = (tabName) => {
    switch(tabName) {
      case 'all': return <FaSearch />;
      case 'users': return <FaUsers />;
      case 'videos': return <FaVideo />;
      default: return <FaSearch />;
    }
  };

  return (
    <Page>
      <HeaderSection>
        <Title>
          <FaSearch />
          {t("search")}
        </Title>
        
        <Description>{t("searchDescription")}</Description>
        
        <SearchHeader>
          <SearchBox as="form" onSubmit={onSubmit}>
            <SearchIcon />
            <Input
              placeholder={t("searchVideosPlaceholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input.length > 0 && (
              <ClearButton onClick={() => setInput("")} />
            )}
          </SearchBox>

          <Controls>
            <Select
              value={videoSort}
              onChange={(e) => setVideoSort(e.target.value)}
            >
              {/* <option value="relevance">{t("searchRelevance")}</option> */}
              <option value="views">{t("searchMostViewed")}</option>
              <option value="recent">{t("searchMostRecent")}</option>
            </Select>
          </Controls>
        </SearchHeader>
      </HeaderSection>

      <TabsContainer>
        <Tab 
          active={tab === "all"} 
          onClick={() => setTab("all")}
        >
          {getTabIcon('all')}
          {t("searchAll")}
          {(usersCount > 0 || videosCount > 0) && (
            <TabCount>{usersCount + videosCount}</TabCount>
          )}
        </Tab>
        <Tab 
          active={tab === "users"} 
          onClick={() => setTab("users")}
        >
          <FaUsers />
          {t("users")}
          {usersCount > 0 && <TabCount>{usersCount}</TabCount>}
        </Tab>
        <Tab 
          active={tab === "videos"} 
          onClick={() => setTab("videos")}
        >
          <FaVideo />
          {t("videos")}
          {videosCount > 0 && <TabCount>{videosCount}</TabCount>}
        </Tab>
      </TabsContainer>

      {/* Show loading skeletons */}
      {loading && (
        <>
          {/* Users skeleton */}
          {(tab === "all" || tab === "users") && (
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <FaUserCircle /> {t("users")}
                </SectionTitle>
              </SectionHeader>
              <UserCarousel>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i}>
                    <SkeletonAvatar variant="circular" width={80} height={80} />
                    <SkeletonText variant="text" width="70%" />
                    <SkeletonText variant="text" width="50%" />
                    <SkeletonButton variant="rectangular" height={40} />
                  </SkeletonCard>
                ))}
              </UserCarousel>
            </Section>
          )}

          {/* Videos skeleton */}
          {(tab === "all" || tab === "videos") && (
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <FaFilm /> {t("videos")}
                </SectionTitle>
              </SectionHeader>
              <VideosGrid>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: '12px' }} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="50%" />
                  </div>
                ))}
              </VideosGrid>
            </Section>
          )}
        </>
      )}

      {!loading && error && (
        <Message>
          <FaSearch />
          <h3>{t("searchError")}</h3>
          <p>{error}</p>
        </Message>
      )}

      {!loading && !error && !urlQuery && (
        <Message>
          <FaSearch />
          <h3>{t("searchStart")}</h3>
          <p>{t("searchStartDescription")}</p>
        </Message>
      )}

      {!loading && !error && urlQuery && (
        <>
          {/* USERS */}
          {(tab === "all" || tab === "users") && (
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <FaUserCircle /> Usuarios
                </SectionTitle>

                <FiltersRow>
                  <ResultsCount>{usersCount} {t("results")}</ResultsCount>
                  <Select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value)}
                  >
                    {/* <option value="relevance">{t("searchRelevance")}</option> */}
                    <option value="followers">{t("searchMostFollowed")}</option>
                  </Select>
                </FiltersRow>
              </SectionHeader>

              {usersCount === 0 ? (
                <Message>
                  <FaUsers />
                  <h3>{t("noUsersFound")}</h3>
                  <p>{t("tryOtherSearchTerms")}</p>
                </Message>
              ) : (
                <UserCarousel>
                  {users.map((u, index) => (
                    <UserCardCarousel 
                      key={u._id} 
                      to={`/profileUser/${u.slug || u._id}`}
                      index={index}
                    >
                      <BigAvatar src={u.img || defaultProfile} />
                      <UserName title={u.name}>{u.name}</UserName>
                      <FollowersCount>
                        {u.follows?.toLocaleString() || 0} {t("followers")}
                      </FollowersCount>
                      <CardButton
                        following={currentUser?.followsProfile.includes(u._id)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSub(u._id);
                        }}
                      >
                        {currentUser?.followsProfile.includes(u._id)
                          ? t("following")
                          : t("follow")}
                      </CardButton>
                    </UserCardCarousel>
                  ))}
                </UserCarousel>
              )}
            </Section>
          )}

          {/* VIDEOS */}
          {(tab === "all" || tab === "videos") && (
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <FaFilm /> {t("searchVideos")}
                </SectionTitle>

                <FiltersRow>
                  <ResultsCount>
                    {videosCount} {t("results")}
                  </ResultsCount>
                  <Select
                    value={videoSort}
                    onChange={(e) => setVideoSort(e.target.value)}
                  >
                    {/* <option value="relevance">Relevancia</option>
                    <option value="views">Más vistos</option>
                    <option value="recent">Más recientes</option> */}
                  </Select>
                </FiltersRow>
              </SectionHeader>

              {videosCount === 0 ? (
                <Message>
                  <FaVideo />
                  <h3>{t("noVideosFound")}</h3>
                  <p>{t("tryOtherSearchTerms")}</p>
                </Message>
              ) : (
                <>
                  <VideosGrid>
                    {videos.map((video) => (
                      <Card key={video._id} video={video}></Card>
                    ))}
                  </VideosGrid>

                  {hasMoreVideos && (
                    <LoadMoreButton onClick={loadMoreVideos}>
                      {t("loadMoreVideos")}
                    </LoadMoreButton>
                  )}
                </>
              )}
            </Section>
          )}
        </>
      )}
    </Page>
  );
};
