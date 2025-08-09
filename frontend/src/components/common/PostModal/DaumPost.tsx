import React from "react";
import DaumPostCode from "react-daum-postcode";

interface DaumPostProps {
  onComplete: (address: string, zoneCode: string) => void;
}

const DaumPost: React.FC<DaumPostProps> = ({ onComplete }) => {
  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    const { addressType, bname, buildingName } = data;
    if (addressType === "R") {
      if (bname !== "") {
        extraAddress += bname;
      }
      if (buildingName !== "") {
        extraAddress += `${extraAddress !== "" ? ", " : ""}${buildingName}`;
      }
      fullAddress += `${extraAddress !== "" ? ` ${extraAddress}` : ""}`;
    }

    onComplete(fullAddress, data.zonecode);
  };

  return <DaumPostCode onComplete={handleComplete} className="post-code" />;
};

export default DaumPost;
