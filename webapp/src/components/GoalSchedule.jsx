import React, { useState, useEffect } from "react";
import styles from "../styles/GoalSchedule.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { modeState, selectedGoalState } from "../atoms";

function GoalSchedule({ eventId }) {
  console.log("event_id :", eventId);
  const navigate = useNavigate();
  const [selectedgoal, setSelectedgoal] = useRecoilState(selectedGoalState);
  const [selectedCategory, setSelectedCategory] = useState("일정");
  const [mode, setMode] = useRecoilState(modeState);
  const [loadedData, setLoadedData] = useState({ schedules: [], todos: [] });
  const moveToCreatePage = () => {
    if (selectedCategory === "일정") {
      setMode(null);
      navigate("/plan");
    } else if (selectedCategory === "할일") {
      setMode(null);
      navigate("/todo");
    }
  };
  useEffect(() => {
    if (eventId) {
      setSelectedgoal(eventId);
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];

      const url = `http://localhost:8000/event/groupByGoal/${eventId}`;
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data;

          const schedules = Object.entries(data).map(([date, events]) => {
            events.sort(
              (a, b) => new Date(a.startDatetime) - new Date(b.startDatetime)
            );
            return {
              day: date.substring(5),
              schedules: events.map((event) => ({
                title: event.title,
                time: `${event.startDatetime.substring(
                  10,
                  16
                )}  - ${event.endDatetime.substring(10, 16)}`,
              })),
            };
          });

          schedules.sort((a, b) => new Date(a.day) - new Date(b.day));
          setLoadedData((prevState) => ({ ...prevState, schedules }));
        })

        .catch((error) => {
          console.error("There was an error!", error);
        });
    }
  }, [eventId]);

  const getButtonClassName = (category) =>
    selectedCategory === category ? `${styles.active}` : "";

  //누르면 색깔 바뀌는 함수
  const getBlueButtonClassName = () =>
    selectedCategory === "추가"
      ? `${styles.active} ${styles.blueButton}`
      : `${styles.blueButton}`;

  const handleTodoToggle = (todoId) => {
    console.log(`Toggle todo with ID ${todoId}`);
  };

  return (
    <div>
      <div className={styles.categoryRow}>
        <div className={styles.buttnoCategory}>
          <button
            className={getButtonClassName("일정")}
            onClick={() => setSelectedCategory("일정")}
          >
            일정
          </button>
          <button
            className={getButtonClassName("할일")}
            onClick={() => setSelectedCategory("할일")}
          >
            할일
          </button>
        </div>
        <button
          style={{ marginLeft: "165px" }}
          className={getBlueButtonClassName("추가")}
          onClick={() => moveToCreatePage()}
        >
          + 추가
        </button>
      </div>

      {selectedCategory === "일정" && (
        <div className={styles.scrollableContainer}>
          <div className={styles.scheduleContainer}>
            {loadedData.schedules.map((daySchedule, index) => (
              <div key={`day-${index}`} className={styles.daySchedule}>
                <h3 className={styles.scheduledate}>
                  {`${daySchedule.day.slice(0, 2)}월`}{" "}
                  {`${daySchedule.day.slice(3)}일`}
                </h3>
                {daySchedule.schedules.map((schedule, idx) => (
                  <div key={`schedule-${idx}`} className={styles.scheduleBox}>
                    <div>{schedule.title}</div>
                    <div>{schedule.time}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCategory === "할일" && (
        <div className={styles.todoContainer}>
          {loadedData.todos.map((todo) => (
            <div key={todo.id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleTodoToggle(todo.id)}
              />
              <span>{todo.task}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalSchedule;
