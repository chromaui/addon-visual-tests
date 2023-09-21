import { CHROMATIC_BASE_URL } from "../constants";
// @ts-expect-error File is in plain JS
import { sha256 } from "./sha256";

// Details we exchange with the Chromatic OAuth server
export type TokenExchangeParameters = {
  expires: number;
  interval: number;
  user_code: string;
  device_code: string;
  verifier: string;
  verificationUrl: string;
};

const bytes = (buf: number[]) =>
  new Uint8Array(buf).reduce((acc, val) => acc + String.fromCharCode(val), "");

const base64 = (val: any) => window.btoa(Array.isArray(val) ? bytes(val) : val);

const base64URLEncode = (val: any) =>
  base64(val).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const hexStringToBytes = (str: string) =>
  Array.from(str.match(/.{1,2}/g) ?? [], (byte) => parseInt(byte, 16));

const seed = () =>
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10) +
  Math.random().toString(36).slice(2, 10);

const encodeParams = (params: { [key: string]: any }) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

const authorizationPending = ({ error }: { error: string }) => error === "authorization_pending";

const betaUserAccessDenied = ({ error_description }: { error_description: string }) => {
  return error_description === "Not OAuth beta user";
};

export const initiateSignin = async (subdomain?: string): Promise<TokenExchangeParameters> => {
  const verifier = base64URLEncode(seed());
  const challenge = base64URLEncode(hexStringToBytes(sha256(verifier)));

  const res = await fetch(`${CHROMATIC_BASE_URL}/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: encodeParams({
      client_id: "chromaui:addon-visual-tests",
      code_challenge: challenge,
    }),
  });

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { device_code, user_code, verification_uri_complete, expires_in, interval } =
    await res.json();

  const verificationUrl = subdomain
    ? verification_uri_complete.replace("https://www", `https://${subdomain}`)
    : verification_uri_complete;

  return {
    expires: Date.now() + expires_in * 1000,
    interval: interval * 1000,
    user_code,
    device_code,
    verifier,
    verificationUrl,
  };
};

export const fetchAccessToken = async ({
  expires,
  device_code,
  verifier,
}: TokenExchangeParameters) => {
  if (Date.now() >= expires) {
    throw new Error(`Token exchange expired, please restart sign in.`);
  }

  try {
    const res = await fetch(`${CHROMATIC_BASE_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: encodeParams({
        client_id: "chromaui:addon-visual-tests",
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code,
        code_verifier: verifier,
        scope: "user:read account:read project:read project:write",
      }),
    });

    const data = await res.json();
    if (authorizationPending(data)) {
      throw new Error(
        `You have not authorized the Visual Tests addon for Chromatic, please try again`
      );
    } else if (data.access_token) {
      return data.access_token as string;
    } else if (betaUserAccessDenied(data)) {
      alert("You must be a beta user to use this addon at this time.");
      return null;
    }
    throw new Error();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn(err);
    throw err;
  }
};
