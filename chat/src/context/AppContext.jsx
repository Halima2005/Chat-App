import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatsData, setChatsData] = useState(null);
const [messagesId,setMessagesId] =useState(null);
const[messages,setMessages] =useState([]);
const[chatUser,setChatUser] = useState(null);
const[chatVisible,setChatVisible] = useState(false);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setUserData(userData);
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(async () => {
        if (auth.chatUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {}
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data().chatsData || []; // ✅ FIXED: Correct key
  
        const enrichedChats = await Promise.all(
          chatItems.map(async (item) => {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};
            return {
              ...item,
              userData, // ✅ FIXED: Properly attaching user data
            };
          })
        );
  
        // Sort by recent messages
        enrichedChats.sort((a, b) => b.updateAt - a.updateAt);
  
        setChatsData(enrichedChats);
      });
  
      return () => unSub();
    }
  }, [userData]);
  
  const value = {
    userData,
    setUserData,
    chatsData,
    setChatsData,
    loadUserData,
    messages,setMessages,
    messagesId,setMessagesId,
    chatUser,setChatUser,
    chatVisible,setChatVisible
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
