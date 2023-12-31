// Copyright (c) Microsoft. All rights reserved.

import {

  LogLevel,
} from "@azure/msal-browser";
// import debug from "debug";
import { Constants } from "../../Constants";

// const log = debug(Constants.debug.root).extend("authHelper");

export const AuthType = {
  AAD: "AzureAd"
}

// This is the default user information when authentication is set to 'None'.
// It must match what is defined in PassthroughAuthenticationHandler.cs on the backend.
export const DefaultChatUser = {
  id: "c05c61eb-65e4-4223-915a-fe72b0c9ece1",
  emailAddress: "user@contoso.com",
  fullName: "Default User",
  online: true,
  isTyping: false,
};

export const DefaultActiveUserInfo = {
  id: DefaultChatUser.id,
  email: DefaultChatUser.emailAddress,
  username: DefaultChatUser.fullName,
};

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AAD_CLIENT_ID ?? "",
    authority: process.env.REACT_APP_AAD_AUTHORITY,
    redirectUri: window.origin,
  },
  cache: Constants.msal.cache,
  system: {
    loggerOptions: {
      loggerCallback: (
        level,
        message,
        containsPii
      ) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.log("error:", message);
            return;
          case LogLevel.Info:
            console.log("info:", message);
            return;
          case LogLevel.Verbose:
            console.log("verbose:", message);
            return;
          case LogLevel.Warning:
            console.log("warn:", message);
            return;
          default:
            console.log(message);
        }
      },
    },
    windowHashTimeout: 9000, // Applies just to popup calls - In milliseconds
    iframeHashTimeout: 9000, // Applies just to silent calls - In milliseconds
    loadFrameTimeout: 9000, // Applies to both silent and popup calls - In milliseconds
  },
};

const logoutRequest = {
  postLogoutRedirectUri: window.origin,
};

const ssoSilentRequest = async (msalInstance) => {
  await msalInstance.ssoSilent({
    account: msalInstance.getActiveAccount() ?? undefined,
    scopes: Constants.msal.semanticKernelScopes,
  });
};

const loginAsync = async (instance) => {
  if (Constants.msal.method === "redirect") {
    await instance.loginRedirect({
      scopes: Constants.msal.semanticKernelScopes,
      extraScopesToConsent: Constants.msal.msGraphAppScopes,
    });
  } else {
    await instance.loginPopup({
      scopes: Constants.msal.semanticKernelScopes,
      extraScopesToConsent: Constants.msal.msGraphAppScopes,
    });
  }
};

const logoutAsync = (instance) => {
  if (Constants.msal.method === "popup") {
    void instance.logoutPopup(logoutRequest);
  }
  if (Constants.msal.method === "redirect") {
    void instance.logoutRedirect(logoutRequest);
  }
};

/**
 * Determines if the app is configured to use Azure AD for authorization
 */
const IsAuthAAD = process.env.REACT_APP_AUTH_TYPE === AuthType.AAD;

// SKaaS = Semantic Kernel as a Service
// Gets token with scopes to authorize SKaaS specifically

export const AuthHelper = {
  msalConfig,
  logoutRequest,
  ssoSilentRequest,
  loginAsync,
  logoutAsync,
  IsAuthAAD,
};
