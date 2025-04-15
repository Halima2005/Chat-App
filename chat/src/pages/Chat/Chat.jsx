import React, { useContext, useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSideBar from "../../components/RightSideBar/RightSideBar";
import "./Chat.css";
import { AppContext } from "../../context/AppContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase"; // or wherever your firebase.js is



const Chat = () => {

  const{chatsdata,userData} =useContext(AppContext);
  const[loading,setLoading] = useState(true)
  const [chats, setChats] = useState([]);

  const fetchUserChats = async (userId) => {
    try {
      const userChatsRef = collection(db, "users", userId, "chats");
      const chatSnapshot = await getDocs(userChatsRef);
  
      const userChats = chatSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      console.log("User's Chats:", userChats); // ✅ Only selected user's chat
    } catch (err) {
      console.error("Error fetching user chats:", err);
    }
  };

  useEffect(()=>{
      if(chatsdata && userData){
        setLoading(true)
      }
  },[chatsdata , userData])
  return (
    <div className="chat">
      {
        // loading
        // ?<p className="loading">Loading...</p>
         <div className="chat-container">
          
      {chats.map((chat) => (
        <div key={chat.id} className="chat-message">
          <p>{chat.message}</p>
        </div>
      ))}
    
        <LeftSidebar />
        <ChatBox />
        <RightSideBar />
      </div>
      }
     
    </div>
  );
};

export default Chat;
