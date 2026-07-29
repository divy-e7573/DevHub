// Axios client — the single HTTP gateway for the frontend.
//
// Why this exists: every network call goes through this preconfigured
// instance. Base URL, timeouts, auth-header injection, and error interceptors
// all live here so no feature talks to Axios (or `fetch`) directly.

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// TODO: request interceptor (attach auth token once auth is implemented).
// TODO: response interceptor (normalise errors, handle 401 refresh, etc.).
