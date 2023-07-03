import { useState } from "react";

import { CHROMATIC_BASE_URL } from "../constants";
// @ts-expect-error File is in plain JS
import { sha256 } from "./sha256";

const bytes = (buf: number[]) =>
  new Uint8Array(buf).reduce((acc, val) => acc + String.fromCharCode(val), "");

const base64 = (val: any) => window.btoa(Array.isArray(val) ? bytes(val) : val);

const base64URLEncode = (val: any) =>
  base64(val).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const hexStringToBytes = (str: string) =>
  Array.from(str.match(/.{1,2}/g), (byte) => parseInt(byte, 16));

const seed = () =>
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10);

const encodeParams = (params: { [key: string]: any }) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

const betaUserAccessDenied = ({ error_description }: { error_description: string }) => {
  return error_description === "Not OAuth beta user";
};

const pollForAccessToken = async (options: {
  expires: number;
  interval: number;
  isMounted: boolean;
  onSuccess: (token: string) => void;
  onFailure: (responseJson: object) => void;
  requestBody: string;
}) => {
  const { expires, interval, isMounted, onSuccess, onFailure, requestBody } = options;

  if (!isMounted || Date.now() >= expires) return;

  try {
    const res = await fetch(`${CHROMATIC_BASE_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: requestBody,
    });
    const data = await res.json();
    if (data.error === "authorization_pending") {
      setTimeout(() => pollForAccessToken(options), interval);
    } else if (data.access_token) {
      onSuccess(data.access_token);
    } else if (betaUserAccessDenied(data)) {
      onFailure(data);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const signInWithRetry = async (options: {
  isMounted: boolean;
  setVerificationUrl: (url: string) => void;
  setUserCode: (userCode: string) => void;
  subdomain?: string;
  onSuccess: (token: string) => void;
  onFailure: () => void;
}) => {
  const { isMounted, onSuccess, onFailure, setUserCode, setVerificationUrl, subdomain } = options;

  if (!isMounted) return;

  const verifier = base64URLEncode(seed());
  const challenge = base64URLEncode(hexStringToBytes(sha256(verifier)));

  const res = await fetch(`${CHROMATIC_BASE_URL}/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: encodeParams({
      client_id: "storybook-visual-tests",
      code_challenge: challenge,
    }),
  });

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { device_code, user_code, verification_uri_complete, expires_in, interval } =
    await res.json();

  // Update UI with user code and verification URL
  setUserCode(user_code);
  setVerificationUrl(
    subdomain
      ? verification_uri_complete.replace("https://www", `https://${subdomain}`)
      : verification_uri_complete
  );

  // Poll for OAuth verification to complete
  pollForAccessToken({
    expires: Date.now() + expires_in * 1000,
    interval: interval * 1000,
    isMounted,
    onSuccess,
    onFailure(authResp: any) {
      if (betaUserAccessDenied(authResp)) {
        // eslint-disable-next-line no-alert
        alert("You must be a beta user to use this addon at this time.");
      } else {
        // eslint-disable-next-line no-console
        console.warn(authResp);
        onFailure();
      }
    },
    requestBody: encodeParams({
      client_id: "storybook-visual-tests",
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code,
      code_verifier: verifier,
      scope: "user:read account:read project:read project:write",
    }),
  });

  // Retry when polling for longer than the OAuth expiration time
  setTimeout(() => signInWithRetry(options), expires_in * 1000);
};

export const useSignIn = (options: {
  isMounted: boolean;
  onSuccess: (token: string) => void;
  onFailure: () => void;
}) => {
  const [userCode, setUserCode] = useState(null);
  const [verificationUrl, setVerificationUrl] = useState(null);

  const onSignIn = (subdomain?: string) =>
    signInWithRetry({ ...options, setUserCode, setVerificationUrl, subdomain });

  return { onSignIn, userCode, verificationUrl };
};
