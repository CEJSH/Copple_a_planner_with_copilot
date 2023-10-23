// PlanListPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/PlanList.module.css";
import GoalPhoto from "../components/GoalPhoto";
import GoalSchedule from "../components/GoalSchedule";
import { useLocation, useParams } from "react-router-dom";
import { selectedGoalState } from "../atoms";
import { useRecoilState } from "recoil";

function PlanListPage() {
  const { state } = useLocation();
  const { event_id } = useParams();
  const [data, setData] = useState({
    goalPhoto: "",
    goalTitle: "",
    schedules: [],
    tasks: [],
  });
  const tokenstring = document.cookie;
  const token = tokenstring.split("=")[1];

  if (event_id) {
    const url = `http://localhost:8000/event/groupByGoal/${event_id}`;
    axios
      .get(url, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
        console.log(response);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }

  return (
    <div className={styles.PlanListWrapper}>
      <div className={styles.PlanListContainer}>
        <div className={styles.goalPhoto}>
          <GoalPhoto eventId={state.event_id} />
        </div>
        <div className={styles.goalTitle}>
          <h2>{data.goalTitle}</h2>
        </div>
        <div className={styles.goalSchedule}>
          <GoalSchedule eventId={state.event_id} />
        </div>
      </div>
    </div>
  );
}

export default PlanListPage;
