import "./ProposalPopup.css";

interface ProposalPopupProps {
  onClose: () => void; // 팝업 닫기 함수
}

const ProposalPopup: React.FC<ProposalPopupProps> = ({ onClose }) => {
  return (
    <div className="mobileProposalPopup-container">
      <div className="Xbtn">
        <button onClick={onClose}>
          {" "}
          {/* X 버튼 클릭 시 onClose 호출 */}
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>
      <h2>제안 상세보기</h2>
      <section className="contentSection">
        <p>[(주)유어잡]문구, 캐릭터 디자인 정규직 채용(경력&신입)</p>
      </section>

      <section className="contentSection mt-20">
        <div className="flexJb">
          <h3>유어잡에서 문구, 캐릭터 디자이너에 적합해보여 연락드립니다.</h3>
        </div>
        <div className="row">
          <p className="w-full">
            안녕하세요. 유어잡입니다. 저희가 찾고 있는 포지션에 적합하다고
            판단되어 제안 드립니다. 긍정적인 검토 부탁드리며, 답변 마감일까지
            해당 포지션의 제안을 수락한 경우에 한해서 기업에 지원자의 이력서 및
            개인정보가 전달되어 다음 전형 안내를 받으실 수 있습니다. 감사합니다.
          </p>
        </div>
        <div className="infos">
          <h4>포지션 정보</h4>
          <p>담당자가 입력한 포지션 정보에 대한 내용이 노출됩니다.</p>
          <h4>담당자</h4>
          <p>인사팀 김남길</p>
        </div>
      </section>
      <div className="flexGap10 w-full mt-50">
        <button className="blueBtn ">수락</button>
        <button className="rejectBtn ">거절</button>
      </div>
    </div>
  );
};

export default ProposalPopup;
