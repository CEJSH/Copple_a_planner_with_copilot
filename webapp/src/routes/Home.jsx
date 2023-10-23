import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import React from "react";
import shortid from "shortid";
import styled from "styled-components";
import Goalitem from "../components/Goalitem";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  infoState,
  modeState,
  nameState,
  goalListState,
  goalState,
} from "../atoms.js";
import NavBar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const tokenstring = document.cookie;
  const token = tokenstring.split("=")[1];
  const [imageURL, setImageURL] = useState(null);
  const [goals, setGoals] = useRecoilState(goalState);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [notcompletedGoals, setNotcompletedGoals] = useState([]);
  const [goalList, setGoalList] = useRecoilState(goalListState);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const info = useRecoilValue(infoState);
  const [name, setName] = useRecoilState(nameState);
  const [bio, setBio] = useState("");
  const [mode, setMode] = useRecoilState(modeState);

  const colors = [
    "#cdb4db",
    "#ffc8dd",
    "#ffafcc",
    "#bde0fe",
    "#a2d2ff",
    "#ffd6ff",
    "#e7c6ff",
    "#c8b6ff",
    "#b8c0ff",
    "#bbd0ff",
  ];
  const getName = async (id) => {
    try {
      const response1 = await axios({
        method: "post",
        url: "http://localhost:8000/account/find/id",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          user_id: id,
        },
        withCredentials: false,
      });

      const name = response1.data.user_names[0];
      setName(name);

      const response2 = await axios({
        method: "POST",
        url: "http://localhost:8000/account/profile",
        withCredentials: false, // 쿠키를 사용하므로 true로 설정
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        data: {
          user_id: info,
          user_name: name,
        },
      });

      const bio = response2.data.introduction || "";
      const imageURL = response2.data.profileImageUrl || "";

      setBio(bio);
      setImageURL(imageURL);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  const doneHandler = (e) => {
    e.target.textContent === "지금 진행중" ? setDone(false) : setDone(true);
    console.log(done);
  };

  async function getData() {
    await axios({
      method: "GET",
      url: "http://localhost:8000/goal/read",
      withCredentials: false, // 쿠키를 사용하므로 true로 설정
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.data.detail === "목표가 없습니다.") return;
      else {
        setGoals(response.data ? response.data : null);

        setMode(null);
        const sortedGoals = [...response.data].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        const completedGoals = setCompletedGoals(
          sortedGoals.filter((value) => value.isCompleted === true)
        );
        const notcompletedGoals = setNotcompletedGoals(
          sortedGoals.filter((value) => value.isCompleted === false)
        );
        setGoalList(sortedGoals);
      }
    });
  }

  useEffect(() => {
    getName(info);
    getData();
  }, [Goalitem]);

  const offset = 4;
  const MoveToGoalFormHandler = () => {
    navigate("/goal");
  };
  return (
    <Background>
      <BigContainer>
        <Container className="first">
          <SmallContainer>
            <Link to={"/profile"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 512 512"
                style={{ fill: "#6d6c69" }}
              >
                <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
              </svg>
            </Link>
          </SmallContainer>
          <Index1>
            <ProfileImageSection>
              <ImageCircle
                style={imageURL ? { backgroundImage: `url(${imageURL})` } : {}}
              >
                {!imageURL && <span>+</span>}
              </ImageCircle>
            </ProfileImageSection>
            <Profile>
              <strong>{name}</strong>
              <br />@ {info}
            </Profile>
          </Index1>
          <ProfileMsg>{bio}</ProfileMsg>
        </Container>
        <Container>
          <Index2>
            <SBtn
              className={done === false ? "active" : ""}
              style={{ paddingLeft: "13px" }}
              onClick={doneHandler}
            >
              지금 진행중
            </SBtn>
            <SBtn
              className={done === true ? "active" : ""}
              onClick={doneHandler}
            >
              완료
            </SBtn>
            <div> </div>
            <SBtn onClick={MoveToGoalFormHandler} className="black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 448 512"
                style={{ fill: "#e0c3fc", height: "20" }}
              >
                <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
              </svg>
            </SBtn>
          </Index2>
          <div>
            <ScrollableContainer>
              <Row
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={index}
              >
                {done === false &&
                  notcompletedGoals.length > 0 &&
                  notcompletedGoals.map((goal) => (
                    <Goalitem
                      key={shortid.generate()}
                      // variants={BoxVariants}
                      goaltitle={goal["title"]}
                      goalperiod={goal["startDatetime"]}
                      event_id={goal["event_id"]}
                      photoUrl={goal["photoUrl"]}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                    ></Goalitem>
                  ))}
                {done === true &&
                  completedGoals.length > 0 &&
                  completedGoals.map((goal) => (
                    <Goalitem
                      key={shortid.generate()}
                      // variants={BoxVariants}
                      goaltitle={goal["title"]}
                      goalperiod={goal["startDatetime"]}
                      event_id={goal["event_id"]}
                      photoUrl={goal["photoUrl"] || goal["imageUrl"]}
                      whileHover="hover"
                      initial="normal"
                      transition={{ type: "tween" }}
                    ></Goalitem>
                  ))}
              </Row>
              <div style={{ marginTop: "40px" }}> </div>
            </ScrollableContainer>
          </div>
          <div>
            <NavBar />
          </div>
        </Container>
      </BigContainer>
    </Background>
  );
}

