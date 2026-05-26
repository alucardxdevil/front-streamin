import { lazy, Suspense, useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import Navbar from "./components/Navbar";
import BetaNoticeBar from "./components/BetaNoticeBar";
import BackButton from "./components/BackButton";
import PageLoader from "./components/PageLoader";
import { darkTheme, lightTheme, sunsetTheme, cyberpunkTheme, sunriseTheme, vintageTheme } from "./utils/Theme";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { getPublicProfilePath } from "./utils/profilePaths";
import Home from "./pages/Home";
import { LanguageProvider } from "./utils/LanguageContext";
import SEOHead from "./components/seo/SEOHead";

const lazyNamed = (factory, name) =>
  lazy(() => factory().then((m) => ({ default: m[name] })));

const Video = lazy(() => import("./pages/Video"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Search = lazyNamed(() => import("./pages/Search"), "Search");
const Profile = lazyNamed(() => import("./pages/Profile"), "Profile");
const Trends = lazy(() => import("./pages/Trends"));
const FilmLibrary = lazy(() => import("./pages/FilmLibrary"));
const ProfileUser = lazyNamed(() => import("./pages/ProfileUser"), "ProfileUser");
const HomeOne = lazy(() => import("./pages/HomeOne"));
const Following = lazy(() => import("./pages/Following"));
const Us = lazy(() => import("./pages/Us"));
const Terms = lazy(() => import("./pages/Terms"));
const Help = lazy(() => import("./pages/Help"));
const FilmLibrarySec = lazy(() => import("./pages/FilmLibrarySec"));
const Contact = lazy(() => import("./pages/Contact"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const NotFound = lazy(() => import("./pages/PageNotFOund"));
const Settings = lazy(() => import("./pages/Settings"));
const HistoryPage = lazyNamed(() => import("./pages/History"), "HistoryPage");
const PlaylistDetailPage = lazyNamed(() => import("./pages/PlaylistDetail"), "PlaylistDetailPage");
const PlaylistPlayerPage = lazyNamed(() => import("./pages/PlaylistPlayer"), "PlaylistPlayerPage");
const SharedPlaylistRedirect = lazyNamed(() => import("./pages/SharedPlaylistRedirect"), "SharedPlaylistRedirect");
const Advertise = lazy(() => import("./pages/Advertise"));
const UploadPage = lazy(() => import("./pages/Upload"));
const EditVideoPage = lazy(() => import("./pages/EditVideo"));

const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: ${({ theme }) => theme.bg || "#000"};
    color: ${({ theme }) => theme.text || "white"};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background-color: ${({ theme }) => theme.bg || "#000"};
  color: ${({ theme }) => theme.text || "white"};
  min-height: 100vh;
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const Wrapper = styled.div`
  padding: 5px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

function LegacyProfileRedirect() {
  const { slug } = useParams();
  return <Navigate to={getPublicProfilePath(slug)} replace />;
}

const themes = {
  dark: darkTheme,
  light: lightTheme,
  sunset: sunsetTheme,
  sunrise: sunriseTheme,
  cyberpunk: cyberpunkTheme,
  vintage: vintageTheme,
};

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("themeMode") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  return (
    <LanguageProvider>
      <ThemeProvider theme={themes[themeMode] || darkTheme}>
        <GlobalStyle />
        <Container>
          <BrowserRouter>
            <Main>
              <Navbar themeMode={themeMode} setThemeMode={setThemeMode} />
              <BetaNoticeBar donationUrl="https://ko-fi.com/streamincom" />
              <BackButton />
              <SEOHead />
              <Wrapper>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/">
                      <Route index element={<Home type="random" />} />
                      <Route path="trends" element={<Trends type="fav" />} />
                      <Route path="likes" element={<HomeOne type="fav" />} />
                      <Route path="following" element={<Following />} />
                      <Route path="search" element={<Search />} />
                      <Route path="trend" element={<Trends />} />
                      <Route path="signin" element={<SignIn />} />
                      <Route path="register" element={<Register />} />
                      <Route path="reset-password" element={<ResetPassword />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="myvideos" element={<FilmLibrary type="filmlibrary" />} />
                      <Route path="videosProfile/:slug" element={<FilmLibrarySec type="second" />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="support" element={<SupportPage />} />
                      <Route path="us" element={<Us />} />
                      <Route path="terms" element={<Terms />} />
                      <Route path="help" element={<Help />} />
                      <Route path="advertise" element={<Advertise />} />
                      <Route path="settings" element={<Settings themeMode={themeMode} setThemeMode={setThemeMode} />} />
                      <Route path="@:slug" element={<ProfileUser />} />
                      <Route path="profileUser/:slug" element={<LegacyProfileRedirect />} />
                      <Route path="video">
                        <Route path=":id" element={<Video />} />
                      </Route>
                      <Route path="history/:userId" element={<HistoryPage />} />
                      <Route path="playlist/:userId/:playlistId" element={<PlaylistDetailPage />} />
                      <Route path="playlist-player/:userId/:playlistId" element={<PlaylistPlayerPage />} />
                      <Route path="shared-playlist/:playlistId" element={<SharedPlaylistRedirect />} />
                      <Route path="upload" element={<UploadPage />} />
                      <Route path="edit-video/:id" element={<EditVideoPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </Wrapper>
            </Main>
          </BrowserRouter>
        </Container>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
