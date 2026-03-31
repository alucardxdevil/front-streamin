import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { formatTimeago } from "../utils/timeago";
import { useLanguage } from "../utils/LanguageContext";
import defaultProfile from '../img/profileUser.png'

/* ================= STYLED COMPONENTS ================= */

const Container = styled.div`
  display: flex;
  gap: 10px;
  margin: 30px 0px;
  position: relative;

  /* Al hacer hover sobre el comentario, mostrar el menú de acciones */
  &:hover .comment-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${({ theme }) => theme.text};
  flex: 1;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const Date = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft};
  margin-left: 5px;
`;

const EditedBadge = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
  margin-left: 6px;
  opacity: 0.7;
  font-style: italic;
`;

/* Contenedor del texto con soporte para line-clamp */
const TextWrapper = styled.div`
  position: relative;
`;

const Text = styled.span`
  font-size: 14px;
  display: ${({ $expanded }) => ($expanded ? "block" : "-webkit-box")};
  -webkit-line-clamp: ${({ $expanded }) => ($expanded ? "unset" : "4")};
  -webkit-box-orient: vertical;
  overflow: ${({ $expanded }) => ($expanded ? "visible" : "hidden")};
  max-width: 600px;
  word-wrap: break-word;
  word-break: break-word;
  /* pre-wrap solo cuando está expandido para respetar saltos de línea;
     en modo clamp se omite para que -webkit-line-clamp funcione correctamente */
  white-space: ${({ $expanded }) => ($expanded ? "pre-wrap" : "normal")};
  line-height: 1.5;
`;

/* ===== Botón Ver más / Ver menos del texto del comentario ===== */
const ExpandBtn = styled.button`
  display: block;
  background: none;
  border: none;
  padding: 4px 0 0;
  margin: 0;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
  text-align: left;

  &:hover {
    color: #5fa8ff;
    text-decoration: underline;
  }
`;

/* ===== Menú de acciones (editar / eliminar) ===== */
const ActionsMenu = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
`;

const ActionBtn = styled.button`
  background: ${({ $danger }) =>
    $danger ? "rgba(233, 69, 96, 0.15)" : "rgba(11, 103, 220, 0.15)"};
  color: ${({ $danger }) => ($danger ? "#e94560" : "#5fa8ff")};
  border: 1px solid
    ${({ $danger }) =>
      $danger ? "rgba(233, 69, 96, 0.3)" : "rgba(11, 103, 220, 0.3)"};
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $danger }) =>
      $danger ? "rgba(233, 69, 96, 0.3)" : "rgba(11, 103, 220, 0.3)"};
    transform: scale(1.04);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/* ===== Modo edición ===== */
const EditContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const EditInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #0b67dc;
    box-shadow: 0 0 0 2px rgba(11, 103, 220, 0.15);
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const SaveBtn = styled.button`
  padding: 6px 16px;
  background: #0b67dc;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #1a77ff;
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  padding: 6px 16px;
  background: transparent;
  color: ${({ theme }) => theme.textSoft};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};
  }
`;

const ErrorMsg = styled.span`
  font-size: 12px;
  color: #e94560;
