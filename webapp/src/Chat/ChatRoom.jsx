// Copyright (c) Microsoft. All rights reserved.

import styles from "./css/ChatRoom.module.css";
import React, { useEffect, useRef, useState } from "react";
import copple from "../assets/cuteco.png";
import { ChatInput } from "./ChatInput.jsx";
import {
  setupSignalRConnectionToChatHub,
  startSignalRConnection,
} from "./ChatApp";
import { ChatHistory } from "./chat-history/ChatHistory";
import { format } from "date-fns";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { chatState, infoState, responseState } from "../atoms";

export const ChatRoom = () => {
  const scrollViewTargetRef = useRef();
  const info = useRecoilValue(infoState);
  const [chatlist, setChatlist] = useRecoilState(chatState);
  const [iswaiting, setIswaiting] = useRecoilState(responseState);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [botresponse, setBotresponse] = useState(null);

  // Signalr related functions
  const registerSignalREvents = (connection) => {
    connection.on("ReceiveMessage", () => {
      console.log("ReceiveMessage");
      setIswaiting(true);
    });
    connection.on("ReceiveSystemMessage", () => {
      const log = () => {
        console.log("ReceiveSystemMessage");
      };
      log();
    });
    connection.on("ReceiveBotMessageStart", (message) => {
      console.log("start");
    });
    connection.on("ReceiveBotMessage", (message) => {
      console.log(message);
      const displayNextCharacter = () => {
        if (message === undefined || message === null) return;
        setDisplayedMessage((prev) => prev + message);
        setChatlist((prev) => {
          let updatedChatlist = [...prev];
          let lastMessage = updatedChatlist[updatedChatlist.length - 1];
          lastMessage = {
            ...lastMessage,
            content: lastMessage.content + message,
            authorRole: 1,
          };
          updatedChatlist[updatedChatlist.length - 1] = lastMessage;
          return updatedChatlist;
        });
      };
      displayNextCharacter();
    });
    connection.on("receivecompletedbotmessage", (message) => {
      const deliver = message.message;
      const displayNextCharacter = () => {
        if (deliver === undefined || deliver === null) return;
        setChatlist((prev) => {
          let updatedChatlist = [...prev];
          let lastMessage = updatedChatlist[updatedChatlist.length - 1];
          lastMessage = {
            ...lastMessage,
            content: deliver,
            authorRole: 1,
          };
          updatedChatlist[updatedChatlist.length - 1] = lastMessage;
          return updatedChatlist;
        });
      };
      displayNextCharacter();
      console.log(message);
      if (message.contextData !== null) {
        const jsonString = message.contextData;
        const jsonObject = JSON.parse(jsonString);
        setChatlist((prev) => [
          ...prev,
          {
            title: jsonObject.Title,
            period: jsonObject.StartDatetime,
            location: jsonObject.Location,
            authorRole: 2,
          },
        ]);
        console.log(
          jsonObject.Title,
          jsonObject.StartDatetime,
          jsonObject.Location
        );
      }
    });

    connection.on("ReceiveBotMessageComplete", () => {
      console.log("ReceiveBotMessageComplete");
      setIswaiting(false);
      setDisplayedMessage("");
    });
  };

  useEffect(() => {
    const connection = setupSignalRConnectionToChatHub();
    startSignalRConnection(connection, info);
    registerSignalREvents(connection);
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  // Api functions
  const ChatHistoryCall = async () => {
    console.log(`calling ${info}'s history...`);
    try {
      const response = await axios.get(
        `https://coppletest.azurewebsites.net/api/chat/${info}`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const messages = response.data.map((item) => ({
        content: item.message,
        authorRole: item.role,
      }));
      console.log(`메시지 총 ${messages.length}개`);
      return messages;
    } catch (error) {
      console.error("Error making Axios request:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      throw error;
    }
  };
  const fetchChatHistory = async () => {
    try {
      const messages = await ChatHistoryCall();
      setChatlist(messages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const RequestAnswer = async (question) => {
    try {
      const currentDate = new Date();
      const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const response = await axios.post(
        `https://coppletest.azurewebsites.net/api/chat`,
        {
          id: "string",
          userId: info,
          parentId: info,
          message: question,
          createdTime: formattedDate,
          role: 0,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`requesting for ${response.data}`);
    } catch (error) {
      console.error("Error making Axios request:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
    }
  };

  const handleSubmit = async (value) => {
    setBotresponse(null);
    console.log("submitting user chat message");
    setChatlist((prev) => [
      ...prev,
      { content: value, authorRole: 0 },
      { content: "", authorRole: 1 },
    ]);
    RequestAnswer(value);
    setShouldAutoScroll(true);
  };

  return (
    <div className={styles.ChatRoomRoot}>
      <div className={styles.ChatBar}>
        {/* <img style={{ height: "1.8em" }} src={copple}></img> */}
        <h3>Copple</h3>
      </div>
      <div ref={scrollViewTargetRef} className={styles.ChatRoomRootHistory}>
        <ChatHistory messages={chatlist} onGetResponse={handleSubmit} />
      </div>
      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
};
