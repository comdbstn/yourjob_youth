import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import Main from "./components/MainSimple";
import MpApply from "./components/mypage/ApplyPage";
import MpMyPage from "./components/mypage/Mypage";
import MpProfile from "./components/mypage/Profile";
import MpProposal from "./components/mypage/ProposalPage";
import MpResume from "./components/mypage/Resume";
import MpResumeWrite from "./components/mypage/ResumeWrite";
import Scrap from "./components/mypage/ScrapPage";
import AcAcceptList from "./components/accept/AcceptList";
import AcAcceptPost from "./components/accept/AcceptPost";
import AcAcceptDetail from "./components/accept/AcceptDetail";
import CmBbsList from "./components/community/BbsList";
import CmBbsView from "./components/community/BbsView";
import CmBbsWrite from "./components/community/BbsWrite";
import CmMentoList from "./components/community/MentoList";
import CmMentoView from "./components/community/MentoView";
import CmMentoWrite from "./components/community/MentoWrite";
import CorpApplicant from "./components/corpmem/Applicant";
import CorpCorpmodify from "./components/corpmem/Corpmodify";
import CorpJobDetail from "./components/corpmem/JobDetail";
import CorpJobpost from "./components/corpmem/Jobpost";
import CorpLatestHuman from "./components/corpmem/LatestHuman";
import CorpMyPage from "./components/corpmem/Mypage";
import CorpPositionHuman from "./components/corpmem/PositionHuman";
import CorpProductAd from "./components/corpmem/ProductAd";
import CorpProductInform from "./components/corpmem/ProductInform";
import CorpProductMypage from "./components/corpmem/ProductMypage";
import CorpProfileView from "./components/corpmem/ProfileView";
import CorpResumeDetail from "./components/corpmem/ResumeDetail";
import CorpScrapHuman from "./components/corpmem/ScrapHuman";
import CorpSearch from "./components/corpmem/Search";
import CorpVolunteerList from "./components/corpmem/VolunteerList";
import JpJobDetail from "./components/jobpost/JobDetail";
import JpJoblistDom from "./components/jobpost/JoblistDom";
import JpJoblistOver from "./components/jobpost/JoblistOver";
import MemCorpJoin from "./components/member/CorpJoin";
import MemFindComplete from "./components/member/FindComplete";
import MemFindIdpwd from "./components/member/FindIdpwd";
import MemJoin from "./components/member/Join";
import MemJoinComplete from "./components/member/JoinComplete";
import MemUserLogin from "./components/member/UserLogin";

import AdminRedirect from "./components/admin/AdminRedirect";
import MobileJoin from "./components/mobile/member/join/MobileJoin";
import MobileUserLogin from "./components/mobile/member/userLogin/MobileUserLogin";
import MobileCorpLogin from "./components/mobile/member/corpLogin/MobileCorpLogin";
import MobileFindIdPwd from "./components/mobile/member/findIdPwd/MobileFindIdPwd";
import MobileCorpJoin from "./components/mobile/member/corpJoin/MobileCorpJoin";
import MobileFindComplete from "./components/mobile/member/findComplete/MobileFindComplete";
import MobileMain from "./components/mobile/main/main";
import MobileTermsView from "./components/mobile/termsView/MobileTermsView";
import MobileMypage from "./components/mobile/components/MyPage/MobileMypage";
import MobileEditMyPage from "./components/mobile/components/EditMyPage/EditMyPage";
import MobileResume from "./components/mobile/components/MyPage/Resume/MobileResume";
import MobileProposal from "./components/mobile/components/MyPage/Proposal/MobileProposal";
import MobileApply from "./components/mobile/components/MyPage/Apply/MobileApply";
import MobileScrap from "./components/mobile/components/MyPage/Scrap/MobileScrap";
import MobileCommunity from "./components/mobile/community/MobileCommunity";
import MobileCommunityView from "./components/mobile/community/communityView/MobileCommunityView";
import MobileWriteBoard from "./components/mobile/community/writeBoard/MobileWriteBoard";
import MobileAccept from "./components/mobile/components/Accept/MobileAccept";
import MobileAcceptView from "./components/mobile/components/Accept/AcceptView/MobileAcceptView";
import MobileJobPost from "./components/mobile/components/JobPost/MobileJobPost";
import MobileJobPostDetail from "./components/mobile/components/JobPost/JobPostDetail/JobPostDetail";
import MobileWriteResume from "./components/mobile/components/MyPage/Resume/WriteResume/WriteResume";
import MobileCompanyHome from "./components/mobile/components/Company/Home/MobileCompanyHome";
import MobileCompanyEditHome from "./components/mobile/components/Company/Home/CompanyEditHome/CompanyEditHome";
import MobileWriteRecruit from "./components/mobile/components/Company/WriteRecruit/MobileWriteRecruit";
import MobileManagePost from "./components/mobile/components/Company/ManagePost/MobileManagePost";
import VolunteerDocu from "./components/mobile/components/Company/ManagePost/VolunteerDocu/VolunteerDocu";
import MobileProductPage from "./components/mobile/components/Company/ProductPage/MobileProductPage";
import PositionInformService from "./components/mobile/components/Company/ProductPage/PositionInformService/PositionInformService";
import BannerInformService from "./components/mobile/components/Company/ProductPage/BannerInformService/BannerInformService";
import MobileSearchTalent from "./components/mobile/components/Company/MobileSearchTalent/MobileSearchTalent";
import TalentManagement from "./components/mobile/components/Company/TalentManagement/TalentManagement";
import MobileProfileView from "./components/mobile/components/Company/ProfileView/MobileProfileView";
import UserJoin from "./components/mobile/member/userJoin/UserJoin";
import Header from "./components/admin/Header";
import DataManagement from "./components/admin/DataManagement";
import DataManagementDetail from "./components/admin/DataManagementDetail";
import Login from "./components/admin/Login";
import JobInfo from "./components/admin/JobInfo";
import ResumeInfo from "./components/admin/ResumeInfo";
import JobApplication from "./components/admin/JobApplication";
import PositionProposal from "./components/admin/PositionProposal";
import CompanyInfo from "./components/admin/CompanyInfo";
import BannerManagement from "./components/admin/BannerManagement";
import BannerManagementDetail from "./components/admin/BannerManagementDetail";
import Community from "./components/admin/Community";
import OAuth2RedirectHandler from "./components/member/OAuth2RedirectHandler";
import TermsView from "./components/terms/TermsView";
import PrivacyPolicyView from "./components/terms/PrivacyPolicyView";
import MobileMemberProfileView from "./components/mobile/components/Company/MemberProfileView/MobileMemberProfileView";
import NewResumeDetail from "./components/corpmem/NewResumeDetail/NewResumeDetail";
import MobileNewResumeDetail from "./components/corpmem/NewResumeDetail/Mobile/MobileNewResumeDetail";
import ScrollToTop from "./components/mobile/scrollToTop/ScrollToTop";
import SessionValidator from "./SessionValidator";
import NotFoundView from "./components/notfound/NotFoundView";
import MyPage from "./components/profile/MyPage";

