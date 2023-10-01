// Copyright (c) Microsoft. All rights reserved.

import { useMsal } from "@azure/msal-react";
import {
  Button,
  Spinner,
  Textarea,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { SendRegular } from "@fluentui/react-icons";
import debug from "debug";
import React, { useRef, useState } from "react";
import { Constants } from "../Constants";
import { AuthHelper } from "../libs/auth/AuthHelper";
// import { useFile } from "../libs/hooks";
import { AlertType } from "../libs/models/AlertType";
import { ChatMessageType } from "../libs/models/ChatMessage";
import { useAppDispatch, useAppSelector } from "../redux/app/hooks";
import { addAlert } from "../redux/features/app/appSlice";
import {
  editConversationInput,
  updateBotResponseStatus,
} from "../redux/features/conversations/conversationsSlice";
// import { Alerts } from "../shared/Alerts";
// import { SpeechService } from "./../libs/services/SpeechService";
import { updateUserIsTyping } from "./../redux/features/conversations/conversationsSlice";
import { ChatStatus } from "./ChatStatus";

const log = debug(Constants.debug.root).extend("chat-input");

const useClasses = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.margin(0, 0),
  },
  typingIndicator: {
    maxHeight: "28px",
  },
  content: {
    ...shorthands.gap(tokens.spacingHorizontalM),
    display: "flex",
    flexDirection: "row",
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
  },
  textarea: {
    maxHeight: "90px",
    borderBottomColor: "#DCE9FF",
  },
  sendbutton: {
    position: "absolute",
    right: "-1px",
    bottom: "0",
    zIndex: "100",
  },
  controls: {
    display: "flex",
    flexDirection: "row",
  },
  essentials: {
    display: "flex",
    flexDirection: "row",
    marginLeft: "auto", // align to right
  },
  functional: {
    display: "flex",
    flexDirection: "row",
  },
  dragAndDrop: {
    ...shorthands.border(
      tokens.strokeWidthThick,
      " solid",
      tokens.colorBrandStroke1
    ),
    ...shorthands.padding("8px"),
    textAlign: "center",
    backgroundColor: tokens.colorNeutralBackgroundInvertedDisabled,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorBrandForeground1,
    caretColor: "transparent",
  },
});

// interface ChatInputProps {
//     isDraggingOver?: boolean;
//     onDragLeave: React.DragEventHandler<HTMLDivElement | HTMLTextAreaElement>;
//     onSubmit: (options: GetResponseOptions) => Promise<void>;
// }

