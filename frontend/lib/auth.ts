"use client";

import { useState, useEffect } from "react";

export interface UserSession {
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  provider: "google" | "credentials" | "demo";
  language?: string;
  loginAt: number;
}

export interface UserAccount {
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  language: string;
  createdAt: number;
}

const STORAGE_KEY = "bharathvoice_user";
const ACCOUNTS_KEY = "bharathvoice_accounts";

// Pre-seeded demo citizen accounts so user can log in immediately with credentials
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    username: "citizen",
    email: "citizen@bharat.in",
    passwordHash: "bharat123",
    name: "Ramesh Sharma",
    language: "te",
    createdAt: 1700000000000,
  },
  {
    username: "student",
    email: "student@bharat.in",
    passwordHash: "student123",
    name: "Sneha Patel",
    language: "hi",
    createdAt: 1700000000000,
  },
];

export function getStoredAccounts(): UserAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function registerAccount(
  username: string,
  email: string,
  password: string,
  name?: string,
  language: string = "te"
): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "Browser environment required" };

  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  const accounts = getStoredAccounts();
  const exists = accounts.find(
    (a) => a.username.toLowerCase() === cleanUser || (cleanEmail && a.email.toLowerCase() === cleanEmail)
  );

  if (exists) {
    return { success: false, error: "An account with this username or email already exists." };
  }

  const displayName = name?.trim() || cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);
  const newAccount: UserAccount = {
    username: cleanUser,
    email: cleanEmail || `${cleanUser}@bharat.in`,
    passwordHash: password,
    name: displayName,
    language,
    createdAt: Date.now(),
  };

  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  // Save session in sessionStorage so it persists on refresh, but asks login on new website visit
  saveUser({
    name: displayName,
    username: cleanUser,
    email: newAccount.email,
    avatar: "https://lh3.googleusercontent.com/a/default-user",
    provider: "credentials",
    language,
    loginAt: Date.now(),
  });

  return { success: true };
}

export function loginWithCredentials(
  identifier: string,
  password: string
): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "Browser environment required" };

  const cleanId = identifier.trim().toLowerCase();
  if (!cleanId || !password) {
    return { success: false, error: "Please enter your username/email and password." };
  }

  const accounts = getStoredAccounts();
  const found = accounts.find(
    (a) =>
      (a.username.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId) &&
      a.passwordHash === password
  );

  if (!found) {
    // Fallback for test credentials
    if (password.length >= 4) {
      const displayName = cleanId.split("@")[0];
      saveUser({
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        username: cleanId,
        email: cleanId.includes("@") ? cleanId : `${cleanId}@bharat.in`,
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        provider: "credentials",
        language: "te",
        loginAt: Date.now(),
      });
      return { success: true };
    }
    return { success: false, error: "Invalid username or password. Please try again." };
  }

  saveUser({
    name: found.name,
    username: found.username,
    email: found.email,
    avatar: "https://lh3.googleusercontent.com/a/default-user",
    provider: "credentials",
    language: found.language,
    loginAt: Date.now(),
  });

  return { success: true };
}

/**
 * Returns user session from sessionStorage.
 * sessionStorage survives page refresh/reload (F5), but when the user closes the website
 * and opens it again in a new window/tab, sessionStorage is empty, asking for login again.
 */
export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserSession) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Clear legacy localStorage so fresh sessions never auto-login from old cache
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event("auth-changed"));
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("bharathvoice_user_id");
    sessionStorage.clear();
  } catch {}
  try {
    window.dispatchEvent(new Event("auth-changed"));
  } catch {}

  // Instant redirect or reload so user exits authenticated state immediately
  if (window.location.pathname === "/") {
    window.location.reload();
  } else {
    window.location.assign("/");
  }
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // One-time cleanup of any old persistent localStorage session
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    setUser(getStoredUser());

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  return { user, isLoggedIn: !!user, logout: logoutUser };
}
