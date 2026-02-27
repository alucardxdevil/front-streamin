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

const Comments = ({videoId}) => {
  const {currentUser} = useSelector((state) => state.user)
  
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { t } = useLanguage();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/comments/${videoId}`)
        setComments(res.data)
        setError(null)
      } catch (err) {
        console.error("Error:", err)
        setError("The comments could not be loaded. Please try again.")
      }
    }
  
    fetchComments()
  }, [videoId])

  const handleNewCommentSubmit = async () => {
    if (!newComment.trim()) {
      setError("The comment cannot be empty.")
      return
    }
    
    setError(null)
    setSuccess(null)
    
    try {
      const res = await axios.post(`/comments/`, { descriptionC: newComment, videoId: videoId });
      setComments([...comments, res.data]);
      setNewComment('');
      setSuccess("Comment published successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Error posting comment. Please try again.")
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewCommentSubmit()
    }
  }

  return (
    <Container>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      <NewComment>
        <AvatarWrapper>
          <Avatar src={currentUser?.img || defaultProfile} alt="Profile picture" />
        </AvatarWrapper>
        <Input 
          placeholder={t("addComment")} 
          value={newComment} 
          onChange={(e) => {
            setNewComment(e.target.value)
            setError(null)
          }}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleNewCommentSubmit} disabled={!newComment.trim()}>
          {t("comment")}
        </Button>
      </NewComment>
      {comments.map(comment => (
        <Comment key={comment._id} comment={comment} />
      ))}
    </Container>
  );
};

export default Comments;
