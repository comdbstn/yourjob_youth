import React from "react";
import { Link } from "react-router-dom";
import "./NotFoundView.css";

export default function NotFoundView() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-logo">
          <img src="/img/logo.png" alt="YourJob 로고" />
        </div>

        <div className="notfound-main">
          <div className="notfound-number">404</div>
          <h1 className="notfound-title">페이지를 찾을 수 없습니다</h1>
          <p className="notfound-description">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            URL을 다시 확인해 주시거나 아래 버튼을 통해 홈으로 이동해 주세요.
          </p>
        </div>

        <div className="notfound-actions">
          <Link to="/" className="notfound-btn primary">
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="notfound-btn secondary"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
