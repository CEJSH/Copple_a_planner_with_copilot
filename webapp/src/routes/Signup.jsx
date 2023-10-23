import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [pw, setPw] = useState();
  const [pwcheck, setPwcheck] = useState();
  const onChangeId = function (e) {
    setId(e.target.value);
  };
  const onChangeName = function (e) {
    setName(e.target.value);
  };
  const onChangePw = function (e) {
    setPw(e.target.value);
  };
  const onChangePwcheck = function (e) {
    setPwcheck(e.target.value);
    console.log(pw === pwcheck);
  };
  // Users table에 아이디, 이름 존재 확인 후 가입 진행
  const onSubmit = async (e) => {
    e.preventDefault();
    await axios({
      method: "post",
      url: "http://localhost:8000/account/signup",
      data: {
        user_id: id,
        password: pw,
        user_name: name,
        passwordcheck: pwcheck,
      },
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then(function (response) {
        if ((response.data.detail = "이미 사용 중인 사용자 이름입니다.")) {
          alert("이미 사용 중인 사용자 이름입니다.");
        }
        if ((response.data.detail = "이미 존재하는 사용자 ID입니다.")) {
          alert("이미 존재하는 사용자 ID입니다.");
        }
        if ((response.data.detail = "패스워드가 일치하지 않습니다.")) {
          alert("패스워드가 일치하지 않습니다.");
        }
        if ((response.data.message = "사용자 등록 완료")) {
          alert("Welcome to Copple!");
          navigate("/");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <Background>
      <Container onSubmit={onSubmit}>
        <Tag style={{ marginBottom: "20px" }}>
          <Title>회원가입</Title>
        </Tag>
        <Tag>이름</Tag>
        <Tag>
          <input
            className="username"
            placeholder="Name"
            onChange={onChangeName}
            value={name}
            required
          />
        </Tag>
        <Tag>아이디</Tag>
        <Tag>
          <input
            className="userid"
            placeholder="ID"
            required
            onChange={onChangeId}
            value={id}
          />
        </Tag>
        <Tag>비밀번호</Tag>
        <Tag>
          <input
            className="password"
            type="password"
            placeholder="Password"
            autoComplete="off"
            required
            onChange={onChangePw}
            value={pw}
          />
        </Tag>
        <Tag>비밀번호 확인</Tag>
        <Tag>
          <input
            className="password"
            type="password"
            placeholder="PasswordCheck"
            autoComplete="off"
            required
            onChange={onChangePwcheck}
            value={pwcheck}
          />
        </Tag>
        <Button type="submit">회원가입</Button>
        <HomeButton style={{ marginTop: "40px" }}>
          <Link to="/">Home</Link>
        </HomeButton>
      </Container>

      {/* <Find>
        <Link to="/find">Forgot your id/password?</Link>
      </Find> */}
    </Background>
  );
}

export default Signup;

const Background = styled.div`
  width: 375px;
  height: 100vh;
  display: flex;
  align-items: center;
  text-align: left;
  background-color: white;
  flex-direction: column;
  margin: 0px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
`;
const Tag = styled.div`
  font-style: bold;
  width: 98%;
  text-align: start;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 7px;
  text-align: left;
  input {
    width: 100%;
    height: 45px;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.596);
    border: 1.2px solid #9d9d9d;
    border-radius: 4px;
    padding: 8px 10px;
    margin-bottom: 13px;
    caret-color: #9d9d9d;
    font-size: 15px;
    &:focus {
      outline: none;
    }
  }
`;
const Container = styled.form`
  width: 375px;
  height: 100vh;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  
  }
`;
const Title = styled.h3`
  color: black;
  font-size: 20px;
  text-align: left;
  font-weight: 600px;
  display: block;
  margin-top: 0px;
  padding: 0px;
`;
const Button = styled.button`
  width: 95%;
  height: 45px;
  display: default;
  background-color: #7ef0ff;
  border-radius: 4px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: 80px;
  color: black;
  padding: 12px 7px;
  &:hover {
    cursor: pointer;
    border: none;
    background-color: #00a6ed;
    color: white;
  }
  a {
    color: black;
    text-decoration: none;
    &:hover {
      color: white;
    }
  }
`;
const HomeButton = styled.button`
  width: 95%;
  height: 45px;
  background-color: #7ef0ff;
  border-radius: 4px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: 80px;
  color: black;
  padding: 12px 7px;
  &:hover {
    cursor: pointer;
    border: none;
    background-color: #00a6ed;
    color: white;
  }
  a {
    color: black;
    text-decoration: none;
    &:hover {
      color: white;
    }
  }
`;
const Find = styled.span`
  text-align: center;
  color: #696969;
  display: block;
  margin-bottom: 20px;
  a {
    color: #696969;
    text-decoration: none;
  }
`;
