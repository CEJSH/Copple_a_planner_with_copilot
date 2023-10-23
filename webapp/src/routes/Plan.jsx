import styles from "../css/FormStyle.module.css";
import Selectop from "../components/Select";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import React from "react";
import {
  goalState,
  modeState,
  selectedDateState,
  selectedGoalState,
} from "../atoms";
import axios from "axios";
import format from "date-fns/format";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers";

function Plan() {
  const [mode, setMode] = useRecoilState(modeState);
  const [stime, setStime] = useState(new Date());
  const [etime, setEtime] = useState(new Date());
  const [sdate, setSdate] = useState(new Date());
  const [edate, setEdate] = useState(new Date());
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/main"); // 뒤로 가기
  };

  // const { title, endDatetime, startDatetime, location, goal, content } =
  //   planinfo;
  // let event_id = null;
  const [selectedgoal, setSelectedgoal] = useRecoilState(selectedGoalState);
  console.log(selectedgoal, "here");
  let planState = {
    title: "",
    goal: selectedgoal,
    startDatetime: format(sdate, "yyyy-MM-dd ") + format(stime, "hh:mm:ss a"),
    endDatetime: format(edate, "yyyy-MM-dd ") + format(etime, "hh:mm:ss a"),
    location: "",
    content: "",
  };
  const [planinfo, setPlaninfo] = useState(planState);
  const SendPlan = async (data, event, method, event_id) => {
    setMode(null);
    try {
      const tokenstring = document.cookie;
      const token = tokenstring.split("=")[1];
      const url = `http://localhost:8000/event/${event}`;
      await axios({
        method: method,
        url: url,
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: data.title,
          startDatetime:
            format(sdate, "yyyy-MM-dd ") + format(stime, "hh:mm:ss"),
          endDatetime: format(edate, "yyyy-MM-dd ") + format(etime, "hh:mm:ss"),
          goal: data.goal,
          location: data.location,
          content: data.content,
        },
        withCredentials: false,
      }).then((response) => {
        if (response.status === 200) {
          setMode(null);
          alert("성공");
        }
      });
    } catch (error) {
      console.error("An error occurred while updating profile:", error);
    }
  };

  const TitleHandler = (e) => {
    setPlaninfo({ ...planinfo, title: e.target.value });
  };

  const LocationHandler = (e) => {
    setPlaninfo({ ...planinfo, location: e.target.value });
  };
  const ContentHandler = (e) => {
    setPlaninfo({ ...planinfo, content: e.target.value });
  };
  //에러나는 함수(try catch가 없을 때)
  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   await setPlaninfo({ ...planinfo, goal: selectedgoal });
  //   await SendPlan(planinfo);
  //   navigate("/home");
  //   console.log(selectedgoal);
  // };

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === "update") {
      const method = "PUT";
      const event = "update";
      console.log(planinfo);
      SendPlan(planinfo, event, method, selectedgoal).then(navigate("/main"));
    } else {
      const method = "POST";
      const event = "create";
      console.log(planinfo);
      SendPlan(planinfo, event, method).then(navigate("/main"));
    }
  };
  // 아직 미완성
  // useEffect(() => {
  //   if (mode === "update") {
  //     getPlandata(event_id);
  //   }
  // }, []);

  return (
    <div className={styles.Container}>
      <form className={styles.Form} onSubmit={onSubmit}>
        <nav className={styles.Navbar}>
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
          <button className={styles.selected}>
            <Link to="/plan">일정</Link>
          </button>
          <button className={styles.Btn}>
            <Link to="/todo">할일</Link>
          </button>

          <div></div>
          <button className={styles.Btn} type="submit">
            저장
          </button>
        </nav>
        <div className={styles.Tag}>제목</div>
        <div className={styles.Tag}>
          <input
            required
            className={styles.Input}
            value={planinfo.title}
            onChange={TitleHandler}
            maxLength={20}
          ></input>
        </div>
        <div className={styles.Tag}>시작</div>
        <div className={styles.TimeWrapper}>
          <DatePicker
            value={sdate}
            onChange={(date) => {
              setSdate(date);
            }}
            label="날짜"
          />
          <TimePicker
            label="시간"
            value={stime}
            onChange={(time) => {
              setStime(time);
              console.log(stime);
            }}
          />
        </div>
        <div className={styles.Tag}>종료</div>
        <div className={styles.TimeWrapper}>
          <DatePicker
            value={edate}
            onChange={(date) => {
              setEdate(date);
            }}
            label="날짜"
          />
          <TimePicker
            label="시간"
            value={etime}
            onChange={(time) => {
              setEtime(time);
              console.log(etime);
            }}
          />
        </div>

        {mode === "update" || selectedgoal !== null ? (
          <></>
        ) : (
          <>
            <div className={styles.Tag}>목표</div>
            <div className={styles.Tag}>
              {" "}
              <Selectop />{" "}
            </div>
          </>
        )}

        <div className={styles.Tag}>내용</div>
        <div className={styles.Tag}>
          <input
            style={{ height: "90px" }}
            value={planinfo.content}
            onChange={ContentHandler}
            className={styles.Input}
          ></input>
        </div>
        <div className={styles.Tag}>장소</div>
        <div className={styles.Tag}>
          <input
            className={styles.Input}
            value={planinfo.location}
            onChange={LocationHandler}
          ></input>
        </div>
      </form>
    </div>
  );
}

export default Plan;
