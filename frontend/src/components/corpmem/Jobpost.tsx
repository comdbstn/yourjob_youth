import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "./JobpostSelect.css";
import { axiosInstance } from "../../api/axios";
import JobTypeModal from "./JobTypeModal";
import SkillTypeModal from "./SkillTypeModal";
import CapacityTypeModal from "./CapacityTypeModal";

import PreferenceModal from "./PreferenceModal";
import LanguageModal from "./LanguageModal";
import LicenseModal from "./LicenseModal";
import MajorModal from "./MajorModal";
import WorklocationModal from "./WorklocationModal";
import IndustryModal from "./IndustryModal";
import JobRankModal from "./JobrankModal";
import PostModal from "../common/PostModal/PostModal";
import { FileResponse } from "../../types/common";
import Editor from "../editor/Editor";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import { useAlert } from "../../contexts/AlertContext";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import DataModal from "../DataModals/DefaultDataModal/DataModal";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}

export interface JobPostForm {
  id?: number;
  title: string; // 채용 제목

  logo_url: string;
  position: string; // 포지션
  jobType: string[]; // 직무
  skills: string[]; // 스킬
  capabilities: string[]; // 핵심역량

  career: {
    type: string; // 신입/경력/무관
    minYears?: number; // 최소 경력년수
    isYearMatter: boolean; // 경력년수 무관 여부
  };

  employmentType: {
    types: string[]; // 고용형태 (정규직/계약직/인턴 등)
    probationMonths?: number; // 수습기간 (개월)
    contractPeriod?: number; // 계약기간 (개월)
    isConversionAvailable?: boolean; // 정규직 전환 가능 여부
    workingPeriod?: number; // 근무기간 (개월)
  };

  recruitmentCount: {
    type: "direct" | "preset"; // 직접입력 or 프리셋
    count: number; // 모집인원 수
  };

  position_rank?: string[]; // 직급/직책

  qualification: {
    education: {
      level: string; // 학력 (고졸/대졸/석사 등)
      isExpectedGraduate: boolean; // 졸업예정자 가능 여부
    };
    preferences?: {
      useSpecialCondition: boolean; // 우대조건 사용 여부
      useLanguage: boolean; // 외국어 사용 여부
      useLicense: boolean; // 자격증 사용 여부
      useSpecialMajor: boolean; // 우대전공 사용 여부
      specialCondition: string[]; // 우대조건
      language: string[]; // 외국어
      license: string[]; // 자격증
      specialMajor: string[]; // 우대전공
    };
  };

  workConditions: {
    salary: {
      type: string; // 연봉/월급/시급 등
      min?: string; // 최소급여
      max?: string; // 최대급여
      isInterviewDecided: boolean; // 면접 후 결정 여부
      isMinimumWage: boolean; // 최저임금 준수 여부
    };
    location: {
      type: "국내" | "해외"; // 국내/해외
      address: string; // 근무지 주소
      address_detail: string; // 근무지 주소 상세
      zip_code: string; // 근무지 우편번호
      region: string[]; // 근무지역
      isRemoteAvailable: boolean; // 재택근무 가능 여부
    };
    workingDay: {
      type: string; // 근무요일 (주5일/주6일 등)
      customDays?: string[]; // 상세요일 선택 시
    };
    workingHours: {
      startHour: string; // 시작시간 (HH)
      startMinute: string; // 시작시간 (mm)
      endHour: string; // 종료시간 (HH)
      endMinute: string; // 종료시간 (mm)
      isFlexible: boolean; // 탄력근무제 가능 여부
    };
  };

  applicationPeriod: {
    start: {
      // 접수 시작
      date: string; // YYYY-MM-DD
      time: string; // HH:mm
    };
    end: {
      // 접수 마감
      date: string; // YYYY-MM-DD
      time: string; // HH:mm
    };
    type: string; // 접수기간 후 마감/채용시 마감/상시채용
  };

  applicationMethod: {
    methods: string[]; // 접수방법 (유어잡/홈페이지/이메일 등)
    homepage?: string; // 홈페이지 URL
    resumeTypes: {
      // 이력서 양식
      useYourJob: boolean; // 유어잡 양식 사용
      useCompanyFormat: boolean; // 자사양식 사용
      yourJobFiles?: (FileResponse | null)[]; // 유어잡 파일들
      companyFormatFiles?: (FileResponse | null)[]; // 자사양식 파일들
    };
  };

  companyInfo: {
    name: string;
    namePrivate: boolean;
    phoneField1: string;
    phoneField2: string;
    phoneField3: string;
    phonePrivate: boolean;
    industry: string[];
  };

  content: string;

  // 개인정보 수집 및 이용동의 필수/선택 항목 선택 여부
  terms: {
    // 민감정보 수집 동의
    sensitiveInfo: boolean;
    // 개인정보 수집 동의
    personalInfo: boolean;
  };

  url?: string;
}

const initialFormData: JobPostForm = {
  title: "", // 채용 제목
  position: "", // 포지션
  jobType: [], // 직무
  skills: [], // 스킬
  capabilities: [], // 핵심역량
  logo_url: "",

  career: {
    type: "", // 신입/경력/무관
    minYears: 0, // 최소 경력년수
    isYearMatter: false, // 경력년수 무관 여부
  },

  employmentType: {
    types: [], // 고용형태
    probationMonths: 3, // 수습기간 기본 3개월
    contractPeriod: 12, // 계약기간 기본 12개월
    isConversionAvailable: false, // 정규직 전환 가능 여부
    workingPeriod: 12, // 근무기간 기본 12개월
  },

  recruitmentCount: {
    type: "direct", // 직접입력/프리셋
    count: 1, // 모집인원 수
  },

  position_rank: [], // 직급/직책

  qualification: {
    education: {
      level: "학력무관", // 학력
      isExpectedGraduate: false, // 졸업예정자 가능 여부
    },
    preferences: {
      useSpecialCondition: false, // 우대조건 사용 여부
      useLanguage: false, // 외국어 사용 여부
      useLicense: false, // 자격증 사용 여부
      useSpecialMajor: false, // 우대전공 사용 여부
      specialCondition: [], // 우대조건
      language: [], // 외국어
      license: [], // 자격증
      specialMajor: [], // 우대전공
    },
  },

  workConditions: {
    salary: {
      type: "연봉", // 급여 유형
      min: "0", // 최소급여
      max: "0", // 최대급여
      isInterviewDecided: false, // 면접 후 결정 여부
      isMinimumWage: false, // 최저임금 준수 여부
    },
    location: {
      type: "국내", // 국내/해외
      address: "", // 근무지 주소
      address_detail: "", // 근무지 주소 상세
      zip_code: "", // 근무지 우편번호
      region: [], // 근무지역
      isRemoteAvailable: false, // 재택근무 가능 여부
    },
    workingDay: {
      type: "주5일", // 근무요일
      customDays: [], // 상세요일
    },
    workingHours: {
      startHour: "09", // 시작시간 (HH)
      startMinute: "00", // 시작시간 (mm)
      endHour: "18", // 종료시간 (HH)
      endMinute: "00", // 종료시간 (mm)
      isFlexible: false, // 탄력근무제 가능 여부
    },
  },

  applicationPeriod: {
    start: {
      date: new Date().toISOString().split("T")[0], // 오늘 날짜
      time: "09:00",
    },
    end: {
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30일 후
      time: "18:00",
    },
    type: "접수기간 후 마감", // 마감 유형
  },

  applicationMethod: {
    methods: [], // 접수방법
    homepage: "", // 홈페이지 URL
    resumeTypes: {
      useYourJob: false, // 유어잡 양식 사용
      useCompanyFormat: false, // 자사양식 사용
      yourJobFiles: [null], // 유어잡 파일 목록
      companyFormatFiles: [null], // 자사양식 파일 목록
    },
  },

  companyInfo: {
    name: "",
    namePrivate: false,
    phoneField1: "",
    phoneField2: "",
    phoneField3: "",
    phonePrivate: false,
    industry: [],
  },

  content: "",

  terms: {
    sensitiveInfo: false,
    personalInfo: false,
  },
};

