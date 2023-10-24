import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import styles from "../styles/Timeline.module.css";
import styled from "styled-components";
import { format } from "date-fns";

const Timeline = ({ eventsProp = [] }) => {
  const [events, setEvents] = useState(eventsProp);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionsIndex, setShowOptionsIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editingTitles, setEditingTitles] = useState({});
  const dropdownRef = useRef();
  useEffect(() => {
    setEvents(eventsProp);
  }, [eventsProp]);

  useEffect(() => {
    const sortedEvents = [...eventsProp].sort((a, b) => {
      return new Date(a.startDatetime) - new Date(b.startDatetime);
    });
    setEvents(sortedEvents);
  }, [eventsProp]);

  const pickColor = () => {
    // Array containing colors
    let colors = ["rgb(255 236 247)", "rgb(247 240 255)", "#EDF3FF"];
    let random_color = colors[Math.floor(Math.random() * colors.length)];
    return random_color;
  };

  const finishEditing = async (eventId, newTitle) => {
    try {
      const tokenString = document.cookie;
      const token = tokenString.split("=")[1];
      await axios.put(
        `http://localhost:8000/event/update/${eventId}`,
        { title: newTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedEvents = events.map((event) =>
        event.event_id === eventId ? { ...event, title: newTitle } : event
      );

      setEvents(updatedEvents);
      setEditIndex(null);
      setShowOptionsIndex(null);
    } catch (error) {
      console.error("Could not finish editing", error);
    }
  };

  const MoreEvents = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const tokenString = document.cookie;
      const token = tokenString.split("=")[1];
      const response = await axios.get(
        `http://localhost:8000/todo/read?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents((prevEvents) => [...prevEvents, ...response.data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching more events", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight - (scrollTop + clientHeight) < 50) {
      MoreEvents();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const deleteEvent = async (index, eventId) => {
    if (window.confirm("이 이벤트를 정말로 삭제하시겠습니까?")) {
      try {
        const tokenString = document.cookie;
        const token = tokenString.split("=")[1];
        await axios.delete(`http://localhost:8000/event/delete/${eventId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedEvents = events.filter(
          (event) => event.event_id !== eventId
        );
        setEvents(updatedEvents);
        setShowOptionsIndex(null);
      } catch (error) {
        console.error("Could not delete event", error);
      }
    }
  };
  const handleCompleteEdit = (eventId, newTitle) => {
    finishEditing(eventId, newTitle);
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptionsIndex(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    // <div className={styles.app}>
    <ul className={styles["event-list"]}>
      {events.map((event, index) => (
        <PlanListItem
          key={event.event_id}
          className={styles["event-item"]}
          style={{
            backgroundColor: `${pickColor()}`,
          }}
        >
          <div>
            <span className={styles["event-time"]}>
              {format(new Date(event.startDatetime), "HH:mm")}
            </span>
          </div>
          <div className={styles.inputwrapper}>
            {editIndex === event.event_id ? (
              <div>
                <input
                  className={styles["edit-input"]}
                  value={editingTitles[event.event_id] || ""}
                  onChange={(e) =>
                    setEditingTitles({
                      ...editingTitles,
                      [event.event_id]: e.target.value,
                    })
                  }
                  onBlur={() =>
                    finishEditing(event.event_id, editingTitles[event.event_id])
                  }
                  autoFocus
                />
              </div>
            ) : (
              <span
                className={styles["event-title"]}
                onDoubleClick={() => {
                  setEditIndex(event.event_id);
                  setEditingTitles({
                    ...editingTitles,
                    [event.event_id]: event.title,
                  });
                }}
              >
                {event.title}
              </span>
            )}
            <div>
              {editIndex === event.event_id ? (
                <button
                  className={styles.completionbutton}
                  onClick={() =>
                    handleCompleteEdit(
                      event.event_id,
                      editingTitles[event.event_id]
                    )
                  }
                >
                  완료
                </button>
              ) : (
                <button
                  className={styles.completionbutton}
                  onClick={() =>
                    setShowOptionsIndex(
                      showOptionsIndex === event.event_id
                        ? null
                        : event.event_id
                    )
                  }
                >
                  ...
                </button>
              )}
            </div>
          </div>
          {showOptionsIndex === event.event_id &&
            editIndex !== event.event_id && (
              <div className={styles["dropdown-options"]} ref={dropdownRef}>
                <button
                  className={styles["edit-btn"]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditIndex(event.event_id);
                    setEditingTitles({
                      ...editingTitles,
                      [event.event_id]: event.title,
                    });
                  }}
                >
                  수정
                </button>
                <button
                  className={styles["delete-btn"]}
                  onClick={() => deleteEvent(index, event.event_id)}
                >
                  삭제
                </button>
              </div>
            )}
        </PlanListItem>
      ))}
    </ul>
    // </div>
  );
};

const PlanListItem = styled.li`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px 12px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  width: 100%;
  position: relative;
  border-radius: 5px;
  font-weight: 400;
`;

export default Timeline;
