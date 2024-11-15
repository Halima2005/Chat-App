import React from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSideBar from "../../components/RightSideBar/RightSideBar";
import "./Chat.css";
const Chat = () => {
  return (
    <div className="chat">
      <div className="chat-container">
        <LeftSidebar />
        <ChatBox />
        <RightSideBar />
      </div>
    </div>
  );
};

export default Chat;
