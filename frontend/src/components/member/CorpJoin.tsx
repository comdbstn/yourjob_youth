import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../hooks";
import { corpJoin } from "../../app/slices/authSlice";
import CorpForm from "../common/CorpForm";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const CorpJoin: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleSubmit = async (data: any) => {
    try {
      const fullEmail =
        data.managerEmail && data.emailDomain
          ? `${data.managerEmail}@${data.emailDomain}`
          : data.managerEmail;

      const { businessCertificate, ...restData } = data;
      const submitData = {
        ...restData,
        managerEmail: fullEmail,
        businessCertificate: businessCertificate?.file || null,
      };

      await dispatch(corpJoin(submitData)).unwrap();
      alert("기업회원 가입이 완료되었습니다.");
      window.location.href = "/member/userlogin?tab=corp";
    } catch (error) {
      console.error("기업회원 가입 중 오류가 발생했습니다:", error);
      alert("기업회원 가입 실패: " + error);
    }
  };

  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet title="기업회원 가입" description="기업회원 가입" />
      <Link className="corp_join_new_header" to={"/"}>
        <img src="/img/logo.png" />
      </Link>
      <div className="corp_join_new">
        <div className="corpjoin">
          <CorpForm onSubmit={handleSubmit} isEditMode={false} />
        </div>
      </div>
    </div>
  );
};

export default CorpJoin;
