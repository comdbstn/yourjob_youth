import { VisaType } from "../app/dummy/options";

export interface User {
  id: number;
  name: string;
  userType: UserType;
}

export enum UserType {
  JOB_SEEKER = "JOB_SEEKER",
  COMPANY = "COMPANY",
  ADMIN = "ADMIN",
}

export interface UserProfile {
  name: string;
  englishName: string;
  birth: string;
  nationality: string;
  visa: VisaType[];
  email: string;
  phone: string;
  gender: "M" | "F";
  address: string;
  address_detail: string;
  zip_code: string;
  profileImage?: string;
}

export interface UpdateUserProfileRequest {
  name: string;
  englishName: string;
  birth: string;
  nationality: string;
  visa: VisaType[];
  email: string;
  phone: string;
  gender: "M" | "F" | "";
  address: string; 
  address_detail: string;
  zip_code: string;
  profileImage?: string;
}
