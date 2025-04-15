import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDoc,
  where,
  orderBy
} from "firebase/firestore";
import React, { useContext, useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import "./LeftSidebar.css";
const LeftSidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { userData,  chatsData,setChatsData ,chatUser,setChatUser,setMessagesId,messagesId,chatVisible,setChatVisible} = useContext(AppContext);
  const { currentUser } = useContext(AppContext);
  

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExit = false;
          chatsData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExit = true;
            }
          });
          if (!userExit) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error(error.messages);
      console.log(error);
    }
  };
  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatRef = collection(db, "chats");
    try {
      const newMessagesRef = doc(messagesRef);

      await setDoc(newMessagesRef, {
        createAt: serverTimestamp(),
        messages: [],
      });
      


      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessagesRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessagesRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db,"users",user.id));
      const uData = uSnap.data();
      setChat({
        messagesId:newMessagesRef.id,
        lastMessage:"",
        rId:user.id,
        updatedAt:Date.now(),
        messageSeen:true,
        userData:uData
      })
      setChatVisible(true);
    } catch (error) {
      toast.error(error.messages);
      console.log(error);
    }
  };
useEffect(()=>{
  const updateChatUserData = async()=>{

    if(chatUser){
      const userRef = doc(db,"users",chatUser.userData.id)
      const userSnap = await getDoc(userRef);
      const userData =userSnap.data();
      setChatUser(prev=>({...prev,userData:userData}))
    }
    
  }

  updateChatUserData();
},[chatsData])
  const setChat = async (item) => {
    // try {
    //   console.log("Chat item clicked:", item);
    //   const messageDocRef = doc(db, "messages", item.messageId);
    //   const messageSnap = await getDoc(messageDocRef);
  
    //   if (messageSnap.exists()) {
    //     const messageData = messageSnap.data();
    //     console.log("Messages for this chat:", messageData.messages);
    //     console.log("currentUser", currentUser);
    //   } else {
    //     console.log("No messages found for this chat.");
    //   }
    // } catch (error) {
    //   console.error("Error fetching chat messages:", error);
    // }
   try{

    setMessagesId(item.messageId);
    setChatUser(item)
    const userChatsRef = doc(db,'chats',userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data();
    const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
    userChatsData.chatsData[chatIndex].messageSeen = true;
    await updateDoc(userChatsRef,{
      chatsData:userChatsData.chatsData
    })
    setChatVisible(true);
  }catch(error){
    toast.error(error.message);
  }
  
  }
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatRef = doc(db, "chats", userData.id);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
          const chatItems = chatSnap.data().chatsData || [];
  
          const enrichedChats = await Promise.all(
            chatItems.map(async (chat) => {
              const userSnap = await getDoc(doc(db, "users", chat.rId));
              return {
                ...chat,
                userData: userSnap.exists() ? userSnap.data() : {},
              };
            })
          );
  
          // Now enrichedChats has full user info per chat
          // You should store this in a state or context
          setChatsData(enrichedChats); // You might need to add setChatsData to AppContext
        }
      } catch (err) {
        console.error("Error fetching chats", err);
      }
    };
  
    if (userData?.id) {
      fetchChats();
    }
  }, [userData]);
  
  return (
    <div className={`ls ${chatVisible ?"hidden":""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatsData &&
          chatsData.map((item, index) => (
            <div onClick={() => setChat(item)} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`} key={index}>
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
