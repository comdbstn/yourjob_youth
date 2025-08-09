import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Main from "./components/Main";

// 간단한 About 페이지
const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">About 페이지</h1>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
          <p className="text-gray-600 mb-4">
            이 페이지는 React Router가 정상적으로 작동하는지 테스트하는 페이지입니다.
          </p>
          <p className="text-gray-600">
            Frontend 라우팅이 성공적으로 구현되었습니다! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;