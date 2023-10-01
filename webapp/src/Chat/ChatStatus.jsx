// Copyright (c) Microsoft. All rights reserved.

import { makeStyles } from "@fluentui/react-components";
import { Animation } from "@fluentui/react-northstar";
import React from "react";
// import { useAppSelector } from "../redux/app/hooks";
import { TypingIndicator } from "../typing-indicator/TypingIndicator";

const useClasses = makeStyles({
  root: {
    display: "flex",
    columnGap: "7px",
    alignItems: "center",
    flexDirection: "row",
  },
});

export const ChatStatus = () => {
  const classes = useClasses();

  // const { conversations, selectedId } = useAppSelector(
  //   (state) => state.conversations
  // );
  // const { users } = conversations[selectedId];
  // const { activeUserInfo } = useAppSelector((state) => state.app);
  const [typingUserList, setTypingUserList] = React.useState([]);

  // React.useEffect(() => {
  //   const checkAreTyping = () => {
  //   //   const updatedTypingUsers = users.filter(
  //   //     (chatUser) => chatUser.id !== activeUserInfo?.id && chatUser.isTyping
  //   //   );

  //   //   setTypingUserList(updatedTypingUsers);
  //   };
  //   checkAreTyping();
  // }, [activeUserInfo, users]);

  let message = 1;
  const numberOfUsersTyping = typingUserList.length;
  if (numberOfUsersTyping === 1) {
    message = message ? `${message} and a user is typing` : "A user is typing";
  } else if (numberOfUsersTyping > 1) {
    message = message
      ? `${message} and ${numberOfUsersTyping} users are typing`
      : `${numberOfUsersTyping} users are typing`;
  }
  message = "Generating bot response";
  if (!message) {
    return null;
  }

  return (
    <Animation name="slideInCubic" keyframeParams={{ distance: "2.4rem" }}>
      <div className={classes.root}>
        <label>{message}</label>
        <TypingIndicator />
      </div>
    </Animation>
  );
};
