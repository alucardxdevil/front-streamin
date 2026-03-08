import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Comment from "./Comment";
import defaultProfile from '../img/profileUser.png'
import { useLanguage } from "../utils/LanguageContext";

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #51cf66;
  background-color: rgba(81, 207, 102, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  font-size: 14px;
`;

const Container = styled.div``;

const NewComment = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const AvatarWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
  background-color: transparent;
  outline: none;
  padding: 10px;
  min-width: 0;
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

/* ── Botón Ver más / Ver menos (solo visible en móvil) ── */
const ShowMoreBtn = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 8px;
    background: transparent;
    border: 1px solid ${({ theme }) => theme.soft};
    border-radius: 8px;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.bgLighter || "rgba(255,255,255,0.05)"};
      border-color: #3498db;
      color: #3498db;
    }
  }
`;

/* Número inicial de comentarios visibles en móvil */
const MOBILE_INITIAL = 3;
/* Cuántos comentarios se cargan por cada "Ver más" */
const MOBILE_PAGE = 10;

const Comments = ({ videoId }) => {
  const { currentUser } = useSelector((state) => state.user);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { t } = useLanguage();

  /* ── Estado de paginación móvil ── */
  const [visibleCount, setVisibleCount] = useState(MOBILE_INITIAL);
  const [isMobile, setIsMobile] = useState(false);

  /* Detectar si estamos en móvil */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Reiniciar paginación cuando cambia el video */
  useEffect(() => {
    setVisibleCount(MOBILE_INITIAL);
  }, [videoId]);

  // Cargar comentarios al montar o cuando cambia el video
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/comments/${videoId}`);
        setComments(res.data);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError("The comments could not be loaded. Please try again.");
      }
    };
    fetchComments();
  }, [videoId]);

  // Publicar nuevo comentario
  const handleNewCommentSubmit = async () => {
    if (!newComment.trim()) {
      setError("The comment cannot be empty.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(`/comments/`, {
        descriptionC: newComment,
        videoId: videoId,
      });
      // Agregar el nuevo comentario al inicio de la lista para visibilidad inmediata
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      setSuccess("Comment published successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Error posting comment. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewCommentSubmit();
    }
  };

  /**
   * Callback que recibe Comment.jsx cuando el usuario elimina su comentario.
   * Elimina el comentario de la lista local sin necesidad de recargar desde el servidor.
   */
  const handleCommentDelete = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  /**
   * Callback que recibe Comment.jsx cuando el usuario edita su comentario.
   * Actualiza el texto del comentario en la lista local.
   */
  const handleCommentEdit = (commentId, newText) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, descriptionC: newText } : c
      )
    );
  };

  /* ── Lógica de paginación móvil ── */
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + MOBILE_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(MOBILE_INITIAL);
  };

  /* En móvil mostramos solo `visibleCount` comentarios; en desktop todos */
  const visibleComments = isMobile ? comments.slice(0, visibleCount) : comments;
  const hasMore = isMobile && comments.length > visibleCount;
  const canCollapse = isMobile && visibleCount > MOBILE_INITIAL;
  /* Solo mostrar el botón "Ver más" si hay más de 3 comentarios */
  const showToggle = isMobile && comments.length > MOBILE_INITIAL;

  return (
    <Container>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {/* Formulario para nuevo comentario */}
      <NewComment>
        <AvatarWrapper>
          <Avatar src={currentUser?.img || defaultProfile} alt="Profile picture" />
        </AvatarWrapper>
        <Input
          placeholder={t("addComment")}
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleNewCommentSubmit} disabled={!newComment.trim()}>
          {t("comment")}
        </Button>
      </NewComment>

      {/* Lista de comentarios */}
      {visibleComments.map((comment) => (
        <Comment
          key={comment._id}
          comment={comment}
          onDelete={handleCommentDelete}
          onEdit={handleCommentEdit}
        />
      ))}

      {/* Botones Ver más / Ver menos (solo móvil, solo si hay más de 3 comentarios) */}
      {showToggle && (
        <>
          {hasMore && (
            <ShowMoreBtn onClick={handleShowMore}>
              {t("showMoreComments")}
            </ShowMoreBtn>
          )}
          {canCollapse && !hasMore && (
            <ShowMoreBtn onClick={handleShowLess}>
              {t("showLessComments")}
            </ShowMoreBtn>
          )}
        </>
      )}
    </Container>
  );
};

export default Comments;
