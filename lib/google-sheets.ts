import "server-only";

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { DemoRequest } from "@/lib/demo-request";
import { safeSheetValue } from "@/lib/demo-request";

type GoogleCredentials = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

const TOKEN_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token";

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function getCredentials(): Promise<Required<GoogleCredentials>> {
  let fileCredentials: GoogleCredentials = {};
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialPath) {
    try {
      fileCredentials = JSON.parse(await readFile(credentialPath, "utf8")) as GoogleCredentials;
    } catch {
      throw new Error("Unable to read GOOGLE_APPLICATION_CREDENTIALS.");
    }
  }

  const client_email = process.env.GOOGLE_CLIENT_EMAIL || fileCredentials.client_email;
  const private_key = (process.env.GOOGLE_PRIVATE_KEY || fileCredentials.private_key)?.replace(/\\n/g, "\n");
  const token_uri = fileCredentials.token_uri || DEFAULT_TOKEN_URI;

  if (!client_email || !private_key) {
    throw new Error("Google service-account credentials are not configured.");
  }

  return { client_email, private_key, token_uri };
}

async function getAccessToken() {
  const credentials = await getCredentials();
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: TOKEN_SCOPE,
    aud: credentials.token_uri,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsignedToken = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${base64Url(signer.sign(credentials.private_key))}`;

  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  const result = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || "Google authentication failed.");
  }
  return result.access_token;
}

export async function appendDemoRequest(request: DemoRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetTab = process.env.GOOGLE_SHEET_TAB || "Demo Requests";
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID is not configured.");

  const token = await getAccessToken();
  const range = encodeURIComponent(`'${sheetTab.replace(/'/g, "''")}'!A:J`);
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const values = [[
    new Date().toISOString(),
    safeSheetValue(request.workEmail),
    safeSheetValue(request.companySize),
    safeSheetValue(request.firstName),
    safeSheetValue(request.lastName),
    safeSheetValue(request.companyName),
    safeSheetValue(request.jobTitle),
    safeSheetValue(request.country),
    safeSheetValue(request.phone),
    request.marketingConsent ? "Yes" : "No",
  ]];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ majorDimension: "ROWS", values }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Google Sheets append failed", response.status, error.slice(0, 500));
    throw new Error("Google Sheets rejected the request.");
  }
}
