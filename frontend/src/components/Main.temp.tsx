import React from "react";

const Main: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-blue-600">
            유어잡 URJOB
          </h1>
          <p className="text-gray-600 mt-2">
            해외대 인재 채용 플랫폼
          </p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Frontend 복구 성공! 🎉
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            원래 앱 구조가 정상적으로 로드되었습니다
          </p>
        </div>

        {/* 기능 카드들 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">채용 공고</h3>
            <p className="text-gray-600 mb-4">해외대 인재를 위한 맞춤 채용 정보</p>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-500">
              Backend 연결 후 실제 데이터 표시
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">인재풀</h3>
            <p className="text-gray-600 mb-4">우수한 해외대 인재들</p>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-500">
              API 연결 대기 중...
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">커뮤니티</h3>
            <p className="text-gray-600 mb-4">취업 정보 공유 및 멘토링</p>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-500">
              서비스 준비 중...
            </div>
          </div>
        </div>

        {/* 상태 체크 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">시스템 상태</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>✅ Frontend 빌드 및 배포</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>✅ Tailwind CSS 스타일링</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span>✅ React Router 라우팅</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span>⏳ Backend API 서버</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span>⏳ 데이터베이스 연결</span>
            </li>
          </ul>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 유어잡 URJOB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Main;