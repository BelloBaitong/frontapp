// src/lib/auth.ts
export const TOKEN_KEY = "token";
export const RETURN_TO_KEY = "returnTo";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setReturnTo(path: string) {
  localStorage.setItem(RETURN_TO_KEY, path);
}

export function consumeReturnTo() {
  const v = localStorage.getItem(RETURN_TO_KEY);
  localStorage.removeItem(RETURN_TO_KEY);
  return v;
}

// decode JWT payload (base64url) แบบง่าย
export function parseJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
