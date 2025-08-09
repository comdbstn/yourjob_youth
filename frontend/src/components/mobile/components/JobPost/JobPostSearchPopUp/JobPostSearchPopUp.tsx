import "./JobPostSearchPopUp.css";
export default function JobPostSearchPopUp() {
  return (
    <div className="jobPostSearchPopup_container">
      <div className="header">
        <h2
          className="ml-auto
        "
        >
          채용공고 상세검색
        </h2>
        <button className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" />
        </button>
      </div>
      <section className="selectSection">
        <div className="left">
          <ul>
            <li className="selected">직무</li>
            <li>근무지역</li>
            <li>채용형태</li>
            <li>기업형태</li>
          </ul>
        </div>
        <div className="right">
          <ul>
            <li>기획 전략</li>
            <li>법무 사무 총무</li>
            <li>인사 HR</li>
            <li>회계 세무</li>
          </ul>
        </div>
      </section>
      <section className="bottomSection">
        <div className="list">
          <button>
            법무 사무 총무
            <img src="/img/mobile/BlueXIcon.png" />
          </button>
          <button>법무 사무 총무 X</button>
          <button>법무 사무 총무 X</button>
        </div>
        <div className="btns">
          <button className="blueBtn w-25 grayBtn">초기화</button>
          <button className="blueBtn w-75">조건 검색하기</button>
        </div>
      </section>
    </div>
  );
}
