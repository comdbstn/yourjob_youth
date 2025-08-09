import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import './CorpLogin.css';
import { useAppDispatch } from '../../hooks';
import { corpLogin } from '../../app/slices/authSlice';

interface CorpLoginForm {
  accountId: string;
  password: string;
}

const CorpLogin: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<CorpLoginForm>({ defaultValues: { accountId: '', password: '' } });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: CorpLoginForm) => {
    dispatch(corpLogin(data))
      .unwrap()
      .then((response) => {
        
        sessionStorage.setItem("userId", response.userId);
        sessionStorage.setItem("userType", response.userType);
        navigate("/");
      })
      .catch((err: string) => {
        alert("기업회원 로그인 실패: " + err);
      });
  };

  return (
    <div className="corp_login_new container-center-horizontal">
      <div className="mem_container">
        <div className="corp_login">
          <Link to="/" className="title">
            <img src="/img/logo.png" alt="YourJob Logo" />
          </Link>
          <div className="loginTab">
            <Link to="/member/userlogin?tab=corp" className="active">기업회원 로그인</Link>
            <Link to="/member/userlogin">일반회원 로그인</Link>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="login_form">
            <div className="input_field">
              {/* name 속성을 register로 대체 */}
              <input 
                type="text" 
                placeholder="아이디를 입력해 주세요." 
                {...register("accountId", { required: true })} 
              />
            </div>
            <div className="input_field">
              <input 
                type="password" 
                placeholder="비밀번호를 입력해 주세요." 
                {...register("password", { required: true })} 
              />
            </div>
            <button type="submit" className="form_btn">로그인</button>
          </form>
          <div className="links">
            <Link to="/member/findidpwd">아이디/비밀번호 찾기</Link>
            <Link to="/member/corpjoin">기업회원 회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorpLogin;
