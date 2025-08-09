import { CompanyInfo } from '../types/corp';

export const validateCompanyInfo = (companyInfo: CompanyInfo): boolean => {
  if (!companyInfo.username) {
    alert('아이디를 입력해주세요.');
    return false;
  }
  
  if (companyInfo.password && companyInfo.password !== companyInfo.passwordConfirm) {
    alert('비밀번호가 일치하지 않습니다.');
    return false;
  }
  
  if (!companyInfo.managerName) {
    alert('담당자 명을 입력해주세요.');
    return false;
  }
  
  if (!companyInfo.managerPhone) {
    alert('담당자 휴대폰 번호를 입력해주세요.');
    return false;
  }
  
  if (!companyInfo.managerEmail) {
    alert('담당자 이메일을 입력해주세요.');
    return false;
  }
  
  if (!companyInfo.companyName) {
    alert('기업명을 입력해주세요.');
    return false;
  }
  
  if (!companyInfo.businessNumber) {
    alert('사업자등록번호를 입력해주세요.');
    return false;
  }
  
  if (!companyInfo.representative) {
    alert('대표자 이름을 입력해주세요.');
    return false;
  }

  return true;
};

export const createCompanyFormData = (companyInfo: CompanyInfo): FormData => {
  const formData = new FormData();
  
  const { businessCertificate, passwordConfirm, ...jsonData } = companyInfo;
  formData.append('data', JSON.stringify(jsonData));
  
  if (companyInfo.businessCertificate?.file) {
    formData.append('businessCertificate', companyInfo.businessCertificate.file);
  }
  
  return formData;
}; 