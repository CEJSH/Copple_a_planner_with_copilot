import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CalendarThumbnail.module.css";
import axios from "axios";
import defaultImage from "../assets/images/rabbit.jpeg";

function ThumbnailList({ goals: initialGoals, id }) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState(initialGoals || []);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const tokenString = document.cookie;
        const token = tokenString.split("=")[1];

        const response = await axios.get("http://localhost:8000/goal/read", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          const sortedGoals = [...response.data].sort((a, b) =>
            a.title.localeCompare(b.title)
          );
          setGoals(sortedGoals);
        } else {
          console.error("Received data is not an array");
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    }

    fetchGoals();
  }, []);

  const goToPlanList = (event_id) => {
    navigate("/planlist", { state: { event_id } });
  };

  return (
    <div className={styles.CalendarThumbnailContainer}>
      {Array.isArray(goals)
        ? goals.map((goal, index) => (
            <div
              key={index}
              className={styles.CalendarThumbnailbigBox}
              onClick={() => {
                goToPlanList(goal.event_id);
              }}
            >
              <div className={styles.CalendarThumbnailthumbnailBox}>
                <img
                  src={goal.photoUrl || defaultImage}
                  alt={`Goal ${goal.title}`}
                  className={styles.CalendarThumbnailthumbnail}
                />
              </div>
              <div className={styles.CalendarThumbnailgoalInfo}>
                <span className={styles.CalendarThumbnailgoalTitle}>
                  {goal.title}
                </span>
                <span
                  className={styles.CalendarThumbnailgoalPeriod}
                >{`${goal.startDatetime}`}</span>
              </div>
            </div>
          ))
        : null}
      <button
        className={styles.CalendarThumbnailloadMore}
        onClick={() => navigate("/goal")}
      >
        +
      </button>
    </div>
  );
}

export default ThumbnailList;
