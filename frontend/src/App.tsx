import React, { useEffect } from "react";
import AppRouter from "./AppRouter"; 

// 브라우저 환경에서만 실행
const initializeAuth = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");
    const token = localStorage.getItem("token");

    if (userId) {
      sessionStorage.setItem("userId", userId);
    }
    if (userType) {
      sessionStorage.setItem("userType", userType);
    }
    if (token) {
      sessionStorage.setItem("token", token);
    }
  } catch (error) {
    console.warn("Storage access failed:", error);
  }
};

const App: React.FC = () => {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AppRouter />
  );
};

export default App;