const ScrollableContainer = styled.div`
  height: calc(100vh - 300px); /* Adjust the height as needed */
  overflow-y: scroll;
  -ms-overflow-style: none; /* IE, Edge: 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox: 스크롤바 숨기기 */

  &::-webkit-scrollbar {
    width: 0; /* Chrome, Safari, Opera: 스크롤바의 너비 설정 */
    display: none; /* 스크롤바 숨기기 */
  }
`;

const BigContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;
const Row = styled(motion.div)`
  display: grid;
  padding-bottom: 0px;
  grid-template-columns: repeat(2, 1fr);
`;

const Background = styled.div`
  width: 375px;
  margin: 0px auto;
  height: 100vh;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.05);
`;

const Container = styled.div`
  flex-grow: 1;
  position: relative;
  padding: 10px 0px;
  height: 100vh;
  display: flex;
  margin-top: 0px;
  width: auto;
  background-color: white;
  flex-direction: column;
  &.first {
    width: 375px;
    padding: 20px 20px;
    margin-bottom: 0px;
    height:300px;
    background: rgb(195,34,145);
    position: sticky;
    background-color: #b4daff;
    background-image: linear-gradient(62deg, #b4daff 0%, #E0C3FC 100%);
   
`;
const SmallContainer = styled.div`
  text-align: right;
  background: none;
  a {
    color: #7e7e7e;
    text-decoration: none;
  }
`;
const Index1 = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
  background-color: none;
  border-radius: 0px;
  padding-right: 10px;
  div {
    padding: 0px;
    margin: 0px;
    flex-grow: 0;
  }
  &:last-child {
    position: fixed;
    bottom: 30px;
    width: 375px;
    justify-content: center;
    align-items: space-between;
  }
`;
const Index2 = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
  background-color: none;
  border-radius: 0px;
  padding-right: 10px;
  margin: 5px 0;
  div {
    padding: 0px;
    margin: 0px;
    flex-grow: 0.93;
  }
  &:last-child {
    position: fixed;
    bottom: 30px;
    width: 375px;
    justify-content: center;
    align-items: space-between;
  }
`;
const IconNav = styled.div`
  height: auto;
  display: flex;
  background-color: transparent;
  border-radius: 0px;
  padding-right: 10px;
  position: fixed;
  bottom: 15px;
  width: 375px;
  justify-content: space-between;
  align-items: center;
`;
const Profile = styled.span`
  display: block;
  padding: 50px 30px;
`;
const ProfileMsg = styled.span`
  padding-left: 15px;
  font-size: 13px;
`;
const SBtn = styled.button`
  font-weight: 600;
  font-size: 17px;
  background-color: white;
  margin: 0px 10px;
  border: none;
  color: #aaa7a7;
  &.active {
    color: black;
  }
  &:hover {
    cursor: pointer;
  }
  &.black {
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0px;
    font-weight: 600;
    line-height: 10px;
    // background-color: #b4daff;
    // background-image: linear-gradient(62deg, #b4daff 0%, #e0c3fc 100%);
    // color: white;
    padding: 6px 10px;
    border-radius: 30px;
    &:hover {
      cursor: pointer;
    }
  }
  a {
    display: block;
    color: rgb(255, 252, 229);
    text-decoration: none;
  }
`;
const Icon = styled.button`
  font-size: 17px;
  background-color: transparent;
  margin: 0px;
  border: none;
  &:hover {
    margin: 0px;
    cursor: pointer;
    background-color: transparent;
  }
`;
const Svg = styled.svg`
  width: 30px;
  height: 30px;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 20px;
`;

const ImageCircle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  margin-right: 20px;
`;
