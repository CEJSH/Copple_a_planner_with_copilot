import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/UserPhoto.module.css";

function UserPhoto() {
  const [userImageURL, setUserImageURL] = useState("");

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const tokenstring = document.cookie;
        const token = tokenstring.split("=")[1];
        await axios({
          method: "POST",
          url: "http://localhost:8000/account/profile",
          withCredentials: false,
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
          data: {
            user_id: "Copple",
            user_name: "코플",
          },
        }).then((response) => {
          setUserImageURL(response.data.profileImageUrl || "");
          console.log(response);
        });
      } catch (error) {
        console.error(
          "An error occurred while fetching user information:",
          error
        );
      }
    }

    fetchUserProfile();
  }, []);

  return (
    <div className={styles.profileImageSection}>
      <div
        className={styles.imageCircle}
        style={
          userImageURL
            ? {
                backgroundImage: `url(${userImageURL})`,
                backgroundSize: "contain",
              }
            : {}
        }
        onClick={() => console.log("Add a profile photo")}
      >
        {!userImageURL && <span>+</span>}
      </div>
      <div className={styles.imageAction}>
        <p>
          코플님, 좋은 아침입니다 🥰 <br /> 오늘도 힘찬 하루 보내세요!🍀💛
        </p>
      </div>
    </div>
  );
}

export default UserPhoto;
