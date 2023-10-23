import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  setMonth,
  setYear,
  isToday,
} from "date-fns";
import styles from "../styles/WeeklyCalendar.module.css";
import { isEqual } from "date-fns";
import { useRecoilState } from "recoil";
import { eventsPropState, selectedDateState } from "../atoms";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { modeState } from "../atoms";

function WeeklyCalendar() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const yearModalRef = useRef(null);
  const monthModalRef = useRef(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [mode, setMode] = useRecoilState(modeState);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const addModalRef = useRef(null);
  const [eventsProp, setEventsProp] = useRecoilState(eventsPropState);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);

  useEffect(() => {
    const days = Array.from({ length: 7 }).map((_, idx) =>
      addDays(startDate, idx)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (days.some((day) => isToday(day))) {
      setSelectedDate(today);
    } else {
      setSelectedDate(startDate);
    }
  }, [startDate, setSelectedDate]);

  useEffect(() => {
    async function fetchUserEvents() {
      try {
        const tokenstring = document.cookie;
        const token = tokenstring.split("=")[1];
        const formattedDay = selectedDate
          ? format(selectedDate, "yyyy-MM-dd HH:mm:ss")
          : format(new Date(), "yyyy-MM-dd HH:mm:ss");
        console.log("여기 : formattedDay", formattedDay);
        console.log("여기 : selectedDate", selectedDate);
        if (formattedDay) {
          // if (selectedDate) {
          const response = await axios({
            method: "GET",
            // url: `http://localhost:8000/event/readByDate/${selectedDate}`,
            url: `http://localhost:8000/event/readByDate/${formattedDay}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
          setEventsProp(response.data);
        }
      } catch (error) {
        console.error("An error occurred while fetching user events:", error);
      }
    }
    fetchUserEvents();
  }, [selectedDate]);

  useEffect(() => {
    const newDate = setYear(setMonth(new Date(), selectedMonth), selectedYear);
    setStartDate(startOfWeek(newDate, { weekStartsOn: 0 }));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        yearModalRef.current &&
        !yearModalRef.current.contains(event.target)
      ) {
        setShowYearModal(false);
      }
      if (
        monthModalRef.current &&
        !monthModalRef.current.contains(event.target)
      ) {
        setShowMonthModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const days = Array.from({ length: 7 }).map((_, idx) =>
    addDays(startDate, idx)
  );
  console.log("days", days);
  const goToPreviousWeek = () =>
    setStartDate((prevStartDate) => addDays(prevStartDate, -7));
  const goToNextWeek = () =>
    setStartDate((prevStartDate) => addDays(prevStartDate, 7));

  const handleDayClick = (day) => {
    setSelectedDate(day);
    console.log("selectedDate : ", day);
  };

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (addModalRef.current && !addModalRef.current.contains(event.target)) {
        setShowAddModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleAddOptionClick = (path) => {
    setMode("create");
    navigate(path);
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.dateSelector}>
        <div
          className={styles.selectorItem}
          style={{ cursor: "pointer" }}
          onClick={() => setShowYearModal(true)}
        >
          {selectedYear}년
          {showYearModal && (
            <div className={styles.modal} ref={yearModalRef}>
              {Array.from({ length: 31 }).map((_, idx) => {
                const yearValue = 2020 + idx;
                return (
                  <div
                    key={yearValue}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedYear(yearValue);
                      setShowYearModal(false);
                    }}
                  >
                    {yearValue}년
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div
          className={styles.selectorItem}
          style={{ cursor: "pointer" }}
          onClick={() => setShowMonthModal(true)}
        >
          {selectedMonth + 1}월
          {showMonthModal && (
            <div className={styles.modal} ref={monthModalRef}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedMonth(idx);
                    setShowMonthModal(false);
                  }}
                >
                  {idx + 1}월
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showMonthlyModal && (
        <div className={styles.monthlyModal}>
          <button onClick={() => setShowMonthlyModal(false)}>Close</button>
        </div>
      )}

      <div className={styles.addIconWrapper}>
        <div className={styles.addIcon} onClick={toggleAddModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="0.8em"
            viewBox="0 0 448 512"
            style={{ fill: "#9d9d9d", height: "20" }}
          >
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
          </svg>
        </div>
        {showAddModal && (
          <div ref={addModalRef} className={styles.addModal}>
            <button onClick={() => handleAddOptionClick("/goal")}>
              목표 추가
            </button>
            <br />
            <button onClick={() => handleAddOptionClick("/plan")}>
              일정 추가
            </button>
            <br />
            <button onClick={() => handleAddOptionClick("/todo")}>
              할일 추가
            </button>
          </div>
        )}
      </div>

      <div className={styles.calendarNavigation}>
        {/* <button
          className={styles.calendarleftbutton}
          onClick={goToPreviousWeek}
        > */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <svg
            onClick={goToPreviousWeek}
            className={styles.calendarleftbutton}
            xmlns="http://www.w3.org/2000/svg"
            height="0.8em"
            viewBox="0 0 320 512"
            style={{ fill: "#9d9d9d;" }}
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
          </svg>
        </div>
        {/* </button> */}
        <div className={styles.calendarContainer}>
          {days.map((day, idx) => (
            <div
              key={idx}
              className={styles.calendarDay}
              onClick={() => handleDayClick(day)}
            >
              <div className={styles.calendarDayName}>{format(day, "E")}</div>
              <div
                className={`${styles.calendarDayNumber} ${
                  isToday(day)
                    ? styles.today
                    : "" || isEqual(selectedDate, day)
                    ? styles.selectedDay
                    : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        {/* <button className={styles.calendarrightbutton} onClick={goToNextWeek}> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <svg
            onClick={goToNextWeek}
            className={styles.calendarrightbutton}
            xmlns="http://www.w3.org/2000/svg"
            height="0.8em"
            viewBox="0 0 320 512"
            style={{ fill: "#9d9d9d;" }}
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
          </svg>
        </div>
        {/* </button> */}
      </div>
    </div>
  );
}

export default WeeklyCalendar;
