import { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";
import { darkTheme, lightTheme, sunsetTheme, cyberpunkTheme,sunriseTheme, vintageTheme } from "./utils/Theme";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Video from "./pages/Video";
import SignIn from "./pages/SignIn";
import { Search } from "./pages/Search";
import { Profile } from "./pages/Profile";
import Trends from "./pages/Trends";
import FilmLibrary from "./pages/FilmLibrary";
import { ProfileUser } from "./pages/ProfileUser";
import HomeOne from "./pages/HomeOne";
import Following from "./pages/Following";
import Register from "./pages/Register";
import Us from "./pages/Us";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import FilmLibrarySec from "./pages/FilmLibrarySec";
import Contact from "./pages/Contact";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/PageNotFOund";
import Settings from "./pages/Settings";
import { LanguageProvider } from "./utils/LanguageContext";
import { HistoryPage } from "./pages/History";
import { PlaylistDetailPage } from "./pages/PlaylistDetail";
import { PlaylistPlayerPage } from "./pages/PlaylistPlayer";
import { SharedPlaylistRedirect } from "./pages/SharedPlaylistRedirect";
import SEOHead from "./components/seo/SEOHead";


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

const themes = { dark: darkTheme, light: lightTheme, sunset: sunsetTheme, sunrise: sunriseTheme, cyberpunk: cyberpunkTheme, vintage: vintageTheme };

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    // Recuperar tema del localStorage o usar dark como defecto
    return localStorage.getItem("themeMode") || "dark";
  });

  // Guardar tema en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);
  // const { currentUser } = useSelector((state) => state.user);

  return (
     <LanguageProvider>
     <ThemeProvider theme={themes[themeMode] || darkTheme}>
      <GlobalStyle />
      <Container>
        <BrowserRouter>
          <Main>
            <Navbar themeMode={themeMode} setThemeMode={setThemeMode} />
            <BackButton />
            {/* SEO: metadatos por defecto (cada página puede sobreescribirlos) */}
            <SEOHead />
      <Wrapper>
                <Routes>
                  <Route path="/">
                    <Route index element={<Home type="random"/>} />
                    <Route path="trends" element={<Trends type="fav"/>} />
                    <Route path="likes" element={<HomeOne type="fav"/>} />
                    <Route path="following" element={<Following />} />
                    <Route path="search" element={<Search />} />
                    <Route path="trend" element={<Trends />} />
                    <Route path="signin" element={<SignIn />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<Profile /> } />
                    <Route path="myvideos" element={<FilmLibrary type="filmlibrary" />} />
                    <Route path="videosProfile/:slug" element={<FilmLibrarySec type="second"/>}>
                  </Route>
                    <Route path="contact" element={<Contact />} />
                    <Route path="support" element={<SupportPage /> } />
                    <Route path="us" element={<Us />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="help" element={<Help />} />
                    <Route path="settings" element={<Settings themeMode={themeMode} setThemeMode={setThemeMode} />} />
                    <Route path="profileUser" >
                      <Route path=":slug" element={<ProfileUser />} />
                    </Route>
                    <Route path="video">
                      <Route path=":id" element={<Video />} />
                    </Route>
                    <Route path="history/:userId" element={<HistoryPage />} />
                    <Route path="playlist/:userId/:playlistId" element={<PlaylistDetailPage />} />
                    <Route path="playlist-player/:userId/:playlistId" element={<PlaylistPlayerPage />} />
                    <Route path="shared-playlist/:playlistId" element={<SharedPlaylistRedirect />} />
                    <Route path="*" element={<NotFound/>} />
                  </Route>
                </Routes>
              </Wrapper>
          </Main>
        </BrowserRouter>
      </Container>
     </ThemeProvider>
     </LanguageProvider>
  );
}

export default App;