export const ChatInput = ({ isDraggingOver, onDragLeave, onSubmit }) => {
  const classes = useClasses();
  const { instance, inProgress } = useMsal();
  const dispatch = useAppDispatch();
  const { conversations, selectedId } = useAppSelector(
    (state) => state.conversations
  );
  const { activeUserInfo } = useAppSelector((state) => state.app);
  //   const fileHandler = useFile();

  const [value, setValue] = useState("");
  const [recognizer, setRecognizer] = useState();
  // const { importingDocuments } = conversations[selectedId];

  const documentFileRef = (useRef < HTMLInputElement) | (null > null);
  const textAreaRef = React.useRef < HTMLTextAreaElement > null;
  React.useEffect(() => {
    // Focus on the text area when the selected conversation changes
    textAreaRef.current?.focus();
  }, [selectedId]);

  React.useEffect(() => {
    async function initSpeechRecognizer() {
      const speechService = new SpeechService(
        process.env.REACT_APP_BACKEND_URI
      );
      const response = await speechService.getSpeechTokenAsync(
        await AuthHelper.getSKaaSAccessToken(instance, inProgress)
      );
      if (response.isSuccess) {
        const recognizer =
          speechService.getSpeechRecognizerAsyncWithValidKey(response);
        setRecognizer(recognizer);
      }
    }

    initSpeechRecognizer();
    // .catch((e) => {
    //     const errorDetails = e instanceof Error ? e.message : String(e);
    //     const errorMessage = `Unable to initialize speech recognizer. Details: ${errorDetails}`;
    //     dispatch(addAlert({ message: errorMessage, type: AlertType.Error }));
    // });
  }, [dispatch, instance, inProgress]);

  // React.useEffect(() => {
  //     const chatState = conversations[selectedId];
  //     setValue(false ? COPY.CHAT_DELETED_MESSAGE() : chatState.input);
  // }, [conversations, selectedId]);

  // const handleSpeech = () => {
  //     setIsListening(true);
  //     if (recognizer) {
  //         recognizer.recognizeOnceAsync((result) => {
  //             if (result.reason === speechSdk.ResultReason.RecognizedSpeech) {
  //                 if (result.text && result.text.length > 0) {
  //                     handleSubmit(result.text);
  //                 }
  //             }
  //             setIsListening(false);
  //         });
  //     }
  // };

  const handleSubmit = (value, messageType = ChatMessageType.Message) => {
    if (value.trim() === "") {
      return; // only submit if value is not empty
    }

    setValue("");
    console.log("handling...", value);
    dispatch(editConversationInput({ id: selectedId, newInput: "" }));
    dispatch(
      updateBotResponseStatus({
        chatId: selectedId,
        status: "Calling the kernel",
      })
    );
    onSubmit({ value, messageType, chatId: selectedId }).catch((error) => {
      const message = `Error submitting chat input: ${error.message}`;
      log(message);
      dispatch(
        addAlert({
          type: AlertType.Error,
          message,
        })
      );
    });
  };

  //   const handleDrop = (e) => {
  //     onDragLeave(e);
  //     void fileHandler.handleImport(
  //       selectedId,
  //       documentFileRef,
  //       undefined,
  //       e.dataTransfer.files
  //     );
  //   };

  return (
    <div className={classes.root}>
      <div className={classes.typingIndicator}>
        <ChatStatus />
      </div>
      {/* <Alerts /> */}
      <div className={classes.content}>
        <Textarea
          title="Chat input"
          aria-label="Chat input field. Click enter to submit input."
          ref={textAreaRef}
          id="chat-input"
          // resize="vertical"
          // disabled={conversations[selectedId].disabled}
          textarea={{
            className: isDraggingOver
              ? mergeClasses(classes.dragAndDrop, classes.textarea)
              : classes.textarea,
          }}
          className={classes.input}
          value={isDraggingOver ? "Drop your files here" : value}
          //   onDrop={handleDrop}
          onFocus={() => {
            // update the locally stored value to the current value
            const chatInput = document.getElementById("chat-input");
            if (chatInput) {
              setValue(chatInput.value);
            }
            // User is considered typing if the input is in focus
            dispatch(
              updateUserIsTyping({
                userId: activeUserInfo?.id,
                chatId: selectedId,
                isTyping: true,
              })
            );
          }}
          onChange={(_event, data) => {
            if (isDraggingOver) {
              return;
            }

            setValue(data.value);
            // dispatch(editConversationInput({ id: selectedId, newInput: data.value }));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(value);
            }
          }}
          onBlur={() => {
            // User is considered not typing if the input is not  in focus
            dispatch(
              updateUserIsTyping({
                userId: activeUserInfo?.id,
                chatId: selectedId,
                isTyping: false,
              })
            );
          }}
        />
        <Button
          className={classes.sendbutton}
          title="Submit"
          aria-label="Submit message"
          appearance="transparent"
          icon={<SendRegular />}
          onClick={() => {
            handleSubmit(value);
          }}
        />
      </div>

      {/* <div className={classes.controls}> */}
      {/* <div className={classes.functional}> */}
      {/* Hidden input for file upload. Only accept .txt and .pdf files for now. */}
      {/* <input
                        type="file"
                        ref={documentFileRef}
                        style={{ display: 'none' }}
                        accept=".txt,.pdf,.md,.jpg,.jpeg,.png,.tif,.tiff"
                        multiple={true}
                    onChange={() => {
                        void fileHandler.handleImport(selectedId, documentFileRef);
                    }}
                    /> */}
      {/* <Button
                        disabled={
                            conversations[selectedId].disabled || (importingDocuments && importingDocuments.length > 0)
                        }
                        appearance="transparent"
                        icon={<AttachRegular />}
                        onClick={() => documentFileRef.current?.click()}
                        title="Attach file"
                        aria-label="Attach file button"
                    /> */}
      {/* {<Spinner size="tiny" />} */}
      {/* </div> */}
      {/* <div className={classes.essentials}>
                    {recognizer && (
                        <Button
                            appearance="transparent"
                            disabled={conversations[selectedId].disabled || isListening}
                            icon={<MicRegular />}
                            onClick={handleSpeech}
                        />
                    )} */}
      {/* <Button
                    title="Submit"
                    aria-label="Submit message"
                    appearance="transparent"
                    icon={<SendRegular />}
                    onClick={() => {
                        handleSubmit(value);
                    }} */}
      {/* disabled={conversations[selectedId].disabled} */}
      {/* /> */}
      {/* </div> */}
    </div>
    // </div >
  );
};