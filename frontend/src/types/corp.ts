import { companyTypeOptions } from '../app/dummy/options';
import { FileResponse } from './common';

export interface CompanyInfo {
  id?: number;
  username: string;
  password?: string;
  passwordConfirm?: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  emailDomain?: string;
  companyName: string;
  businessNumber: string;
  representative: string;
  businessCertificate: FileResponse | null;
  companyType: string;
  // 250509 넘버타입 value 0으로 들어와서 바꿈
  employeeCount: '';
  capital: '';
  revenue: '';
  profit: '';
  // employeeCount: number;
  // capital: number;
  // revenue: number;
  // profit: number;
}

export interface CompanyInfoFormData {
  data: string; // JSON stringified CompanyInfo
  businessCertificate: FileResponse | null;
}

export const initialCompanyInfo: CompanyInfo = {
  username: '',
  password: '',
  passwordConfirm: '',
  managerName: '',
  managerPhone: '',
  managerEmail: '',
  emailDomain: '',
  companyName: '',
  businessNumber: '',
  representative: '',
  businessCertificate: null,
  companyType: companyTypeOptions[0].value,
  // 250509 넘버타입 value 0으로 들어와서 바꿈
  employeeCount: '',
  capital: '',
  revenue: '',
  profit: ''
  // employeeCount: number,
  // capital: number,
  // revenue: number,
  // profit: number
}; 