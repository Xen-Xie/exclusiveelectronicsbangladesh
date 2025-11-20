/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export function AuthProvider({ children }) {
  // Local state to store the current user and token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Ref to store logout timer so we can clear it if needed
  const logoutTimerRef = useRef(null);

  // Logout Logic
  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Schedule automatic logout when JWT expires
  const scheduleLogout = useCallback(
    (exp) => {
      const timeUntilExpiry = exp * 1000 - Date.now();
      if (timeUntilExpiry > 0) {
        logoutTimerRef.current = setTimeout(() => {
          clearAuth(); // logout when token expires
        }, timeUntilExpiry);
      } else {
        clearAuth();
      }
    },
    [clearAuth]
  );

  // check saved token
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token); // decode JWT to get user info & expiry

      // Function to safely update state
      const handleAuthUpdate = () => {
        if (decoded.exp * 1000 < Date.now()) {
          clearAuth();
        } else {
          setUser(decoded);
          scheduleLogout(decoded.exp);
        }
      };

      queueMicrotask(handleAuthUpdate);
    } catch (error) {
      queueMicrotask(() => clearAuth());
    }
  }, [token, scheduleLogout, clearAuth]);

  // Axios interceptors
  useEffect(() => {
    // Attach token to all outgoing requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const t = localStorage.getItem("token");
        if (t) config.headers.Authorization = `Bearer ${t}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Logout automatically if any response returns 401 Unauthorized
    const responseInterceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          clearAuth();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [clearAuth]);

  // Function to handle login (both email/password & Google)
  const login = (newToken, callback) => {
    try {
      const decoded = jwtDecode(newToken);

      localStorage.setItem("token", newToken);
      setUser(decoded);
      setToken(newToken);
      if (callback) callback();

      scheduleLogout(decoded.exp);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  // Manual logout function
  const logout = () => {
    clearAuth();
  };

  // Provide AuthContext values to all child components
  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}
