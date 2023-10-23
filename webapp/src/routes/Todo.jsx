import { Link, useNavigate } from "react-router-dom";
import Selectop from "../components/Select";
import axios from "axios";
import React from "react";
import styles from "../css/FormStyle.module.css";
import { useRecoilState } from "recoil";
import { goalState, modeState, selectedGoalState } from "../atoms";
import { useState, useEffect } from "react";

function Todo() {
  const [mode, setMode] = useRecoilState(modeState);
  // let event_id = null;
  const [selectedgoal, setSelectedgoal] = useRecoilState(selectedGoalState);
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/main"); // 뒤로 가기
    setSelectedgoal(null);
  };
  //아직 미완성
  const getTodoData = async (event_id) => {
    const tokenstring = document.cookie;
    const token = tokenstring.split("=")[1];
    await axios({
      method: "get",
      url: `http://localhost:8000/todo/read/${event_id}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }).then((response) => {
      console.log(response.data);
      if (mode === "update") {
        setTodoinfo(response.data);
      }
    });
  };
  const todoState = {
    title: "",
    location: "",
    goal: selectedgoal,
    content: "",
    isCompleted: false,
  };
  console.log(selectedgoal);

  const [todoinfo, setTodoinfo] = useState(todoState);

  const SendTodo = async (data, event, method, event_id) => {
    setMode(null);
    try {
      console.log(todoState);
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
      const url = event_id
        ? `http://localhost:8000/todo/${event}/${event_id}`
        : `http://localhost:8000/todo/${event}`;
      await axios({
        method: method,
        url: url,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: data.title,
          goal: data.goal,
          location: data.location,
          content: data.content,
          isCompleted: data.isCompleted,
        },
        withCredentials: false,
      }).then((response) => {
        if (response.status === 200) {
          setSelectedgoal(null);
          setMode(null);
          alert("성공");
        }
      });
    } catch (error) {
      console.error("An error occurred", error);
    }
  };
  const TitleHandler = (e) => {
    setTodoinfo({ ...todoinfo, title: e.target.value });
  };
  const LocationHandler = (e) => {
    setTodoinfo({ ...todoinfo, location: e.target.value });
  };
  const ContentHandler = (e) => {
    setTodoinfo({ ...todoinfo, content: e.target.value });
  };
  const IsCompletedHandler = (e) => {
    setTodoinfo({ ...todoinfo, isCompleted: e.target.checked });
  };
  useEffect(() => {
    // if (mode === "update") {
    //   getTodoData(todoId);
    // }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === "update") {
      const method = "PUT";
      const event = "update";
      console.log(todoinfo);
      SendTodo(todoinfo, event, method, selectedgoal).then(navigate("/main"));
    } else {
      const method = "POST";
      const event = "create";
      console.log(todoinfo);
      SendTodo(todoinfo, event, method).then(navigate("/main"));
    }
  };
  return (
    <div className={styles.Container}>
      <form onSubmit={onSubmit}>
        <div className={styles.Navbar}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <svg
              onClick={handleGoBack}
              className={styles.leftbutton}
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 320 512"
              style={{ fill: "black" }}
            >
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
            </svg>
          </div>
          <button className={styles.Btn}>
            <Link to="/goal">목표</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/plan">일정</Link>
          </button>
          <button className={styles.selected}>
            <Link to="/todo">할일</Link>
          </button>

          <div></div>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </div>
        <div className={styles.Tag}>제목</div>
        <div className={styles.Tag}>
          <input
            required
            maxLength={20}
            value={todoinfo.title}
            onChange={TitleHandler}
            className={styles.Input}
          ></input>
        </div>
        <span></span>
        {mode === "update" || selectedgoal ? (
          <></>
        ) : (
          <>
            <div className={styles.Tag}>목표</div>
            <div className={styles.Tag}>
              <Selectop />
            </div>
          </>
        )}
        <div className={styles.Tag}>내용</div>
        <div className={styles.Tag}>
          <textarea
            style={{ height: "90px" }}
            value={todoinfo.content}
            onChange={ContentHandler}
            className={styles.Input}
          ></textarea>
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            maxLength={20}
            value={todoinfo.location}
            onChange={LocationHandler}
            className={styles.Input}
          ></input>
        </div>
        <div style={{ width: "100%" }}>
          <div className={styles.Tag}>완료</div>
          <div className={styles.Tag}>
            <input
              className={styles.check}
              value={todoinfo.isCompleted}
              onChange={IsCompletedHandler}
              type="checkbox"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default Todo;
