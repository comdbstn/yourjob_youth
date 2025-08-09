import { useEffect, useRef } from "react";
import CustomModal from "../common/CustomModal";
import "./OneBtnModal.css";
interface OneBtnModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  content: string;
  confirmEvent: () => void;
  confirmBtnLabel: string;
}
export default function OneBtnModal(props: OneBtnModalProps) {
  const { isOpen, onOpenChange, content, confirmEvent, confirmBtnLabel } =
    props;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 모달이 열릴 때 포커스 설정
    modalRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        confirmEvent();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, confirmEvent]);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      showCloseButton={false}
    >
      <div className="oneBtnModalContainer">
        <pre
          className="content"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {content}
        </pre>
        <button className="confirmBtn" onClick={confirmEvent}>
          {confirmBtnLabel}
        </button>
      </div>
    </CustomModal>
  );
}