const Jobpost: React.FC = () => {
  //경고 보여주는 유무
  const [isShowError, setIsShowError] = useState<boolean>(false);

  // 데이터 모달 데이터 init
  // 직무
  // 직무
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  // 스킬
  const [skillData, setSkillData] = useState<JobpostDataItem[]>([]);
  // 핵심역량
  const [capabilityData, setCapabilityData] = useState<JobpostDataItem[]>([]);
  // 자격증
  const [licenseData, setLicenseData] = useState<JobpostDataItem[]>([]);
  // 지역 (국내+해외)
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);
  const [domesticLocationData, setDomesticLocationData] = useState<
    JobpostDataItem[]
  >([]);
  const [overseasLocationData, setOverseasLocationData] = useState<
    JobpostDataItem[]
  >([]);
  // 추가로 필요한 데이터들
  // 우대조건
  const [preferenceData, setPreferenceData] = useState<JobpostDataItem[]>([]);
  // 외국어
  const [languageData, setLanguageData] = useState<JobpostDataItem[]>([]);
  // 우대전공
  const [majorData, setMajorData] = useState<JobpostDataItem[]>([]);
  // 업종
  const [industryData, setIndustryData] = useState<JobpostDataItem[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem("userType");
    if (sessionData === "ADMIN") {
      setIsAdmin(true);
    }
  }, []);

  // 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000009");
      const skillTypeData = await fetchJobpostData("00000015");
      const capabilityData = await fetchJobpostData("00000020");
      const licenseData = await fetchJobpostData("00000018");
      // 지역데이터
      const domestic = await fetchJobpostData("00000012");
      const overseas = await fetchJobpostData("00000013");
      const combined = [...domestic, ...overseas];
      //
      const preferenceData = await fetchJobpostData("00000014");
      const languageData = await fetchJobpostData("00000017");
      const majorData = await fetchJobpostData("00000019");
      const industryData = await fetchJobpostData("00000016");
      setJobTypeData(jobTypeData);
      setSkillData(skillTypeData);
      setCapabilityData(capabilityData);
      setLicenseData(licenseData);
      setDomesticLocationData(domestic);
      setOverseasLocationData(overseas);
      setLocationData([...domestic, ...overseas]); // 기존 combined 용도

      setPreferenceData(preferenceData);
      setLanguageData(languageData);
      setMajorData(majorData);
      setIndustryData(industryData);
    };

    fetchData();
  }, []);

  registerLocale("ko", ko);
  const { customAlert, customConfirm } = useAlert();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [jobPost, setJobPost] = useState<JobPostForm>(initialFormData);
  const [previousPosts, setPreviousPosts] = useState<JobPostForm[]>([]);
  const [showPrevLayer, setShowPrevLayer] = useState(false);
  const [isOpenPost, setIsOpenPost] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [displayLabels, setDisplayLabels] = useState({
    jobType: [] as string[],
    skills: [] as string[],
    capabilities: [] as string[],
    position_rank: [] as string[],
    specialCondition: [] as string[],
    language: [] as string[],
    license: [] as string[],
    specialMajor: [] as string[],
    region: [] as string[],
    industry: [] as string[],
  });

  useEffect(() => {
    setIsDirty(true);
  }, [jobPost]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();

      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!isDirty) return;

      if (
        !window.confirm(
          "저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?"
        )
      ) {
        window.history.pushState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);
  const fetchJobPost = async () => {
    try {
      const response = await axiosInstance.get<JobPostForm>(
        `/api/v1/corpmem/posts/${id}`
      );
      const mergedData = await mergeWithInitialData(response.data);
      setJobPost(mergedData);
      setJobPost((prev) => ({
        ...prev,
        terms: { ...prev.terms, sensitiveInfo: true },
      }));
      // 코드 배열 → 레이블 배열로 변환하는 헬퍼
      const mapCodesToLabels = (
        codes: string[] = [],
        list: JobpostDataItem[],
        // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
        getLabel: (item: JobpostDataItem) => string = (item) =>
          item.level1 ?? ""
      ): string[] => {
        return codes.map((code) => {
          const found = list.find((item) => item.operationDataId === code);
          return found ? getLabel(found) : code;
        });
      };

      setDisplayLabels({
        jobType: mapCodesToLabels(mergedData.jobType, jobTypeData),
        skills: mapCodesToLabels(mergedData.skills, skillData),
        capabilities: mapCodesToLabels(mergedData.capabilities, capabilityData),
        // position_rank 도 매핑이 필요하다면 예시처럼
        position_rank: mergedData.position_rank ?? [],

        specialCondition: mapCodesToLabels(
          mergedData.qualification.preferences?.specialCondition,
          preferenceData
        ),
        language: mapCodesToLabels(
          mergedData.qualification.preferences?.language,
          languageData
        ),
        license: mapCodesToLabels(
          mergedData.qualification.preferences?.license,
          licenseData
        ),
        specialMajor: mapCodesToLabels(
          mergedData.qualification.preferences?.specialMajor,
          majorData
        ),
        region: mapCodesToLabels(
          mergedData.workConditions.location.region,
          locationData
        ),
        industry: mapCodesToLabels(
          mergedData.companyInfo.industry,
          industryData
        ),
      });
    } catch (error) {
      navigate("/notfound");
      console.error("채용공고 조회 실패:", error);
    }
  };

  const fetchJobPostWithId = async (bringId: number) => {
    try {
      const response = await axiosInstance.get<JobPostForm>(
        `/api/v1/corpmem/posts/${bringId}`
      );
      const mergedData = await mergeWithInitialData(response.data);
      setJobPost(mergedData);

      // 코드 배열 → 레이블 배열로 변환하는 헬퍼
      const mapCodesToLabels = (
        codes: string[] = [],
        list: JobpostDataItem[],
        // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
        getLabel: (item: JobpostDataItem) => string = (item) =>
          item.level1 ?? ""
      ): string[] => {
        return codes.map((code) => {
          const found = list.find((item) => item.operationDataId === code);
          return found ? getLabel(found) : code;
        });
      };

      setDisplayLabels({
        jobType: mapCodesToLabels(mergedData.jobType, jobTypeData),
        skills: mapCodesToLabels(mergedData.skills, skillData),
        capabilities: mapCodesToLabels(mergedData.capabilities, capabilityData),
        // position_rank 도 매핑이 필요하다면 예시처럼
        position_rank: mergedData.position_rank ?? [],

        specialCondition: mapCodesToLabels(
          mergedData.qualification.preferences?.specialCondition,
          preferenceData
        ),
        language: mapCodesToLabels(
          mergedData.qualification.preferences?.language,
          languageData
        ),
        license: mapCodesToLabels(
          mergedData.qualification.preferences?.license,
          licenseData
        ),
        specialMajor: mapCodesToLabels(
          mergedData.qualification.preferences?.specialMajor,
          majorData
        ),
        region: mapCodesToLabels(
          mergedData.workConditions.location.region,
          locationData
        ),
        industry: mapCodesToLabels(
          mergedData.companyInfo.industry,
          industryData
        ),
      });
    } catch (error) {
      console.error("채용공고 조회 실패:", error);
    }
  };

  const fetchPreviousPosts = async () => {
    try {
      const response = await axiosInstance.get<JobPostForm[]>(
        "/api/v1/corpmem/posts"
      );
      setPreviousPosts(response.data);
    } catch (error) {
      console.error("이전 공고 조회 실패:", error);
    }
  };

  // 모달 관련 로직 시작
  // 직무 선택 모달 상태
  const [isJobTypeModalOpen, setIsJobTypeModalOpen] = useState(false);

  // 직무 선택 모달 열기
  const openJobTypeModal = () => {
    setIsJobTypeModalOpen(true);
  };

  // 직무 선택 모달 닫기
  const closeJobTypeModal = () => {
    setIsJobTypeModalOpen(false);
  };

  // 직무 선택 처리
  const handleJobTypeSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        jobType: selectedItems.map((item) => item.operationDataId),
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      jobType: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 스킬 선택 모달 상태
  const [isSkillTypeModalOpen, setIsSkillTypeModalOpen] = useState(false);

  // 스킬 선택 모달 열기
  const openSkillTypeModal = () => {
    setIsSkillTypeModalOpen(true);
  };

  // 스킬 선택 모달 닫기
  const closeSkillTypeModal = () => {
    setIsSkillTypeModalOpen(false);
  };

  // 스킬 선택 처리
  const handleSkillTypeSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skills: selectedItems.map((item) => item.operationDataId),
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      skills: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 핵심역량 선택 모달 상태
  const [isCapacityTypeModalOpen, setIsCapacityTypeModalOpen] = useState(false);

  // 핵심역량 선택 모달 열기
  const openCapacityTypeModal = () => {
    setIsCapacityTypeModalOpen(true);
  };

  // 핵심역량 선택 모달 닫기
  const closeCapacityTypeModal = () => {
    setIsCapacityTypeModalOpen(false);
  };

  // 핵심역량 선택 처리
  const handleCapacityTypeSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => ({
      ...prev,
      capabilities: selectedItems.map((item) => item.operationDataId),
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      capabilities: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 직급/직책 선택 모달 상태
  const [isJobRankModalOpen, setIsJobRankModalOpen] = useState(false);

  // 직급/직책 선택 모달 열기
  const openJobRankModal = () => {
    setIsJobRankModalOpen(true);
  };

  // 직급/직책 선택 모달 닫기
  const closeJobRankModal = () => {
    setIsJobRankModalOpen(false);
  };

  // 직급/직책 선택 처리
  const handleJobRankSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        position_rank: selectedItems.map((item) => item.operationDataId),
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      position_rank: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 우대조건 모달 상태
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);

  // 외국어 모달 상태
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // 자격증 모달 상태
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // 우대전공 모달 상태
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);

  // 우대조건 모달 열기
  const openPreferenceModal = () => {
    setIsPreferenceModalOpen(true);
  };

  // 우대조건 모달 닫기
  const closePreferenceModal = () => {
    setIsPreferenceModalOpen(false);
  };

  // 우대조건 선택 처리
  const handlePreferenceSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;

      const currentPreferences = prev.qualification.preferences || {
        useSpecialCondition: false,
        useLanguage: false,
        useLicense: false,
        useSpecialMajor: false,
        specialCondition: [],
        language: [],
        license: [],
        specialMajor: [],
      };

      return {
        ...prev,
        qualification: {
          ...prev.qualification,
          preferences: {
            ...currentPreferences,
            specialCondition: selectedItems.map((item) => item.operationDataId),
            useSpecialCondition: selectedItems.length > 0,
          },
        },
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      specialCondition: selectedItems.map((item) => item.displayLabel),
    }));
  };
  // 외국어 모달 열기
  const openLanguageModal = () => {
    setIsLanguageModalOpen(true);
  };

  // 외국어 모달 닫기
  const closeLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  // 외국어 선택 처리
  const handleLanguageSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;

      const currentPreferences = prev.qualification.preferences || {
        useSpecialCondition: false,
        useLanguage: false,
        useLicense: false,
        useSpecialMajor: false,
        specialCondition: [],
        language: [],
        license: [],
        specialMajor: [],
      };

      return {
        ...prev,
        qualification: {
          ...prev.qualification,
          preferences: {
            ...currentPreferences,
            language: selectedItems.map((item) => item.operationDataId),
            useLanguage: selectedItems.length > 0,
          },
        },
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      language: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 자격증 모달 열기
  const openLicenseModal = () => {
    setIsLicenseModalOpen(true);
  };

  // 자격증 모달 닫기
  const closeLicenseModal = () => {
    setIsLicenseModalOpen(false);
  };

  // 자격증 선택 처리
  const handleLicenseSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;

      const currentPreferences = prev.qualification.preferences || {
        useSpecialCondition: false,
        useLanguage: false,
        useLicense: false,
        useSpecialMajor: false,
        specialCondition: [],
        language: [],
        license: [],
        specialMajor: [],
      };

      return {
        ...prev,
        qualification: {
          ...prev.qualification,
          preferences: {
            ...currentPreferences,
            license: selectedItems.map((item) => item.operationDataId),
            useLicense: selectedItems.length > 0,
          },
        },
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      license: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 우대전공 모달 열기
  const openMajorModal = () => {
    setIsMajorModalOpen(true);
  };

  // 우대전공 모달 닫기
  const closeMajorModal = () => {
    setIsMajorModalOpen(false);
  };

  // 우대전공 선택 처리
  const handleMajorSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => {
      if (!prev) return prev;

      const currentPreferences = prev.qualification.preferences || {
        useSpecialCondition: false,
        useLanguage: false,
        useLicense: false,
        useSpecialMajor: false,
        specialCondition: [],
        language: [],
        license: [],
        specialMajor: [],
      };

      return {
        ...prev,
        qualification: {
          ...prev.qualification,
          preferences: {
            ...currentPreferences,
            specialMajor: selectedItems.map((item) => item.operationDataId),
            useSpecialMajor: selectedItems.length > 0,
          },
        },
      };
    });
    setDisplayLabels((prev) => ({
      ...prev,
      specialMajor: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 근무지 선택 모달 상태
  const [isWorklocationModalOpen, setIsWorklocationModalOpen] = useState(false);

  // 근무지 선택 모달 열기
  const openWorklocationModal = () => {
    setIsWorklocationModalOpen(true);
  };

  // 근무지 선택 모달 닫기
  const closeWorklocationModal = () => {
    setIsWorklocationModalOpen(false);
  };

  // 근무지 선택 처리
  const handleWorklocationSelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => ({
      ...prev,
      workConditions: {
        ...prev.workConditions,
        location: {
          ...prev.workConditions.location,
          region: selectedItems.map((item) => item.operationDataId),
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      region: selectedItems.map((item) => item.displayLabel),
    }));
  };

  // 모달 관련 로직 끝

  useEffect(() => {
    // 수정 모드일 경우 (id가 있을 경우) 데이터 불러오기
    if (id) {
      fetchJobPost();
    }

    // 이전 공고 목록 불러오기
    fetchPreviousPosts();
  }, [
    id,
    jobTypeData,
    skillData,
    capabilityData,
    licenseData,
    locationData,
    preferenceData,
    languageData,
    majorData,
    industryData,
  ]);

  // 입력 필드 변경 함수
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value: rawValue } = e.target;
    let value = rawValue;

    // 연락처(phoneField1, phoneField2, phoneField3)일 경우 숫자만 남기기
    if (
      name === "companyInfo.phoneField1" ||
      name === "companyInfo.phoneField2" ||
      name === "companyInfo.phoneField3"
    ) {
      // 숫자 외 모든 문자 제거
      value = rawValue.replace(/\D/g, "");
    }
    if (name.includes(".")) {
      const parts = name.split(".");
      setJobPost((prev) => {
        const current = { ...prev };
        let temp = current as any;

        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }

        temp[parts[parts.length - 1]] = value;

        // 접수기간 관련 입력이 변경된 경우 유효성 검사
        if (name.includes("applicationPeriod")) {
          const startDate = new Date(current.applicationPeriod.start.date);
          const endDate = new Date(current.applicationPeriod.end.date);

          if (endDate < startDate) {
            setErrors((prev) => ({
              ...prev,
              applicationPeriod: "마감일은 등록일보다 이후여야 합니다.",
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.applicationPeriod;
              return newErrors;
            });
          }
        }

        return current;
      });
    } else {
      setJobPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 체크박스 변경 함수
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name.includes(".")) {
      const parts = name.split(".");
      setJobPost((prev) => {
        const current = { ...prev };
        let temp = current as any;

        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }

        temp[parts[parts.length - 1]] = checked;

        return current;
      });
    } else {
      setJobPost((prev) => ({ ...prev, [name]: checked }));
    }
  };

  // 체크박스 그룹 변경 함수(입력 값이 배열일 경우)
  // 기존 handleCheckboxGroupChange를 아래와 같이 대체하세요.
  const handleCheckboxGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, checked } = e.target;

    // applicationMethod.methods인 경우: 한 개만 선택되도록 덮어쓰기
    if (name === "applicationMethod.methods") {
      setJobPost((prev) => ({
        ...prev,
        applicationMethod: {
          ...prev.applicationMethod,
          methods: checked ? [value] : [],
          // 만약 체크를 해제한 경우라면 빈 배열로
        },
      }));
      return;
    }

    // 그 외의 배열 타입 필드 (이전 로직 그대로)
    if (name.includes(".")) {
      const parts = name.split(".");
      setJobPost((prev) => {
        const current = { ...prev };
        let temp: any = current;
        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }

        const lastPart = parts[parts.length - 1];
        const currentArray: string[] = temp[lastPart] || [];

        if (currentArray.includes(value)) {
          temp[lastPart] = currentArray.filter((item) => item !== value);
        } else {
          temp[lastPart] = [...currentArray, value];

          // 홈페이지 체크 시 useYourJob 자동 활성화
          if (
            parts[0] === "applicationMethod" &&
            lastPart === "methods" &&
            value === "홈페이지"
          ) {
            current.applicationMethod = {
              ...current.applicationMethod,
              resumeTypes: {
                ...current.applicationMethod.resumeTypes,
                useYourJob: true,
              },
            };
          }
        }

        // (기존에 있던 최대 3개 제한 로직 보존)
        if (currentArray.length >= 3) {
          customAlert({
            content: "고용형태는 최대 3개까지만 선택할 수 있습니다.",
          });
          return prev;
        }

        return current;
      });
    } else {
      setJobPost((prev) => {
        const currentArray = (prev[name as keyof JobPostForm] ||
          []) as string[];
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [name]: currentArray.filter((item) => item !== value),
          };
        } else {
          return {
            ...prev,
            [name]: [...currentArray, value],
          };
        }
      });
    }
  };

  // 라디오 변경 함수
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const parts = name.split(".");
      setJobPost((prev) => {
        const current = { ...prev };
        let temp = current as any;

        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }

        temp[parts[parts.length - 1]] = value;

        return current;
      });
    } else {
      setJobPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 선택 필드 변경 함수
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const parts = name.split(".");
      setJobPost((prev) => {
        const current = { ...prev };
        let temp = current as any;

        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = { ...temp[parts[i]] };
          temp = temp[parts[i]];
        }

        temp[parts[parts.length - 1]] = value;

        return current;
      });
    } else {
      setJobPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 파일 변경 함수
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).map(
      (file) =>
        ({
          file,
          apo_file_nm: file.name,
          apo_download_url: URL.createObjectURL(file),
        } as FileResponse)
    );

    if (name === "applicationMethod.resumeTypes.yourJobFiles") {
      setJobPost((prev) => ({
        ...prev,
        applicationMethod: {
          ...prev.applicationMethod,
          resumeTypes: {
            ...prev.applicationMethod.resumeTypes,
            yourJobFiles: fileArray,
          },
        },
      }));
    } else if (name === "applicationMethod.resumeTypes.companyFormatFiles") {
      setJobPost((prev) => ({
        ...prev,
        applicationMethod: {
          ...prev.applicationMethod,
          resumeTypes: {
            ...prev.applicationMethod.resumeTypes,
            companyFormatFiles: fileArray,
          },
        },
      }));
    }
  };

  // 적용 버튼 클릭 함수
  const handleApply = () => {
    const jobPostData = {
      ...jobPost,
      career: {
        ...jobPost.career,
        minYears:
          jobPost.career.type !== "경력" ? jobPost.career.minYears : null,
        isYearMatter:
          jobPost.career.type !== "경력" ? jobPost.career.isYearMatter : false,
      },
      employmentType: {
        ...jobPost.employmentType,
        probationMonths: jobPost.employmentType.types.includes("정규직")
          ? jobPost.employmentType.probationMonths
          : null,
        contractPeriod: jobPost.employmentType.types.includes("계약직")
          ? jobPost.employmentType.contractPeriod
          : null,
        isConversionAvailable: jobPost.employmentType.types.includes("계약직")
          ? jobPost.employmentType.isConversionAvailable
          : null,
        workingPeriod: jobPost.employmentType.types.includes(
          "위촉직/개인사업자"
        )
          ? jobPost.employmentType.workingPeriod
          : null,
      },
      qualification: {
        ...jobPost.qualification,
        preferences: {
          ...jobPost.qualification.preferences,
          specialCondition: jobPost.qualification.preferences
            ?.useSpecialCondition
            ? jobPost.qualification.preferences?.specialCondition
            : [],
          language: jobPost.qualification.preferences?.useLanguage
            ? jobPost.qualification.preferences?.language
            : [],
          license: jobPost.qualification.preferences?.useLicense
            ? jobPost.qualification.preferences?.license
            : [],
          specialMajor: jobPost.qualification.preferences?.useSpecialMajor
            ? jobPost.qualification.preferences?.specialMajor
            : [],
        },
      },
      applicationMethod: {
        ...jobPost.applicationMethod,
        resumeTypes: {
          ...jobPost.applicationMethod.resumeTypes,
          // 파일 필드는 제외하고 JSON으로 전송
          useYourJob: jobPost.applicationMethod.resumeTypes.useYourJob,
          useCompanyFormat:
            jobPost.applicationMethod.resumeTypes.useCompanyFormat,
        },
      },
    };

    // FormData 객체 생성
    const formData = new FormData();

    // JSON 데이터 추가
    formData.append("data", JSON.stringify(jobPostData));

    // 파일 데이터 추가
    if (
      jobPost.applicationMethod.resumeTypes.useYourJob &&
      jobPost.applicationMethod.resumeTypes.yourJobFiles &&
      jobPost.applicationMethod.resumeTypes.yourJobFiles.length > 0
    ) {
      jobPost.applicationMethod.resumeTypes.yourJobFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`yourJobFiles`, file.file);
          }
        }
      );
    }

    if (
      jobPost.applicationMethod.resumeTypes.useCompanyFormat &&
      jobPost.applicationMethod.resumeTypes.companyFormatFiles &&
      jobPost.applicationMethod.resumeTypes.companyFormatFiles.length > 0
    ) {
      jobPost.applicationMethod.resumeTypes.companyFormatFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`companyFormatFiles`, file.file);
          }
        }
      );
    }

    const userType = sessionStorage.getItem("userType");
    if (userType === "ADMIN") {
      setIsAdmin(true);
    }

    // API 호출
    axiosInstance
      .post("/api/v1/corpmem/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setIsDirty(false);
        customAlert({
          content: "채용공고 등록이 완료되었습니다.",
        });
        if (isAdmin) {
          window.location.href = "/admin/Jobs.html";
        } else {
          navigate("/corpmem/applicant");
        }
      })
      .catch((error) => {
        console.error("채용공고 등록 실패:", error);
      });
  };

  // 이전공고 불러오기 버튼 클릭 함수
  const handleBringJobPost = () => {
    setShowPrevLayer(!showPrevLayer);
  };

  const mergeWithInitialData = async (
    selectedPost: JobPostForm
  ): Promise<JobPostForm> => {
    // 이력서 양식이 있을 경우 File 객체로 변환
    const convertedYourJobFiles = selectedPost.applicationMethod?.resumeTypes
      ?.yourJobFiles
      ? await Promise.all(
          (selectedPost.applicationMethod?.resumeTypes?.yourJobFiles || []).map(
            async (yourJobFile: FileResponse | null) => {
              if (yourJobFile?.apo_download_url) {
                try {
                  const response = await fetch(
                    yourJobFile?.apo_download_url || ""
                  );
                  const blob = await response.blob();
                  return {
                    ...yourJobFile,
                    file: new File(
                      [blob],
                      yourJobFile?.apo_file_nm || "yourJobFile.pdf",
                      {
                        type: blob.type,
                      }
                    ),
                  };
                } catch (error) {
                  console.error("이력서 파일 변환 실패:", error);
                  return yourJobFile;
                }
              }
              return yourJobFile;
            }
          )
        )
      : [];

    const convertedCompanyFormatFiles = selectedPost.applicationMethod
      ?.resumeTypes?.companyFormatFiles
      ? await Promise.all(
          (
            selectedPost.applicationMethod?.resumeTypes?.companyFormatFiles ||
            []
          ).map(async (companyFormatFile: FileResponse | null) => {
            if (companyFormatFile?.apo_download_url) {
              try {
                const response = await fetch(
                  companyFormatFile?.apo_download_url || ""
                );
                const blob = await response.blob();
                return {
                  ...companyFormatFile,
                  file: new File(
                    [blob],
                    companyFormatFile?.apo_file_nm || "companyFormatFile.pdf",
                    {
                      type: blob.type,
                    }
                  ),
                };
              } catch (error) {
                console.error("이력서 파일 변환 실패:", error);
                return companyFormatFile;
              }
            }
            return companyFormatFile;
          })
        )
      : [];

    const mergedResumeTypes = {
      useYourJob:
        selectedPost.applicationMethod?.resumeTypes?.useYourJob ||
        initialFormData.applicationMethod.resumeTypes.useYourJob,
      useCompanyFormat:
        selectedPost.applicationMethod?.resumeTypes?.useCompanyFormat ||
        initialFormData.applicationMethod.resumeTypes.useCompanyFormat,
      yourJobFiles:
        convertedYourJobFiles.length > 0
          ? convertedYourJobFiles
          : initialFormData.applicationMethod.resumeTypes.yourJobFiles,
      companyFormatFiles:
        convertedCompanyFormatFiles.length > 0
          ? convertedCompanyFormatFiles
          : initialFormData.applicationMethod.resumeTypes.companyFormatFiles,
    };

    return {
      id: selectedPost.id || initialFormData.id,
      title: selectedPost.title || initialFormData.title,
      logo_url: selectedPost.logo_url || initialFormData.logo_url,
      position: selectedPost.position || initialFormData.position,
      jobType: selectedPost.jobType?.length
        ? selectedPost.jobType
        : initialFormData.jobType,
      skills: selectedPost.skills?.length
        ? selectedPost.skills
        : initialFormData.skills,
      capabilities: selectedPost.capabilities?.length
        ? selectedPost.capabilities
        : initialFormData.capabilities,
      career: selectedPost.career?.type
        ? selectedPost.career
        : initialFormData.career,
      employmentType: selectedPost.employmentType?.types?.length
        ? selectedPost.employmentType
        : initialFormData.employmentType,
      recruitmentCount:
        selectedPost.recruitmentCount || initialFormData.recruitmentCount,
      position_rank: selectedPost.position_rank?.length
        ? selectedPost.position_rank
        : initialFormData.position_rank,
      qualification: selectedPost.qualification?.education
        ? selectedPost.qualification
        : initialFormData.qualification,
      workConditions:
        selectedPost.workConditions || initialFormData.workConditions,
      applicationPeriod:
        selectedPost.applicationPeriod || initialFormData.applicationPeriod,
      applicationMethod: selectedPost.applicationMethod
        ? {
            ...selectedPost.applicationMethod,
            resumeTypes: mergedResumeTypes,
          }
        : initialFormData.applicationMethod,
      companyInfo: selectedPost.companyInfo || initialFormData.companyInfo,
      content: selectedPost.content || initialFormData.content,
      terms: selectedPost.terms || initialFormData.terms,
    };
  };
  const startDate = jobPost.applicationPeriod.start.date
    ? new Date(jobPost.applicationPeriod.start.date)
    : null;
  const handleSelectPreviousPost = async (selectedPost: JobPostForm) => {
    // const mergedData = await mergeWithInitialData(selectedPost);
    // setJobPost({
    //   ...mergedData,
    //   id: undefined,
    // });
    if (selectedPost.id) {
      fetchJobPostWithId(selectedPost.id);
    } else {
      customAlert({
        content: `"${selectedPost.title}" 공고 불러오기가 실패하였습니다.`,
      });
      setShowPrevLayer(false);
    }

    setShowPrevLayer(false);
    customAlert({
      content: `"${selectedPost.title}" 공고 불러오기가 성공적으로 처리되었습니다.`,
    });
  };

  // 수정 버튼 클릭 함수
  const handleEditJobPost = () => {
    const jobPostData = {
      ...jobPost,
      career: {
        ...jobPost.career,
        minYears:
          jobPost.career.type !== "경력" ? jobPost.career.minYears : null,
        isYearMatter:
          jobPost.career.type !== "경력" ? jobPost.career.isYearMatter : false,
      },
      employmentType: {
        ...jobPost.employmentType,
        probationMonths: jobPost.employmentType.types.includes("정규직")
          ? jobPost.employmentType.probationMonths
          : null,
        contractPeriod: jobPost.employmentType.types.includes("계약직")
          ? jobPost.employmentType.contractPeriod
          : null,
        isConversionAvailable: jobPost.employmentType.types.includes("계약직")
          ? jobPost.employmentType.isConversionAvailable
          : null,
        workingPeriod: jobPost.employmentType.types.includes(
          "위촉직/개인사업자"
        )
          ? jobPost.employmentType.workingPeriod
          : null,
      },
      qualification: {
        ...jobPost.qualification,
        preferences: {
          ...jobPost.qualification.preferences,
          specialCondition: jobPost.qualification.preferences
            ?.useSpecialCondition
            ? jobPost.qualification.preferences?.specialCondition
            : [],
          language: jobPost.qualification.preferences?.useLanguage
            ? jobPost.qualification.preferences?.language
            : [],
          license: jobPost.qualification.preferences?.useLicense
            ? jobPost.qualification.preferences?.license
            : [],
          specialMajor: jobPost.qualification.preferences?.useSpecialMajor
            ? jobPost.qualification.preferences?.specialMajor
            : [],
        },
      },
      applicationMethod: {
        ...jobPost.applicationMethod,
        resumeTypes: {
          ...jobPost.applicationMethod.resumeTypes,
          // 파일 필드는 제외하고 JSON으로 전송
          useYourJob: jobPost.applicationMethod.resumeTypes.useYourJob,
          useCompanyFormat:
            jobPost.applicationMethod.resumeTypes.useCompanyFormat,
        },
      },
    };

    // FormData 객체 생성
    const formData = new FormData();

    // JSON 데이터 추가
    formData.append("data", JSON.stringify(jobPostData));

    // 파일 데이터 추가
    if (
      jobPost.applicationMethod.resumeTypes.useYourJob &&
      jobPost.applicationMethod.resumeTypes.yourJobFiles &&
      jobPost.applicationMethod.resumeTypes.yourJobFiles.length > 0
    ) {
      jobPost.applicationMethod.resumeTypes.yourJobFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`yourJobFiles`, file.file);
          }
        }
      );
    }

    if (
      jobPost.applicationMethod.resumeTypes.useCompanyFormat &&
      jobPost.applicationMethod.resumeTypes.companyFormatFiles &&
      jobPost.applicationMethod.resumeTypes.companyFormatFiles.length > 0
    ) {
      jobPost.applicationMethod.resumeTypes.companyFormatFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`companyFormatFiles`, file.file);
          }
        }
      );
    }

    const userType = sessionStorage.getItem("userType");
    if (userType === "ADMIN") {
      setIsAdmin(true);
    }

    // API 호출
    axiosInstance
      .put(`/api/v1/corpmem/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setIsDirty(false);
        customAlert({
          content: "수정이 완료되었습니다.",
        });
        if (isAdmin) {
          window.location.href = "/admin/Jobs.html";
        } else {
          navigate("/corpmem/applicant");
        }
      })
      .catch((error) => {
        console.error("채용공고 수정 실패:", error);
      });
  };

  // 취소 버튼 클릭 함수
  const handleCancelJobPost = async () => {
    const userType = sessionStorage.getItem("userType");
    if (userType === "ADMIN") {
      setIsAdmin(true);
    }
    if (isAdmin) {
      setIsDirty(false); // 변경사항 플래그 초기화
      window.location.href = "/admin/Jobs.html";
      return;
    }

    const confirmMessage = id
      ? "수정을 취소하시겠습니까?"
      : "등록을 취소하시겠습니까?";
    if (
      await customConfirm({
        content: confirmMessage,
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      navigate("/corpmem/applicant");
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    setIsShowError(true);
    // 채용 제목 검증
    if (!jobPost.title.trim()) {
      newErrors.title = "채용 제목을 입력해주세요.";
    }

    // 포지션 검증
    if (!jobPost.position.trim()) {
      newErrors.position = "포지션을 입력해주세요.";
    }

    // 직무 검증
    if (!jobPost.jobType.length) {
      newErrors.jobType = "직무를 선택해주세요.";
    }

    // 경력 검증
    if (!jobPost.career.type) {
      newErrors.career = "경력을 선택해주세요.";
    }

    // 고용형태 검증
    if (!jobPost.employmentType.types.length) {
      newErrors.employmentType = "고용형태를 선택해주세요.";
    }

    // 학력 검증
    if (!jobPost.qualification.education.level) {
      newErrors.education = "학력을 선택해주세요.";
    }

    // 급여 검증
    if (!jobPost.workConditions.salary.type) {
      newErrors.salary = "급여 유형을 선택해주세요.";
    }
    const { salary } = jobPost.workConditions;

    if (!salary.isInterviewDecided && salary.type !== "회사내규에 따름") {
      const min = salary.min;
      const max = salary.max;

      if (!min || !max) {
        newErrors.salary = "최소·최대 급여를 모두 입력해주세요.";
      } else if (Number(min) > Number(max)) {
        newErrors.salary = "최소 급여는 최대 급여보다 작아야 합니다.";
      }
    }

    // 근무지 주소 검증
    if (
      !jobPost.workConditions.location.address ||
      !jobPost.workConditions.location.type
    ) {
      newErrors.address = "근무지 주소를 입력해주세요.";
    }

    // 근무지역 검증
    if (!jobPost.workConditions.location.region.length) {
      newErrors.region = "근무지역을 선택해주세요.";
    }

    // 접수기간 검증
    if (
      !jobPost.applicationPeriod.start.date ||
      !jobPost.applicationPeriod.end.date
    ) {
      newErrors.applicationPeriod = "접수기간을 선택해주세요.";
    } else {
      const startDate = new Date(jobPost.applicationPeriod.start.date);
      const endDate = new Date(jobPost.applicationPeriod.end.date);

      if (endDate < startDate) {
        newErrors.applicationPeriod = "마감일은 등록일보다 이후여야 합니다.";
      }
    }

    // 접수방법 검증
    if (!jobPost.applicationMethod.methods.length) {
      newErrors.applicationMethod = "접수방법을 선택해주세요.";
    }

    // 이력서 검증
    if (
      !jobPost.applicationMethod.methods.includes("홈페이지") &&
      !jobPost.applicationMethod.resumeTypes.useYourJob &&
      !jobPost.applicationMethod.resumeTypes.useCompanyFormat
    ) {
      newErrors.resume = "이력서 양식을 선택해주세요.";
    }

    // 홈페이지 검증
    if (
      jobPost.applicationMethod.methods.includes("홈페이지") &&
      !jobPost.applicationMethod.homepage?.trim()
    ) {
      newErrors.homepage = "홈페이지 URL을 입력해주세요.";
    }

    // 담당자명 검증
    if (!jobPost.companyInfo.name) {
      newErrors.name = "담당자명을 입력해주세요.";
    }

    // 연락처 검증
    if (
      !jobPost.companyInfo.phoneField1 ||
      !jobPost.companyInfo.phoneField2 ||
      !jobPost.companyInfo.phoneField3
    ) {
      newErrors.phone = "연락처를 입력해주세요.";
    }

    // 업종 검증
    if (!jobPost.companyInfo.industry.length) {
      newErrors.industry = "업종을 선택해주세요.";
    }

    // 개인정보 수집 동의 검증
    if (!jobPost.terms.sensitiveInfo) {
      newErrors.terms = "민감정보 수집에 동의해주세요.";
    }
    // 우대조건/외국어/자격증/우대전공 검증
    const prefs = jobPost.qualification.preferences;
    if (prefs) {
      if (prefs.useSpecialCondition && !prefs.specialCondition.length) {
        newErrors.specialCondition = "우대조건을 선택해주세요.";
      }
      if (prefs.useLanguage && !prefs.language.length) {
        newErrors.language = "외국어를 선택해주세요.";
      }
      if (prefs.useLicense && !prefs.license.length) {
        newErrors.license = "자격증을 선택해주세요.";
      }
      if (prefs.useSpecialMajor && !prefs.specialMajor.length) {
        newErrors.specialMajor = "우대전공을 선택해주세요.";
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <div className="error-message">{errors[field]}</div>
    ) : null;
  };

  const getErrorClass = (field: string) => {
    return errors[field] ? "error" : "";
  };

  useEffect(() => {
    if (isShowError) {
      validateForm();
    }
  }, [jobPost]);

  // 수정/등록 버튼 클릭 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      if (firstKey) {
        const elId = `field-${firstKey.replace(/\./g, "-")}`;
        const el = document.getElementById(elId);

        if (el) {
          const offset = 100;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
          });

          setTimeout(() => {
            (el as HTMLElement).focus?.();
          }, 100);
        }
      }

      customAlert({
        content: "필수 항목을 입력해 주세요.",
      });
      return;
    }

    try {
      if (id) {
        // 수정 모드
        handleEditJobPost();
      } else {
        // 신규 등록 모드
        handleApply();
      }
    } catch (error) {
      console.error("채용공고 등록 실패:", error);
    }
  };

  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);

  // 업종 선택 모달 열기
  const openIndustryModal = () => {
    setIsIndustryModalOpen(true);
  };

  // 업종 선택 모달 닫기
  const closeIndustryModal = () => {
    setIsIndustryModalOpen(false);
  };

  // 업종 선택 처리
  const handleIndustrySelect = (selectedItems: SelectedItem[]) => {
    setJobPost((prev) => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        industry: selectedItems.map((item) => item.operationDataId),
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      industry: selectedItems.map((item) => item.displayLabel),
    }));
  };

  const handleAddressComplete = (address: string, zoneCode: string) => {
    setJobPost((prev) => ({
      ...prev,
      workConditions: {
        ...prev.workConditions,
        location: {
          ...prev.workConditions.location,
          address: address,
          zip_code: zoneCode,
        },
      },
    }));
    setIsOpenPost(false);
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="채용공고 등록" description="채용공고 등록" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            {/* jobpost-reg */}
            <div className="jobpost-reg">
              <div className="inputfield">
                <button
                  type="button"
                  className="bring_btn"
                  id="bring_btn"
                  onClick={handleBringJobPost}
                >
                  + 이전공고 불러오기
                </button>
                <ul
                  className="prev_Layer"
                  style={{ display: showPrevLayer ? "block" : "none" }}
                >
                  {previousPosts?.length === 0 ? (
                    <li>이전 공고가 없습니다.</li>
                  ) : (
                    previousPosts?.map((post) => (
                      <li
                        key={post.id}
                        onClick={() => handleSelectPreviousPost(post)}
                        className={jobPost.id === post.id ? "active" : ""}
                      >
                        {post.title}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <h2>채용 제목을 입력해 주세요.</h2>
              <div className="inputfield" id="field-title" tabIndex={-1}>
                <input
                  type="text"
                  className={`form-control subject ${getErrorClass("title")}`}
                  id="title"
                  name="title"
                  placeholder="제목을 입력해 주세요."
                  value={jobPost.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <ErrorMessage field="title" />
              <h2>어떤 포지션을 채용하시나요?</h2>
              <div className="inputfield mb25">
                <label className="label">
                  포지션<span>*</span>
                </label>
                <div
                  style={{ width: "100%" }}
                  id="field-position"
                  tabIndex={-1}
                >
                  <input
                    type="text"
                    className={`form-control ${getErrorClass("position")}`}
                    id="position"
                    name="position"
                    placeholder="최대한 직무명을 포함하여 입력하세요."
                    value={jobPost.position}
                    onChange={handleInputChange}
                    required
                  />
                  <ErrorMessage field="position" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  직무<span>*</span>
                </label>
                <div style={{ width: "100%" }} id="field-jobType" tabIndex={-1}>
                  <div className={`fieldBox ${getErrorClass("jobType")}`}>
                    <div className="viewItem">
                      {displayLabels.jobType &&
                      displayLabels.jobType.length > 0 ? (
                        displayLabels.jobType.map((job, index) => (
                          <div
                            key={index}
                            className="items"
                            style={{ cursor: "pointer" }}
                          >
                            <div className="label">{job}</div>
                            <i
                              className="fa-solid fa-xmark"
                              onClick={() => {
                                setJobPost((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    jobType: prev.jobType.filter(
                                      (_, i) => i !== index
                                    ),
                                  };
                                });
                                setDisplayLabels((prev) => ({
                                  ...prev,
                                  jobType: prev.jobType.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                            ></i>
                          </div>
                        ))
                      ) : (
                        <div className="items noitem">직무를 선택해주세요.</div>
                      )}
                    </div>
                    <div className="viewAll" onClick={openJobTypeModal}>
                      전체보기
                    </div>
                  </div>
                  <ErrorMessage field="jobType" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">스킬</label>
                <div className="fieldBox">
                  <div className="viewItem">
                    {displayLabels.skills && displayLabels.skills.length > 0 ? (
                      displayLabels.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="items"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="label">{skill}</div>
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  skills: prev.skills.filter(
                                    (_, i) => i !== index
                                  ),
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                skills: prev.skills.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          ></i>
                        </div>
                      ))
                    ) : (
                      <div className="items noitem">
                        직무와 관련있는 스킬을 선택해 주세요.
                      </div>
                    )}
                  </div>
                  <div className="viewAll" onClick={openSkillTypeModal}>
                    전체보기
                  </div>
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">핵심역량</label>
                <div className="fieldBox">
                  <div className="viewItem">
                    {displayLabels.capabilities &&
                    displayLabels.capabilities.length > 0 ? (
                      displayLabels.capabilities.map((capacity, index) => (
                        <div key={index} className="items">
                          <div className="label">{capacity}</div>
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  capabilities: prev.capabilities.filter(
                                    (_, i) => i !== index
                                  ),
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                capabilities: prev.capabilities.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          ></i>
                        </div>
                      ))
                    ) : (
                      <div className="items noitem">
                        인재를 채용할 때 중요하게 생각하는 역량을 선택해
                        주세요(3~12개 선택)
                      </div>
                    )}
                  </div>
                  <div className="viewAll" onClick={openCapacityTypeModal}>
                    전체보기
                  </div>
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  경력<span>*</span>
                </label>
                <div className="col-box">
                  <div style={{ width: "100%" }}>
                    <div
                      className={`fieldBox ${getErrorClass("career")}`}
                      id="field-career"
                      tabIndex={-1}
                    >
                      <div className="viewItem ml1">
                        <div className="items">
                          <input
                            type="radio"
                            id="career1"
                            name="career.type"
                            value="신입"
                            onChange={handleRadioChange}
                            checked={jobPost.career.type === "신입"}
                          />
                          <label htmlFor="career1" className="label">
                            신입
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="radio"
                            id="career2"
                            name="career.type"
                            value="경력"
                            onChange={handleRadioChange}
                            checked={jobPost.career.type === "경력"}
                          />
                          <label htmlFor="career2" className="label">
                            경력
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="radio"
                            id="career3"
                            name="career.type"
                            value="무관"
                            onChange={handleRadioChange}
                            checked={jobPost.career.type === "무관"}
                          />
                          <label htmlFor="career3" className="label">
                            경력무관
                          </label>
                        </div>
                      </div>
                    </div>
                    <ErrorMessage field="career" />
                  </div>
                  {/* opne layer */}
                  <div
                    className="career_Layer"
                    style={{
                      display:
                        jobPost.career.type === "경력" ? "block" : "none",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="Layer-container">
                      <div className="box">
                        <div className="txt">경력</div>
                        <input
                          type="number"
                          className="form-control"
                          name="career.minYears"
                          placeholder="숫자."
                          onChange={handleInputChange}
                          value={jobPost.career.minYears}
                          disabled={jobPost.career.isYearMatter}
                          min={0}
                        />
                        <span>년 이상</span>
                      </div>
                      <div className="box ml3">
                        <input
                          type="checkbox"
                          id="year_matter"
                          name="career.isYearMatter"
                          value="1"
                          onChange={handleCheckboxChange}
                          checked={jobPost.career.isYearMatter}
                        />
                        <label htmlFor="year_matter">경력년수 무관</label>
                      </div>
                    </div>
                  </div>
                  {/* opne layer end */}
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  고용형태<span>*</span>
                  <span className="slabel">최대 3개</span>
                </label>
                <div className="col-box">
                  <div style={{ width: "100%" }}>
                    <div
                      className={`fieldBox ${getErrorClass("employmentType")}`}
                      id="field-employmentType"
                      tabIndex={-1}
                    >
                      <div className="viewItem ml1">
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl1"
                            name="employmentType.types"
                            value="정규직"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "정규직"
                            )}
                          />
                          <label htmlFor="empl1" className="label">
                            정규직
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl2"
                            name="employmentType.types"
                            value="계약직"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "계약직"
                            )}
                          />
                          <label htmlFor="empl2" className="label">
                            계약직
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl3"
                            name="employmentType.types"
                            value="인턴"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "인턴"
                            )}
                          />
                          <label htmlFor="empl3" className="label">
                            인턴
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl4"
                            name="employmentType.types"
                            value="파견직"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "파견직"
                            )}
                          />
                          <label htmlFor="empl4" className="label">
                            파견직
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl5"
                            name="employmentType.types"
                            value="도급"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "도급"
                            )}
                          />
                          <label htmlFor="empl5" className="label">
                            도급
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl6"
                            name="employmentType.types"
                            value="프리랜서"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "프리랜서"
                            )}
                          />
                          <label htmlFor="empl6" className="label">
                            프리랜서
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl7"
                            name="employmentType.types"
                            value="아르바이트"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "아르바이트"
                            )}
                          />
                          <label htmlFor="empl7" className="label">
                            아르바이트
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl8"
                            name="employmentType.types"
                            value="연수생/교육생"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "연수생/교육생"
                            )}
                          />
                          <label htmlFor="empl8" className="label">
                            연수생/교육생
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl9"
                            name="employmentType.types"
                            value="병역특례"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "병역특례"
                            )}
                          />
                          <label htmlFor="empl9" className="label">
                            병역특례
                          </label>
                        </div>
                        <div className="items">
                          <input
                            type="checkbox"
                            id="empl10"
                            name="employmentType.types"
                            value="위촉직/개인사업자"
                            onChange={handleCheckboxGroupChange}
                            checked={jobPost.employmentType.types.includes(
                              "위촉직/개인사업자"
                            )}
                          />
                          <label htmlFor="empl10" className="label">
                            위촉직/개인사업자
                          </label>
                        </div>
                      </div>
                    </div>
                    <ErrorMessage field="employmentType" />
                  </div>

                  {/* opne 정규직 layer */}
                  <div
                    className="permanent_Layer"
                    style={{
                      display: jobPost.employmentType.types.includes("정규직")
                        ? "block"
                        : "none",
                    }}
                  >
                    <div className="Layer-container">
                      <div className="box">
                        <div className="txt">정규직 수습기간</div>
                        <select
                          id="prod"
                          name="employmentType.probationMonths"
                          className="nice-select"
                          onChange={handleSelectChange}
                          value={jobPost.employmentType.probationMonths}
                        >
                          <option value="0">없음</option>
                          <option value="1">1개월</option>
                          <option value="2">2개월</option>
                          <option value="3">3개월</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* opne 정규직 layer end */}

                  {/* opne 계약직 layer */}
                  <div
                    className="temporary_Layer"
                    style={{
                      display: jobPost.employmentType.types.includes("계약직")
                        ? "block"
                        : "none",
                    }}
                  >
                    <div className="Layer-container">
                      <div className="box">
                        <div className="txt">계약 기간</div>
                        <select
                          id="prod1"
                          name="employmentType.contractPeriod"
                          className="nice-select"
                          onChange={handleSelectChange}
                          value={jobPost.employmentType.contractPeriod}
                        >
                          <option value="1">1개월</option>
                          <option value="2">2개월</option>
                          <option value="3">3개월</option>
                          <option value="4">4개월</option>
                          <option value="5">5개월</option>
                          <option value="6">6개월</option>
                          <option value="7">7개월</option>
                          <option value="8">8개월</option>
                          <option value="9">9개월</option>
                          <option value="10">10개월</option>
                          <option value="11">11개월</option>
                          <option value="12">12개월</option>
                        </select>
                      </div>
                      <div className="box ml3">
                        <input
                          type="checkbox"
                          id="temp_conver"
                          name="employmentType.isConversionAvailable"
                          value="true"
                          onChange={handleCheckboxChange}
                          checked={jobPost.employmentType.isConversionAvailable}
                        />
                        <label htmlFor="temp_conver">정규직 전환가능</label>
                      </div>
                    </div>
                  </div>
                  {/* opne 계약직 layer end */}

                  {/* opne 위촉직/개인사업자 layer */}
                  <div
                    className="contractual_Layer"
                    style={{
                      display: jobPost.employmentType.types.includes(
                        "위촉직/개인사업자"
                      )
                        ? "block"
                        : "none",
                    }}
                  >
                    <div className="Layer-container">
                      <div className="box">
                        <div className="txt">근무기간</div>
                        <select
                          id="prod2"
                          name="employmentType.workingPeriod"
                          className="nice-select"
                          onChange={handleSelectChange}
                          value={jobPost.employmentType.workingPeriod}
                        >
                          <option value="1">1개월</option>
                          <option value="2">2개월</option>
                          <option value="3">3개월</option>
                          <option value="4">4개월</option>
                          <option value="5">5개월</option>
                          <option value="6">6개월</option>
                          <option value="7">7개월</option>
                          <option value="8">8개월</option>
                          <option value="9">9개월</option>
                          <option value="10">10개월</option>
                          <option value="11">11개월</option>
                          <option value="12">12개월</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* opne 위촉직/개인사업자 layer end */}
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">모집인원</label>
                <div className="recruitNum">
                  <div className="direct">
                    <input
                      type="radio"
                      id="direct"
                      name="recruitmentCount.type"
                      value="direct"
                      onChange={handleRadioChange}
                      checked={jobPost.recruitmentCount.type === "direct"}
                    />
                    <label htmlFor="direct" className="label">
                      직접입력
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="recruitmentCount.count"
                      placeholder="숫자."
                      onChange={handleInputChange}
                      value={jobPost.recruitmentCount.count}
                      min={0}
                    />
                    <span>명</span>
                  </div>
                  <div className="direct">
                    <input
                      type="radio"
                      id="num1"
                      name="recruitmentCount.type"
                      value="preset"
                      onChange={(e) => {
                        handleRadioChange(e);
                        handleInputChange({
                          target: {
                            name: "recruitmentCount.count",
                            value: 1,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }}
                      checked={
                        jobPost.recruitmentCount.type === "preset" &&
                        jobPost.recruitmentCount.count === 1
                      }
                    />
                    <label htmlFor="num1" className="label">
                      0명
                    </label>
                  </div>
                  <div className="direct">
                    <input
                      type="radio"
                      id="num2"
                      name="recruitmentCount.type"
                      value="preset"
                      onChange={(e) => {
                        handleRadioChange(e);
                        handleInputChange({
                          target: {
                            name: "recruitmentCount.count",
                            value: 2,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }}
                      checked={
                        jobPost.recruitmentCount.type === "preset" &&
                        jobPost.recruitmentCount.count === 2
                      }
                    />
                    <label htmlFor="num2" className="label">
                      00명
                    </label>
                  </div>
                  <div className="direct">
                    <input
                      type="radio"
                      id="num3"
                      name="recruitmentCount.type"
                      value="preset"
                      onChange={(e) => {
                        handleRadioChange(e);
                        handleInputChange({
                          target: {
                            name: "recruitmentCount.count",
                            value: 3,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }}
                      checked={
                        jobPost.recruitmentCount.type === "preset" &&
                        jobPost.recruitmentCount.count === 3
                      }
                    />
                    <label htmlFor="num3" className="label">
                      000명
                    </label>
                  </div>
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">직급/직책</label>
                <div className="fieldBox">
                  <div className="viewItem">
                    {displayLabels.position_rank &&
                    displayLabels.position_rank.length > 0 ? (
                      displayLabels.position_rank.map((rank, index) => (
                        <div key={index} className="items">
                          <div className="label">{rank}</div>
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  position_rank:
                                    prev.position_rank?.filter(
                                      (_, i) => i !== index
                                    ) || [],
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                position_rank: prev.position_rank.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="items noitem">
                        직급/직책 선택해 주세요
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="viewAll"
                    onClick={openJobRankModal}
                  >
                    전체보기
                  </button>
                </div>
              </div>
              <h2>지원자격은 어떤 것들이 있나요?</h2>
              <div className="inputfield mb25">
                <label className="label">
                  학력<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div
                    className="field_row gap01"
                    id="field-education"
                    tabIndex={-1}
                  >
                    <select
                      id="eligibility"
                      name="qualification.education.level"
                      className={`w02 nice-select ${getErrorClass(
                        "education"
                      )}`}
                      onChange={handleSelectChange}
                      value={jobPost.qualification.education.level}
                    >
                      <option value="">학력 선택</option>
                      <option value="학력무관">학력무관</option>
                      <option value="고등학교졸업">고등학교졸업</option>
                      <option value="대학졸업(2,3년)">대학졸업(2,3년)</option>
                      <option value="대학교졸업(4년)">대학교졸업(4년)</option>
                      <option value="대학원 석사졸업">대학원 석사졸업</option>
                      <option value="대학원 박사졸업">대학원 박사졸업</option>
                    </select>
                    <input
                      type="checkbox"
                      id="grad_chk"
                      name="qualification.education.isExpectedGraduate"
                      value="true"
                      onChange={handleCheckboxChange}
                      checked={
                        jobPost.qualification.education.isExpectedGraduate
                      }
                    />
                    <label htmlFor="grad_chk" className="label">
                      졸업예정자 가능
                    </label>
                  </div>
                  <ErrorMessage field="education" />
                </div>
              </div>
              <div className="inputfield mb10" id="choice_item">
                <label className="label">선택항목</label>
                <div className="field_row gap01">
                  <div
                    id="field-specialCondition"
                    className={`SelectBox w04 ${getErrorClass(
                      "specialCondition"
                    )}`}
                  >
                    <div className="military">
                      <div className="scheck-primary">
                        <input
                          type="checkbox"
                          id="chkitem1"
                          name="qualification.preferences.useSpecialCondition"
                          onChange={handleCheckboxChange}
                          checked={
                            jobPost.qualification.preferences
                              ?.useSpecialCondition
                          }
                        />
                        <label htmlFor="chkitem1">우대조건</label>
                      </div>
                    </div>
                  </div>
                  <div
                    id="field-language"
                    className={`SelectBox w04 ${getErrorClass("language")}`}
                  >
                    <div className="military">
                      <div className="scheck-primary">
                        <input
                          type="checkbox"
                          id="chkitem2"
                          name="qualification.preferences.useLanguage"
                          onChange={handleCheckboxChange}
                          checked={
                            jobPost.qualification.preferences?.useLanguage
                          }
                        />
                        <label htmlFor="chkitem2">외국어</label>
                      </div>
                    </div>
                  </div>
                  <div
                    id="field-license"
                    className={`SelectBox w04 ${getErrorClass("license")}`}
                  >
                    <div className="military">
                      <div className="scheck-primary">
                        <input
                          type="checkbox"
                          id="chkitem3"
                          name="qualification.preferences.useLicense"
                          onChange={handleCheckboxChange}
                          checked={
                            jobPost.qualification.preferences?.useLicense
                          }
                        />
                        <label htmlFor="chkitem3">자격증</label>
                      </div>
                    </div>
                  </div>
                  <div
                    id="field-specialMajor"
                    className={`SelectBox w04 ${getErrorClass("specialMajor")}`}
                  >
                    <div className="military">
                      <div className="scheck-primary">
                        <input
                          type="checkbox"
                          id="chkitem4"
                          name="qualification.preferences.useSpecialMajor"
                          onChange={handleCheckboxChange}
                          checked={
                            jobPost.qualification.preferences?.useSpecialMajor
                          }
                        />
                        <label htmlFor="chkitem4">우대전공</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 우대조건 레이어 */}
              <div
                className={
                  jobPost.qualification.preferences?.useSpecialCondition
                    ? "inputfield"
                    : "inputfield_none"
                }
                id="choice1"
              >
                <div className="inputfield mb10">
                  <label className="label addlabel">우대조건</label>
                  <div className="fieldBox">
                    <div className="viewItem">
                      {displayLabels.specialCondition.length || 0 > 0 ? (
                        displayLabels.specialCondition.map(
                          (condition, index) => (
                            <div key={index} className="items">
                              <div className="label">{condition}</div>
                              <i
                                className="fa-solid fa-xmark"
                                onClick={() => {
                                  setJobPost((prev) => {
                                    if (!prev) return prev;

                                    const currentPreferences = prev
                                      .qualification.preferences || {
                                      useSpecialCondition: false,
                                      useLanguage: false,
                                      useLicense: false,
                                      useSpecialMajor: false,
                                      specialCondition: [],
                                      language: [],
                                      license: [],
                                      specialMajor: [],
                                    };

                                    return {
                                      ...prev,
                                      qualification: {
                                        ...prev.qualification,
                                        preferences: {
                                          ...currentPreferences,
                                          specialCondition:
                                            currentPreferences.specialCondition.filter(
                                              (_, i) => i !== index
                                            ),
                                        },
                                      },
                                    };
                                  });
                                  setDisplayLabels((prev) => ({
                                    ...prev,
                                    specialCondition:
                                      prev.specialCondition.filter(
                                        (_, i) => i !== index
                                      ),
                                  }));
                                }}
                              ></i>
                            </div>
                          )
                        )
                      ) : (
                        <div className="items noitem">
                          우대조건 선택해 주세요
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="prefeview"
                      onClick={openPreferenceModal}
                    >
                      전체보기
                    </button>
                  </div>
                </div>
              </div>
              {jobPost.qualification.preferences?.useSpecialCondition && (
                <ErrorMessage field="specialCondition" />
              )}

              {/* 외국어 레이어 */}
              <div
                className={
                  jobPost.qualification.preferences?.useLanguage
                    ? "inputfield"
                    : "inputfield_none"
                }
                id="choice2"
              >
                <div className="inputfield mb10">
                  <label className="label addlabel">
                    외국어(
                    {jobPost.qualification.preferences?.language.length || 0}/3)
                  </label>
                  <div className="fieldBox">
                    <div className="viewItem">
                      {displayLabels.language.length || 0 > 0 ? (
                        displayLabels.language.map((language, index) => (
                          <div key={index} className="items">
                            {language}
                            <i
                              className="fa-solid fa-xmark"
                              onClick={() => {
                                setJobPost((prev) => {
                                  if (!prev) return prev;

                                  const currentPreferences = prev.qualification
                                    .preferences || {
                                    useSpecialCondition: false,
                                    useLanguage: false,
                                    useLicense: false,
                                    useSpecialMajor: false,
                                    specialCondition: [],
                                    language: [],
                                    license: [],
                                    specialMajor: [],
                                  };

                                  return {
                                    ...prev,
                                    qualification: {
                                      ...prev.qualification,
                                      preferences: {
                                        ...currentPreferences,
                                        language:
                                          currentPreferences.language.filter(
                                            (_, i) => i !== index
                                          ),
                                      },
                                    },
                                  };
                                });
                                setDisplayLabels((prev) => ({
                                  ...prev,
                                  language: prev.language.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                            ></i>
                          </div>
                        ))
                      ) : (
                        <div className="items noitem">
                          외국어를 선택해 주세요.
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="langview"
                      onClick={openLanguageModal}
                    >
                      전체보기
                    </button>
                  </div>
                </div>
              </div>
              {jobPost.qualification.preferences?.useLanguage && (
                <ErrorMessage field="language" />
              )}

              {/* 자격증 레이어 */}
              <div
                className={
                  jobPost.qualification.preferences?.useLicense
                    ? "inputfield"
                    : "inputfield_none"
                }
                id="choice3"
              >
                <div className="inputfield mb10">
                  <label className="label addlabel">
                    자격증(
                    {jobPost.qualification.preferences?.license.length || 0}/3)
                  </label>
                  <div className="fieldBox">
                    <div className="viewItem">
                      {displayLabels.license.length === 0 && (
                        <div className="items noitem">자격증 선택해 주세요</div>
                      )}
                      {displayLabels.license.map((license, index) => (
                        <div key={index} className="items">
                          {license}
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;

                                const currentPreferences = prev.qualification
                                  .preferences || {
                                  useSpecialCondition: false,
                                  useLanguage: false,
                                  useLicense: false,
                                  useSpecialMajor: false,
                                  specialCondition: [],
                                  language: [],
                                  license: [],
                                  specialMajor: [],
                                };

                                return {
                                  ...prev,
                                  qualification: {
                                    ...prev.qualification,
                                    preferences: {
                                      ...currentPreferences,
                                      license:
                                        currentPreferences.license.filter(
                                          (_, i) => i !== index
                                        ),
                                    },
                                  },
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                license: prev.license.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          ></i>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="licenseview"
                      onClick={openLicenseModal}
                    >
                      전체보기
                    </button>
                  </div>
                </div>
              </div>
              {jobPost.qualification.preferences?.useLicense && (
                <ErrorMessage field="license" />
              )}

              {/* 우대전공 레이어 */}
              <div
                className={
                  jobPost.qualification.preferences?.useSpecialMajor
                    ? "inputfield"
                    : "inputfield_none"
                }
                id="choice4"
              >
                <div className="inputfield mb10">
                  <label className="label addlabel">
                    우대전공(
                    {jobPost.qualification.preferences?.specialMajor.length ||
                      0}
                    /3)
                  </label>
                  <div className="fieldBox">
                    <div className="viewItem">
                      {displayLabels.specialMajor.length === 0 && (
                        <div className="items noitem">
                          우대전공 선택해 주세요
                        </div>
                      )}
                      {displayLabels.specialMajor.map((major, index) => (
                        <div key={index} className="items">
                          {major}
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;

                                const currentPreferences = prev.qualification
                                  .preferences || {
                                  useSpecialCondition: false,
                                  useLanguage: false,
                                  useLicense: false,
                                  useSpecialMajor: false,
                                  specialCondition: [],
                                  language: [],
                                  license: [],
                                  specialMajor: [],
                                };

                                return {
                                  ...prev,
                                  qualification: {
                                    ...prev.qualification,
                                    preferences: {
                                      ...currentPreferences,
                                      specialMajor:
                                        currentPreferences.specialMajor.filter(
                                          (_, i) => i !== index
                                        ),
                                    },
                                  },
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                specialMajor: prev.specialMajor.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          ></i>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="majorview"
                      onClick={openMajorModal}
                    >
                      전체보기
                    </button>
                  </div>
                </div>
              </div>
              {jobPost.qualification.preferences?.useSpecialMajor && (
                <ErrorMessage field="specialMajor" />
              )}
              <h2>근무조건을 입력해 주세요.</h2>
              <div className="inputfield mb25">
                <label className="label">
                  급여<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div
                    className="field_row gap01"
                    id="field-salary"
                    tabIndex={-1}
                  >
                    <select
                      id="eligibility"
                      name="workConditions.salary.type"
                      className={`w02 nice-select ${getErrorClass("salary")}`}
                      value={jobPost.workConditions.salary.type}
                      disabled={
                        jobPost.workConditions.salary.isInterviewDecided
                      }
                      onChange={handleSelectChange}
                    >
                      <option value="연봉">연봉</option>
                      <option value="월급">월급</option>
                      <option value="주급">주급</option>
                      <option value="일급">일급</option>
                      <option value="시급">시급</option>
                      <option value="건별">건별</option>
                      <option value="회사내규에 따름">회사내규에 따름</option>
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`form-control w03 ${getErrorClass("salary")}`}
                      id="minSalary"
                      name="workConditions.salary.min"
                      placeholder="최소급여"
                      value={
                        jobPost.workConditions.salary.min
                          ? Number(
                              jobPost.workConditions.salary.min
                            ).toLocaleString()
                          : ""
                      }
                      disabled={
                        jobPost.workConditions.salary.isInterviewDecided ||
                        jobPost.workConditions.salary.type === "회사내규에 따름"
                      }
                      style={{ textAlign: "right" }}
                      onChange={(e) => {
                        // 숫자 외 문자 모두 제거해서 문자열로 저장
                        const onlyDigits = e.target.value.replace(/\D/g, "");
                        setJobPost((prev) => ({
                          ...prev,
                          workConditions: {
                            ...prev.workConditions,
                            salary: {
                              ...prev.workConditions.salary,
                              min: onlyDigits,
                            },
                          },
                        }));
                      }}
                    />
                    &nbsp;~&nbsp;
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`form-control w03 ${getErrorClass("salary")}`}
                      id="maxSalary"
                      name="workConditions.salary.max"
                      placeholder="최대급여"
                      value={
                        jobPost.workConditions.salary.max
                          ? Number(
                              jobPost.workConditions.salary.max
                            ).toLocaleString()
                          : ""
                      }
                      disabled={
                        jobPost.workConditions.salary.isInterviewDecided ||
                        jobPost.workConditions.salary.type === "회사내규에 따름"
                      }
                      style={{ textAlign: "right" }}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, "");
                        setJobPost((prev) => ({
                          ...prev,
                          workConditions: {
                            ...prev.workConditions,
                            salary: {
                              ...prev.workConditions.salary,
                              max: onlyDigits,
                            },
                          },
                        }));
                      }}
                    />
                    <input
                      type="checkbox"
                      id="interview"
                      name="workConditions.salary.isInterviewDecided"
                      value="1"
                      onChange={handleCheckboxChange}
                      checked={jobPost.workConditions.salary.isInterviewDecided}
                    />
                    <label htmlFor="interview" className="label">
                      면접 후 결정
                    </label>
                  </div>
                  <ErrorMessage field="salary" />
                </div>
              </div>
              <div className="inputfield mb25">
                <div className="field_row gap01 Salary">
                  <input
                    type="checkbox"
                    id="salary_chk"
                    name="workConditions.salary.isMinimumWage"
                    value="1"
                    onChange={handleCheckboxChange}
                    checked={jobPost.workConditions.salary.isMinimumWage}
                  />
                  <label htmlFor="salary_chk" className="label">
                    당사는 본 채용 건과 관련하여 '최저임금법'을 준수하며,
                    최저임금 미만의 공고는 강제 마감될 수 있음을 동의합니다.
                    <br />
                    (최저임금법 위반 시 3년 이하의 징역 또는 2천만원 이하의
                    벌금에 처함)
                  </label>
                </div>
              </div>
              <div className="inputfield mb15">
                <label className="label">
                  근무지 주소<span>*</span>
                </label>
                <div style={{ width: "100%" }} id="field-address" tabIndex={-1}>
                  <div className="field_row gap01">
                    <div className="workAdd">
                      <div className="direct">
                        <input
                          type="radio"
                          id="workadd1"
                          name="workConditions.location.type"
                          value="국내"
                          onChange={handleRadioChange}
                          checked={
                            jobPost.workConditions.location.type === "국내"
                          }
                        />
                        <label htmlFor="workadd1" className="label">
                          국내
                        </label>
                      </div>
                      <div className="direct">
                        <input
                          type="radio"
                          id="workadd2"
                          name="workConditions.location.type"
                          value="해외"
                          onChange={handleRadioChange}
                          checked={
                            jobPost.workConditions.location.type === "해외"
                          }
                        />
                        <label htmlFor="workadd2" className="label">
                          해외
                        </label>
                      </div>
                      <div className="direct">
                        <input
                          type="checkbox"
                          id="remote-work"
                          name="workConditions.location.isRemoteAvailable"
                          value="true"
                          onChange={handleCheckboxChange}
                          checked={
                            jobPost.workConditions.location.isRemoteAvailable
                          }
                        />
                        <label htmlFor="remote-work" className="label">
                          재택근무 가능
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label"></label>
                <div style={{ width: "100%" }}>
                  <div
                    className={`fieldBox ${getErrorClass("address")}`}
                    style={{
                      border:
                        jobPost.workConditions.location.type === "해외"
                          ? "none"
                          : "",
                      padding:
                        jobPost.workConditions.location.type === "해외"
                          ? "0"
                          : "",
                    }}
                  >
                    {jobPost.workConditions.location.type !== "해외" ? (
                      <>
                        <div className="viewItem">
                          {jobPost.workConditions.location.address.length ===
                            0 && (
                            <div className="items noitem">
                              주소를 검색해 주세요
                            </div>
                          )}
                          {jobPost.workConditions.location.address.length >
                            0 && (
                            <div className="items">
                              {jobPost.workConditions.location.address}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          id="workadd"
                          name="workConditions.location.address"
                          placeholder="주소를 입력해주세요"
                          onChange={handleInputChange}
                          value={jobPost.workConditions.location.address}
                        />
                      </>
                    )}

                    {jobPost.workConditions.location.type !== "해외" && (
                      <button
                        type="button"
                        className="viewAll"
                        onClick={() => setIsOpenPost(true)}
                      >
                        찾기
                      </button>
                    )}
                  </div>
                  <ErrorMessage field="address" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label"></label>
                <input
                  type="text"
                  className="form-control"
                  id="workadd_detail"
                  name="workConditions.location.address_detail"
                  placeholder="상세주소"
                  onChange={handleInputChange}
                  value={jobPost.workConditions.location.address_detail}
                />
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  근무지역<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div className={`fieldBox ${getErrorClass("region")}`}>
                    <div className="viewItem" id="field-region" tabIndex={-1}>
                      {displayLabels.region.length === 0 && (
                        <div className="items noitem">선택해주세요.</div>
                      )}
                      {displayLabels.region.map((region, index) => (
                        <div key={index} className="items">
                          <div className="label">{region}</div>
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  workConditions: {
                                    ...prev.workConditions,
                                    location: {
                                      ...prev.workConditions.location,
                                      region:
                                        prev.workConditions.location.region.filter(
                                          (_, i) => i !== index
                                        ),
                                    },
                                  },
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                region: prev.region.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="worklocation"
                      onClick={openWorklocationModal}
                    >
                      전체보기
                    </button>
                  </div>
                  <ErrorMessage field="region" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">근무요일</label>
                <div className="field_row gap01">
                  <select
                    id="workday"
                    name="workConditions.workingDay.type"
                    className="w02 nice-select"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions.workingDay.type}
                  >
                    <option value="주5일">주5일</option>
                    <option value="주6일">주6일</option>
                    <option value="격주휴무">격주휴무</option>
                    <option value="격일근무">격일근무</option>
                    <option value="협의가능">협의가능</option>
                    {/* <option value="직접입력">직접입력</option> */}
                  </select>
                  {/* TODO: 모호한 기능 */}
                  {/* <input type="checkbox" id="grad_chk" name="grad_chk" value="1"/><label htmlFor="grad_chk"
                                                                                         className="label">상세요일
                  선택</label> */}
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">근무시간</label>
                <div className="field_row gap01 worktimes">
                  <select
                    id="sworkhour"
                    name="workConditions.workingHours.startHour"
                    className="w04 nice-select"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions.workingHours.startHour}
                  >
                    <option value="00">00시</option>
                    <option value="01">01시</option>
                    <option value="02">02시</option>
                    <option value="03">03시</option>
                    <option value="04">04시</option>
                    <option value="05">05시</option>
                    <option value="06">06시</option>
                    <option value="07">07시</option>
                    <option value="08">08시</option>
                    <option value="09">09시</option>
                    <option value="10">10시</option>
                    <option value="11">11시</option>
                    <option value="12">12시</option>
                    <option value="13">13시</option>
                    <option value="14">14시</option>
                    <option value="15">15시</option>
                    <option value="16">16시</option>
                    <option value="17">17시</option>
                    <option value="18">18시</option>
                    <option value="19">19시</option>
                    <option value="20">20시</option>
                    <option value="21">21시</option>
                    <option value="22">22시</option>
                    <option value="23">23시</option>
                  </select>
                  <select
                    id="sworkminute"
                    name="workConditions.workingHours.startMinute"
                    className="w04 nice-select"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions.workingHours.startMinute}
                  >
                    <option value="00">00분</option>
                    <option value="10">10분</option>
                    <option value="20">20분</option>
                    <option value="30">30분</option>
                    <option value="40">40분</option>
                    <option value="50">50분</option>
                  </select>
                  ~
                  <select
                    id="eworkhour"
                    name="workConditions.workingHours.endHour"
                    className="w04 nice-select"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions.workingHours.endHour}
                  >
                    <option value="00">00시</option>
                    <option value="01">01시</option>
                    <option value="02">02시</option>
                    <option value="03">03시</option>
                    <option value="04">04시</option>
                    <option value="05">05시</option>
                    <option value="06">06시</option>
                    <option value="07">07시</option>
                    <option value="08">08시</option>
                    <option value="09">09시</option>
                    <option value="10">10시</option>
                    <option value="11">11시</option>
                    <option value="12">12시</option>
                    <option value="13">13시</option>
                    <option value="14">14시</option>
                    <option value="15">15시</option>
                    <option value="16">16시</option>
                    <option value="17">17시</option>
                    <option value="18">18시</option>
                    <option value="19">19시</option>
                    <option value="20">20시</option>
                    <option value="21">21시</option>
                    <option value="22">22시</option>
                    <option value="23">23시</option>
                  </select>
                  <select
                    id="eworkminute"
                    name="workConditions.workingHours.endMinute"
                    className="w04 nice-select"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions.workingHours.endMinute}
                  >
                    <option value="00">00분</option>
                    <option value="10">10분</option>
                    <option value="20">20분</option>
                    <option value="30">30분</option>
                    <option value="40">40분</option>
                    <option value="50">50분</option>
                  </select>
                  {/* TODO: 우선순위 낮은 기능 */}
                  {/* <button type="button" className="minus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <rect x="0.5" y="0.5" width="59" height="59" rx="19.5" fill="#F5F5F5" stroke="#CBCBCB"/>
                      <rect x="20" y="30" width="21" height="1" fill="#8F8F8F"/>
                    </svg>
                        </button>
                  <button type="button" className="plusBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <rect x="0.5" y="0.5" width="59" height="59" rx="19.5" fill="#F5F5F5" stroke="#CBCBCB"/>
                      <rect x="20" y="30" width="21" height="1" fill="#8F8F8F"/>
                      <rect x="31" y="19" width="21" height="1" transform="rotate(90 31 19)" fill="#8F8F8F"/>
                    </svg>
                  </button> */}
                  <input
                    type="checkbox"
                    id="flexiblestat"
                    name="workConditions.workingHours.isFlexible"
                    value="1"
                    onChange={handleCheckboxChange}
                    checked={jobPost.workConditions.workingHours.isFlexible}
                  />
                  <label htmlFor="flexiblestat" className="label">
                    탄력근무제 가능
                  </label>
                </div>
              </div>
              <h2>접수기간과 방법을 선택해 주세요.</h2>
              <div className="inputfield mb25">
                <label className="label">
                  접수기간<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div className="field_row gap01 worktimes">
                    <div
                      className="dateBox w05"
                      id="field-applicationPeriod"
                      tabIndex={-1}
                    >
                      <i className="fa-regular fa-calendar-days"></i>
                      <DatePicker
                        onChangeRaw={(e) => e?.preventDefault()}
                        id="receptsdate"
                        className={`form-control ${getErrorClass(
                          "applicationPeriod"
                        )}`}
                        placeholderText="2025-05-21"
                        dateFormat="yyyy-MM-dd"
                        selected={
                          jobPost.applicationPeriod?.start.date
                            ? new Date(jobPost.applicationPeriod?.start.date)
                            : null
                        }
                        locale="ko"
                        onChange={(date: Date | null) => {
                          const value = date
                            ? `${date.getFullYear()}-${String(
                                date.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                date.getDate()
                              ).padStart(2, "0")}`
                            : "";
                          // handleInputChange가 ChangeEvent 핸들러라면
                          handleInputChange({
                            target: {
                              name: "applicationPeriod.start.date",
                              value,
                            },
                          } as React.ChangeEvent<HTMLInputElement>);
                        }}
                      />
                    </div>
                    <select
                      id="receptshour"
                      name="applicationPeriod.start.time"
                      className={`w04 nice-select ${getErrorClass(
                        "applicationPeriod"
                      )}`}
                      onChange={handleSelectChange}
                      value={jobPost.applicationPeriod?.start.time}
                    >
                      <option value="00:00">00:00</option>
                      <option value="01:00">01:00</option>
                      <option value="02:00">02:00</option>
                      <option value="03:00">03:00</option>
                      <option value="04:00">04:00</option>
                      <option value="05:00">05:00</option>
                      <option value="06:00">06:00</option>
                      <option value="07:00">07:00</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                      <option value="23:00">23:00</option>
                    </select>
                    ~
                    <div className="dateBox w05">
                      <i className="fa-regular fa-calendar-days"></i>
                      <DatePicker
                        minDate={startDate || undefined}
                        onChangeRaw={(e) => e?.preventDefault()}
                        id="receptedate"
                        name="applicationPeriod.end.date"
                        className={`form-control ${getErrorClass(
                          "applicationPeriod"
                        )}`}
                        placeholderText="2025-05-21"
                        dateFormat="yyyy-MM-dd"
                        selected={
                          jobPost.applicationPeriod?.end.date
                            ? new Date(jobPost.applicationPeriod?.end.date)
                            : null
                        }
                        locale="ko"
                        onChange={(date: Date | null) => {
                          const value = date
                            ? `${date.getFullYear()}-${String(
                                date.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                date.getDate()
                              ).padStart(2, "0")}`
                            : "";
                          handleInputChange({
                            target: {
                              name: "applicationPeriod.end.date",
                              value,
                            },
                          } as React.ChangeEvent<HTMLInputElement>);
                        }}
                      />
                    </div>
                    <select
                      id="receptehour"
                      name="applicationPeriod.end.time"
                      className={`w04 nice-select ${getErrorClass(
                        "applicationPeriod"
                      )}`}
                      onChange={handleSelectChange}
                      value={jobPost.applicationPeriod?.end.time}
                    >
                      <option value="00:00">00:00</option>
                      <option value="01:00">01:00</option>
                      <option value="02:00">02:00</option>
                      <option value="03:00">03:00</option>
                      <option value="04:00">04:00</option>
                      <option value="05:00">05:00</option>
                      <option value="06:00">06:00</option>
                      <option value="07:00">07:00</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                      <option value="23:00">23:00</option>
                    </select>
                    <select
                      id="receptstat"
                      name="applicationPeriod.type"
                      className={`w02 nice-select ${getErrorClass(
                        "applicationPeriod"
                      )}`}
                      onChange={handleSelectChange}
                      value={jobPost.applicationPeriod.type}
                    >
                      <option value="접수기간 후 마감">접수기간 후 마감</option>
                      <option value="채용시 마감">채용시 마감</option>
                      <option value="상시채용">상시채용</option>
                    </select>
                  </div>
                  <ErrorMessage field="applicationPeriod" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  접수방법<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div
                    className="field_row gap30"
                    id="field-applicationMethod"
                    tabIndex={-1}
                  >
                    <input
                      type="checkbox"
                      id="methodstat1"
                      name="applicationMethod.methods"
                      value="유어잡 지원(즉시지원)"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "유어잡 지원(즉시지원)"
                      )}
                    />
                    <label htmlFor="methodstat1" className="label">
                      유어잡 지원(즉시지원)
                    </label>
                    <input
                      type="checkbox"
                      id="methodstat2"
                      name="applicationMethod.methods"
                      value="홈페이지"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "홈페이지"
                      )}
                    />
                    <label htmlFor="methodstat2" className="label">
                      홈페이지
                    </label>
                    <input
                      type="checkbox"
                      id="methodstat3"
                      name="applicationMethod.methods"
                      value="우편"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "우편"
                      )}
                    />
                    <label htmlFor="methodstat3" className="label">
                      우편
                    </label>
                    <input
                      type="checkbox"
                      id="methodstat4"
                      name="applicationMethod.methods"
                      value="방문"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "방문"
                      )}
                    />
                    <label htmlFor="methodstat4" className="label">
                      방문
                    </label>
                    <input
                      type="checkbox"
                      id="methodstat5"
                      name="applicationMethod.methods"
                      value="e-메일"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "e-메일"
                      )}
                    />
                    <label htmlFor="methodstat5" className="label">
                      e-메일
                    </label>
                    <input
                      type="checkbox"
                      id="methodstat6"
                      name="applicationMethod.methods"
                      value="fax"
                      onChange={handleCheckboxGroupChange}
                      checked={jobPost.applicationMethod.methods.includes(
                        "fax"
                      )}
                    />
                    <label htmlFor="methodstat6" className="label">
                      fax
                    </label>
                  </div>
                  <ErrorMessage field="applicationMethod" />
                </div>
              </div>
              <div
                className={`mb25 ${
                  jobPost.applicationMethod.methods.includes("홈페이지")
                    ? "inputfield"
                    : "inputfield_none"
                } ${getErrorClass("homepage")}`}
                id="field-homepage"
              >
                <div className="inputfield">
                  <label className="label addlabel">홈페이지</label>
                  <input
                    type="text"
                    className="form-control"
                    id="homeurl"
                    name="applicationMethod.homepage"
                    placeholder="홈페이지 url"
                    onChange={handleInputChange}
                    value={jobPost.applicationMethod.homepage}
                  />
                </div>
                <ErrorMessage field="homepage" />
              </div>
              {/* TODO: 이력서 첨부 기능 추가 */}
              {!jobPost.applicationMethod.methods.includes("홈페이지") && (
                <>
                  {" "}
                  <div className="inputfield mb25">
                    <label className="label">
                      이력서<span>*</span>
                    </label>
                    <div
                      style={{ width: "100%" }}
                      id="field-resume"
                      tabIndex={-1}
                    >
                      <div className={`fieldBox ${getErrorClass("resume")}`}>
                        <div className="field_row gap30" id="resumemethod">
                          <input
                            type="checkbox"
                            id="resumemethod1"
                            name="applicationMethod.resumeTypes.useYourJob"
                            value="true"
                            onChange={handleCheckboxChange}
                            checked={
                              jobPost.applicationMethod.resumeTypes.useYourJob
                            }
                          />
                          <label htmlFor="resumemethod1" className="label">
                            유어잡 양식
                          </label>
                          <input
                            type="checkbox"
                            id="resumemethod2"
                            name="applicationMethod.resumeTypes.useCompanyFormat"
                            value="true"
                            onChange={handleCheckboxChange}
                            checked={
                              jobPost.applicationMethod.resumeTypes
                                .useCompanyFormat
                            }
                          />
                          <label htmlFor="resumemethod2" className="label">
                            자사양식
                          </label>
                        </div>
                      </div>
                      <ErrorMessage field="resume" />
                    </div>
                  </div>
                </>
              )}

              {/* 첨부파일이 있으면 item_start class를 추가한다 */}
              {/* <div
                className={`mb25 ${
                  jobPost.applicationMethod.resumeTypes.useYourJob
                    ? "inputfield_none"
                    : "inputfield_none"
                }`}
                id="resume1"
              >
              </div> */}
              <div
                className={`mb25 ${
                  jobPost.applicationMethod.resumeTypes.useCompanyFormat
                    ? "inputfield"
                    : "inputfield_none"
                }`}
                id="resume2"
              >
                {/* 첨부파일이 있으면 item_start class를 추가한다 */}
                <div className="inputfield item_start">
                  <label className="label addlabel">자사양식</label>
                  {/* 첨부파일이 있을시 노출 */}
                  <div className="fileBox" style={{ cursor: "pointer" }}>
                    {/* loop */}
                    {/* TODO: 첨부파일 추가 기능 추가 */}
                    {jobPost.applicationMethod.resumeTypes.companyFormatFiles?.map(
                      (companyFormatFile, index) => (
                        <React.Fragment key={index}>
                          <div className="fileItem item_between">
                            {/* TODO: 배열로 변경 시 index 등 세팅 및 관련 기능 수정 필요 */}
                            <label
                              className="items"
                              style={{ cursor: "pointer" }}
                            >
                              <input
                                type="file"
                                name={`applicationMethod.resumeTypes.companyFormatFiles`}
                                className="form-control formfild"
                                onChange={handleFileChange}
                                accept="*"
                                key={`file-input-${index}`}
                              />
                              <div className="fileicon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="18"
                                  viewBox="0 0 14 18"
                                  fill="none"
                                >
                                  <path
                                    d="M8.75016 0.250977H1.75081C0.788403 0.250977 0.000976562 1.0384 0.000976562 2.00081V15.9995C0.000976562 16.9619 0.788403 17.7494 1.75081 17.7494H12.2498C13.2122 17.7494 13.9997 16.9619 13.9997 15.9995V5.50049L8.75016 0.250977ZM12.2498 15.9995H1.75081V2.00081H8.75016V5.50049H12.2498V15.9995ZM7.00033 13.3748C6.03792 13.3748 5.25049 12.5873 5.25049 11.6249V6.81287C5.25049 6.56789 5.44297 6.37541 5.68795 6.37541C5.93293 6.37541 6.12541 6.56789 6.12541 6.81287V11.6249H7.87525V6.81287C7.87525 5.60548 6.89534 4.62557 5.68795 4.62557C4.48056 4.62557 3.50065 5.60548 3.50065 6.81287V11.6249C3.50065 13.5585 5.06676 15.1246 7.00033 15.1246C8.9339 15.1246 10.5 13.5585 10.5 11.6249V8.12525H8.75016V11.6249C8.75016 12.5873 7.96274 13.3748 7.00033 13.3748Z"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </div>
                              <div className="items" key={index}>
                                {companyFormatFile?.file?.name || "파일 추가"}
                              </div>
                            </label>
                            {/* TODO: 배열로 변경 시 */}
                            {/* <button type="button" className="items">
                              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
                                <rect x="0.5" y="0.5" width="59" height="59" rx="19.5" fill="#F5F5F5" stroke="#CBCBCB"/>
                                <rect x="24.4141" y="23" width="17" height="2" transform="rotate(45 24.4141 23)"
                                      fill="#A8A8A8"/>
                                <rect x="36.4355" y="24.4141" width="17" height="2" transform="rotate(135 36.4355 24.4141)"
                                      fill="#A8A8A8"/>
                              </svg>
                            </button> */}
                          </div>
                          {companyFormatFile && (
                            <div className="fileItem item_between">
                              <button
                                type="button"
                                className="preview-btn"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(
                                    companyFormatFile.file!
                                  );
                                  link.download = companyFormatFile.file!.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(link.href);
                                }}
                              >
                                다운로드
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      )
                    )}
                    {/* loop end */}
                    {/* TODO: 첨부파일 추가 기능 추가 */}
                    {/* <button type="button" className="fileOpenBtn" id="fileOpen">+ 추가</button> */}
                  </div>
                  {/* 첨부파일이 없을시 노출
                  <div class="fileOpen" id="fileOpen">+ 파일추가</div>
                  */}
                </div>
              </div>
              <h2>우리 기업의 정보가 맞나요?</h2>
              <div className="inputfield mb25">
                <label className="label">
                  담당자명<span>*</span>
                </label>

                <div style={{ width: "100%" }}>
                  <div className="field_row gap01">
                    <input
                      type="text"
                      className={`form-control w02 ${getErrorClass("name")}`}
                      id="field-name"
                      name="companyInfo.name"
                      placeholder="담당자명 입력"
                      onChange={handleInputChange}
                      value={jobPost.companyInfo.name}
                    />
                    <input
                      type="checkbox"
                      id="disstat1"
                      name="companyInfo.namePrivate"
                      value="true"
                      onChange={handleCheckboxChange}
                      checked={jobPost.companyInfo.namePrivate}
                    />
                    <label htmlFor="disstat1" className="label">
                      비공개
                    </label>
                  </div>
                  <ErrorMessage field="name" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  연락처<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div
                    className="field_row gap01"
                    id="field-phone"
                    tabIndex={-1}
                  >
                    <input
                      type="text"
                      className={`form-control w04 ${getErrorClass("phone")}`}
                      id="htel1"
                      name="companyInfo.phoneField1"
                      onChange={handleInputChange}
                      value={jobPost.companyInfo.phoneField1}
                    />
                    -
                    <input
                      type="text"
                      className={`form-control w04 ${getErrorClass("phone")}`}
                      id="htel2"
                      name="companyInfo.phoneField2"
                      onChange={handleInputChange}
                      value={jobPost.companyInfo.phoneField2}
                    />
                    -
                    <input
                      type="text"
                      className={`form-control w04 ${getErrorClass("phone")}`}
                      id="htel3"
                      name="companyInfo.phoneField3"
                      onChange={handleInputChange}
                      value={jobPost.companyInfo.phoneField3}
                    />
                    <input
                      type="checkbox"
                      id="disstat2"
                      name="companyInfo.phonePrivate"
                      value="true"
                      onChange={handleCheckboxChange}
                      checked={jobPost.companyInfo.phonePrivate}
                    />
                    <label htmlFor="disstat2" className="label">
                      비공개
                    </label>
                  </div>
                  <ErrorMessage field="phone" />
                </div>
              </div>
              <div className="inputfield mb25">
                <label className="label">
                  업종<span>*</span>
                </label>
                <div style={{ width: "100%" }}>
                  <div
                    className={`fieldBox ${getErrorClass("industry")}`}
                    id="field-industry"
                    tabIndex={-1}
                  >
                    <div className="viewItem">
                      {displayLabels.industry.length === 0 && (
                        <div className="items noitem">선택해주세요.</div>
                      )}
                      {displayLabels.industry.map((industry, index) => (
                        <div key={index} className="items">
                          <div className="label">{industry}</div>
                          <i
                            className="fa-solid fa-xmark"
                            onClick={() => {
                              setJobPost((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  companyInfo: {
                                    ...prev.companyInfo,
                                    industry: prev.companyInfo.industry.filter(
                                      (_, i) => i !== index
                                    ),
                                  },
                                };
                              });
                              setDisplayLabels((prev) => ({
                                ...prev,
                                industry: prev.industry.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="viewAll"
                      id="industry"
                      onClick={openIndustryModal}
                    >
                      전체보기
                    </button>
                  </div>
                  <ErrorMessage field="industry" />
                </div>
              </div>
              {/* TODO: 모호한 기능. 임시저장인 듯 함. */}
              {/* <div className="btnBox mt50">
                <button type="button" className="apply_btn" id="apply_ok" onClick={handleApply}>입력한 내용으로 적용</button>
              </div> */}
              <div className="mt45 w-full" style={{ height: "760px" }}>
                {/* <textarea
                  // id="txtContent"
                  name="content"
                  className="form-control"
                  style={{ width: "100%" }}
                  cols={100}
                  rows={10}
                  value={jobPost.content}
                  onChange={handleInputChange}
                /> */}
                <Editor
                  value={jobPost.content}
                  // onValueChange={setJobPost((prev) => ({...prev,content: }))}
                  onValueChange={(value: string) =>
                    setJobPost((prev) => ({ ...prev, content: value }))
                  }
                  setImageName={function (value: string[]): void {}}
                  height={700}
                />
              </div>
              <div className="inputfield mt35">
                <div className="termsBox">
                  <div className="field_row mb15">
                    <input
                      type="checkbox"
                      id="termAll"
                      name="termAll"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setJobPost((prev) => ({
                          ...prev,
                          terms: {
                            sensitiveInfo: checked,
                            personalInfo: checked,
                          },
                        }));
                      }}
                      checked={
                        jobPost.terms.personalInfo &&
                        jobPost.terms.sensitiveInfo
                      }
                    />
                    <label htmlFor="termAll" className="label">
                      개인정보 수집 및 이용 동의(필수/선택)2가지 항목에 모두
                      동의합니다.
                    </label>
                  </div>
                  <div
                    id="field-terms"
                    className="field_row item_column item_start mb10 pdl2"
                  >
                    <input
                      type="checkbox"
                      id="term1"
                      name="terms.sensitiveInfo"
                      value="true"
                      onChange={handleCheckboxChange}
                      checked={jobPost.terms.sensitiveInfo}
                    />
                    <label htmlFor="term1" className="termlabel mb13">
                      <span>(필수)</span>민감정보 수집에 동의합니다.{" "}
                      <i className="fa-solid fa-angle-down"></i>
                    </label>

                    <div
                      className="term_info"
                      id="termCon1"
                      style={{
                        display: jobPost.terms.sensitiveInfo ? "block" : "none",
                      }}
                    >
                      <p>
                        채용공고 등록을 위해 아래와 같이 개인정보를 수집 및
                        이용합니다.
                      </p>
                      <p className="mb15">
                        동의를 거부할 권리가 있으며, 동의 거부 시 채용공고
                        등록이 불가합니다.
                      </p>
                      <p>
                        목적 : 채용정보 등록자 확인 및 관리, 구직자 지원 및
                        문의. 등록 결과 안내 및 고객불만처리. 각종 맞춤형 서비스
                        제공
                      </p>
                      <p>항목 : 이름, 전화번호, 이메일</p>
                      <p>보유 및 이용기간 : 회원 탈퇴 시 즉시 파기</p>
                    </div>

                    <input
                      type="checkbox"
                      id="term2"
                      name="terms.personalInfo"
                      value="true"
                      onChange={handleCheckboxChange}
                      checked={jobPost.terms.personalInfo}
                    />
                    <label htmlFor="term2" className="termlabel mb13">
                      (선택)민감정보 수집에 동의합니다.{" "}
                      <i className="fa-solid fa-angle-down"></i>
                    </label>

                    <div
                      className="term_info"
                      id="termCon2"
                      style={{
                        display: jobPost.terms.personalInfo ? "block" : "none",
                      }}
                    >
                      <p>
                        채용공고 등록을 위해 아래와 같이 개인정보를 수집 및
                        이용합니다.
                      </p>
                      <p className="mb15">
                        동의를 거부할 권리가 있으며, 동의 거부 시 채용공고에
                        선택항목 등록이 불가합니다.
                      </p>
                      <p>
                        목적 : 채용정보 등록자 확인 및 관리, 구직자 지원 및
                        문의. 등록 결과 안내 및 고객불만처리. 각종 맞춤형 서비스
                        제공
                      </p>
                      <p>항목 : 부서명, 휴대폰번호</p>
                      <p>보유 및 이용기간 : 회원 탈퇴 시 즉시 파기</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="btnBox mt80 relative">
                {/* {showErrorToast && Object.keys(errors).length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-200px",
                      left: 0,
                      right: 0,
                      minHeight: "50px",
                      background: "#eaeaea",
                      padding: "8px",
                      boxSizing: "border-box",
                      zIndex: 10,
                    }}
                  >
                    {Object.values(errors).map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          color: "#c00",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        • {msg}
                      </div>
                    ))}
                  </div>
                )} */}

                <button
                  type="button"
                  className="form_btn"
                  onClick={handleSubmit}
                >
                  {id ? "수정하기" : "등록하기"}
                </button>
                <button
                  type="button"
                  className="home_btn"
                  onClick={handleCancelJobPost}
                >
                  취소
                </button>
              </div>
            </div>
            {/* jobpost-reg end */}
            {/* 직무 모달 */}
            <DataModal
              isOpen={isJobTypeModalOpen}
              onClose={closeJobTypeModal}
              onSelect={handleJobTypeSelect}
              initialData={jobTypeData}
              initialSelected={
                jobPost?.jobType.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.jobType[index] || id, // ID가 없으면 라벨로 사용
                })) || []
              }
            />

            {/* 스킬 모달 */}
            {/* <DataModal
              isOpen={isSkillTypeModalOpen}
              onClose={closeSkillTypeModal}
              onSelect={handleSkillTypeSelect}
              initialData={skillData}
              initialSelected={
                jobPost?.skills.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.skills[index] || id,
                })) || []
              }
              isOneDepth
            /> */}
            <SkillTypeModal
              isOpen={isSkillTypeModalOpen}
              onClose={closeSkillTypeModal}
              onSelect={handleSkillTypeSelect}
              initialSelected={
                jobPost?.skills.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.skills[index] || id,
                })) || []
              }
            />

            {/* 핵심역량 모달 */}
            {/* <DataModal
              isOpen={isCapacityTypeModalOpen}
              onClose={closeCapacityTypeModal}
              onSelect={handleCapacityTypeSelect}
              initialData={capabilityData}
              initialSelected={
                jobPost?.capabilities.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.capabilities[index] || id,
                })) || []
              }
              isOneDepth
            /> */}

            {isCapacityTypeModalOpen && (
              <CapacityTypeModal
                isOpen={isCapacityTypeModalOpen}
                onClose={closeCapacityTypeModal}
                onSelect={handleCapacityTypeSelect}
                initialSelected={
                  jobPost?.capabilities.map((id, index) => ({
                    operationDataId: id,
                    displayLabel: displayLabels.capabilities[index] || id,
                  })) || []
                }
              />
            )}

            {isJobRankModalOpen && (
              <JobRankModal
                isOpen={isJobRankModalOpen}
                onClose={closeJobRankModal}
                onSelect={handleJobRankSelect}
                initialSelected={
                  jobPost?.position_rank?.map((id, index) => ({
                    operationDataId: id,
                    displayLabel: displayLabels.position_rank[index] || id,
                  })) || []
                }
              />
            )}

            {isPreferenceModalOpen && (
              <PreferenceModal
                isOpen={isPreferenceModalOpen}
                onClose={closePreferenceModal}
                onSelect={handlePreferenceSelect}
                initialSelected={
                  jobPost?.qualification?.preferences?.specialCondition.map(
                    (id, index) => ({
                      operationDataId: id,
                      displayLabel: displayLabels.specialCondition[index] || id,
                    })
                  ) || []
                }
              />
            )}

            {isLanguageModalOpen && (
              <LanguageModal
                isOpen={isLanguageModalOpen}
                onClose={closeLanguageModal}
                onSelect={handleLanguageSelect}
                initialSelected={
                  jobPost?.qualification?.preferences?.language.map(
                    (id, index) => ({
                      operationDataId: id,
                      displayLabel: displayLabels.language[index] || id,
                    })
                  ) || []
                }
              />
            )}
            {/* 자격증 모달 */}
            <DataModal
              isOpen={isLicenseModalOpen}
              onClose={closeLicenseModal}
              onSelect={handleLicenseSelect}
              initialData={licenseData}
              initialSelected={
                jobPost?.qualification?.preferences?.license.map(
                  (id, index) => ({
                    operationDataId: id,
                    displayLabel: displayLabels.license[index] || id,
                  })
                ) || []
              }
              title="자격증 선택"
              maxLength={3}
            />
            {/* {isLicenseModalOpen && (
              <LicenseModal
                isOpen={isLicenseModalOpen}
                onClose={closeLicenseModal}
                onSelect={handleLicenseSelect}
                initialSelected={
                  jobPost?.qualification?.preferences?.license.map(
                    (id, index) => ({
                      operationDataId: id,
                      displayLabel: displayLabels.license[index] || id,
                    }),
                  ) || []
                }
              />
            )} */}

            {isMajorModalOpen && (
              <MajorModal
                isOpen={isMajorModalOpen}
                onClose={closeMajorModal}
                onSelect={handleMajorSelect}
                initialSelected={
                  jobPost?.qualification?.preferences?.specialMajor.map(
                    (id, index) => ({
                      operationDataId: id,
                      displayLabel: displayLabels.specialMajor[index] || id,
                    })
                  ) || []
                }
              />
            )}
            {/* 근무지역 모달 */}
            <DataModal
              isOpen={isWorklocationModalOpen}
              onClose={closeWorklocationModal}
              onSelect={handleWorklocationSelect}
              initialData={
                jobPost.workConditions.location.type === "해외"
                  ? overseasLocationData
                  : domesticLocationData
              }
              initialSelected={
                jobPost.workConditions.location.region.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.region[index] || id,
                })) || []
              }
              isGlobal={jobPost.workConditions.location.type === "해외"}
              title="근무지역 선택"
            />
            {/* {isWorklocationModalOpen && (
              <WorklocationModal
                isOpen={isWorklocationModalOpen}
                onClose={closeWorklocationModal}
                onSelect={handleWorklocationSelect}
                initialSelected={
                  jobPost.workConditions.location.region.map((id, index) => ({
                    operationDataId: id,
                    displayLabel: displayLabels.region[index] || id,
                  })) || []
                }
              />
            )} */}

            {/* {isIndustryModalOpen && (
              <IndustryModal
                isOpen={isIndustryModalOpen}
                onClose={closeIndustryModal}
                onSelect={handleIndustrySelect}
                initialSelected={
                  jobPost.companyInfo.industry.map((id, index) => ({
                    operationDataId: id,
                    displayLabel: displayLabels.industry[index] || id,
                  })) || []
                }
              />
            )} */}
            <DataModal
              isOpen={isIndustryModalOpen}
              onClose={closeIndustryModal}
              onSelect={handleIndustrySelect}
              initialData={industryData}
              initialSelected={
                jobPost.companyInfo.industry.map((id, index) => ({
                  operationDataId: id,
                  displayLabel: displayLabels.industry[index] || id,
                })) || []
              }
              title="업종 선택"
            />
          </div>
        </div>
      </div>
      {isOpenPost && (
        <PostModal
          isOpen={isOpenPost}
          width="900px"
          onClose={() => setIsOpenPost(false)}
          onComplete={handleAddressComplete}
        />
      )}
    </CorpLayout>
  );
};

export default Jobpost;
