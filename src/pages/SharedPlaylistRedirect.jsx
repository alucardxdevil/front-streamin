import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useLanguage } from "../utils/LanguageContext";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: ${({ theme }) => theme.text};
  padding-top: 0;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid ${({ theme }) => theme.soft};
    border-top-color: #ff3e6c;
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

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding-top: 0;
  color: ${({ theme }) => theme.textSoft};
  text-align: center;

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.text};
  }
`;

/**
 * SharedPlaylistRedirect
 *
 * Resolves a shared playlist URL (/shared-playlist/:playlistId) by fetching
 * the playlist data to get the owner's userId, then redirects to the canonical
 * playlist detail URL (/playlist/:userId/:playlistId).
 *
 * This allows share links to work without requiring the userId in the URL.
 */
export const SharedPlaylistRedirect = () => {
  const { playlistId } = useParams();
  const { t } = useLanguage();
  const [redirectPath, setRedirectPath] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolvePlaylist = async () => {
      try {
        const response = await axios.get(`/users/playlists/shared/${playlistId}`);
        const playlist = response.data;
        if (playlist && playlist.userId) {
          setRedirectPath(`/playlist/${playlist.userId}/${playlistId}`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error resolving shared playlist:", err);
        setError(true);
      }
    };
    resolvePlaylist();
  }, [playlistId]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (error) {
    return (
      <ErrorContainer>
        <h3>{t("playlistNotFound")}</h3>
        <p>{t("playlistNotFoundDescription")}</p>
      </ErrorContainer>
    );
  }

  return (
    <LoadingContainer>
      <div className="spinner" />
      <p>{t("loadingPlaylist")}</p>
    </LoadingContainer>
  );
};
