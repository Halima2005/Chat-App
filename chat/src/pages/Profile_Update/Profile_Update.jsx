import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { auth, db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import upload from "../../lib/upload";
import "./Profile_Update.css";
const Profile_Update = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("upload profile image");
      }
      const docRef = doc(db, "users", uid);

      if (image) {
        const imageUrl = await upload(image);
        setPrevImage(imageUrl);
        await updateDoc(docRef, {
          avatar: imageUrl,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        if (userData) {
          if (userData.name) setName(userData.name);
          if (userData.bio) setBio(userData.bio);
          if (userData.avatar) setPrevImage(userData.avatar);
        }
      } else {
        navigate("/");
      }
    });
  
    return () => unsubscribe(); // 🔥 Always unsubscribe
  }, [navigate]);
  

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt=""
            />
            Upload Profile Image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="write profile bio"
            required
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default Profile_Update;
