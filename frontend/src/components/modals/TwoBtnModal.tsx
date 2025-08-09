import { useEffect, useRef } from "react";
import CustomModal from "../common/CustomModal";
import "./TwoBtnModal.css";

interface TwoBtnModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  content: string;
  confirmEvent: () => void;
  cancelEvent: () => void;
  confirmBtnLabel: string;
  cancelBtnLabel: string;
}

export default function TwoBtnModal(props: TwoBtnModalProps) {
  const {
    isOpen,
    onOpenChange,
    content,
    confirmEvent,
    cancelEvent,
    confirmBtnLabel,
    cancelBtnLabel,
  } = props;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    modalRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmEvent();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEvent();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, confirmEvent, cancelEvent]);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      showCloseButton={false}
    >
      <div className="twoBtnModalContainer">
        <pre className="content" style={{ textAlign: "center" }}>
          {content}
        </pre>
        <div className="buttonContainer">
          <button className="cancelBtn" onClick={cancelEvent}>
            {cancelBtnLabel}
          </button>
          <button className="confirmBtn" onClick={confirmEvent}>
            {confirmBtnLabel}
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
