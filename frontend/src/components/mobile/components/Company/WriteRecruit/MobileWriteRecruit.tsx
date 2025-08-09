import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileWriteRecruit.css";

import CheckBox from "../../CheckBox/CheckBox";
import JopTypePopUp from "../../Popups/JopTypePopUp/JopTypePopUp";
import { axiosInstance } from "../../../../../api/axios";
import SkillTypePopUp from "../../Popups/SkillTypePopUp/SkillTypePopUp";
import CapacityPopUp from "../../Popups/CapacityPopUp/CapacityPopUp";
import PreferencePopUp from "../../Popups/PreferencePopUp/PreferencePopUp";
import LanguagePopUp from "../../Popups/LanguagePopUp/LanguagePopUp";
import LicensePopUp from "../../Popups/LicensePopUp/LicensePopUp";
import MajorPopUp from "../../Popups/MajorPopUp/MajorPopUp";
import WorkLocationPopUp from "../../Popups/WorkLocationPopUp/WorkLocationPopUp";
import IndustryPopUp from "../../Popups/IndustryPopUp/IndustryPopUp";
import PostModal from "../../../../common/PostModal/PostModal";
import { useSmartEditor } from "../../../../../hooks/useSmartEditor";
import { FileResponse } from "../../../../../types/common";
import Editor from "../../../../editor/Editor";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";
import { useAlert } from "../../../../../contexts/AlertContext";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

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
    minYears: undefined, // 최소 경력년수
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
      min: undefined, // 최소급여
      max: undefined, // 최대급여
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
export default function MobileWriteRecruit() {
  //경고 보여주는 유무
  const [isShowError, setIsShowError] = useState<boolean>(false);
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
      setLocationData(combined);

      setPreferenceData(preferenceData);
      setLanguageData(languageData);
      setMajorData(majorData);
      setIndustryData(industryData);
    };

    fetchData();
  }, []);
  registerLocale("ko", ko);
  const { customAlert, customConfirm } = useAlert();
  const [jobPost, setJobPost] = useState<JobPostForm>(initialFormData);
  const [previousPosts, setPreviousPosts] = useState<JobPostForm[]>([]);
  const [showPrevLayer, setShowPrevLayer] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const isSalaryDisabled =
    jobPost.workConditions?.salary.type === "회사내규에 따름" ||
    jobPost.workConditions?.salary.isInterviewDecided;
  // PopUp 관련 상태
  const [isJobTypeModalOpen, setIsJobTypeModalOpen] = useState(false);
  const [isSkillTypeModalOpen, setIsSkillTypeModalOpen] = useState(false);
  const [isCapacityTypeModalOpen, setIsCapacityTypeModalOpen] = useState(false);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [isWorklocationModalOpen, setIsWorklocationModalOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
  // const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // 불러오기 로딩
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 임시 레이어 (예: 경력 입력 등)
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
  const fetchJobPost = async () => {
    try {
      const response = await axiosInstance.get<JobPostForm>(
        `/api/v1/corpmem/posts/${id}`
      );
      const mergedData = await mergeWithInitialData(response.data);
      setJobPost(mergedData);

      // 코드 배열 → 레이블 배열로 변환하는 헬퍼
      const mapCodesToLabels = (
        codes: string[] = [],
        list: JobpostDataItem[],
        // 기본 레이블로 level2 를 사용하도록 변경
        getLabel: (item: JobpostDataItem) => string = (item) =>
          item.level2 || item.level1 || ""
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
  // API 호출
  const fetchJobPostById = async (id: number) => {
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

  useEffect(() => {
    if (id) {
      fetchJobPost();
    } else {
      // 신규 등록 모드일 때도 로딩 해제
      setIsLoading(false);
    }
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

  // 입력 핸들러들
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
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
          // "홈페이지"를 선택하면 자동으로 useYourJob을 체크
          resumeTypes: {
            ...prev.applicationMethod.resumeTypes,
            useYourJob:
              checked && value === "홈페이지"
                ? true
                : prev.applicationMethod.resumeTypes.useYourJob,
          },
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
          filename: file.name,
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
  const mapCodesToLabels = (
    codes: string[],
    list: JobpostDataItem[]
  ): string[] =>
    codes.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? found.level2 || found.level1 || code : code;
    });
  // PopUp 열기/닫기 핸들러
  const openJobTypeModal = () => setIsJobTypeModalOpen(true);
  const closeJobTypeModal = () => setIsJobTypeModalOpen(false);
  const handleJobTypeSelect = (selectedCodes: string[]) => {
    const newLabels = selectedCodes.map((code) => {
      const found = jobTypeData.find((item) => item.operationDataId === code);
      return found ? found.level2 || found.level1 || code : code;
    });

    setJobPost((prev) => ({ ...prev, jobType: selectedCodes }));
    setDisplayLabels((prev) => ({ ...prev, jobType: newLabels }));
  };

  const openSkillTypeModal = () => setIsSkillTypeModalOpen(true);
  const closeSkillTypeModal = () => setIsSkillTypeModalOpen(false);
  const handleSkillTypeSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({ ...prev, skills: selectedCodes }));
    setDisplayLabels((prev) => ({
      ...prev,
      skills: mapCodesToLabels(selectedCodes, skillData),
    }));
  };

  const openCapacityTypeModal = () => setIsCapacityTypeModalOpen(true);
  const closeCapacityTypeModal = () => setIsCapacityTypeModalOpen(false);
  const handleCapacityTypeSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({ ...prev, capabilities: selectedCodes }));
    setDisplayLabels((prev) => ({
      ...prev,
      capabilities: mapCodesToLabels(selectedCodes, capabilityData),
    }));
  };

  const openPreferenceModal = () => setIsPreferenceModalOpen(true);
  const closePreferenceModal = () => setIsPreferenceModalOpen(false);
  const handlePreferenceSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        preferences: {
          ...prev.qualification.preferences!,
          specialCondition: selectedCodes,
          useSpecialCondition: selectedCodes.length > 0,
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      specialCondition: mapCodesToLabels(selectedCodes, preferenceData),
    }));
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);
  const handleLanguageSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        preferences: {
          ...prev.qualification.preferences!,
          language: selectedCodes,
          useLanguage: selectedCodes.length > 0,
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      language: mapCodesToLabels(selectedCodes, languageData),
    }));
  };

  const openLicenseModal = () => setIsLicenseModalOpen(true);
  const closeLicenseModal = () => setIsLicenseModalOpen(false);
  const handleLicenseSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        preferences: {
          ...prev.qualification.preferences!,
          license: selectedCodes,
          useLicense: selectedCodes.length > 0,
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      license: mapCodesToLabels(selectedCodes, licenseData),
    }));
  };

  const openMajorModal = () => setIsMajorModalOpen(true);
  const closeMajorModal = () => setIsMajorModalOpen(false);
  const handleMajorSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        preferences: {
          ...prev.qualification.preferences!,
          specialMajor: selectedCodes,
          useSpecialMajor: selectedCodes.length > 0,
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      specialMajor: mapCodesToLabels(selectedCodes, majorData),
    }));
  };

  const openWorklocationModal = () => setIsWorklocationModalOpen(true);
  const closeWorklocationModal = () => setIsWorklocationModalOpen(false);
  const handleWorklocationSelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      workConditions: {
        ...prev.workConditions,
        location: {
          ...prev.workConditions.location,
          region: selectedCodes,
        },
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      region: mapCodesToLabels(selectedCodes, locationData),
    }));
  };

  const openIndustryModal = () => setIsIndustryModalOpen(true);
  const closeIndustryModal = () => setIsIndustryModalOpen(false);
  const handleIndustrySelect = (selectedCodes: string[]) => {
    setJobPost((prev) => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        industry: selectedCodes,
      },
    }));
    setDisplayLabels((prev) => ({
      ...prev,
      industry: mapCodesToLabels(selectedCodes, industryData),
    }));
  };

  const toggleEmploymentType = (type: string, checked: boolean) => {
    setJobPost((prev) => {
      const currentTypes = prev.employmentType.types;
      // 체크 해제인 경우: 무조건 제거
      if (!checked) {
        return {
          ...prev,
          employmentType: {
            ...prev.employmentType,
            types: currentTypes.filter((t) => t !== type),
          },
        };
      }
      // 체크 선택인 경우: 이미 3개 선택되었으면 무시
      if (currentTypes.length >= 3) {
        return prev;
      }
      // 그 외에는 추가
      return {
        ...prev,
        employmentType: {
          ...prev.employmentType,
          types: [...currentTypes, type],
        },
      };
    });
  };

  const handleCareerTypeChange = (type: "신입" | "경력" | "무관") => {
    setJobPost((prev) => ({
      ...prev,
      career: {
        ...prev.career,
        type: type,

        minYears: type !== "경력" ? undefined : prev.career.minYears,
        isYearMatter: type !== "경력" ? false : prev.career.isYearMatter,
      },
    }));
  };

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
          ...jobPost.applicationMethod?.resumeTypes,
          useYourJob: jobPost.applicationMethod?.resumeTypes.useYourJob,
          useCompanyFormat:
            jobPost.applicationMethod?.resumeTypes.useCompanyFormat,
        },
      },
    };

    // FormData 객체 생성
    const formData = new FormData();

    // JSON 데이터 추가
    formData.append("data", JSON.stringify(jobPostData));

    // 파일 데이터 추가
    if (
      jobPost.applicationMethod?.resumeTypes.useYourJob &&
      jobPost.applicationMethod?.resumeTypes.yourJobFiles &&
      jobPost.applicationMethod?.resumeTypes.yourJobFiles.length > 0
    ) {
      jobPost.applicationMethod?.resumeTypes.yourJobFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`yourJobFiles`, file.file);
          }
        }
      );
    }

    if (
      jobPost.applicationMethod?.resumeTypes.useCompanyFormat &&
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles &&
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles.length > 0
    ) {
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles.forEach(
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
        alert("채용공고 등록이 완료되었습니다.");
        navigate("/m/company/managePost");
      })
      .catch((error) => {
        console.error("채용공고 등록 실패:", error);
        alert("채용공고 등록에 실패했습니다. 다시 시도해주세요.");
      });
  };

  // API 요청 - 수정 (JSON 구조에 맞게 payload 구성)
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
          ...jobPost.applicationMethod?.resumeTypes,
          useYourJob: jobPost.applicationMethod?.resumeTypes.useYourJob,
          useCompanyFormat:
            jobPost.applicationMethod?.resumeTypes.useCompanyFormat,
        },
      },
    };

    // FormData 객체 생성
    const formData = new FormData();

    // JSON 데이터 추가
    formData.append("data", JSON.stringify(jobPostData));

    // 파일 데이터 추가
    if (
      jobPost.applicationMethod?.resumeTypes.useYourJob &&
      jobPost.applicationMethod?.resumeTypes.yourJobFiles &&
      jobPost.applicationMethod?.resumeTypes.yourJobFiles.length > 0
    ) {
      jobPost.applicationMethod?.resumeTypes.yourJobFiles.forEach(
        (file, index) => {
          if (file?.file) {
            formData.append(`yourJobFiles`, file.file);
          }
        }
      );
    }

    if (
      jobPost.applicationMethod?.resumeTypes.useCompanyFormat &&
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles &&
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles.length > 0
    ) {
      jobPost.applicationMethod?.resumeTypes.companyFormatFiles.forEach(
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
        alert("수정이 완료되었습니다.");
        navigate("/m/company/managePost");
      })
      .catch((error) => {
        console.error("채용공고 수정 실패:", error);
        alert("채용공고 수정에 실패했습니다. 다시 시도해주세요.");
      });
  };

  const handleCancelJobPost = async () => {
    const userType = sessionStorage.getItem("userType");
    if (userType === "ADMIN") {
      setIsAdmin(true);
    }
    if (isAdmin) {
      // setIsDirty(false); // 변경사항 플래그 초기화
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
      navigate("/m/company/managePost");
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

  const handleBringJobPost = () => {
    setShowPrevLayer(!showPrevLayer);
  };

  const handleSelectPreviousPost = (selectedPost: JobPostForm) => {
    fetchJobPostById(selectedPost.id ?? 0);
    setShowPrevLayer(false);
  };
  const [isOpenPost, setIsOpenPost] = useState<boolean>(false);
  const [selectedPriorityTab, setSelectedPriorityTab] = useState<string[]>([]);
  const yourJobFileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mobileWriteRecruit_Container">
      <MetaTagHelmet title="채용공고 등록" description="채용공고 등록" />
      <PostModal
        width="90%"
        isOpen={isOpenPost}
        onClose={function (): void {}}
        onComplete={function (address: string, zoneCode: string): void {
          setJobPost((prev) => ({
            ...prev,
            workConditions: {
              ...prev.workConditions,
              location: {
                ...prev.workConditions.location,
                address: address,
              },
            },
          }));
          setJobPost((prev) => ({
            ...prev,
            workConditions: {
              ...prev.workConditions,
              location: {
                ...prev.workConditions.location,
                zip_code: zoneCode,
              },
            },
          }));
          setIsOpenPost(false);
        }}
      />
      <script src="https://unpkg.com/@tailwindcss/browser@4.0.14/dist/index.global.js"></script>
      <MobileMainHeader />
      <h3 className="siteH3Label">공고등록</h3>

      <div style={{ width: "100%", padding: "0 20px", position: "relative" }}>
        <button className="loadBtn" onClick={handleBringJobPost}>
          <img src="/img/mobile/bluePlus.png" alt="이전공고 불러오기" />
          <p>이전공고 불러오기</p>
        </button>
        <ul
          className="prev_Layer"
          style={{
            display: showPrevLayer ? "block" : "none",
            position: "absolute",
            top: "70px",
            width: "calc(100% - 40px)",
            left: "auto",
            maxHeight: "230px",
            overflow: "auto",
          }}
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

      <section className="inputSection mt-70">
        <h4>채용 제목을 입력해 주세요</h4>
        <div
          className={`input_default ${getErrorClass("title")}`}
          style={{ height: "78px" }}
          id="field-title"
        >
          <input
            placeholder="채용 제목을 입력해 주세요."
            name="title"
            value={jobPost.title}
            onChange={handleInputChange}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <ErrorMessage field="title" />
        </div>
      </section>
      <section className="inputSection mt-35">
        <h4 style={{ marginBottom: "10px" }}>어떤 포지션을 채용하시나요?</h4>

        <div className="inputRow">
          <h5>
            포지션<strong>*</strong>
          </h5>
          <div
            className={`input_default ${getErrorClass("position")}`}
            id="field-position"
          >
            <input
              placeholder="최대한 직무명을 포함하여 입력하세요."
              name="position"
              value={jobPost.position}
              onChange={handleInputChange}
              style={{ width: "100%", fontSize: "14px" }}
            />
          </div>
          <ErrorMessage field="position" />
        </div>

        <div className="inputRow">
          <h5>
            직무<strong>*</strong>
          </h5>
          <div
            className={`input_default w-full ${getErrorClass("jobType")}`}
            style={{ minHeight: "60px", height: "auto" }}
            id="field-jobType"
          >
            <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
              {jobPost.jobType && jobPost.jobType.length > 0 ? (
                displayLabels.jobType.map((job, index) => (
                  <div key={index} className="items">
                    <div className="label" style={{ textWrap: "nowrap" }}>
                      {job}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="items noitem"
                  style={{ color: "#a8a8a8", fontSize: "14px" }}
                >
                  직무를 선택해주세요.
                </div>
              )}
            </div>
            <button className="openPopupBtn w-25" onClick={openJobTypeModal}>
              전체보기
            </button>
            <JopTypePopUp
              isOpen={isJobTypeModalOpen}
              onClose={closeJobTypeModal}
              onSelect={handleJobTypeSelect}
              initialSelected={jobPost.jobType || []}
            />
          </div>
          <ErrorMessage field="jobType" />
        </div>

        <div className="inputRow">
          <h5>스킬</h5>
          <div
            className="input_default"
            style={{ minHeight: "60px", height: "auto" }}
          >
            <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
              {jobPost.skills && jobPost.skills.length > 0 ? (
                jobPost.skills.map((skill, index) => (
                  // displayLabels.skills.map((skill, index) => (
                  <div key={index} className="items">
                    <div className="label">{skill}</div>
                  </div>
                ))
              ) : (
                <div
                  className="items noitem"
                  style={{ color: "#a8a8a8", fontSize: "14px" }}
                >
                  직무와 관련있는 스킬을 선택해 주세요.
                </div>
              )}
            </div>
            <button className="openPopupBtn w-25" onClick={openSkillTypeModal}>
              전체보기
            </button>
            <SkillTypePopUp
              isOpen={isSkillTypeModalOpen}
              onClose={closeSkillTypeModal}
              onSelect={handleSkillTypeSelect}
              initialSelected={jobPost.skills || []}
            />
          </div>
          <ErrorMessage field="skills" />
        </div>

        <div className="inputRow">
          <h5>
            핵심역량<strong>*</strong>
          </h5>
          <div
            className={`input_default w-full ${getErrorClass("capabilities")}`}
            style={{ minHeight: "60px", height: "auto" }}
            id="field-capabilities"
          >
            <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
              {jobPost.capabilities && jobPost.capabilities.length > 0 ? (
                displayLabels.capabilities.map((capacityLabel, index) => (
                  <div key={index} className="items">
                    <div className="label">{capacityLabel}</div>
                  </div>
                ))
              ) : (
                <div
                  className="items noitem"
                  style={{ color: "#a8a8a8", fontSize: "14px" }}
                >
                  중요하게 생각하는 역량을 선택해주세요(3~12개 선택)
                </div>
              )}
            </div>
            <button
              className="openPopupBtn w-25"
              onClick={openCapacityTypeModal}
            >
              전체보기
            </button>
            <CapacityPopUp
              isOpen={isCapacityTypeModalOpen}
              onClose={closeCapacityTypeModal}
              onSelect={handleCapacityTypeSelect}
              initialSelected={jobPost.capabilities || []}
            />
          </div>
          <ErrorMessage field="capabilities" />
        </div>

        <div className="item">
          <h5 className="CheckLabel">
            경력<strong>*</strong>
          </h5>
          <div
            className={`flexGap10 ${getErrorClass("career")}`}
            id="field-career"
          >
            {["신입", "경력", "무관"].map((type) => (
              <div key={type} className="checkBoxRow">
                <CheckBox
                  isChecked={jobPost.career.type === type}
                  // 클릭 시 handleCareerTypeChange에 해당 타입만 전달
                  setIsChecked={() => handleCareerTypeChange(type as any)}
                />
                <p style={{ fontSize: "14px" }}>{type}</p>
              </div>
            ))}
          </div>
          <ErrorMessage field="career" />
        </div>

        <div
          className="career_Layer type2"
          style={{
            display: jobPost.career?.type === "경력" ? "block" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="Layer-container">
            <div className="box">
              <div className="txt">경력</div>
              <input
                type="number"
                className="form-control personal_year"
                placeholder="숫자."
                name="career.minYears"
                onChange={handleInputChange}
                value={jobPost.career?.minYears || ""}
                disabled={jobPost.career.isYearMatter}
              />
              <span style={{ marginLeft: "4px" }}>년 이상</span>
            </div>
            <div className="box">
              <input
                type="checkbox"
                id="year_matter"
                name="career.isYearMatter"
                value="1"
                onChange={handleCheckboxChange}
                checked={jobPost.career?.isYearMatter}
              />
              <label htmlFor="year_matter">경력년수 무관</label>
            </div>
          </div>
        </div>

        <div className="item">
          <h5 className="CheckLabel">
            고용형태<strong>*</strong>
            <span className="slabel">최대 3개</span>
          </h5>
          <div
            className={`checkSection type2 ${getErrorClass("employmentType")}`}
            style={{ fontSize: "14px" }}
            id="field-employmentType"
          >
            {[
              "정규직",
              "계약직",
              "인턴",
              "파견직",
              "도급",
              "프리랜서",
              "아르바이트",
              "연수생/교육생",
              "병역특례",
              "위촉직/개인사업자",
            ].map((type) => (
              <div className="checkBoxRow" key={type}>
                <CheckBox
                  isChecked={jobPost.employmentType?.types.includes(type)}
                  setIsChecked={(value) => toggleEmploymentType(type, value)}
                />
                <p>{type}</p>
              </div>
            ))}
          </div>
          {jobPost.employmentType?.types.includes("정규직") && (
            <div className="inputfield">
              <div className="permanent_Layer">
                <div className="Layer-container">
                  <div className="box">
                    <div className="txt">정규직 수습기간</div>
                    <select
                      id="prod"
                      name="employmentType.probationMonths"
                      className="nice-select"
                      onChange={handleSelectChange}
                      value={jobPost.employmentType?.probationMonths}
                    >
                      <option value="1">1개월</option>
                      <option value="2">2개월</option>
                      <option value="3">3개월</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          {jobPost.employmentType?.types.includes("계약직") && (
            <div className="inputfield">
              <div className="temporary_Layer">
                <div className="Layer-container">
                  <div className="box">
                    <div className="txt">계약 기간</div>
                    <select
                      id="prod1"
                      name="employmentType.contractPeriod"
                      className="nice-select"
                      onChange={handleSelectChange}
                      // value={jobPost.employmentType?.contractPeriod}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}개월
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="box ml3">
                    <input
                      type="checkbox"
                      id="temp_conver"
                      name="employmentType.isConversionAvailable"
                      value="true"
                      onChange={handleCheckboxChange}
                      // checked={jobPost.employmentType?.isConversionAvailable}
                    />
                    <label htmlFor="temp_conver">정규직 전환가능</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {jobPost.employmentType?.types.includes("위촉직/개인사업자") && (
            <div className="inputfield">
              <div className="contractual_Layer">
                <div className="Layer-container">
                  <div className="box">
                    <div className="txt">근무기간</div>
                    <select
                      id="prod2"
                      name="employmentType.workingPeriod"
                      className="nice-select"
                      onChange={handleSelectChange}
                      // value={jobPost.employmentType?.workingPeriod}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}개월
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="peopleAmountSection">
          <h5 className="CheckLabel">
            모집인원<strong>*</strong>
          </h5>
          <div
            className="row"
            style={{ fontSize: "14px", gap: "10px", height: "60px" }}
          >
            <div className="checkBoxRow">
              <CheckBox
                isChecked={jobPost.recruitmentCount?.type === "direct"}
                setIsChecked={(value) =>
                  setJobPost((prev) => ({
                    ...prev,
                    recruitmentCount: {
                      ...prev.recruitmentCount,
                      type: "direct",
                    },
                  }))
                }
              />
              <p>직접입력</p>
            </div>
            {jobPost.recruitmentCount?.type === "direct" && (
              <div className="flexGap10" style={{ alignItems: "center" }}>
                <div
                  className="input_default"
                  style={{ width: "72px", fontSize: "14px" }}
                >
                  <input
                    type="number"
                    className="input_num"
                    value={jobPost.recruitmentCount?.count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setJobPost((prev) => ({
                        ...prev,
                        recruitmentCount: {
                          ...prev.recruitmentCount,
                          count: val,
                        },
                      }));
                    }}
                  />
                </div>
                <p>명</p>
              </div>
            )}
          </div>
          <div className="row mt-30">
            {["1명", "2명", "3명"].map((label, index) => {
              const countValue = index + 1;
              return (
                <div className="checkBoxRow" key={label}>
                  <CheckBox
                    isChecked={
                      jobPost.recruitmentCount?.type === "preset" &&
                      jobPost.recruitmentCount?.count === countValue
                    }
                    setIsChecked={(value) =>
                      setJobPost((prev) => ({
                        ...prev,
                        recruitmentCount: {
                          ...prev.recruitmentCount,
                          type: "preset",
                          count: countValue,
                        },
                      }))
                    }
                  />
                  <p style={{ fontSize: "14px" }}>{label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <h4 className="sectionTitle">지원자격은 어떤 것들이 있나요?</h4>
        <div className="item">
          <section className="educationSection">
            <h3 className="rowTitle">
              학력<strong>*</strong>
            </h3>
            <div className="flexGap10">
              <div
                className={`input_default ${getErrorClass("education")}`}
                id="field-education"
              >
                <select
                  className="w-full"
                  name="qualification.education.level"
                  onChange={handleSelectChange}
                  value={jobPost.qualification?.education.level}
                >
                  <option value="학력무관">학력무관</option>
                  <option value="고등학교졸업">고등학교졸업</option>
                  <option value="대학졸업(2,3년)">대학졸업(2,3년)</option>
                  <option value="대학교졸업(4년)">대학교졸업(4년)</option>
                  <option value="대학원 석사졸업">대학원 석사졸업</option>
                  <option value="대학원 박사졸업">대학원 박사졸업</option>
                </select>
              </div>
              <label className="checkBox">
                <CheckBox
                  isChecked={
                    jobPost.qualification?.education.isExpectedGraduate
                  }
                  setIsChecked={(value: boolean) =>
                    setJobPost((prev) => ({
                      ...prev,
                      qualification: {
                        ...prev.qualification,
                        education: {
                          ...prev.qualification.education,
                          isExpectedGraduate: value,
                        },
                      },
                    }))
                  }
                />
                졸업예정자 가능
              </label>
            </div>
          </section>
        </div>

        <section className="prioritySection">
          <h3 className="rowTitle">선택항목</h3>
          <div className="gridSection">
            {[
              { key: "specialCondition", label: "우대조건" },
              { key: "language", label: "외국어" },
              { key: "license", label: "자격증" },
              { key: "specialMajor", label: "우대전공" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className={`gridRow ${
                  selectedPriorityTab.includes(key) ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedPriorityTab((prev) =>
                    prev.includes(key)
                      ? prev.filter((t) => t !== key)
                      : [...prev, key]
                  )
                }
              >
                {/* SVG 아이콘 */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.12695 0.5C4.43495 0.5 0.626953 4.308 0.626953 9C0.626953 13.692 4.43495 17.5 9.12695 17.5C13.819 17.5 17.627 13.692 17.627 9C17.627 4.308 13.819 0.5 9.12695 0.5ZM9.12695 15.8C5.37845 15.8 2.32695 12.7485 2.32695 9C2.32695 5.2515 5.37845 2.2 9.12695 2.2C12.8755 2.2 15.927 5.2515 15.927 9C15.927 12.7485 12.8755 15.8 9.12695 15.8ZM13.0285 5.243L7.42695 10.8445L5.22545 8.6515L4.02695 9.85L7.42695 13.25L14.227 6.45L13.0285 5.243Z"
                    fill="#CBCBCB"
                  />
                </svg>
                {label}
              </div>
            ))}
          </div>
        </section>
        {selectedPriorityTab.includes("specialCondition") && (
          <>
            {" "}
            <div className="inputColumnRow">
              <p>우대조건</p>
              <div
                className="input_default "
                style={{ minHeight: "60px", height: "auto" }}
              >
                <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
                  {displayLabels.specialCondition.length ? (
                    displayLabels.specialCondition.map((condition, index) => (
                      <div key={index} className="items">
                        <div className="label">{condition}</div>
                      </div>
                    ))
                  ) : (
                    <div className="items noitem">우대조건 선택해 주세요</div>
                  )}
                </div>
                <button onClick={openPreferenceModal} className="openPopupBtn">
                  전체보기
                </button>
              </div>
            </div>
          </>
        )}
        {selectedPriorityTab.includes("language") && (
          <>
            {" "}
            <div className="inputColumnRow">
              <p>외국어</p>
              <div
                className="input_default"
                style={{ minHeight: "60px", height: "auto" }}
              >
                <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
                  {displayLabels.language.length ? (
                    displayLabels.language.map((lang, index) => (
                      <div key={index} className="items">
                        <div className="label">{lang}</div>
                      </div>
                    ))
                  ) : (
                    <div className="items noitem">외국어 선택해 주세요.</div>
                  )}
                </div>
                <button onClick={openLanguageModal} className="openPopupBtn">
                  전체보기
                </button>
              </div>
            </div>
          </>
        )}
        {selectedPriorityTab.includes("license") && (
          <>
            {" "}
            <div className="inputColumnRow w-full">
              <h5>자격증</h5>
              <div
                className="input_default"
                style={{ minHeight: "60px", height: "auto" }}
              >
                <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
                  {displayLabels.license.length ? (
                    displayLabels.license.map((lic, index) => (
                      <div key={index} className="items">
                        <div className="label">{lic}</div>
                      </div>
                    ))
                  ) : (
                    <div className="items noitem">자격증 선택해 주세요.</div>
                  )}
                </div>
                <button onClick={openLicenseModal} className="openPopupBtn">
                  전체보기
                </button>
              </div>
            </div>
          </>
        )}
        {selectedPriorityTab.includes("specialMajor") && (
          <>
            {" "}
            <div className="inputColumnRow w-full">
              <h5>우대전공</h5>
              <div
                className="input_default"
                style={{ minHeight: "60px", height: "auto" }}
              >
                <div className="flexGap10 w-full" style={{ flexWrap: "wrap" }}>
                  {displayLabels.specialMajor.length ? (
                    displayLabels.specialMajor.map((major, index) => (
                      <div key={index} className="items">
                        <div className="label">{major}</div>
                      </div>
                    ))
                  ) : (
                    <div className="items noitem">우대전공 선택해 주세요.</div>
                  )}
                </div>
                <button onClick={openMajorModal} className="openPopupBtn">
                  전체보기
                </button>
              </div>
            </div>
          </>
        )}

        <h4 className="sectionTitle">근무조건을 입력해 주세요.</h4>
        <section className="conditionSection">
          <h5 className="sectionTitle2">
            급여<strong>*</strong>
          </h5>
          <div
            className={`input_default ${getErrorClass("salary")}`}
            id="field-salary"
          >
            <select
              className={`w-full ${getErrorClass("salary")}`}
              name="workConditions.salary.type"
              onChange={handleSelectChange}
              value={jobPost.workConditions?.salary.type}
            >
              <option value="연봉">연봉</option>
              <option value="월급">월급</option>
              <option value="주급">주급</option>
              <option value="일급">일급</option>
              <option value="시급">시급</option>
              <option value="건별">건별</option>
              <option value="회사내규에 따름">회사내규에 따름</option>
            </select>
          </div>
          <div className="flexGap10 mt-10">
            <div className={`input_default w-full ${getErrorClass("salary")}`}>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                className="w-full"
                name="workConditions.salary.min"
                disabled={isSalaryDisabled}
                placeholder="최소급여"
                style={{ textAlign: "right" }}
                value={
                  jobPost.workConditions.salary.min
                    ? Number(jobPost.workConditions.salary.min).toLocaleString()
                    : ""
                }
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
            </div>
            ~
            <div className={`input_default w-full ${getErrorClass("salary")}`}>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                className="w-full"
                name="workConditions.salary.max"
                disabled={isSalaryDisabled}
                placeholder="최대급여"
                style={{ textAlign: "right" }}
                value={
                  jobPost.workConditions.salary.max
                    ? Number(jobPost.workConditions.salary.max).toLocaleString()
                    : ""
                }
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
            </div>
          </div>
          <div className="flexGap10 mt-15">
            <CheckBox
              isChecked={jobPost.workConditions?.salary.isInterviewDecided}
              setIsChecked={(value) =>
                setJobPost((prev) => ({
                  ...prev,
                  workConditions: {
                    ...prev.workConditions,
                    salary: {
                      ...prev.workConditions.salary,
                      isInterviewDecided: value,
                    },
                  },
                }))
              }
            />
            <p>면접 후 결정</p>
          </div>
          <ErrorMessage field="salary" />
          <div className="flexGap10 mt-30">
            <CheckBox
              isChecked={jobPost.workConditions?.salary.isMinimumWage}
              setIsChecked={(value) =>
                setJobPost((prev) => ({
                  ...prev,
                  workConditions: {
                    ...prev.workConditions,
                    salary: {
                      ...prev.workConditions.salary,
                      isMinimumWage: value,
                    },
                  },
                }))
              }
            />
            <p>
              당사는 본 채용 건과 관련하여 '최저임금법'을 준수하며, 최저임금
              미만의 공고는 강제 마감될 수 있음을 동의합니다. (최저임금법 위반
              시 3년 이하의 징역 또는 2천만원 이하의 벌금에 처함)
            </p>
          </div>
        </section>
        <section className="addressSection">
          <div className="item">
            <h5 className="sectionTitle2">
              근무지주소<strong>*</strong>
            </h5>
            <div className="selects">
              {/* 국내 */}
              <div className="flexGap10">
                <CheckBox
                  isChecked={jobPost.workConditions.location.type === "국내"}
                  setIsChecked={() =>
                    setJobPost((prev) => ({
                      ...prev,
                      workConditions: {
                        ...prev.workConditions,
                        location: {
                          ...prev.workConditions.location,
                          type: "국내",
                        },
                      },
                    }))
                  }
                />
                <p>국내</p>
              </div>

              {/* 해외 */}
              <div className="flexGap10">
                <CheckBox
                  isChecked={jobPost.workConditions.location.type === "해외"}
                  setIsChecked={() =>
                    setJobPost((prev) => ({
                      ...prev,
                      workConditions: {
                        ...prev.workConditions,
                        location: {
                          ...prev.workConditions.location,
                          type: "해외",
                        },
                      },
                    }))
                  }
                />
                <p>해외</p>
              </div>

              <div className="flexGap10">
                <CheckBox
                  isChecked={jobPost.workConditions?.location.isRemoteAvailable}
                  setIsChecked={(value) =>
                    setJobPost((prev) => ({
                      ...prev,
                      workConditions: {
                        ...prev.workConditions,
                        location: {
                          ...prev.workConditions.location,
                          isRemoteAvailable: value,
                        },
                      },
                    }))
                  }
                />
                <p>재택근무 가능</p>
              </div>
            </div>

            <div
              className={`input_default ${getErrorClass("address")}`}
              id="field-address"
            >
              {jobPost.workConditions.location.type === "해외" ? (
                // 해외일 경우 직접 입력
                <input
                  placeholder="해외 주소를 입력해주세요."
                  value={jobPost.workConditions.location.address}
                  onChange={(e) =>
                    setJobPost((prev) => ({
                      ...prev,
                      workConditions: {
                        ...prev.workConditions,
                        location: {
                          ...prev.workConditions.location,
                          address: e.target.value,
                        },
                      },
                    }))
                  }
                  style={{ width: "100%" }}
                />
              ) : (
                // 국내일 경우 기존 모달 조회
                <>
                  <p style={{ flex: 1, margin: 0 }}>
                    {jobPost.workConditions.location.address ||
                      "주소를 선택해주세요."}
                  </p>
                  <button onClick={() => setIsOpenPost(true)}>찾기</button>
                </>
              )}
            </div>
            <div className="input_default mt-4">
              <input
                placeholder="상세주소를 입력해주세요"
                onChange={(e) => {
                  setJobPost((prev) => ({
                    ...prev,
                    workConditions: {
                      ...prev.workConditions,
                      location: {
                        ...prev.workConditions.location,
                        address_detail: e.target.value,
                      },
                    },
                  }));
                }}
              />
            </div>
          </div>
          <ErrorMessage field="address" />

          <div className="item">
            <h5 className="sectionTitle2">
              근무지역<strong>*</strong>
            </h5>
            <div
              className="input_default"
              style={{ minHeight: "60px", height: "auto" }}
            >
              <div
                className={`flexGap10 w-full ${getErrorClass("region")}`}
                style={{ flexWrap: "wrap" }}
                id="field-region"
              >
                {displayLabels.region.length === 0 && (
                  <div className="items noitem">선택해주세요.</div>
                )}
                {displayLabels.region.map((region, index) => (
                  <div key={index} className="items">
                    <div className="label" style={{ textWrap: "nowrap" }}>
                      {region}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsWorklocationModalOpen(true)}>
                전체보기
              </button>
            </div>
            <ErrorMessage field="region" />
          </div>

          <div className="item">
            <h5 className="sectionTitle2">
              근무요일<strong>*</strong>
            </h5>
            <div
              className={`input_default ${getErrorClass("workingDay")}`}
              id="field-workingDay"
            >
              <select
                className="w-full"
                name="workConditions.workingDay.type"
                onChange={handleSelectChange}
                value={jobPost.workConditions?.workingDay.type}
              >
                <option value="주5일">주5일</option>
                <option value="주6일">주6일</option>
                <option value="격주휴무">격주휴무</option>
                <option value="격일근무">격일근무</option>
                <option value="협의가능">협의가능</option>
              </select>
            </div>
            <ErrorMessage field="workingDay" />
          </div>

          <div className="item">
            <h5 className="sectionTitle2">근무시간</h5>
            <div className={`time-wrap ${getErrorClass("workingHours")}`}>
              <div className="flexGap10 items-center">
                <div className="input_default">
                  <select
                    className="w-full"
                    name="workConditions.workingHours.startHour"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions?.workingHours.startHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}시
                      </option>
                    ))}
                  </select>
                </div>
                <span>~</span>
                <div className="input_default">
                  <select
                    className="w-full"
                    name="workConditions.workingHours.endHour"
                    onChange={handleSelectChange}
                    value={jobPost.workConditions?.workingHours.endHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}시
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <ErrorMessage field="workingHours" />
          </div>
        </section>

        <h3 className="sectionTitle">접수기간과 방법을 선택해 주세요.</h3>

        <section className="PeriodSection">
          <h3 className="sectionTitle2">
            접수기간<strong>*</strong>
          </h3>
          <div
            className={`flexGap10 mb-15 ${getErrorClass("applicationPeriod")}`}
            style={{ flexDirection: "row" }}
            id="field-applicationPeriod"
          >
            <div className="input_default">
              <div
                className="dateBox w05"
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <i className="fa-regular fa-calendar-days"></i>
                <DatePicker
                  id="receptsdate"
                  className="form-control"
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
                        ).padStart(2, "0")}-${String(date.getDate()).padStart(
                          2,
                          "0"
                        )}`
                      : "";
                    handleInputChange({
                      target: {
                        name: "applicationPeriod.start.date",
                        value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                />
              </div>
            </div>
            <div className="input_default" style={{ width: "35%" }}>
              <select
                className="w-full"
                name="applicationPeriod.start.time"
                onChange={handleSelectChange}
                value={jobPost.applicationPeriod?.start.time}
              >
                {[
                  "00:00",
                  "01:00",
                  "02:00",
                  "03:00",
                  "04:00",
                  "05:00",
                  "06:00",
                  "07:00",
                  "08:00",
                  "09:00",
                  "10:00",
                  "11:00",
                  "12:00",
                  "13:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                  "18:00",
                  "19:00",
                  "20:00",
                  "21:00",
                  "22:00",
                  "23:00",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className={`flexGap10 mb-15 ${getErrorClass("applicationPeriod")}`}
            style={{ flexDirection: "row" }}
          >
            <div className="input_default">
              <div
                className="dateBox w05"
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <i className="fa-regular fa-calendar-days"></i>
                <DatePicker
                  id="receptedate"
                  name="applicationPeriod.end.date"
                  className="form-control"
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
                        ).padStart(2, "0")}-${String(date.getDate()).padStart(
                          2,
                          "0"
                        )}`
                      : "";
                    handleInputChange({
                      target: { name: "applicationPeriod.end.date", value },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                />
              </div>
            </div>
            <div className="input_default" style={{ width: "35%" }}>
              <select
                className="w-full"
                name="applicationPeriod.end.time"
                onChange={handleSelectChange}
                value={jobPost.applicationPeriod?.end.time}
              >
                {[
                  "00:00",
                  "01:00",
                  "02:00",
                  "03:00",
                  "04:00",
                  "05:00",
                  "06:00",
                  "07:00",
                  "08:00",
                  "09:00",
                  "10:00",
                  "11:00",
                  "12:00",
                  "13:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                  "18:00",
                  "19:00",
                  "20:00",
                  "21:00",
                  "22:00",
                  "23:00",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="input_default">
            <select
              className="w-full"
              name="applicationPeriod.type"
              onChange={handleSelectChange}
              value={jobPost.applicationPeriod?.type}
            >
              <option value="접수기간 후 마감">접수기간 후 마감</option>
              <option value="채용시 마감">채용시 마감</option>
              <option value="상시채용">상시채용</option>
            </select>
          </div>
          <ErrorMessage field="applicationPeriod" />
        </section>

        <section className="howToSection contents-wrap">
          <h3 className="sectionTitle2">
            접수방법<strong>*</strong>
          </h3>
          <div
            className={`selects ${getErrorClass("applicationMethod")}`}
            id="field-applicationMethod"
          >
            {[
              "유어잡 지원(즉시지원)",
              "홈페이지",
              "우편",
              "방문",
              "e-메일",
              "fax",
            ].map((method) => (
              <div className="flexGap10" key={method}>
                <CheckBox
                  isChecked={jobPost.applicationMethod?.methods.includes(
                    method
                  )}
                  setIsChecked={(checked) =>
                    handleCheckboxGroupChange({
                      target: {
                        name: "applicationMethod.methods",
                        value: method,
                        checked, // ★ checked 값을 추가로 넘겨 줍니다
                      },
                    } as any)
                  }
                />
                <p style={{ fontSize: "14px", paddingBottom: "6px" }}>
                  {method}
                </p>
              </div>
            ))}
          </div>
          <ErrorMessage field="applicationMethod" />
        </section>
        <div className="contents-wrap">
          {!jobPost.applicationMethod.methods.includes("홈페이지") && (
            <>
              <h3 className="sectionTitle2">
                이력서<strong>*</strong>
              </h3>
              <div className="flexwrap">
                <div className="flexGap10">
                  <CheckBox
                    isChecked={
                      jobPost.applicationMethod?.resumeTypes.useYourJob
                    }
                    setIsChecked={(value) =>
                      setJobPost((prev) => ({
                        ...prev,
                        applicationMethod: {
                          ...prev.applicationMethod,
                          resumeTypes: {
                            ...prev.applicationMethod.resumeTypes,
                            useYourJob: value,
                          },
                        },
                      }))
                    }
                  />
                  <p>유어잡 양식</p>
                </div>
                <div className="flexGap10">
                  <CheckBox
                    isChecked={
                      jobPost.applicationMethod?.resumeTypes.useCompanyFormat
                    }
                    setIsChecked={(value) =>
                      setJobPost((prev) => ({
                        ...prev,
                        applicationMethod: {
                          ...prev.applicationMethod,
                          resumeTypes: {
                            ...prev.applicationMethod.resumeTypes,
                            useCompanyFormat: value,
                          },
                        },
                      }))
                    }
                  />
                  <p>자사양식</p>
                </div>
              </div>

              {jobPost.applicationMethod?.resumeTypes.useCompanyFormat && (
                <>
                  {/* 숨겨진 file input */}
                  <input
                    type="file"
                    ref={yourJobFileInputRef}
                    name="applicationMethod.resumeTypes.companyFormatFiles"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    multiple
                  />
                  <button
                    className="input_default mt-20"
                    onClick={() => yourJobFileInputRef.current?.click()}
                  >
                    {jobPost.applicationMethod?.resumeTypes
                      .companyFormatFiles &&
                    jobPost.applicationMethod?.resumeTypes.companyFormatFiles
                      .length > 0 ? (
                      <>
                        <div className="fileicon">
                          {" "}
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
                        {jobPost.applicationMethod?.resumeTypes.companyFormatFiles.map(
                          (file, idx) => (
                            <div className="items" key={idx}>
                              {file?.filename ||
                                file?.apo_file_nm ||
                                file?.file?.name}
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      <span>선택해주세요.</span>
                    )}
                  </button>
                  <ErrorMessage field="resume" />
                </>
              )}
            </>
          )}

          {jobPost.applicationMethod?.methods.includes("홈페이지") && (
            <>
              <h3 className="sectionTitle2">
                홈페이지<strong>*</strong>
              </h3>
              <div
                id="field-homepage"
                className={`input_default ${getErrorClass("homepage")}`}
              >
                <input
                  placeholder="홈페이지 url"
                  name="applicationMethod.homepage"
                  value={jobPost.applicationMethod?.homepage}
                  onChange={handleInputChange}
                />
              </div>
              <ErrorMessage field="homepage" />
            </>
          )}
        </div>
        <h4 className="sectionTitle">우리기업의 정보가 맞나요?</h4>
        <section className="infoValiSection">
          <h5 className="sectionTitle2">
            담당자명<strong>*</strong>
          </h5>
          <div
            className={`input_default ${getErrorClass("name")}`}
            id="field-name"
          >
            <input
              placeholder="담당자명 입력"
              name="companyInfo.name"
              value={jobPost.companyInfo?.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="flexGap10 mt-10">
            <CheckBox
              isChecked={jobPost.companyInfo?.namePrivate}
              setIsChecked={(value) =>
                setJobPost((prev) => ({
                  ...prev,
                  companyInfo: { ...prev.companyInfo, namePrivate: value },
                }))
              }
            />
            <p>비공개</p>
          </div>
          <ErrorMessage field="name" />
          <h5 className="sectionTitle2 mt-20">
            연락처<strong>*</strong>
          </h5>
          <div
            className={`flexGap10 ${getErrorClass("phone")}`}
            id="field-phone"
          >
            <div className="input_default">
              <input
                placeholder="00"
                name="companyInfo.phoneField1"
                value={jobPost.companyInfo?.phoneField1}
                onChange={handleInputChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            -
            <div className="input_default">
              <input
                placeholder="00"
                name="companyInfo.phoneField2"
                value={jobPost.companyInfo?.phoneField2}
                onChange={handleInputChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            -
            <div className="input_default">
              <input
                placeholder="00"
                name="companyInfo.phoneField3"
                value={jobPost.companyInfo?.phoneField3}
                onChange={handleInputChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="flexGap10 mt-10">
            <CheckBox
              isChecked={jobPost.companyInfo?.phonePrivate}
              setIsChecked={(value) =>
                setJobPost((prev) => ({
                  ...prev,
                  companyInfo: { ...prev.companyInfo, phonePrivate: value },
                }))
              }
            />
            <p>비공개</p>
          </div>
          <ErrorMessage field="phone" />
          <h5 className="sectionTitle2 mt-20">
            업종<strong>*</strong>
          </h5>
          <div
            className={`input_default ${getErrorClass("industry")}`}
            id="field-industry"
            style={{ minHeight: "60px", height: "auto" }}
          >
            <div className="flexGap10" style={{ flexWrap: "wrap" }}>
              {displayLabels.industry.length === 0 && (
                <div className="items noitem">선택해주세요.</div>
              )}
              {displayLabels.industry.map((industry, index) => (
                <div key={index} className="items">
                  <div className="label">{industry}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsIndustryModalOpen(true)}
              style={{ fontSize: "14px", textWrap: "nowrap" }}
            >
              전체보기
            </button>
          </div>
          <ErrorMessage field="industry" />
          <button
            className="blueBtn mt-35"
            onClick={handleSubmit}
            style={{ height: "50px" }}
          >
            {id ? "수정하기" : "입력한 내용으로 적용"}
          </button>
        </section>

        <div className="inputfield mt-10" style={{ height: "540px" }}>
          <Editor
            value={jobPost.content}
            // onValueChange={setJobPost((prev) => ({...prev,content: }))}
            onValueChange={(value: string) =>
              setJobPost((prev) => ({ ...prev, content: value }))
            }
            setImageName={function (value: string[]): void {}}
            height={400}
          />
        </div>

        <div id="field-terms" className="termsSection">
          <div className="title">
            약관 동의<span>*</span>
          </div>
          <input
            type="checkbox"
            id="term1"
            name="terms.sensitiveInfo"
            value="true"
            onChange={handleCheckboxChange}
            checked={jobPost.terms?.sensitiveInfo}
          />
          <label htmlFor="term1" className="termlabel mb13">
            <span className="essential" style={{ color: "red" }}>
              (필수)
            </span>
            민감정보 수집에 동의합니다.{" "}
            <i className="fa-solid fa-angle-down"></i>
          </label>

          <div
            className="term_info"
            id="termCon1"
            style={{
              display: jobPost.terms?.sensitiveInfo ? "block" : "none",
            }}
          >
            <p>
              채용공고 등록을 위해 아래와 같이 개인정보를 수집 및 이용합니다.
            </p>
            <p className="mb15">
              동의를 거부할 권리가 있으며, 동의 거부 시 채용공고 등록이
              불가합니다.
            </p>
            <p>
              목적 : 채용정보 등록자 확인 및 관리, 구직자 지원 및 문의. 등록
              결과 안내 및 고객불만처리. 각종 맞춤형 서비스 제공
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
            checked={jobPost.terms?.personalInfo}
          />
          <label htmlFor="term2" className="termlabel mb13">
            (선택)민감정보 수집에 동의합니다.{" "}
            <i className="fa-solid fa-angle-down"></i>
          </label>

          <div
            className="term_info"
            id="termCon2"
            style={{
              display: jobPost.terms?.personalInfo ? "block" : "none",
            }}
          >
            <p>
              채용공고 등록을 위해 아래와 같이 개인정보를 수집 및 이용합니다.
            </p>
            <p className="mb15">
              동의를 거부할 권리가 있으며, 동의 거부 시 채용공고에 선택항목
              등록이 불가합니다.
            </p>
            <p>
              목적 : 채용정보 등록자 확인 및 관리, 구직자 지원 및 문의. 등록
              결과 안내 및 고객불만처리. 각종 맞춤형 서비스 제공
            </p>
            <p>항목 : 부서명, 휴대폰번호</p>
            <p>보유 및 이용기간 : 회원 탈퇴 시 즉시 파기</p>
          </div>
        </div>

        <div className="flexGap10 btn-foot mt-20">
          <button className="blueBtn" onClick={handleSubmit}>
            {id ? "수정하기" : "등록하기"}
          </button>
          <button className="whiteBtn" onClick={handleCancelJobPost}>
            취소
          </button>
        </div>
      </section>
      {isJobTypeModalOpen && (
        <JopTypePopUp
          isOpen={isJobTypeModalOpen}
          onClose={closeJobTypeModal}
          onSelect={handleJobTypeSelect}
          initialSelected={jobPost.jobType || []}
        />
      )}
      {isSkillTypeModalOpen && (
        <SkillTypePopUp
          isOpen={isSkillTypeModalOpen}
          onClose={closeSkillTypeModal}
          onSelect={handleSkillTypeSelect}
          initialSelected={jobPost.skills || []}
        />
      )}
      {isCapacityTypeModalOpen && (
        <CapacityPopUp
          isOpen={isCapacityTypeModalOpen}
          onClose={closeCapacityTypeModal}
          onSelect={handleCapacityTypeSelect}
          initialSelected={jobPost.capabilities || []}
        />
      )}
      {isPreferenceModalOpen && (
        <PreferencePopUp
          isOpen={isPreferenceModalOpen}
          onClose={closePreferenceModal}
          onSelect={handlePreferenceSelect}
          initialSelected={
            jobPost.qualification?.preferences?.specialCondition || []
          }
        />
      )}
      {isLanguageModalOpen && (
        <LanguagePopUp
          isOpen={isLanguageModalOpen}
          onClose={closeLanguageModal}
          onSelect={handleLanguageSelect}
          initialSelected={jobPost.qualification?.preferences?.language || []}
        />
      )}
      {isLicenseModalOpen && (
        <LicensePopUp
          isOpen={isLicenseModalOpen}
          onClose={closeLicenseModal}
          onSelect={handleLicenseSelect}
          initialSelected={jobPost.qualification?.preferences?.license || []}
        />
      )}
      {isMajorModalOpen && (
        <MajorPopUp
          isOpen={isMajorModalOpen}
          onClose={closeMajorModal}
          onSelect={handleMajorSelect}
          initialSelected={
            jobPost.qualification?.preferences?.specialMajor || []
          }
        />
      )}
      {isWorklocationModalOpen && (
        <WorkLocationPopUp
          isOpen={isWorklocationModalOpen}
          onClose={closeWorklocationModal}
          onSelect={handleWorklocationSelect}
          initialSelected={jobPost.workConditions?.location.region}
          isGlobal={jobPost.workConditions.location.type === "해외"}
        />
      )}
      {isIndustryModalOpen && (
        <IndustryPopUp
          isOpen={isIndustryModalOpen}
          onClose={closeIndustryModal}
          onSelect={handleIndustrySelect}
          initialSelected={jobPost.companyInfo?.industry}
        />
      )}
      <MainFooter />
    </div>
  );
}
