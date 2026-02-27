import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatTimeago } from "../utils/timeago";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  display: flex;
  gap: 10px;
  margin: 30px 0px;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.text};
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

const Text = styled.span`
  font-size: 14px;
  display: inline-block;
  max-width: 500px;
  word-wrap: break-word;
`;

const Comment = ({comment}) => {

  const [channel, setChannel] = useState({});
  const { language } = useLanguage();

  useEffect(() => {
    const fetchComment = async () => {
      const res = await axios.get(`/users/find/${comment.userId}`);
      setChannel(res.data)
    }
    fetchComment()
    }, [comment.userId]
  );

 

  return (
    <Container>
      <Link to={`/profileUser/${channel.slug || channel._id}`}>
        <Avatar src={channel.img || "https://via.placeholder.com/50"} alt={`Foto de perfil de ${channel.name}`} />
      </Link>
      <Details>
        <Name>
          {channel.name} <Date>{formatTimeago(comment.createdAt, language)}</Date>
        </Name>
        <Text>
          {comment.descriptionC}
        </Text>
      </Details>
    </Container>
  );
};

export default Comment;
