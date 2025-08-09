import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./MobileFindIdPwd.css";
import "../../common/styles/common.css";
import { Link } from "react-router-dom";
import MainFooter from "../../components/MainFooter/MainFooter";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const MobileFindIdPwd: React.FC = () => {
  const [activeTab, setActiveTab] = useState("id");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tab === "pwd") {
      setActiveTab("pwd");
    }
  }, [location.state]);

  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet
        title="아이디/비밀번호 찾기"
        description="아이디/비밀번혘 찾기"
      />
      <div className="mobile-container-mobileFindIdPwd">
        <Link to={"/m"}>
          <h1 className="urJobHeaderLabel">
            <img src="/img/logo.png" />
          </h1>
        </Link>
        <div className="switchTabs modify">
          <button
            className={activeTab === "id" ? "selected" : "notSelected"}
            onClick={() => setActiveTab("id")}
          >
            아이디 찾기
          </button>
          <button
            className={activeTab === "pwd" ? "selected" : "notSelected"}
            onClick={() => setActiveTab("pwd")}
          >
            비밀번호 찾기
          </button>
        </div>
        <div className="tabContent modify">
          {activeTab === "id" ? (
            <div className="findIdTab">
              <div className="header">
                회원가입 시 등록된 정보를 입력해 주세요.
              </div>
              <div className="inputs modify">
                <div className="input_default">
                  <input placeholder="담당자 명을 입력해 주세요." />
                </div>{" "}
                <div className="input_default">
                  <input placeholder="담당자 이메일을 입력해 주세요." />
                </div>
                <Link to={"/m/member/findComplete"} className="blueBtn">
                  아이디 찾기
                </Link>
              </div>
            </div>
          ) : (
            <div className="findPwTab">
              <div className="header">
                회원가입 시 등록된 정보를 입력해 주세요.
              </div>
              <div className="inputs modify">
                <div className="input_default">
                  <input placeholder="아이디를 입력해 주세요." />
                </div>{" "}
                <div className="input_default">
                  <input placeholder="담당자 이메일을 입력해 주세요." />
                </div>
                <Link to={"/m/member/findComplete"} className="blueBtn">
                  임시 비밀번호 발송
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <MainFooter /> */}
    </div>
  );
};

export default MobileFindIdPwd;
