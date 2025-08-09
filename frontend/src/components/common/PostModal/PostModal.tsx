import React from "react";
import CustomModal from "../CustomModal";
import DaumPost from "./DaumPost";
import CustomModalMobile from "../../mobile/components/CustomModal/CustomModalMobile";

interface PostModalProps {
  isOpen: boolean;
  width?: string;
  onClose: () => void;

  onComplete: (address: string, zoneCode: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  width = "500px",
  onClose,

  onComplete,
}) => {
  return (
    <CustomModalMobile
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width={width}
      showCloseButton={false}
    >
      <div className="accept-delete-item-modal">
        <button
          onClick={onClose}
          style={{ width: "100%", textAlign: "end", marginBottom: "10px" }}
        >
          X
        </button>
        <DaumPost onComplete={onComplete} />
      </div>
    </CustomModalMobile>
  );
};

export default PostModal;
