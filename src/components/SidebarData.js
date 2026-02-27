import React from "react";
import { AiFillHome, AiOutlineLike } from "react-icons/ai";
import { FaUserFriends, FaFireAlt, FaUserCircle, FaRegHeart } from "react-icons/fa";
import { MdVideoLibrary, MdOutlineSupportAgent, MdConnectWithoutContact, MdSettings } from "react-icons/md";

export const getSidebarData = (t) => [
  {
    title: t("home"),
    path: "/",
    icon: <AiFillHome />,
    cName: "nav-text",
  },
  {
    title: t("myProfile"),
    path: "/profile",
    icon: <FaUserCircle />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: t("trends"),
    path: "/trend",
    icon: <FaFireAlt />,
    cName: "nav-text",
  },
  {
    title: t("following"),
    path: "/following",
    icon: <FaUserFriends />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: t("filmLibrary"),
    path: "/myvideos",
    icon: <MdVideoLibrary />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: t("likes"),
    path: "/likes",
    icon: <AiOutlineLike />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: t("contact"),
    path: "/contact",
    icon: <MdConnectWithoutContact />,
    cName: "nav-text",
  },
  {
    title: t("support"),
    path: "/support",
    icon: <MdOutlineSupportAgent />,
    cName: "nav-text",
  },
  {
    title: t("settings"),
    path: "/settings",
    icon: <MdSettings />,
    cName: "nav-text",
  },
];

// Keep backward compatibility
export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "My Profile",
    path: "/profile",
    icon: <FaUserCircle />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: "Trends",
    path: "/trend",
    icon: <FaFireAlt />,
    cName: "nav-text",
  },
  {
    title: "Following",
    path: "/following",
    icon: <FaUserFriends />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: "Film Library",
    path: "/myvideos",
    icon: <MdVideoLibrary />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: "Likes",
    path: "/likes",
    icon: <AiOutlineLike />,
    cName: "nav-text",
    authRequired: true,
  },
  {
    title: "Contact",
    path: "/contact",
    icon: <MdConnectWithoutContact />,
    cName: "nav-text",
  },
  {
    title: "Support",
    path: "/support",
    icon: <MdOutlineSupportAgent />,
    cName: "nav-text",
  },
];
