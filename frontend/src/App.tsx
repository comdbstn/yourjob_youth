import React from "react";
import AppRouter from "./AppRouter"; 

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

const App: React.FC = () => {
  return (
    <AppRouter />
  );
};

export default App;