`;

/* ================= COMPONENTE ================= */

const Comment = ({ comment, onDelete, onEdit }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [channel, setChannel] = useState({});
  const { language, t } = useLanguage();

  // Estado de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.descriptionC);
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estado local del texto del comentario (para reflejar ediciones sin recargar)
  const [displayText, setDisplayText] = useState(comment.descriptionC);
  const [wasEdited, setWasEdited] = useState(false);

  // Estado de expansión del texto largo (independiente por comentario)
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const textareaRef = useRef(null);

  // Cargar datos del autor del comentario
  useEffect(() => {
    const fetchComment = async () => {
      try {
        const res = await axios.get(`/users/find/${comment.userId}`);
        setChannel(res.data);
      } catch (err) {
        console.error("Error cargando autor del comentario:", err);
      }
    };
    fetchComment();
  }, [comment.userId]);

  // Enfocar el textarea al entrar en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Mover el cursor al final del texto
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  /* ── ¿Es el autor del comentario? ── */
  const isOwner = currentUser && currentUser._id === comment.userId;

  /* ── Cancelar edición ── */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(displayText); // restaurar el texto actual
    setEditError(null);
  };

  /* ── Guardar edición ── */
  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError(t ? t("commentCannotBeEmpty") : "El comentario no puede estar vacío.");
      return;
    }
    if (trimmed === displayText) {
      // Sin cambios, solo cerrar
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const res = await axios.put(`/comments/${comment._id}`, {
        descriptionC: trimmed,
      });
      // Actualizar el texto mostrado localmente
      setDisplayText(res.data.descriptionC);
      setEditText(res.data.descriptionC);
      setWasEdited(true);
      setIsEditing(false);
      // Notificar al padre si se proporcionó callback
      if (onEdit) onEdit(comment._id, res.data.descriptionC);
    } catch (err) {
      console.error("Error editando comentario:", err);
      setEditError(
        err.response?.data?.message ||
          (t ? t("errorEditingComment") : "Error al editar el comentario.")
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Eliminar comentario ── */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      t ? t("confirmDeleteComment") : "¿Eliminar este comentario?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/comments/${comment._id}`);
      // Notificar al padre para que elimine el comentario de la lista
      if (onDelete) onDelete(comment._id);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  /* ── Teclas en el textarea de edición ── */
  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  /* ── Ref para detectar si el texto está siendo truncado por line-clamp ── */
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // scrollHeight > clientHeight indica que el contenido está truncado
    setIsTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [displayText]);

  return (
    <Container>
      <Link to={`/profileUser/${channel.slug || channel._id}`}>
        <Avatar
          src={channel.img || defaultProfile}
          alt="Profile picture"
        />
      </Link>

      <Details>
        <Name>
          {channel.name}
          <Date>{formatTimeago(comment.createdAt, language)}</Date>
          {wasEdited && (
            <EditedBadge>
              {t ? t("edited") : "(edited)"}
            </EditedBadge>
          )}
        </Name>

        {/* ── Modo edición ── */}
        {isEditing ? (
          <EditContainer>
            <EditInput
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setEditError(null);
              }}
              onKeyDown={handleEditKeyDown}
              maxLength={1000}
            />
            {editError && <ErrorMsg>{editError}</ErrorMsg>}
            <EditActions>
              <CancelBtn onClick={handleCancelEdit} disabled={saving}>
                {t ? t("cancel") : "Cancel"}
              </CancelBtn>
              <SaveBtn
                onClick={handleSaveEdit}
                disabled={saving || !editText.trim()}
              >
                {saving
                  ? t
                    ? t("saving")
                    : "Saving..."
                  : t
                  ? t("save")
                  : "Save"}
              </SaveBtn>
            </EditActions>
          </EditContainer>
        ) : (
          <TextWrapper>
            <Text ref={textRef} $expanded={isTextExpanded}>
              {displayText}
            </Text>
            {(isTruncated || isTextExpanded) && (
              <ExpandBtn onClick={() => setIsTextExpanded((p) => !p)}>
                {isTextExpanded
                  ? (t ? t("showLessText") : "Show less")
                  : (t ? t("showMoreText") : "Show more")}
              </ExpandBtn>
            )}
          </TextWrapper>
        )}
      </Details>

      {/* ── Botones de acción (solo visibles al hacer hover y solo para el autor) ── */}
      {isOwner && !isEditing && (
        <ActionsMenu className="comment-actions">
          <ActionBtn onClick={() => setIsEditing(true)}>
            {t ? t("edit") : "Edit"}
          </ActionBtn>
          <ActionBtn $danger onClick={handleDelete}>
            {t ? t("delete") : "Delete"}
          </ActionBtn>
        </ActionsMenu>
      )}
    </Container>
  );
};

export default Comment;
