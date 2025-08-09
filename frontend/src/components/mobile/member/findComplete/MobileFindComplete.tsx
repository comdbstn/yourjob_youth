import "./MobileFindComplete.css";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";
const MobileFindComplete: React.FC = () => {
  return (
    <div className="mobile-findComplete-container">
      <MetaTagHelmet
        title="아이디/비밀번호 찾기"
        description="아이디/비밀번혘 찾기"
      />
      <h1 className="urJobHeaderLabel">
        <img src="/img/logo.png" />
      </h1>
      <p className="mt-80 pl-20 pr-20" style={{ marginBottom: "128px" }}>
        회원님의 아이디는 abcd 입니다.
      </p>
      <div
        className="flexGap10 w-full pl-20 pr-20
      "
      >
        <button className="blueBtn w-full">로그인</button>
        <button className="grayBtn">홈으로</button>
      </div>
    </div>
  );
};

export default MobileFindComplete;