function RedirectToLogin() {
  useEffect(() => {
    window.location.replace("/admin/login.html");
  }, []);
  return null;
}

const AppRouter: React.FC = () => {
  return (
    <Router basename="/">
      <ScrollToTop />
      <SessionValidator />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/apply" element={<MpApply />} />
        <Route path="/mypage/resume" element={<MpResume />} />
        <Route path="/mypage/resume/write" element={<MpResumeWrite />} />
        <Route path="/mypage/resume/write/:id" element={<MpResumeWrite />} />
        <Route path="/mypage/scrap" element={<Scrap />} />
        <Route path="/mypage/profile" element={<MpProfile />} />
        <Route path="/mypage/proposal" element={<MpProposal />} />
        <Route path="/accept/acceptlist" element={<AcAcceptList />} />
        <Route path="/accept/acceptpost" element={<AcAcceptPost />} />
        <Route path="/accept/acceptdetail/:id" element={<AcAcceptDetail />} />
        <Route path="/community/bbslist" element={<CmBbsList />} />
        <Route path="/community/bbsview/:id" element={<CmBbsView />} />
        <Route path="/community/bbswrite" element={<CmBbsWrite />} />
        <Route path="/community/bbswrite/:id" element={<CmBbsWrite />} />
        <Route path="/community/mentolist" element={<CmMentoList />} />
        <Route path="/community/mentoview/:id" element={<CmMentoView />} />
        <Route path="/community/mentowrite" element={<CmMentoWrite />} />
        <Route path="/community/mentowrite/:id" element={<CmMentoWrite />} />
        <Route path="/corpmem/mypage" element={<CorpMyPage />} />
        <Route path="/corpmem/corpmodify" element={<CorpCorpmodify />} />
        <Route path="/corpmem/jobdetail/:id" element={<CorpJobDetail />} />
        <Route path="/corpmem/jobpost" element={<CorpJobpost />} />
        <Route path="/corpmem/jobpost/:id" element={<CorpJobpost />} />
        <Route path="/corpmem/productad" element={<CorpProductAd />} />
        <Route path="/corpmem/productinform" element={<CorpProductInform />} />
        <Route path="/corpmem/productmypage" element={<CorpProductMypage />} />
        <Route
          path="/corpmem/resumedetail/:id"
          element={<CorpResumeDetail />}
        />{" "}
        <Route
          path="/corpmem/newResumeDetail/:id"
          element={<NewResumeDetail />}
        />
        <Route
          path="/mypage/newResumeDetail/:id"
          element={<NewResumeDetail />}
        />
        <Route path="/corpmem/search" element={<CorpSearch />} />
        <Route path="/corpmem/positionhuman" element={<CorpPositionHuman />} />
        <Route path="/corpmem/scraphuman" element={<CorpScrapHuman />} />
        <Route path="/corpmem/latesthuman" element={<CorpLatestHuman />} />
        <Route path="/corpmem/applicant" element={<CorpApplicant />} />
        <Route
          path="/corpmem/applicant/:postId"
          element={<CorpVolunteerList />}
        />
        <Route
          path="/corpmem/applicant/:postId/:volunteerId"
          element={<CorpProfileView />}
        />
        <Route path="/jobs" element={<JpJoblistDom />} />
        <Route path="/jobpost/joblistover" element={<JpJoblistOver />} />
        <Route path="/jobs/:id" element={<JpJobDetail />} />
        <Route path="/member/corpjoin" element={<MemCorpJoin />} />
        <Route path="/member/findcomplete" element={<MemFindComplete />} />
        <Route path="/member/findidpwd" element={<MemFindIdpwd />} />
        <Route path="/member/join" element={<MemJoin />} />
        <Route path="/member/joincomplete" element={<MemJoinComplete />} />
        <Route path="/member/userlogin" element={<MemUserLogin />} />
        <Route path="/terms" element={<TermsView />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
        <Route path="/terms/service" element={<TermsView />} />
        <Route path="/terms/privacy" element={<PrivacyPolicyView />} />
        {/* Mobile */}
        <Route path="/m" element={<MobileMain />} />
        <Route path="/m/termsView" element={<MobileTermsView />} />
        <Route path="/m/mypage" element={<MobileMypage />} />
        <Route path="/m/mypage/editMyPage" element={<MobileEditMyPage />} />
        <Route path="/m/mypage/resume" element={<MobileResume />} />
        <Route path="/m/mypage/writeResume" element={<MobileWriteResume />} />
        <Route path="/m/mypage/proposal" element={<MobileProposal />} />
        <Route path="/m/mypage/apply" element={<MobileApply />} />
        <Route path="/m/mypage/scrap" element={<MobileScrap />} />
        <Route path="/m/member/userlogin" element={<MobileUserLogin />} />
        <Route path="/m/member/join" element={<MobileJoin />} />
        <Route path="/m/member/corplogin" element={<MobileCorpLogin />} />
        <Route path="/m/member/findIdPwd" element={<MobileFindIdPwd />} />
        <Route path="/m/member/corpJoin" element={<MobileCorpJoin />} />
        <Route path="/m/member/userJoin" element={<UserJoin />} />
        <Route path="/m/member/findComplete" element={<MobileFindComplete />} />
        <Route path="/m/community" element={<MobileCommunity />} />
        <Route path="/m/community/view" element={<MobileCommunityView />} />
        <Route path="/m/community/writeBoard" element={<MobileWriteBoard />} />
        <Route path="/m/accept" element={<MobileAccept />} />
        <Route path="/m/accept/view" element={<MobileAcceptView />} />
        <Route path="/m/jobPost" element={<MobileJobPost />} />
        <Route path="/m/jobPost/detail" element={<MobileJobPostDetail />} />
        <Route path="/m/company/home" element={<MobileCompanyHome />} />
        <Route path="/m/company/productPage" element={<MobileProductPage />} />
        <Route
          path="/m/corpmem/newResumeDetail/:id"
          element={<MobileNewResumeDetail />}
        />
        <Route
          path="/m/company/productPage/positionServiceInfo"
          element={<PositionInformService />}
        />
        <Route
          path="/m/company/productPage/bannerServiceInfo"
          element={<BannerInformService />}
        />
        <Route
          path="/m/company/searchTalent"
          element={<MobileSearchTalent />}
        />
        <Route
          path="/m/company/home/edit"
          element={<MobileCompanyEditHome />}
        />{" "}
        <Route
          path="/m/company/writeRecruit"
          element={<MobileWriteRecruit />}
        />
        <Route path="/m/company/managePost" element={<MobileManagePost />} />
        <Route path="/m/company/manageTalent" element={<TalentManagement />} />
        <Route
          path="/m/company/managePost/document"
          element={<VolunteerDocu />}
        />
        <Route
          path="/m/company/profileView/:postId/:volunteerId"
          element={<MobileProfileView />}
        />
        <Route
          path="/m/company/memberProfileView/:id"
          element={<MobileMemberProfileView />}
        />
        {/* Mobile */}
        <Route path="/admin" element={<RedirectToLogin />} />
        <Route
          path="/admin/login"
          element={<Navigate to="/admin/login.html" replace />}
        />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="*" element={<NotFoundView />} />
        <Route path="/notfound" element={<NotFoundView />} />
      </Routes>
    </Router>
  );
};

/**
 * Admin 레이아웃 컴포넌트
 */
const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <Header title="관리자" activeMenu="data-management" />
      <div className="admin-main">
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppRouter;
