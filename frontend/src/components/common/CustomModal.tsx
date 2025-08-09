import React, { useEffect, useRef } from "react";
import Modal from "react-modal";
import "./CustomModal.css";

// 앱의 루트 요소 설정 (접근성 관련)
Modal.setAppElement("#root");

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentLabel?: string;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  contentLabel = "Modal",
  width = "500px",
  height = "auto",
  showCloseButton = true,
}) => {
  // 모달 스타일
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      padding: 0,
      border: "1px solid #CBCBCB",
      borderRadius: "20px",
      width,
      height,
      maxHeight: "100vh",
      overflow: "visible",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  const scrollYRef = useRef(0);

  // useEffect(() => {
  //   if (isOpen) {
  //     // 1) 열린 직후에 현재 스크롤 위치 저장
  //     scrollYRef.current = window.pageYOffset;

  //     // 2) 배경 스크롤 잠금
  //     document.body.style.overflow = "hidden";
  //     document.body.style.position = "fixed";
  //     document.body.style.top = `-${scrollYRef.current}px`;
  //     document.body.style.width = "100%";
  //   } else {
  //     // 모달 닫힐 때 스타일 해제 + 스크롤 복원
  //     document.body.style.removeProperty("overflow");
  //     document.body.style.removeProperty("position");
  //     document.body.style.removeProperty("top");
  //     document.body.style.removeProperty("width");

  //     window.scrollTo(0, scrollYRef.current);
  //   }
  // }, [isOpen]);

  // 언마운트 시에도 스타일은 깨끗하게 지우기만
  // useEffect(() => {
  //   return () => {
  //     document.body.style.removeProperty("overflow");
  //     document.body.style.removeProperty("position");
  //     document.body.style.removeProperty("top");
  //     document.body.style.removeProperty("width");
  //   };
  // }, []);
  const handleAfterOpen = () => {
    scrollYRef.current = window.pageYOffset;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = "100%";
  };

  // 모달이 완전히 닫힌 후 (애니메이션 끝나고)
  const handleAfterClose = () => {
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");
    window.scrollTo(0, scrollYRef.current);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      onAfterOpen={handleAfterOpen}
      onAfterClose={handleAfterClose}
      closeTimeoutMS={200} // CSS 트랜지션 타이밍과 맞추세요
      shouldCloseOnOverlayClick
      shouldFocusAfterRender
      shouldReturnFocusAfterClose={false} // 포커스로 인한 스크롤 이동 차단
      style={customStyles}
      contentLabel={contentLabel}
    >
      <div className="custom-modal-container" style={{ paddingBottom: "20px" }}>
        {title && (
          <div className="header" style={{ padding: "30px 0" }}>
            <h2 className="title">{title}</h2>
          </div>
        )}
        {showCloseButton && (
          <button onClick={onClose} className="close-button" aria-label="닫기">
            ×
          </button>
        )}
        <div className="content">{children}</div>
      </div>
    </Modal>
  );
};

export default CustomModal;
