import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer_wrap">
        <div className="footer_link">
          <ul>
            <li>
              <Link to="/terms">이용약관</Link>
            </li>
            <li>
              <Link to="/privacy-policy">개인정보처리방침</Link>
            </li>
          </ul>
        </div>

        <div className="footer_con">
          <div className="container">
            <div className="footer_box">
              <div className="footer_info">
                <ul>
                  <li>고객센터 : 1644-9988</li>
                  <li>FAX : 0508-928-0728</li>
                </ul>
                <ul>
                  <li>서울특별시 광진구 광나루로19길 23, 103호(군자동, 가온누리1)</li>
                  <li>사업자등록번호 : 378-88-03422</li>
                </ul>
                <ul>
                  <li>Copyright ⓒ아이비리거. All rights reserved.</li>
                </ul>
              </div>
              <div className="urjob">
                <img src="/img/f_logo.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
