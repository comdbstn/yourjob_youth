import "./ApplyPopup.css";

interface MobileApplyPopupProps {
  onClose: () => void; // 팝업 닫기 함수
}

const MobileApplyPopup: React.FC<MobileApplyPopupProps> = ({ onClose }) => {
  return (
    <div className="mobileApplyPopup-container">
      <div className="Xbtn">
        <button onClick={onClose}>
          {" "}
          {/* X 버튼 클릭 시 onClose 호출 */}
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>
      <h2>입사지원</h2>
      <section className="contentSection">
        <p>(주)유어잡</p>
        <p>문구, 캐릭터 디자인 정규직 채용(경력&신입)</p>
        <div className="input_default">
          <select className="w-full">
            <option value="" disabled selected hidden>
              지원분야를 선택해주세요
            </option>
            <option value="option1">옵션 1</option>
            <option value="option2">옵션 2</option>
            <option value="option3">옵션 3</option>
          </select>
        </div>
      </section>
      <section className="contentSection mt-20">
        <h3>지원이력서</h3>
        <div className="input_default">
          <select className="w-full">
            <option value="" disabled selected hidden>
              이력서를 선택해주세요.
            </option>
            <option value="option1">옵션 1</option>
            <option value="option2">옵션 2</option>
            <option value="option3">옵션 3</option>
          </select>
        </div>
      </section>
      <section className="contentSection mt-20">
        <div className="flexJb">
          <h3>선택항목</h3>
          <button>파일첨부</button>
        </div>
        <div className="row">
          <p>증명서</p>
          <p>증명서.jpg</p>
        </div>
        <div className="row">
          <p>포트폴리오</p>
          <p>http://portfolio.com/web</p>
        </div>
      </section>
      <div className="bottomDes">
        {" "}
        <p>
          개인정보보호를 위해 개인정보가 포함된 파일은 사전동의 없이 삭제될 수
          있습니다.
        </p>
        <p>
          제출서류는 채용 마감 후 90일까지 지원기업에게 제공됩니다. 제출에
          동의할 경우에만[지원하기]버튼을 눌러주세요. 동의하지 않을 경우
          입사지원이 불가능합니다.
        </p>
      </div>
      <button className="blueBtn mt-50">지원하기</button>
    </div>
  );
};

export default MobileApplyPopup;
