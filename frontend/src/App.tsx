import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎉 Frontend 빌드 성공!
        </h1>
        <p className="text-gray-600 mb-8">
          Tailwind CSS가 올바르게 작동하고 있습니다.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">다음 단계:</h2>
          <ul className="text-left space-y-2">
            <li>✅ Frontend 빌드 완료</li>
            <li>⏳ Backend API 연결</li>
            <li>⏳ 데이터베이스 연결</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
