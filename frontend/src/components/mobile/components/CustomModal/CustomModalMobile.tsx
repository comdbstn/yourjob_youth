import React, { useEffect, useRef } from "react";
import Modal from "react-modal";
import "./CustomModalMobile.css";

// 앱의 루트 요소 설정 (접근성 관련)
Modal.setAppElement("#root");

interface CustomModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentLabel?: string;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
}

const CustomModalMobile: React.FC<CustomModalMobileProps> = ({
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
      width: width,
      height: height,
      maxHeight: "90vh",
      overflow: "scroll",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  const scrollYRef = useRef(0);

  // useEffect(() => {
  //   if (isOpen) {
  //     // 모달 열릴 때 스크롤 위치 저장
  //     scrollYRef.current = window.pageYOffset;
  //     document.body.style.overflow = "hidden";
  //     document.body.style.position = "fixed";
  //     document.body.style.top = `-${scrollYRef.current}px`;
  //     document.body.style.width = "100%";
  //   } else {
  //     // 모달이 완전히 닫힐 때만 복원
  //     document.body.style.removeProperty("overflow");
  //     document.body.style.removeProperty("position");
  //     document.body.style.removeProperty("top");
  //     document.body.style.removeProperty("width");
  //     window.scrollTo(0, scrollYRef.current);
  //   }
  // }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel={contentLabel}
      closeTimeoutMS={200}
      shouldCloseOnOverlayClick={true}
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
      preventScroll={false}
      onAfterOpen={() => {
        scrollYRef.current = window.pageYOffset;
      }}
      onAfterClose={() => {
        window.scrollTo(0, scrollYRef.current);
      }}
    >
      <div className="mobile-custom-modal-container">
        {title && (
          <div className="header">
            <h2 className="title">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="close-button"
                aria-label="닫기"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="content">{children}</div>
      </div>
    </Modal>
  );
};

export default CustomModalMobile;
