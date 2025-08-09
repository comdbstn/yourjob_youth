export interface CompanyProfile {
  id: number;
  companyInfo: {
    name: string;
  };
  career: {
    type: string;
  };
  representativeName: string;
  logo_url?: string;
  employeeCount: number;
  capitalAmount: number;
  revenueAmount: number;
  netIncome: number;
  address: string;
  url?: string;
  businessNumber: string;
  industry: string;
  description: string;
  companyName: string;
}
