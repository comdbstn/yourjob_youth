import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Layout from "../layout/Layout";
import NiceSelectBox from "../common/NiceSelectBox";
import "../../../public/css/mypage.css";
import { formatBirthAndAge, formatGender } from "../../utils/formatUtils";
import { resumeApi } from "../../api/resume";
import { ResumeForm, Apostille } from "../../types/resume";
import { userApi } from "../../api/user";
import { UserProfile } from "../../types/user";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import {
  careerTypeOptions,
  schoolOptions,
  gradStatusOptions,
  languageOptions,
  languageLevelOptions,
  internTypeOptions,
  disabledLevelOptions,
  militaryServiceOptions,
  militaryServiceClassOptions,
  CareerType,
  VisaType,
  VisaStatusText,
  majorTypeOptions,
  fetchAreaOptions,
  areaOptions,
} from "../../app/dummy/options";
import { useOperationData } from "../../hooks/useOperationData";
import {
  OperationDataResponse,
  OperationDataType,
} from "../../types/operationData";
import SearchableInput from "../common/SearchableInput";
import "../../../public/css/searchableInput.css";
import { useAlert } from "../../contexts/AlertContext";
import getOperationData from "../../api/operatuibData";
import { mapOperationCodesToLabels } from "../../services/mapCodesToLabels";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ResumeWrite: React.FC = () => {
  const [regionData, setRegionData] = useState<OperationDataResponse>();
  useEffect(() => {
    getOperationData("00000002").then((res) => setRegionData(res));
  }, []);
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);

  const gbn = searchParams.get("gbn") || "";
  registerLocale("ko", ko);
  const parseYearMonth = (value: string): Date | null => {
    if (!value) return null;
    const [yStr, mStr] = value.split("-");
    const year = Number(yStr);
    const month = Number(mStr);
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      year < 1900 ||
      month < 1 ||
      month > 12
    ) {
      return null;
    }
    const d = new Date(year, month - 1, 1);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    const sessionData = sessionStorage.getItem("userType");
    const userData = sessionStorage.getItem("userId");

    if (sessionData === "ADMIN") {
      setIsAdmin(true);
    }

    console.log(sessionData, userData);
  }, []);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreeToSensitiveInfo, setAgreeToSensitiveInfo] = useState<boolean>(
    !!id
  );

  const [areaOptionsState, setAreaOptionsState] = useState(areaOptions);
  const loadAreaOptions = async () => {
    const options = await fetchAreaOptions();
    setAreaOptionsState(options);
  };

  useEffect(() => {
    loadAreaOptions(); // 지역 옵션 로딩 추가
  }, [id]);

  const [resumeForm, setResumeForm] = useState<ResumeForm>({
    title: "",
    picturePath: "",
    name: "홍길동",
    englishName: "Hong Gil Dong",
    birth: "1990-01-01",
    gender: "M",
    careerType: "JUNIOR" as CareerType,
    phone: "010-1234-5678",
    address: "서울특별시 강남구 테헤란로 14길 6 남도빌딩 2층",
    email: "hong@gmail.com",
    nationality: "대한민국",
    visa: [VisaType.F2],
    educations: [
      {
        lastSchool: "",
        schoolName: "",
        department: "",
        admissionDate: "",
        graduationDate: "",
        graduationStatus: "",
        totalCredits: "",
        gpa: "",
        transferStatus: false,
        region: "",
        additionalMajor: "",
        additionalMajorType: "",
      },
    ],
    languages: [
      {
        language: "",
        speakingLevel: "",
        writingLevel: "",
        readingLevel: "",
      },
    ],
    careers: [],
    activities: [],
    apostilles: [{}],
    certifications: [],
    awards: [],
    employmentPreferences: {
      isVeteran: false,
      isEmploymentProtected: false,
      isEmploymentSupport: false,
      isDisabled: false,
      disabledGrade: "",
      hasMilitaryService: false,
      militaryServiceStatus: "",
      militaryServiceJoinDate: "",
      militaryServiceOutDate: "",
      militaryServiceClass: "",
    },
    selfIntroductions: [
      {
        title: "",
        content: "",
      },
    ],
  });

  // 초기 상태에서 첫 번째 교육 항목의 학점 섹션 활성화
  useEffect(() => {
    toggleGPA(0);
  }, []);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    englishName: "",
    birth: "",
    nationality: "",
    visa: [],
    email: "",
    phone: "",
    gender: "M",
    address: "",
    address_detail: "",
    zip_code: "",
    profileImage: "",
  });
  //
  const { customAlert, customConfirm } = useAlert();

  // 학력 관련 상태 추가
  const [showGPA, setShowGPA] = useState<{ [key: number]: boolean }>({});
  const [showRegion, setShowRegion] = useState<{ [key: number]: boolean }>({});
  const [showAdditionalMajor, setShowAdditionalMajor] = useState<{
    [key: number]: boolean;
  }>({});

  // 토글 핸들러 함수들
  const toggleGPA = (index: number) => {
    setShowGPA((prev) => {
      const next = !prev[index];
      // off 상태가 되면 GPA 관련 값 초기화
      if (!next) {
        setResumeForm((prev) => ({
          ...prev,
          educations: prev.educations.map((edu, i) =>
            i === index
              ? {
                  ...edu,
                  totalCredits: "",
                  gpa: "",
                  transferStatus: false,
                }
              : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };
  const initialForm = React.useRef(JSON.stringify(resumeForm));

  // 저장된 초기 상태와 다르면 true
  const hasUnsavedChanges = JSON.stringify(resumeForm) !== initialForm.current;
  useEffect(() => {
    // 1) SPA 내 뒤로가기(팝스테이트) 핸들러
    const handlePopState = (e: PopStateEvent) => {
      const userType = sessionStorage.getItem("userType");

      if (userType === "ADMIN") {
        setIsAdmin(true);
      }

      // 관리자인 경우 href로 이동
      if (isAdmin) {
        window.location.href = "/admin/Resumes.html";
      }

      if (!hasUnsavedChanges) {
        // 변경사항 없으면 그냥 뒤로가기
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
        return;
      }
      const leave = window.confirm(
        "저장되지 않은 변경사항이 있습니다. 정말 이동하시겠습니까?"
      );
      if (leave) {
        // 사용자가 이동 확인을 눌렀으면, 이벤트 리스너 해제 후 뒤로가기 허용
        window.removeEventListener("popstate", handlePopState);
        navigate(-1);
        window.history.back();
      } else {
        // 취소하면 현재 URL을 다시 푸시해서 뒤로가기를 막음
        // window.history.pushState(null, "", window.location.href);
      }
    };

    // 2) 새로고침/탭닫기 경고
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };

    // 3) 초기 스택 한 번만 푸시: 뒤로가기를 가로채기 위한 버퍼
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const toggleAdditionalMajor = (index: number) => {
    setShowAdditionalMajor((prev) => {
      const next = !prev[index];
      // off 상태가 되면 추가전공 초기화
      if (!next) {
        setResumeForm((prev) => ({
          ...prev,
          educations: prev.educations.map((edu, i) =>
            i === index
              ? {
                  ...edu,
                  additionalMajor: "",
                  additionalMajorType: "",
                }
              : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      customAlert({
        content: "파일 크기는 5MB 이하여야 합니다.",
      });
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      customAlert({
        content: "이미지 파일만 업로드 가능합니다.",
      });
      return;
    }

    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setSelectedImage(file);

    // 수정일 때만 즉시 업로드
    if (id && gbn !== "copy") {
      try {
        setIsUploading(true);
        const { picturePath } = await resumeApi.uploadResumeProfileImage(
          Number(id),
          file
        );
        setResumeForm((prev) => ({
          ...prev,
          picturePath,
        }));
        // 업로드 성공 시 미리보기 업데이트
        // setPreviewImage(picturePath);
        /*customAlert({
          content: "프로필 이미지가 성공적으로 변경되었습니다.",
        });*/
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        customAlert({
          content: "이미지 업로드에 실패했습니다.",
        });
        setPreviewImage("");
        setSelectedImage(null);
        URL.revokeObjectURL(previewUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleImageDelete = () => {
    setSelectedImage(null);
    setPreviewImage("");
    setResumeForm((prev) => ({ ...prev, picturePath: "" }));
  };
  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        try {
          const response = await resumeApi.getResumeDetail(Number(id));
          if (response.data) {
            const resumeData = response.data;

            const rawApostilles = Array.isArray(response.data.apostilles)
              ? response.data.apostilles
              : [];

            // 아포스티유 데이터를 File 객체로 변환
            const convertedApostilles = await Promise.all(
              rawApostilles.map(async (apostille: Apostille) => {
                if (apostille.apo_download_url) {
                  try {
                    const res = await fetch(apostille.apo_download_url);
                    const blob = await res.blob();
                    return {
                      ...apostille,
                      file: new File(
                        [blob],
                        apostille.apo_file_nm || "apostille.pdf",
                        { type: blob.type }
                      ),
                    };
                  } catch (error) {
                    console.error("아포스티유 파일 변환 실패:", error);
                    return apostille;
                  }
                }
                return apostille;
              })
            );
            // 학력 데이터에 따라 show 상태 설정
            const newShowGPA: { [key: number]: boolean } = {};
            const newShowRegion: { [key: number]: boolean } = {};
            const newShowAdditionalMajor: { [key: number]: boolean } = {};

            response.data.educations.forEach(
              (education: any, index: number) => {
                newShowGPA[index] = !!(education.totalCredits || education.gpa);
                newShowRegion[index] = !!education.region;
                newShowAdditionalMajor[index] = !!(
                  education.additionalMajor || education.additionalMajorType
                );
              }
            );

            setShowGPA(newShowGPA);
            setShowRegion(newShowRegion);
            setShowAdditionalMajor(newShowAdditionalMajor);
            // fetchUserProfile();
            setResumeForm((prev) => ({
              ...prev,
              ...response.data,
              apostilles: convertedApostilles,
            }));
            // 관리자인 경우 이력서 데이터에서 프로필 정보 추출
            const userType = sessionStorage.getItem("userType");

            if (userType === "ADMIN") {
              setIsAdmin(true);

              // birth 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
              const formatBirth = (birth: string) => {
                if (birth && birth.length === 8) {
                  return `${birth.substring(0, 4)}-${birth.substring(
                    4,
                    6
                  )}-${birth.substring(6, 8)}`;
                }
                return birth;
              };

              // visa 데이터 처리
              let visaArray: VisaType[] = [];
              if (resumeData.visa) {
                if (typeof resumeData.visa === "string") {
                  // 쉼표로 분리하여 배열로 변환
                  // "F-6,F-5,F-4,F-2,E-2,D-10" -> ["F-6", "F-5", ...]
                  const visaStrings = resumeData.visa
                    .split(",")
                    .map((v: string) => v.trim());

                  // VisaType으로 변환
                  visaArray = visaStrings
                    .map((v: string) => {
                      // VisaType enum의 값들과 비교
                      const matchedVisa = Object.values(VisaType).find(
                        (visaType: string) => visaType === v
                      );
                      return matchedVisa as VisaType | undefined;
                    })
                    .filter(
                      (v: VisaType | undefined): v is VisaType =>
                        v !== undefined
                    );
                } else if (Array.isArray(resumeData.visa)) {
                  visaArray = (resumeData.visa as string[])
                    .map((v: string) => {
                      const matchedVisa = Object.values(VisaType).find(
                        (visaType: string) => visaType === v
                      );
                      return matchedVisa as VisaType | undefined;
                    })
                    .filter(
                      (v: VisaType | undefined): v is VisaType =>
                        v !== undefined
                    );
                }
              }

              setUserProfile({
                name: resumeData.name || "",
                englishName: resumeData.englishName || "",
                birth: formatBirth(resumeData.birth) || "",
                nationality: resumeData.nationality || "",
                visa: visaArray,
                email: resumeData.email || "",
                phone: resumeData.phone || "",
                gender: resumeData.gender || "M",
                address: resumeData.address || "",
                address_detail: "",
                zip_code: "",
                profileImage: resumeData.picturePath || "",
              });

              setResumeForm((prev) => ({
                ...prev,
                ...resumeData,
                visa: visaArray,
                apostilles: convertedApostilles,
              }));
            } else {
              // 일반 사용자는 자신의 프로필 조회
              fetchUserProfile();
            }
          }
        } catch (error) {
          console.error("이력서 가져오기 실패:", error);
          customAlert({
            content: "이력서 정보를 불러오는 데 실패했습니다.",
          });
        }
      };
      fetchResume();
      fetchUserProfile();
    }
  }, [id]);
  const fetchUserProfile = async () => {
    try {
      const response = await userApi.getUserProfile();
      if (response) {
        setUserProfile(response);
        setResumeForm((prev) => ({
          ...prev,
          name: response.name,
          englishName: response.englishName,
          birth: response.birth,
          gender: response.gender,
          phone: response.phone,
          address: response.address,
          email: response.email,
          nationality: response.nationality,
          visa: response.visa,
        }));
      }
    } catch (error) {
      console.error("사용자 프로필 조회 실패:", error);
    }
  };
  useEffect(() => {
    // const fetchUserProfile = async () => {
    //   try {
    //     const response = await userApi.getUserProfile();
    //     if (response) {
    //       setUserProfile(response);
    //     }
    //   } catch (error) {
    //     console.error("사용자 프로필 조회 실패:", error);
    //   }
    // };
    fetchUserProfile();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    const inputValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setResumeForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ResumeForm] as object),
          [child]: inputValue,
        },
      }));
    } else {
      setResumeForm((prev) => ({
        ...prev,
        [name]: inputValue,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value === null) return; // null 값 처리

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setResumeForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ResumeForm] as object),
          [child]: value,
        },
      }));
    } else {
      setResumeForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEducationChange = (
    index: number,
    name: string,
    value: string | boolean
  ) => {
    const updatedEducations = resumeForm.educations.map((education, i) =>
      i === index ? { ...education, [name]: value } : education
    );

    setResumeForm({
      ...resumeForm,
      educations: updatedEducations,
    });
  };

  const addEducation = () => {
    const newEducation = {
      lastSchool: "",
      schoolName: "",
      department: "",
      admissionDate: "",
      graduationDate: "",
      graduationStatus: "",
      totalCredits: "",
      gpa: "",
      transferStatus: false,
      region: "",
      additionalMajor: "",
      additionalMajorType: "",
    };

    const newIndex = resumeForm.educations.length;

    setResumeForm({
      ...resumeForm,
      educations: [...resumeForm.educations, newEducation],
    });

    toggleGPA(newIndex);
  };

  const removeEducation = (index: number) => {
    const updatedEducations = resumeForm.educations.filter(
      (education, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      educations: updatedEducations,
    });
  };

  const removeAllEducation = async () => {
    if (
      await customConfirm({
        content: "모든 학력 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        educations: [],
      });
    }
  };

  const handleLanguageChange = (index: number, name: string, value: string) => {
    const updatedLanguages = resumeForm.languages.map((language, i) =>
      i === index ? { ...language, [name]: value } : language
    );

    setResumeForm({
      ...resumeForm,
      languages: updatedLanguages,
    });
  };

  const addLanguage = () => {
    const newLanguage = {
      language: "",
      speakingLevel: "",
      writingLevel: "",
      readingLevel: "",
    };

    setResumeForm({
      ...resumeForm,
      languages: [...resumeForm.languages, newLanguage],
    });
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = resumeForm.languages.filter(
      (language, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      languages: updatedLanguages,
    });
  };

  const removeAllLanguage = async () => {
    if (
      await customConfirm({
        content: "모든 어학능력 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        languages: [],
      });
    }
  };

  const handleCareerChange = (
    index: number,
    name: string,
    value: string | boolean
  ) => {
    const updatedCareers = resumeForm.careers.map((career, i) =>
      i === index ? { ...career, [name]: value } : career
    );

    setResumeForm({
      ...resumeForm,
      careers: updatedCareers,
    });
  };

  const addCareer = () => {
    const newCareer = {
      companyName: "",
      jobTitle: "",
      position: "",
      responsibilities: "",
      startDate: "",
      endDate: "",
      isCurrent: undefined,
    };

    setResumeForm({
      ...resumeForm,
      careers: [...resumeForm.careers, newCareer],
    });
  };

  const removeCareer = (index: number) => {
    const updatedCareers = resumeForm.careers.filter(
      (career, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      careers: updatedCareers,
    });
  };

  const removeAllCareer = async () => {
    if (
      await customConfirm({
        content: "모든 경력 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        careers: [],
      });
    }
  };

  const handleActivityChange = (index: number, name: string, value: string) => {
    const updatedActivities = resumeForm.activities.map((activity, i) =>
      i === index ? { ...activity, [name]: value } : activity
    );

    setResumeForm({
      ...resumeForm,
      activities: updatedActivities,
    });
  };

  const addActivity = () => {
    const newActivity = {
      activityType: "",
      organizationName: "",
      startDate: "",
      endDate: "",
      description: "",
    };

    setResumeForm({
      ...resumeForm,
      activities: [...resumeForm.activities, newActivity],
    });
  };

  const removeActivity = (index: number) => {
    const updatedActivities = resumeForm.activities.filter(
      (activity, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      activities: updatedActivities,
    });
  };

  const removeAllActivity = async () => {
    if (
      await customConfirm({
        content: "모든 인턴/대외활동 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        activities: [],
      });
    }
  };

  const handleApostilleChange = (index: number, file: File | null) => {
    if (!file) return;

    const updatedApostilles = resumeForm.apostilles.map((apostille, i) =>
      i === index ? { ...apostille, file } : apostille
    );

    setResumeForm({
      ...resumeForm,
      apostilles: updatedApostilles,
    });
  };

  const addApostille = () => {
    const newApostille = {
      file: null,
    };

    setResumeForm({
      ...resumeForm,
      apostilles: [...resumeForm.apostilles, newApostille],
    });
  };

  const removeApostille = (index: number) => {
    const updatedApostilles = resumeForm.apostilles.filter(
      (apostille, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      apostilles: updatedApostilles,
    });
  };

  const removeAllApostille = async () => {
    if (
      await customConfirm({
        content: "모든 아포스티유 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        apostilles: [],
      });
    }
  };

  const addCertification = () => {
    const newCertification = {
      certificationName: "",
      issuingOrganization: "",
      acquisitionDate: "",
    };

    setResumeForm({
      ...resumeForm,
      certifications: [...resumeForm.certifications, newCertification],
    });
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = resumeForm.certifications.filter(
      (certification, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      certifications: updatedCertifications,
    });
  };

  const removeAllCertification = async () => {
    if (
      await customConfirm({
        content: "모든 자격증 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        certifications: [],
      });
    }
  };

  const handleAwardChange = (index: number, name: string, value: string) => {
    const updatedAwards = resumeForm.awards.map((award, i) =>
      i === index ? { ...award, [name]: value } : award
    );

    setResumeForm({
      ...resumeForm,
      awards: updatedAwards,
    });
  };

  const addAward = () => {
    const newAward = {
      awardName: "",
      awardingOrganization: "",
      awardYear: "",
      description: "",
    };

    setResumeForm({
      ...resumeForm,
      awards: [...resumeForm.awards, newAward],
    });
  };

  const removeAward = (index: number) => {
    const updatedAwards = resumeForm.awards.filter((award, i) => i !== index);

    setResumeForm({
      ...resumeForm,
      awards: updatedAwards,
    });
  };

  const removeAllAward = async () => {
    if (
      await customConfirm({
        content: "모든 수상 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        awards: [],
      });
    }
  };

  const handleCertificationChange = (
    index: number,
    name: string,
    value: string
  ) => {
    const updatedCertifications = resumeForm.certifications.map(
      (certification, i) =>
        i === index ? { ...certification, [name]: value } : certification
    );

    setResumeForm({
      ...resumeForm,
      certifications: updatedCertifications,
    });
  };

  const handleEmploymentPreferencesChange = (name: string, value: string) => {
    setResumeForm({
      ...resumeForm,
      employmentPreferences: {
        ...resumeForm.employmentPreferences,
        [name]: value,
      },
    });
  };

  const employmentPreferencesReset = () => {
    setResumeForm({
      ...resumeForm,
      employmentPreferences: {
        isVeteran: false,
        isEmploymentProtected: false,
        isEmploymentSupport: false,
        isDisabled: false,
        disabledGrade: "",
        hasMilitaryService: false,
        militaryServiceStatus: "",
        militaryServiceJoinDate: "",
        militaryServiceOutDate: "",
        militaryServiceClass: "",
      },
    });
  };

  const handleSelfIntroductionChange = (
    index: number,
    name: string,
    value: string
  ) => {
    const updatedSelfIntroductions = resumeForm.selfIntroductions.map(
      (selfIntroduction, i) =>
        i === index ? { ...selfIntroduction, [name]: value } : selfIntroduction
    );

    setResumeForm({
      ...resumeForm,
      selfIntroductions: updatedSelfIntroductions,
    });
  };

  const addSelfIntroduction = () => {
    const newSelfIntroduction = {
      title: "",
      content: "",
    };

    setResumeForm({
      ...resumeForm,
      selfIntroductions: [...resumeForm.selfIntroductions, newSelfIntroduction],
    });
  };

  const removeSelfIntroductions = (index: number) => {
    const updatedSelfIntroductions = resumeForm.selfIntroductions.filter(
      (selfIntroduction, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      selfIntroductions: updatedSelfIntroductions,
    });
  };

  const removeAllSelfIntroductions = async () => {
    if (
      await customConfirm({
        content: "모든 자기소개서 정보를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      setResumeForm({
        ...resumeForm,
        selfIntroductions: [],
      });
    }
  };

  const validateForm = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    // 기본 정보 검증
    if (!resumeForm.title.trim()) {
      newErrors["title"] = "이력서 제목을 입력해주세요.";
    }
    if (!previewImage && !resumeForm.picturePath) {
      newErrors["picture"] = "프로필 사진을 등록해주세요.";
    }
    // if (!resumeForm.apostilles.some((apostille) => apostille.file)) {
    //   newErrors["apostilles"] = "아포스티유 파일을 하나 이상 추가해주세요.";
    // }
    // 학력 검증
    resumeForm.educations.forEach((education, index) => {
      if (!education.lastSchool) {
        newErrors[`education.${index}.lastSchool`] =
          "학교 구분을 선택해주세요.";
      }
      if (!education.schoolName.trim()) {
        newErrors[`education.${index}.schoolName`] = "학교명을 입력해주세요.";
      }
      if (!education.department.trim()) {
        newErrors[`education.${index}.department`] = "학과를 입력해주세요.";
      }
      if (!education.admissionDate.trim()) {
        newErrors[`education.${index}.admissionDate`] =
          "입학년월을 입력해주세요.";
      }
      if (!education.graduationDate.trim()) {
        newErrors[`education.${index}.graduationDate`] =
          "졸업년월을 입력해주세요.";
      }
      if (education.admissionDate && education.graduationDate) {
        if (education.admissionDate > education.graduationDate) {
          newErrors[`education.${index}.admissionDate`] =
            "입학년월은 졸업년월보다 이전이어야 합니다.";
        }
      }
      if (!education.graduationStatus) {
        newErrors[`education.${index}.graduationStatus`] =
          "졸업상태를 선택해주세요.";
      }
      if (showGPA[index]) {
        if (!education.totalCredits) {
          newErrors[`education.${index}.totalCredits`] =
            "학점 총점을 입력해주세요.";
        }
        if (!education.gpa) {
          newErrors[`education.${index}.gpa`] = "학점을 입력해주세요.";
        } else if (!/^\d+\.\d+$/.test(String(education.gpa))) {
          newErrors[`education.${index}.gpa`] =
            "소수점 형태로 입력해주세요 (예: 3.50)";
        }
      }
    });

    // 어학능력 검증
    resumeForm.languages.forEach((language, index) => {
      if (!language.language) {
        newErrors[`language.${index}.language`] = "언어를 선택해주세요.";
      }
      if (!language.speakingLevel) {
        newErrors[`language.${index}.speakingLevel`] =
          "회화수준을 선택해주세요.";
      }
      if (!language.writingLevel) {
        newErrors[`language.${index}.writingLevel`] =
          "작문수준을 선택해주세요.";
      }
      if (!language.readingLevel) {
        newErrors[`language.${index}.readingLevel`] =
          "독해수준을 선택해주세요.";
      }
    });

    // 경력 검증
    resumeForm.careers.forEach((career, index) => {
      if (!career.companyName.trim()) {
        newErrors[`career.${index}.companyName`] = "회사명을 입력해주세요.";
      }
      if (!career.jobTitle.trim()) {
        newErrors[`career.${index}.jobTitle`] = "담당직무를 입력해주세요.";
      }
      if (!career.position.trim()) {
        newErrors[`career.${index}.position`] = "직급/직책을 입력해주세요.";
      }
      if (career.responsibilities.trim() === "") {
        newErrors[`career.${index}.responsibilities`] =
          "담당업무를 입력해주세요.";
      }
      if (!career.startDate.trim()) {
        newErrors[`career.${index}.startDate`] = "입사년월을 입력해주세요.";
      }
      if (career.isCurrent === undefined || career.isCurrent === null) {
        newErrors[`career.${index}.isCurrent`] = "재직여부를 선택해주세요.";
      }
      if (career.isCurrent === true && !career.startDate.trim()) {
        newErrors[`career.${index}.startDate`] =
          "재직중인 경우 입사년월을 입력해주세요.";
      }
      if (career?.isCurrent === false && !career?.endDate.trim()) {
        newErrors[`career.${index}.endDate`] = "퇴사년월을 입력해주세요.";
      }
      if (career.isCurrent === false && career.startDate > career.endDate) {
        newErrors[`career.${index}.startDate`] =
          "입사년월이 퇴사년월보다 이전일 수 없습니다.";
      }
    });

    // 인턴/대외활동 검증
    resumeForm.activities.forEach((activity, index) => {
      if (!activity.activityType) {
        newErrors[`activity.${index}.activityType`] =
          "활동구분을 선택해주세요.";
      }
      if (!activity.organizationName.trim()) {
        newErrors[`activity.${index}.organizationName`] =
          "회사/기관/단체명을 입력해주세요.";
      }
      if (!activity.startDate.trim()) {
        newErrors[`activity.${index}.startDate`] = "시작년월을 입력해주세요.";
      }
      if (!activity.endDate.trim()) {
        newErrors[`activity.${index}.endDate`] = "종료년월을 입력해주세요.";
      }
      if (activity.startDate > activity.endDate) {
        newErrors[`activity.${index}.startDate`] =
          "시작년월이 종료년월보다 이전일 수 없습니다.";
      }
      if (!activity.description.trim()) {
        newErrors[`activity.${index}.description`] = "활동내용을 입력해주세요.";
      }
    });

    // 자격증 검증
    resumeForm.certifications.forEach((certification, index) => {
      if (!certification.certificationName.trim()) {
        newErrors[`certification.${index}.certificationName`] =
          "자격증명을 입력해주세요.";
      }
      if (!certification.issuingOrganization.trim()) {
        newErrors[`certification.${index}.issuingOrganization`] =
          "발행처를 입력해주세요.";
      }
      if (!certification.acquisitionDate.trim()) {
        newErrors[`certification.${index}.acquisitionDate`] =
          "취득년월을 입력해주세요.";
      }
    });

    // 수상 검증
    resumeForm.awards.forEach((award, index) => {
      if (!award.awardName.trim()) {
        newErrors[`award.${index}.awardName`] = "수상명을 입력해주세요.";
      }
      if (!award.awardingOrganization.trim()) {
        newErrors[`award.${index}.awardingOrganization`] =
          "수여기관을 입력해주세요.";
      }
      if (!award.awardYear.trim()) {
        newErrors[`award.${index}.awardYear`] = "수상연도를 입력해주세요.";
      }
      if (!award.description.trim()) {
        newErrors[`award.${index}.description`] = "수상내용을 입력해주세요.";
      }
    });

    // 취업우대·병역 검증
    if (
      resumeForm.employmentPreferences.isDisabled &&
      !resumeForm.employmentPreferences.disabledGrade
    ) {
      newErrors["employmentPreferences.disabledGrade"] =
        "장애 등급을 선택해주세요.";
    }

    if (resumeForm.employmentPreferences.hasMilitaryService) {
      if (!resumeForm.employmentPreferences.militaryServiceStatus) {
        newErrors["employmentPreferences.militaryServiceStatus"] =
          "병역을 선택해주세요.";
      }

      if (
        resumeForm.employmentPreferences.militaryServiceStatus === "completed"
      ) {
        if (!resumeForm.employmentPreferences.militaryServiceJoinDate) {
          newErrors["employmentPreferences.militaryServiceJoinDate"] =
            "입대일을 입력해주세요.";
        }
        if (!resumeForm.employmentPreferences.militaryServiceOutDate) {
          newErrors["employmentPreferences.militaryServiceOutDate"] =
            "제대일을 입력해주세요.";
        }
        if (!resumeForm.employmentPreferences.militaryServiceClass) {
          newErrors["employmentPreferences.militaryServiceClass"] =
            "제대 계급을 선택해주세요.";
        }
      }
    }

    // 자기소개서 검증
    resumeForm.selfIntroductions.forEach((selfIntroduction, index) => {
      if (!selfIntroduction.title.trim()) {
        newErrors[`selfIntroduction.${index}.title`] = "제목을 입력해주세요.";
      }
      if (!selfIntroduction.content.trim()) {
        newErrors[`selfIntroduction.${index}.content`] = "내용을 입력해주세요.";
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      if (firstKey) {
        const elId = `field-${firstKey.replace(/\./g, "-")}`;
        const el = document.getElementById(elId);

        if (el) {
          const offset = 200;
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

    // 민감정보 수집 동의 검증
    if (!agreeToSensitiveInfo) {
      customAlert({
        content: "민감정보 수집에 동의해주세요.",
      });
      return false;
    }

    try {
      setIsUploading(true);

      // FormData 생성
      const formData = new FormData();

      // 프로필 이미지 추가 (새로운 이미지가 선택된 경우에만)
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      // 아포스티유 파일들 추가 (새로운 파일이 있는 경우에만)
      resumeForm.apostilles.forEach((apostille, index) => {
        if (apostille.file instanceof File) {
          // File 객체인 경우에만 추가
          formData.append(`apostilleFiles`, apostille.file);
        }
      });

      // 나머지 이력서 데이터를 JSON으로 추가
      const resumeData = {
        ...resumeForm,
        picturePath: selectedImage ? "" : resumeForm.picturePath, // 새 이미지가 있으면 빈 문자열로 설정
        apostilles: resumeForm.apostilles.map((apostille) => {
          // File 객체가 아닌 경우 (기존 파일 경로)는 그대로 유지
          if (!(apostille.file instanceof File)) {
            return apostille;
          }
          // 새로운 파일은 빈 문자열로 설정 (서버에서 처리)
          return { file: "" };
        }),
      };
      formData.append("resumeData", JSON.stringify(resumeData));

      // 서버로 전송
      if (id && gbn !== "copy") {
        await resumeApi.updateResume(Number(id), formData);

        initialForm.current = JSON.stringify(resumeForm);

        customAlert({
          content: "이력서가 성공적으로 수정되었습니다.",
          onConfirm() {
            if (isAdmin) {
              window.location.href = "/admin/Resumes.html";
            } else {
              navigate("/mypage/resume");
            }
          },
        });
      } else {
        if (gbn === "copy") {
          console.log("이력서를 복사 저장");
        }

        await resumeApi.createResume(formData);

        initialForm.current = JSON.stringify(resumeForm);

        customAlert({
          content: "이력서가 성공적으로 저장되었습니다.",
          onConfirm() {
            if (isAdmin) {
              window.location.href = "/admin/Resumes.html";
            } else {
              navigate("/mypage/resume");
            }
          },
        });
      }
    } catch (error) {
      console.error("이력서 저장 실패:", error);
      customAlert({
        content: "이력서 저장에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 에러 메시지 표시 컴포넌트
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <div className="error-message">{errors[field]}</div>
    ) : null;
  };

  // 입력 필드에 에러 클래스 추가 함수
  const getErrorClass = (field: string) => {
    return errors[field] ? "error" : "";
  };

  // 각 섹션의 데이터 입력 여부를 확인하는 함수들
  const isEducationFilled = () => resumeForm.educations.length > 0;
  const isLanguageFilled = () => resumeForm.languages.length > 0;
  const isCareerFilled = () => resumeForm.careers.length > 0;
  const isActivityFilled = () => resumeForm.activities.length > 0;
  const isApostilleFilled = () =>
    resumeForm.apostilles.some((apostille) => apostille.file);
  const isCertificationFilled = () => resumeForm.certifications.length > 0;
  const isAwardFilled = () => resumeForm.awards.length > 0;
  const isEmploymentPreferencesFilled = () => {
    const ep = resumeForm.employmentPreferences;
    return (
      ep.isVeteran ||
      ep.isEmploymentProtected ||
      ep.isEmploymentSupport ||
      ep.isDisabled ||
      ep.hasMilitaryService
    );
  };
  const isSelfIntroductionFilled = () =>
    resumeForm.selfIntroductions.length > 0;

  // 체크 아이콘 컴포넌트
  const CheckIcon = ({
    isActive,
    onClick,
    sectionId,
  }: {
    isActive: boolean;
    onClick?: () => void;
    sectionId: string;
  }) => {
    const handleClick = () => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      onClick && onClick();

      // sticky 기능 구현 필요 시
      //   if (!isCurrentSection) {
      //   // 현재 보는 위치가 아닌 경우 해당 섹션으로 스크롤
      //   element.scrollIntoView({ behavior: 'smooth' });
      // } else if (onClick) {
      //   // 현재 보는 위치인 경우 onClick 함수 실행
      //   onClick();
      // }
    };

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <circle
          cx="12"
          cy="12"
          r="11"
          fill="white"
          stroke={isActive ? "#2F80DC" : "#CBCBCB"}
          strokeWidth="2"
        />
        {isActive ? (
          <rect x="7" y="11" width="10" height="2" fill="#2F80DC" />
        ) : (
          <>
            <rect
              x="7.5"
              y="11.5"
              width="9"
              height="1"
              fill="#CBCBCB"
              stroke="#CBCBCB"
            />
            <rect
              x="12.5"
              y="7.5"
              width="9"
              height="1"
              transform="rotate(90 12.5 7.5)"
              fill="#CBCBCB"
              stroke="#CBCBCB"
            />
          </>
        )}
      </svg>
    );
  };

  const getSchoolType = (schoolType: string) => {
    if (schoolType === "high") {
      return "";
    } else if (schoolType === "univ2") {
      return "전문대학";
    } else if (schoolType === "univ4") {
      return "대학";
    } else {
      return "대학원";
    }
  };

  // 각 섹션의 삭제 확인 함수들
  const handleEducationDelete = async () => {
    if (isEducationFilled()) {
      if (
        await customConfirm({
          content: "학력 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllEducation();
      }
    } else {
      addEducation();
      // 학력 섹션 스크롤 이동
      const educationSection = document.getElementById("education-section");
      if (educationSection) {
        educationSection.scrollIntoView();
      }
    }
  };

  const handleLanguageDelete = async () => {
    if (isLanguageFilled()) {
      if (
        await customConfirm({
          content: "어학능력 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllLanguage();
      }
    } else {
      addLanguage();
      // 어학능력 섹션 스크롤 이동
      const languageSection = document.getElementById("language-section");
      if (languageSection) {
        languageSection.scrollIntoView();
      }
    }
  };

  const handleCareerDelete = async () => {
    if (isCareerFilled()) {
      if (
        await customConfirm({
          content: "경력 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllCareer();
      }
    } else {
      addCareer();
      // 경력 섹션 스크롤 이동
      const careerSection = document.getElementById("career-section");
      if (careerSection) {
        careerSection.scrollIntoView();
      }
    }
  };
  const toggleRegion = (index: number) => {
    setShowRegion((prev) => {
      const next = !prev[index];
      // off 상태가 되면 region 초기화
      if (!next) {
        setResumeForm((prev) => ({
          ...prev,
          educations: prev.educations.map((edu, i) =>
            i === index ? { ...edu, region: "" } : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };
  const handleActivityDelete = async () => {
    if (isActivityFilled()) {
      if (
        await customConfirm({
          content: "인턴/대외활동 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllActivity();
      }
    } else {
      addActivity();
      // 인턴/대외활동 섹션 스크롤 이동
      const activitySection = document.getElementById("activity-section");
      if (activitySection) {
        activitySection.scrollIntoView();
      }
    }
  };

  const handleApostilleDelete = async () => {
    if (isApostilleFilled()) {
      if (
        await customConfirm({
          content: "아포스티유 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllApostille();
      }
    } else {
      addApostille();
      // 아포스티유 섹션 스크롤 이동
      const apostilleSection = document.getElementById("apostille-section");
      if (apostilleSection) {
        apostilleSection.scrollIntoView();
      }
    }
  };

  const handleCertificationDelete = async () => {
    if (isCertificationFilled()) {
      if (
        await customConfirm({
          content: "자격증 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllCertification();
      }
    } else {
      addCertification();
      // 자격증 섹션 스크롤 이동
      const certificationSection = document.getElementById(
        "certification-section"
      );
      if (certificationSection) {
        certificationSection.scrollIntoView();
      }
    }
  };

  const handleAwardDelete = async () => {
    if (isAwardFilled()) {
      if (
        await customConfirm({
          content: "수상 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllAward();
      }
    } else {
      addAward();
      // 수상 섹션 스크롤 이동
      const awardSection = document.getElementById("award-section");
      if (awardSection) {
        awardSection.scrollIntoView();
      }
    }
  };

  const handleEmploymentPreferencesDelete = async () => {
    if (isEmploymentPreferencesFilled()) {
      if (
        await customConfirm({
          content: "취업우대·병역 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        employmentPreferencesReset();
      }
    } else {
      // 취업우대·병역 섹션 스크롤 이동
      const employmentPreferencesSection = document.getElementById(
        "employment-preferences-section"
      );
      if (employmentPreferencesSection) {
        employmentPreferencesSection.scrollIntoView();
      }
    }
  };
  const handleSelfIntroductionDelete = async () => {
    if (isSelfIntroductionFilled()) {
      if (
        await customConfirm({
          content: "자기소개서 정보를 모두 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        removeAllSelfIntroductions();
      }
    } else {
      addSelfIntroduction();
      // 자기소개서 섹션 스크롤 이동
      const selfIntroductionSection = document.getElementById(
        "self-introduction-section"
      );
      if (selfIntroductionSection) {
        selfIntroductionSection.scrollIntoView();
      }
    }
  };
  function normalizeBirth(rawBirth: string) {
    if (/^\d{8}$/.test(rawBirth)) {
      return rawBirth.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
    }
    return rawBirth;
  }

  // 에러 체크 로직을 메모이제이션
  const checkErrors = useCallback(() => {
    const newErrors = { ...errors };

    // 기본 정보 검증
    if (resumeForm.title.trim()) {
      delete newErrors["title"];
    }
    if (previewImage || resumeForm.picturePath) {
      delete newErrors["picture"];
    }

    // 학력 검증
    resumeForm.educations.forEach((education, index) => {
      if (education.lastSchool) {
        delete newErrors[`education.${index}.lastSchool`];
      }
      if (education.schoolName.trim()) {
        delete newErrors[`education.${index}.schoolName`];
      }
      if (education.department.trim()) {
        delete newErrors[`education.${index}.department`];
      }
      if (education.admissionDate.trim()) {
        delete newErrors[`education.${index}.admissionDate`];
      }
      if (education.graduationDate.trim()) {
        delete newErrors[`education.${index}.graduationDate`];
      }
      if (education.graduationStatus) {
        delete newErrors[`education.${index}.graduationStatus`];
      }
      if (showGPA[index]) {
        if (education.totalCredits) {
          delete newErrors[`education.${index}.totalCredits`];
        }
        if (education.gpa && !/^\d+\.\d+$/.test(String(education.gpa))) {
          delete newErrors[`education.${index}.gpa`];
        }
      }
    });

    // 어학능력 검증
    resumeForm.languages.forEach((language, index) => {
      if (language.language) {
        delete newErrors[`language.${index}.language`];
      }
      if (language.speakingLevel) {
        delete newErrors[`language.${index}.speakingLevel`];
      }
      if (language.writingLevel) {
        delete newErrors[`language.${index}.writingLevel`];
      }
      if (language.readingLevel) {
        delete newErrors[`language.${index}.readingLevel`];
      }
    });

    // 경력 검증
    resumeForm.careers.forEach((career, index) => {
      if (career.companyName.trim()) {
        delete newErrors[`career.${index}.companyName`];
      }
      if (career.jobTitle.trim()) {
        delete newErrors[`career.${index}.jobTitle`];
      }
      if (career.position.trim()) {
        delete newErrors[`career.${index}.position`];
      }
      if (career.responsibilities.trim()) {
        delete newErrors[`career.${index}.responsibilities`];
      }
      if (career.startDate.trim()) {
        delete newErrors[`career.${index}.startDate`];
      }
      if (career.endDate.trim() || career.isCurrent) {
        delete newErrors[`career.${index}.endDate`];
      }
      if (career.isCurrent !== undefined) {
        delete newErrors[`career.${index}.isCurrent`];
      }
    });

    // 인턴/대외활동 검증
    resumeForm.activities.forEach((activity, index) => {
      if (activity.activityType) {
        delete newErrors[`activity.${index}.activityType`];
      }
      if (activity.organizationName.trim()) {
        delete newErrors[`activity.${index}.organizationName`];
      }
      if (activity.startDate.trim()) {
        delete newErrors[`activity.${index}.startDate`];
      }
      if (activity.endDate.trim()) {
        delete newErrors[`activity.${index}.endDate`];
      }
      if (activity.description.trim()) {
        delete newErrors[`activity.${index}.description`];
      }
    });

    // 자격증 검증
    resumeForm.certifications.forEach((certification, index) => {
      if (certification.certificationName.trim()) {
        delete newErrors[`certification.${index}.certificationName`];
      }
      if (certification.issuingOrganization.trim()) {
        delete newErrors[`certification.${index}.issuingOrganization`];
      }
      if (certification.acquisitionDate.trim()) {
        delete newErrors[`certification.${index}.acquisitionDate`];
      }
    });

    // 수상 검증
    resumeForm.awards.forEach((award, index) => {
      if (award.awardName.trim()) {
        delete newErrors[`award.${index}.awardName`];
      }
      if (award.awardingOrganization.trim()) {
        delete newErrors[`award.${index}.awardingOrganization`];
      }
      if (award.awardYear.trim()) {
        delete newErrors[`award.${index}.awardYear`];
      }
      if (award.description.trim()) {
        delete newErrors[`award.${index}.description`];
      }
    });

    // 취업우대·병역 검증
    if (resumeForm.employmentPreferences.isDisabled) {
      if (resumeForm.employmentPreferences.disabledGrade) {
        delete newErrors["employmentPreferences.disabledGrade"];
      }
    }

    if (resumeForm.employmentPreferences.hasMilitaryService) {
      if (resumeForm.employmentPreferences.militaryServiceStatus) {
        delete newErrors["employmentPreferences.militaryServiceStatus"];
      }

      if (
        resumeForm.employmentPreferences.militaryServiceStatus === "completed"
      ) {
        if (resumeForm.employmentPreferences.militaryServiceJoinDate) {
          delete newErrors["employmentPreferences.militaryServiceJoinDate"];
        }
        if (resumeForm.employmentPreferences.militaryServiceOutDate) {
          delete newErrors["employmentPreferences.militaryServiceOutDate"];
        }
        if (resumeForm.employmentPreferences.militaryServiceClass) {
          delete newErrors["employmentPreferences.militaryServiceClass"];
        }
      }
    }

    // 자기소개서 검증
    resumeForm.selfIntroductions.forEach((selfIntroduction, index) => {
      if (selfIntroduction.title.trim()) {
        delete newErrors[`selfIntroduction.${index}.title`];
      }
      if (selfIntroduction.content.trim()) {
        delete newErrors[`selfIntroduction.${index}.content`];
      }
    });

    return newErrors;
  }, [resumeForm, previewImage, showGPA, showRegion, showAdditionalMajor]);

  // 에러 체크 useEffect
  useEffect(() => {
    const newErrors = checkErrors();
    setErrors(newErrors);
  }, [checkErrors]);

  return (
    <Layout>
      <MetaTagHelmet title="이력서 작성" description="이력서 작성" />
      <div className="mypage screen">
        <div className="container">
          <div className="flex-con">
            {/* resume_write */}
            <div className="resume_write">
              {/* form start */}
              <div className="resume_write_form">
                <div className="resume_title">
                  <input
                    id="field-title"
                    type="text"
                    className={`form-control ${getErrorClass("title")}`}
                    name="title"
                    value={resumeForm.title}
                    onChange={handleInputChange}
                    placeholder="이력서 제목을 입력해 주세요."
                  />
                  <ErrorMessage field="title" />
                </div>
                {/* formProfile */}
                <div className="formProfile">
                  <div className="picture">
                    <div id="field-picture" className="file-upload">
                      <label
                        htmlFor="ex_file"
                        style={{
                          height: "198px",
                          width: "198px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          ...(previewImage || resumeForm.picturePath
                            ? {
                                backgroundImage: `url("${
                                  previewImage || resumeForm.picturePath
                                }")`,
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }
                            : {}),
                        }}
                      >
                        {isUploading ? (
                          <div className="loading-spinner">업로드 중...</div>
                        ) : !previewImage && !resumeForm.picturePath ? (
                          <span>사진 업로드</span>
                        ) : null}
                      </label>
                      <input
                        type="file"
                        id="ex_file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  <div className="user-profile">
                    <div className="user-profile_row">
                      <div className="user-profile_name-container">
                        <div className="user-profile_name">
                          {userProfile.name || "홍길동"}
                        </div>
                        {userProfile.gender && (
                          <span>
                            {userProfile.gender === "M" ? "남" : "여"}
                          </span>
                        )}

                        {userProfile.birth &&
                          (() => {
                            const normalized = normalizeBirth(
                              userProfile.birth
                            );
                            const dateObj = new Date(normalized);

                            // Date 객체가 유효하지 않으면 (getTime()가 NaN이면) 아무것도 렌더링하지 않음
                            if (isNaN(dateObj.getTime())) return null;

                            return <span>{formatBirthAndAge(normalized)}</span>;
                          })()}

                        <span>
                          <NiceSelectBox
                            value={resumeForm.careerType}
                            options={careerTypeOptions}
                            onChange={(value) =>
                              handleSelectChange("careerType", value)
                            }
                            placeholder="경력구분 선택"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="user-profile_detail-contents">
                      <div className="profile_detail">
                        <div className="user-profile_list-container">
                          <dl>
                            <dt>휴대폰</dt>
                            <dd>{userProfile.phone || ""}</dd>
                          </dl>
                          <dl>
                            <dt>영문이름</dt>
                            <dd>{userProfile.englishName || ""}</dd>
                          </dl>
                        </div>
                      </div>
                      <div className="profile_detail">
                        <div className="user-profile_list-container">
                          <dl>
                            <dt>주소</dt>
                            <dd>{userProfile.address}</dd>
                          </dl>
                          <dl>
                            <dt>국적</dt>
                            <dd>
                              {mapOperationCodesToLabels(
                                [userProfile.nationality ?? ""],
                                regionData?.content ?? []
                              )}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="profile_detail">
                        <div className="user-profile_list-container">
                          <dl>
                            <dt>Email</dt>
                            <dd>{userProfile.email || ""}</dd>
                          </dl>
                          <dl style={{ display: "flex", marginBottom: 0 }}>
                            <dt
                              style={{
                                flex: "0 0 75px",
                                maxWidth: "75px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              비자여부
                            </dt>
                            <dd style={{ flex: "1 1 auto" }}>
                              {userProfile.visa && userProfile.visa?.length > 0
                                ? userProfile.visa
                                    .map((v) => VisaStatusText[v])
                                    .join(", ")
                                : "-"}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(previewImage || userProfile.profileImage) && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleImageDelete}
                    style={{
                      background: "#eaeaea",
                      borderRadius: "15px",
                      padding: "12px",
                    }}
                  >
                    삭제
                  </button>
                )}

                {errors["picture"] && (
                  <div className="error-message">{errors["picture"]}</div>
                )}
                {/* formProfile end */}

                <div className="user-inform">
                  {/* 학력 */}
                  <dl id="education-section">
                    <dt>학력</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.educations.map((education, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.lastSchool`
                                )}`}
                                id={`field-education-${index}-lastSchool`}
                                tabIndex={-1}
                              >
                                <label htmlFor="lastSchool">
                                  학교 구분<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={education.lastSchool}
                                  options={schoolOptions}
                                  onChange={(value) => {
                                    handleEducationChange(
                                      index,
                                      "lastSchool",
                                      value || ""
                                    );
                                  }}
                                  placeholder="학교 구분 선택"
                                />
                                <ErrorMessage
                                  field={`education.${index}.lastSchool`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.schoolName`
                                )}`}
                                id={`field-education-${index}-schoolName`}
                                tabIndex={-1}
                              >
                                <label htmlFor="schoolName">
                                  학교명<span>*</span>
                                </label>
                                <SearchableInput
                                  value={education.schoolName}
                                  onChange={(value) =>
                                    handleEducationChange(
                                      index,
                                      "schoolName",
                                      value
                                    )
                                  }
                                  onSelect={(value) =>
                                    handleEducationChange(
                                      index,
                                      "schoolName",
                                      value
                                    )
                                  }
                                  placeholder="학교명을 입력해주세요"
                                  dataType="국내대학"
                                  dataField="level3"
                                  level1Query={getSchoolType(
                                    education.lastSchool
                                  )}
                                />
                                <ErrorMessage
                                  field={`education.${index}.schoolName`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.department`
                                )}`}
                                id={`field-education-${index}-department`}
                                tabIndex={-1}
                              >
                                <label htmlFor="department">
                                  학과<span>*</span>
                                </label>
                                <SearchableInput
                                  value={education.department}
                                  onChange={(value) =>
                                    handleEducationChange(
                                      index,
                                      "department",
                                      value
                                    )
                                  }
                                  onSelect={(value) =>
                                    handleEducationChange(
                                      index,
                                      "department",
                                      value
                                    )
                                  }
                                  placeholder="학과를 입력해주세요"
                                  dataType="국내대학전공"
                                  dataField="level2"
                                  keywordQuery={education.schoolName}
                                />
                                <ErrorMessage
                                  field={`education.${index}.department`}
                                />
                              </div>
                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeEducation(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* row end*/}

                            {/* row */}
                            <div className="row">
                              {/* 입학년월 */}
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.admissionDate`
                                )}`}
                                id={`field-education-${index}-admissionDate`}
                                tabIndex={-1}
                              >
                                <label htmlFor={`admissionDate-${index}`}>
                                  입학년월<span>*</span>
                                </label>
                                <DatePicker
                                  id={`admissionDate-${index}`}
                                  onChangeRaw={(e) => e?.preventDefault()}
                                  selected={parseYearMonth(
                                    education.admissionDate
                                  )}
                                  onChange={(date) => {
                                    const value = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleEducationChange(
                                      index,
                                      "admissionDate",
                                      value
                                    );
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText="입학년월"
                                  className="form-control"
                                  locale="ko"
                                />
                                <ErrorMessage
                                  field={`education.${index}.admissionDate`}
                                />
                              </div>

                              {/* 졸업년월 */}
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.graduationDate`
                                )}`}
                                id={`field-education-${index}-graduationDate`}
                                tabIndex={-1}
                              >
                                <label htmlFor={`graduationDate-${index}`}>
                                  졸업년월<span>*</span>
                                </label>
                                <DatePicker
                                  id={`graduationDate-${index}`}
                                  onChangeRaw={(e) => e?.preventDefault()}
                                  selected={parseYearMonth(
                                    education.graduationDate
                                  )}
                                  onChange={(date) => {
                                    const value = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleEducationChange(
                                      index,
                                      "graduationDate",
                                      value
                                    );
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText="졸업년월"
                                  className="form-control"
                                  locale="ko"
                                />
                                <ErrorMessage
                                  field={`education.${index}.graduationDate`}
                                />
                              </div>

                              {/* 졸업상태 */}
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `education.${index}.graduationStatus`
                                )}`}
                                id={`field-education-${index}-graduationStatus`}
                                tabIndex={-1}
                              >
                                <label htmlFor="graduationStatus">
                                  졸업상태<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={education.graduationStatus}
                                  options={gradStatusOptions}
                                  onChange={(value) =>
                                    handleEducationChange(
                                      index,
                                      "graduationStatus",
                                      value || ""
                                    )
                                  }
                                  placeholder="졸업상태 선택"
                                />
                                <ErrorMessage
                                  field={`education.${index}.graduationStatus`}
                                />
                              </div>
                            </div>
                            {/* row end*/}

                            {/* row */}
                            {showGPA[index] && (
                              <div className="row">
                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `education.${index}.totalCredits`
                                  )}`}
                                  id={`field-education-${index}-totalCredits`}
                                >
                                  <label htmlFor="totalCredits">
                                    학점 총점<span>*</span>
                                  </label>
                                  <input
                                    id={`totalCredits-${index}`}
                                    type="number"
                                    name="totalCredits"
                                    step="0.01"
                                    min="0"
                                    max="400"
                                    required
                                    value={education.totalCredits}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "totalCredits",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                  <ErrorMessage
                                    field={`education.${index}.totalCredits`}
                                  />
                                </div>

                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `education.${index}.gpa`
                                  )}`}
                                  id={`field-education-${index}-gpa`}
                                >
                                  <label
                                    htmlFor="gpa"
                                    id={`field-education-${index}-gpa`}
                                    tabIndex={-1}
                                  >
                                    학점<span>*</span>
                                  </label>
                                  <input
                                    id={`gpa-${index}`}
                                    type="number"
                                    name="gpa"
                                    step="0.01"
                                    min="0"
                                    max="4.5"
                                    required
                                    value={education.gpa}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "gpa",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                  <ErrorMessage
                                    field={`education.${index}.gpa`}
                                  />
                                </div>
                                <div className="transfer">
                                  <div className="scheck-primary">
                                    <input
                                      type="checkbox"
                                      id={`field-education-${index}-transferStatus`}
                                      name="transferStatus"
                                      checked={education.transferStatus}
                                      onChange={(e) =>
                                        handleEducationChange(
                                          index,
                                          "transferStatus",
                                          e.target.checked
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`field-education-${index}-transferStatus`}
                                      style={{ textWrap: "nowrap" }}
                                    >
                                      편입
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* row end*/}

                            {/* 추가전공 row */}
                            {showAdditionalMajor[index] && (
                              <div className="row">
                                <div className="SelectBox">
                                  <label htmlFor="additionalMajor">
                                    전공명
                                  </label>
                                  <SearchableInput
                                    value={education.additionalMajor}
                                    onChange={(value) =>
                                      handleEducationChange(
                                        index,
                                        "additionalMajor",
                                        value
                                      )
                                    }
                                    onSelect={(value) =>
                                      handleEducationChange(
                                        index,
                                        "additionalMajor",
                                        value
                                      )
                                    }
                                    placeholder="학과를 입력해주세요"
                                    dataType="국내대학전공"
                                    dataField="level2"
                                    keywordQuery={education.schoolName}
                                  />

                                  {/* <input
                                    type="text"
                                    name="additionalMajor"
                                    value={education.additionalMajor}
                                    onChange={(e) =>
                                      handleEducationChange(
                                        index,
                                        "additionalMajor",
                                        e.target.value,
                                      )
                                    }
                                    className="form-control"
                                  /> */}
                                </div>
                                <div className="SelectBox">
                                  <label htmlFor="additionalMajorType">
                                    전공 유형
                                  </label>
                                  <NiceSelectBox
                                    value={education.additionalMajorType}
                                    options={majorTypeOptions}
                                    onChange={(value) =>
                                      handleEducationChange(
                                        index,
                                        "additionalMajorType",
                                        value || ""
                                      )
                                    }
                                    placeholder="전공 유형 선택"
                                  />
                                </div>
                              </div>
                            )}

                            {/* 지역 선택 row */}
                            {showRegion[index] && (
                              <div className="row">
                                <div className="SelectBox">
                                  <label htmlFor="region">희망근무지</label>
                                  <NiceSelectBox
                                    value={education.region}
                                    options={areaOptionsState}
                                    onChange={(value) =>
                                      handleEducationChange(
                                        index,
                                        "region",
                                        value || ""
                                      )
                                    }
                                    placeholder="희망근무지"
                                  />
                                </div>
                              </div>
                            )}

                            {/* row */}
                            <div className="row">
                              <div className="addBtnbox">
                                <button
                                  type="button"
                                  className={showRegion[index] ? "active" : ""}
                                  onClick={() => toggleRegion(index)}
                                >
                                  + 희망근무지
                                </button>
                                <button
                                  type="button"
                                  className={showGPA[index] ? "active" : ""}
                                  onClick={() => toggleGPA(index)}
                                >
                                  + 학점
                                </button>
                                <button
                                  type="button"
                                  className={
                                    showAdditionalMajor[index] ? "active" : ""
                                  }
                                  onClick={() => toggleAdditionalMajor(index)}
                                >
                                  + 추가전공
                                </button>
                              </div>
                            </div>
                            {/* row end*/}
                          </div>
                        ))}
                        {/* row */}
                        <button
                          type="button"
                          id="addEducationBtn"
                          className="infoaddBrn"
                          onClick={addEducation}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                    </dd>
                  </dl>
                  {/* 학력 end*/}

                  {/* 어학능력 */}
                  <dl id="language-section">
                    <dt>어학능력</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.languages.map((language, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `language.${index}.language`
                                )}`}
                                id={`field-language-${index}-language`}
                                tabIndex={-1}
                              >
                                <label
                                  htmlFor={`language-${index}`}
                                  id={`field-language-${index}-language`}
                                  tabIndex={-1}
                                >
                                  외국어<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={language.language}
                                  options={languageOptions}
                                  onChange={(value) =>
                                    handleLanguageChange(
                                      index,
                                      "language",
                                      value || ""
                                    )
                                  }
                                  placeholder="언어 선택"
                                />
                                <ErrorMessage
                                  field={`language.${index}.language`}
                                />
                              </div>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `language.${index}.speakingLevel`
                                )}`}
                              >
                                <label htmlFor={`speakingLevel-${index}`}>
                                  회화수준<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={language.speakingLevel}
                                  options={languageLevelOptions}
                                  onChange={(value) =>
                                    handleLanguageChange(
                                      index,
                                      "speakingLevel",
                                      value || ""
                                    )
                                  }
                                  placeholder="선택"
                                />
                                <ErrorMessage
                                  field={`language.${index}.speakingLevel`}
                                />
                              </div>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `language.${index}.writingLevel`
                                )}`}
                              >
                                <label htmlFor={`writingLevel-${index}`}>
                                  작문수준<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={language.writingLevel}
                                  options={languageLevelOptions}
                                  onChange={(value) =>
                                    handleLanguageChange(
                                      index,
                                      "writingLevel",
                                      value || ""
                                    )
                                  }
                                  placeholder="선택"
                                />
                                <ErrorMessage
                                  field={`language.${index}.writingLevel`}
                                />
                              </div>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `language.${index}.readingLevel`
                                )}`}
                              >
                                <label htmlFor={`readingLevel-${index}`}>
                                  독해수준<span>*</span>
                                </label>
                                <NiceSelectBox
                                  value={language.readingLevel}
                                  options={languageLevelOptions}
                                  onChange={(value) =>
                                    handleLanguageChange(
                                      index,
                                      "readingLevel",
                                      value || ""
                                    )
                                  }
                                  placeholder="선택"
                                />
                                <ErrorMessage
                                  field={`language.${index}.readingLevel`}
                                />
                              </div>
                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeLanguage(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* row end*/}
                          </div>
                        ))}
                        {/* row */}
                        <button
                          type="button"
                          id="addLanguageBtn"
                          className="infoaddBrn"
                          onClick={addLanguage}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                    </dd>
                  </dl>
                  {/* 어학능력 end*/}

                  {/* 경력 */}
                  <dl id="career-section">
                    <dt>경력</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.careers.map((career, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `career.${index}.companyName`
                                )}`}
                                id={`field-career-${index}-companyName`}
                                tabIndex={-1}
                              >
                                <label htmlFor="companyName">
                                  회사명<span>*</span>
                                </label>
                                <input
                                  type="text"
                                  name="companyName"
                                  value={career.companyName}
                                  onChange={(e) =>
                                    handleCareerChange(
                                      index,
                                      "companyName",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                />
                                <ErrorMessage
                                  field={`career.${index}.companyName`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `career.${index}.jobTitle`
                                )}`}
                                id={`field-career-${index}-jobTitle`}
                                tabIndex={-1}
                              >
                                <label htmlFor="jobTitle">
                                  담당직무<span>*</span>
                                </label>
                                <input
                                  type="text"
                                  name="jobTitle"
                                  value={career.jobTitle}
                                  onChange={(e) =>
                                    handleCareerChange(
                                      index,
                                      "jobTitle",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                />
                                <ErrorMessage
                                  field={`career.${index}.jobTitle`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `career.${index}.position`
                                )}`}
                              >
                                <label htmlFor="position">
                                  직급/직책<span>*</span>
                                </label>
                                <input
                                  type="text"
                                  name="position"
                                  value={career.position}
                                  onChange={(e) =>
                                    handleCareerChange(
                                      index,
                                      "position",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                />
                                <ErrorMessage
                                  field={`career.${index}.position`}
                                />
                              </div>
                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeCareer(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* row end*/}
                            {/* row */}
                            <div className="row">
                              <div style={{ width: "100%" }}>
                                <textarea
                                  name="responsibilities"
                                  value={career.responsibilities}
                                  onChange={(e) =>
                                    handleCareerChange(
                                      index,
                                      "responsibilities",
                                      e.target.value
                                    )
                                  }
                                  className={`${getErrorClass(
                                    `career.${index}.responsibilities`
                                  )}`}
                                  placeholder="담당업무*"
                                ></textarea>
                                <ErrorMessage
                                  field={`career.${index}.responsibilities`}
                                />
                              </div>
                            </div>
                            {/* row end*/}
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `career.${index}.startDate`
                                )}`}
                                id={`field-career-${index}-startDate`}
                                tabIndex={-1}
                              >
                                <label htmlFor={`startDate-${index}`}>
                                  입사년월<span>*</span>
                                </label>
                                <DatePicker
                                  id={`startDate-${index}`}
                                  onChangeRaw={(e) => e?.preventDefault()}
                                  selected={parseYearMonth(career.startDate)}
                                  onChange={(date: Date | null) => {
                                    const value = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleCareerChange(
                                      index,
                                      "startDate",
                                      value
                                    );
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText=""
                                  className="form-control"
                                  locale="ko"
                                />
                                <ErrorMessage
                                  field={`career.${index}.startDate`}
                                />
                              </div>

                              {career.isCurrent === false && (
                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `career.${index}.endDate`
                                  )}`}
                                  id={`field-career-${index}-endDate`}
                                  tabIndex={-1}
                                >
                                  <label htmlFor={`endDate-${index}`}>
                                    퇴사년월<span>*</span>
                                  </label>
                                  <DatePicker
                                    id={`endDate-${index}`}
                                    onChangeRaw={(e) => e?.preventDefault()}
                                    selected={parseYearMonth(career.endDate)}
                                    onChange={(date: Date | null) => {
                                      const value = date
                                        ? `${date.getFullYear()}-${String(
                                            date.getMonth() + 1
                                          ).padStart(2, "0")}`
                                        : "";
                                      handleCareerChange(
                                        index,
                                        "endDate",
                                        value
                                      );
                                    }}
                                    dateFormat="yyyy-MM"
                                    showMonthYearPicker
                                    className="form-control"
                                    locale="ko"
                                  />
                                  <ErrorMessage
                                    field={`career.${index}.endDate`}
                                  />
                                </div>
                              )}
                              <div
                                className={`SelectBox w02 ${getErrorClass(
                                  `career.${index}.isCurrent`
                                )}`}
                                id={`field-career-${index}-isCurrent`}
                                tabIndex={-1}
                              >
                                <label>
                                  재직여부<span>*</span>
                                </label>
                                <div className="flex-row items-center empstat">
                                  <input
                                    id={`field-career-${index}-isCurrent1`}
                                    type="radio"
                                    name={`isCurrent-${index}`}
                                    checked={career.isCurrent === true}
                                    onChange={() =>
                                      handleCareerChange(
                                        index,
                                        "isCurrent",
                                        true
                                      )
                                    }
                                  />
                                  <label htmlFor={`isCurrent1-${index}`}>
                                    재직중
                                  </label>
                                  <input
                                    id={`field-career-${index}-isCurrent2`}
                                    type="radio"
                                    name={`isCurrent-${index}`}
                                    checked={career.isCurrent === false}
                                    onChange={() =>
                                      handleCareerChange(
                                        index,
                                        "isCurrent",
                                        false
                                      )
                                    }
                                  />
                                  <label htmlFor={`isCurrent2-${index}`}>
                                    퇴사
                                  </label>
                                </div>
                                <ErrorMessage
                                  field={`career.${index}.isCurrent`}
                                />
                              </div>
                            </div>
                            {/* row end*/}
                          </div>
                        ))}
                      </div>
                      {/* row */}
                      <button
                        type="button"
                        id="addCareerBtn"
                        className="infoaddBrn"
                        onClick={addCareer}
                      >
                        + 추가
                      </button>
                      {/* row end*/}
                    </dd>
                  </dl>
                  {/* 경력 end */}

                  {/* 인턴/대외활동 */}
                  <dl id="activity-section">
                    <dt>인턴/대외활동</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.activities.map((activity, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `activity.${index}.activityType`
                                )}`}
                              >
                                <label
                                  htmlFor={`activityType-${index}`}
                                  id={`field-activity-${index}-activityType`}
                                  tabIndex={-1}
                                >
                                  활동구분<span>*</span>
                                </label>
                                <NiceSelectBox
                                  options={internTypeOptions}
                                  value={activity.activityType}
                                  onChange={(value) =>
                                    handleActivityChange(
                                      index,
                                      "activityType",
                                      value || ""
                                    )
                                  }
                                  placeholder="활동구분 선택"
                                />
                                <ErrorMessage
                                  field={`activity.${index}.activityType`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `activity.${index}.organizationName`
                                )}`}
                              >
                                <label
                                  htmlFor={`organizationName-${index}`}
                                  id={`field-activity-${index}-organizationName`}
                                  tabIndex={-1}
                                >
                                  회사/기관/단체명<span>*</span>
                                </label>
                                <div className="comnm">
                                  <input
                                    type="text"
                                    name={`organizationName-${index}`}
                                    id={`organizationName-${index}`}
                                    className="form-control"
                                    value={activity.organizationName}
                                    onChange={(e) =>
                                      handleActivityChange(
                                        index,
                                        "organizationName",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <ErrorMessage
                                  field={`activity.${index}.organizationName`}
                                />
                              </div>
                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeActivity(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* row end*/}
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `activity.${index}.startDate`
                                )}`}
                                id={`field-activity-${index}-startDate`}
                                tabIndex={-1}
                              >
                                <label htmlFor={`startDate-${index}-activity`}>
                                  시작년월<span>*</span>
                                </label>
                                <div className="comnm">
                                  <DatePicker
                                    selected={parseYearMonth(
                                      activity.startDate
                                    )}
                                    onChange={(date: Date | null) => {
                                      const v = date
                                        ? `${date.getFullYear()}-${String(
                                            date.getMonth() + 1
                                          ).padStart(2, "0")}`
                                        : "";
                                      handleActivityChange(
                                        index,
                                        "startDate",
                                        v
                                      );
                                    }}
                                    dateFormat="yyyy-MM"
                                    showMonthYearPicker
                                    className="form-control w-full"
                                    locale="ko"
                                    onChangeRaw={(e) => e?.preventDefault()}
                                  />
                                </div>
                                <ErrorMessage
                                  field={`activity.${index}.startDate`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `activity.${index}.endDate`
                                )}`}
                              >
                                <label htmlFor={`endDate-${index}-activity`}>
                                  종료년월<span>*</span>
                                </label>
                                <div className="comnm">
                                  <DatePicker
                                    selected={parseYearMonth(activity.endDate)}
                                    onChange={(date: Date | null) => {
                                      const v = date
                                        ? `${date.getFullYear()}-${String(
                                            date.getMonth() + 1
                                          ).padStart(2, "0")}`
                                        : "";
                                      handleActivityChange(index, "endDate", v);
                                    }}
                                    dateFormat="yyyy-MM"
                                    showMonthYearPicker
                                    className="form-control w-full"
                                    locale="ko"
                                    onChangeRaw={(e) => e?.preventDefault()}
                                  />
                                </div>
                                <ErrorMessage
                                  field={`activity.${index}.endDate`}
                                />
                              </div>
                            </div>
                            {/* row end*/}
                            {/* row */}
                            <div className="row">
                              <div style={{ width: "100%" }}>
                                <textarea
                                  name={`activities.${index}.description`}
                                  id={`field-activity-${index}-description`}
                                  className={`${getErrorClass(
                                    `activity.${index}.description`
                                  )}`}
                                  placeholder="활동내용*"
                                  value={activity.description}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                ></textarea>
                                <ErrorMessage
                                  field={`activity.${index}.description`}
                                />
                              </div>
                            </div>
                            {/* row end*/}
                          </div>
                        ))}
                        {/* row */}
                        <button
                          type="button"
                          id="addActivityBtn"
                          className="infoaddBrn"
                          onClick={addActivity}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                    </dd>
                  </dl>
                  {/* 인턴/대외활동 end*/}

                  {/* 아포스티유 */}
                  <dl id="apostille-section">
                    <dt>아포스티유</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.apostilles.map((apostille, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div className="apostille-upload">
                                <label
                                  htmlFor={`field-apostille-${index}-file`}
                                >
                                  {apostille.file
                                    ? apostille.file.name
                                    : "+ 파일추가"}
                                </label>
                                <input
                                  type="file"
                                  name={`apostille_file-${index}`}
                                  id={`field-apostille-${index}-file`}
                                  onChange={(e) =>
                                    handleApostilleChange(
                                      index,
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                              </div>

                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeApostille(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>

                            {apostille.apo_download_url && (
                              <div className="row">
                                <button
                                  type="button"
                                  className="preview-btn"
                                  onClick={async () => {
                                    try {
                                      // URL에서 파일 가져오기
                                      const response = await fetch(
                                        apostille.apo_download_url as string
                                      );
                                      const blob = await response.blob();

                                      // Blob으로부터 다운로드 링크 생성
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement("a");
                                      link.href = url;
                                      link.download =
                                        apostille.apo_file_nm as string;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                    } catch (error) {
                                      console.error(
                                        "파일 다운로드 중 오류 발생:",
                                        error
                                      );
                                    }
                                  }}
                                >
                                  다운로드
                                </button>
                              </div>
                            )}
                            {/* row end*/}
                          </div>
                        ))}
                        {/* row */}
                        <button
                          type="button"
                          id="addApostilleBtn"
                          className="infoaddBrn"
                          onClick={addApostille}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                      <ErrorMessage field="apostilles" />
                    </dd>
                  </dl>
                  {/* 아포스티유 end*/}

                  {/* 자격증 */}
                  <dl id="certification-section">
                    <dt>자격증</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.certifications.map(
                          (certification, index) => (
                            <div
                              key={index}
                              className="resume-item"
                              style={{ marginBottom: 20 }}
                            >
                              {/* row */}
                              <div className="row">
                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `certification.${index}.certificationName`
                                  )}`}
                                  id={`field-certification-${index}-certificationName`}
                                  tabIndex={-1}
                                >
                                  <label htmlFor="certificationName">
                                    자격증 명<span>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="certificationName"
                                    value={certification.certificationName}
                                    onChange={(e) =>
                                      handleCertificationChange(
                                        index,
                                        "certificationName",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                  <ErrorMessage
                                    field={`certification.${index}.certificationName`}
                                  />
                                </div>
                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `certification.${index}.issuingOrganization`
                                  )}`}
                                  id={`field-certification-${index}-issuingOrganization`}
                                >
                                  <label htmlFor="issuingOrganization">
                                    발행처<span>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="issuingOrganization"
                                    value={certification.issuingOrganization}
                                    onChange={(e) =>
                                      handleCertificationChange(
                                        index,
                                        "issuingOrganization",
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                  <ErrorMessage
                                    field={`certification.${index}.issuingOrganization`}
                                  />
                                </div>
                                <div
                                  className={`SelectBox ${getErrorClass(
                                    `certification.${index}.acquisitionDate`
                                  )}`}
                                  id={`field-certification-${index}-acquisitionDate`}
                                >
                                  <label htmlFor="acquisitionDate">
                                    취득년월<span>*</span>
                                  </label>
                                  <DatePicker
                                    selected={parseYearMonth(
                                      certification.acquisitionDate
                                    )}
                                    onChange={(date: Date | null) => {
                                      const v = date
                                        ? `${date.getFullYear()}-${String(
                                            date.getMonth() + 1
                                          ).padStart(2, "0")}`
                                        : "";
                                      handleCertificationChange(
                                        index,
                                        "acquisitionDate",
                                        v
                                      );
                                    }}
                                    dateFormat="yyyy-MM"
                                    showMonthYearPicker
                                    className="form-control w-full"
                                    locale="ko"
                                    onChangeRaw={(e) => e?.preventDefault()}
                                  />
                                  <ErrorMessage
                                    field={`certification.${index}.acquisitionDate`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="adddelBtn"
                                  onClick={() => removeCertification(index)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="60"
                                    height="60"
                                    viewBox="0 0 60 60"
                                    fill="none"
                                  >
                                    <rect
                                      x="0.5"
                                      y="0.5"
                                      width="59"
                                      height="59"
                                      rx="19.5"
                                      fill="#F5F5F5"
                                      stroke="#CBCBCB"
                                    />
                                    <rect
                                      x="24.4141"
                                      y="23"
                                      width="17"
                                      height="2"
                                      transform="rotate(45 24.4141 23)"
                                      fill="#A8A8A8"
                                    />
                                    <rect
                                      x="36.4355"
                                      y="24.4141"
                                      width="17"
                                      height="2"
                                      transform="rotate(135 36.4355 24.4141)"
                                      fill="#A8A8A8"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {/* row end*/}
                            </div>
                          )
                        )}
                        {/* row */}
                        <button
                          type="button"
                          id="addCertificationBtn"
                          className="infoaddBrn"
                          onClick={addCertification}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                    </dd>
                  </dl>
                  {/* 자격증 end*/}

                  {/* 수상 */}
                  <dl id="award-section">
                    <dt>수상</dt>
                    <dd>
                      <div className="row-container">
                        {resumeForm.awards.map((award, index) => (
                          <div
                            key={index}
                            className="resume-item"
                            style={{ marginBottom: 20 }}
                          >
                            {/* row */}
                            <div className="row">
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `award.${index}.awardName`
                                )}`}
                                id={`field-award-${index}-awardName`}
                                tabIndex={-1}
                              >
                                <label htmlFor="awardName">
                                  수상 명<span>*</span>
                                </label>
                                <input
                                  type="text"
                                  name="awardName"
                                  value={award.awardName}
                                  onChange={(e) =>
                                    handleAwardChange(
                                      index,
                                      "awardName",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                />
                                <ErrorMessage
                                  field={`award.${index}.awardName`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `award.${index}.awardingOrganization`
                                )}`}
                                id={`field-award-${index}-awardingOrganization`}
                              >
                                <label htmlFor="awardingOrganization">
                                  수여기관<span>*</span>
                                </label>
                                <input
                                  type="text"
                                  name="awardingOrganization"
                                  value={award.awardingOrganization}
                                  onChange={(e) =>
                                    handleAwardChange(
                                      index,
                                      "awardingOrganization",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                />
                                <ErrorMessage
                                  field={`award.${index}.awardingOrganization`}
                                />
                              </div>
                              <div
                                className={`SelectBox ${getErrorClass(
                                  `award.${index}.awardYear`
                                )}`}
                                id={`field-award-${index}-awardYear`}
                              >
                                <label htmlFor="awardYear">
                                  수상연도<span>*</span>
                                </label>
                                <DatePicker
                                  selected={parseYearMonth(award.awardYear)}
                                  onChange={(date: Date | null) => {
                                    const v = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleAwardChange(index, "awardYear", v);
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText="수상연도"
                                  className="form-control w-full"
                                  locale="ko"
                                  onChangeRaw={(e) => e?.preventDefault()}
                                />
                                <ErrorMessage
                                  field={`award.${index}.awardYear`}
                                />
                              </div>
                              <button
                                type="button"
                                className="adddelBtn"
                                onClick={() => removeAward(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="60"
                                  height="60"
                                  viewBox="0 0 60 60"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="59"
                                    height="59"
                                    rx="19.5"
                                    fill="#F5F5F5"
                                    stroke="#CBCBCB"
                                  />
                                  <rect
                                    x="24.4141"
                                    y="23"
                                    width="17"
                                    height="2"
                                    transform="rotate(45 24.4141 23)"
                                    fill="#A8A8A8"
                                  />
                                  <rect
                                    x="36.4355"
                                    y="24.4141"
                                    width="17"
                                    height="2"
                                    transform="rotate(135 36.4355 24.4141)"
                                    fill="#A8A8A8"
                                  />
                                </svg>
                              </button>
                            </div>
                            {/* row end*/}
                            {/* row */}
                            <div className="row">
                              <div style={{ width: "100%" }}>
                                <textarea
                                  name={`awards.${index}.description`}
                                  id={`field-award-${index}-description`}
                                  className={`${getErrorClass(
                                    `award.${index}.description`
                                  )}`}
                                  placeholder="수상내용*"
                                  value={award.description}
                                  onChange={(e) =>
                                    handleAwardChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                ></textarea>
                                <ErrorMessage
                                  field={`award.${index}.description`}
                                />
                              </div>
                            </div>
                            {/* row end*/}
                          </div>
                        ))}
                        {/* row */}
                        <button
                          type="button"
                          id="addAwardBtn"
                          className="infoaddBrn"
                          onClick={addAward}
                        >
                          + 추가
                        </button>
                        {/* row end*/}
                      </div>
                    </dd>
                  </dl>
                  {/* 수상 end*/}

                  {/* 취업우대·병역 */}
                  <dl id="employment-preferences-section">
                    <dt>취업우대·병역</dt>
                    <dd>
                      {/* row */}
                      <div className="row">
                        <div className="SelectBox bg1 w04">
                          <div className="military">
                            <div className="scheck-primary">
                              <input
                                type="checkbox"
                                id="isVeteran"
                                name="employmentPreferences.isVeteran"
                                checked={
                                  resumeForm.employmentPreferences.isVeteran
                                }
                                onChange={handleInputChange}
                              />
                              <label htmlFor="isVeteran">보훈대상</label>
                            </div>
                          </div>
                        </div>
                        <div className="SelectBox bg1 w04">
                          <div className="military">
                            <div className="scheck-primary">
                              <input
                                type="checkbox"
                                id="isEmploymentProtected"
                                name="employmentPreferences.isEmploymentProtected"
                                checked={
                                  resumeForm.employmentPreferences
                                    .isEmploymentProtected
                                }
                                onChange={handleInputChange}
                              />
                              <label htmlFor="isEmploymentProtected">
                                취업보호대상
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="SelectBox bg1 w04">
                          <div className="military">
                            <div className="scheck-primary">
                              <input
                                type="checkbox"
                                id="isEmploymentSupport"
                                name="employmentPreferences.isEmploymentSupport"
                                checked={
                                  resumeForm.employmentPreferences
                                    .isEmploymentSupport
                                }
                                onChange={handleInputChange}
                              />
                              <label htmlFor="isEmploymentSupport">
                                고용지원금 대상
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="SelectBox bg1 w04">
                          <div className="military">
                            <div className="scheck-primary">
                              <input
                                type="checkbox"
                                id="isDisabled"
                                name="employmentPreferences.isDisabled"
                                checked={
                                  resumeForm.employmentPreferences.isDisabled
                                }
                                onChange={handleInputChange}
                              />
                              <label htmlFor="isDisabled">장애</label>
                            </div>
                          </div>
                        </div>
                        <div className="SelectBox bg1 w04">
                          <div className="military">
                            <div className="scheck-primary">
                              <input
                                type="checkbox"
                                id="hasMilitaryService"
                                name="employmentPreferences.hasMilitaryService"
                                checked={
                                  resumeForm.employmentPreferences
                                    .hasMilitaryService
                                }
                                onChange={handleInputChange}
                              />
                              <label htmlFor="hasMilitaryService">병역</label>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="adddelBtn"
                          onClick={employmentPreferencesReset}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="60"
                            height="60"
                            viewBox="0 0 60 60"
                            fill="none"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="59"
                              height="59"
                              rx="19.5"
                              fill="#F5F5F5"
                              stroke="#CBCBCB"
                            />
                            <rect
                              x="24.4141"
                              y="23"
                              width="17"
                              height="2"
                              transform="rotate(45 24.4141 23)"
                              fill="#A8A8A8"
                            />
                            <rect
                              x="36.4355"
                              y="24.4141"
                              width="17"
                              height="2"
                              transform="rotate(135 36.4355 24.4141)"
                              fill="#A8A8A8"
                            />
                          </svg>
                        </button>
                      </div>
                      {/* row end*/}

                      {/* 장애 체크시 노출 */}
                      {resumeForm.employmentPreferences.isDisabled && (
                        <div className="row" id="display4">
                          <div
                            className={`SelectBox ${getErrorClass(
                              `employmentPreferences.disabledGrade`
                            )}`}
                            id={`field-employmentPreferences-disabledGrade`}
                          >
                            <label htmlFor="disabledGrade">
                              장애 등급<span>*</span>
                            </label>
                            <NiceSelectBox
                              value={
                                resumeForm.employmentPreferences.disabledGrade
                              }
                              options={disabledLevelOptions}
                              onChange={(value) =>
                                handleEmploymentPreferencesChange(
                                  "disabledGrade",
                                  value || ""
                                )
                              }
                              placeholder="장애 등급 선택"
                            />
                            <ErrorMessage
                              field={`employmentPreferences.disabledGrade`}
                            />
                          </div>
                        </div>
                      )}
                      {/*  장애 체크시 노출 end*/}

                      {/* 병역 체크시 노출 */}
                      {resumeForm.employmentPreferences.hasMilitaryService && (
                        <div className="row" id="display5">
                          <div
                            className={`SelectBox ${getErrorClass(
                              `employmentPreferences.militaryServiceStatus`
                            )}`}
                            id={`field-employmentPreferences-militaryServiceStatus`}
                          >
                            <label htmlFor="militaryServiceStatus">
                              병역<span>*</span>
                            </label>
                            <NiceSelectBox
                              value={
                                resumeForm.employmentPreferences
                                  .militaryServiceStatus
                              }
                              options={militaryServiceOptions}
                              onChange={(value) =>
                                handleEmploymentPreferencesChange(
                                  "militaryServiceStatus",
                                  value || ""
                                )
                              }
                              placeholder="병역 선택"
                            />
                            <ErrorMessage
                              field={`employmentPreferences.militaryServiceStatus`}
                            />
                          </div>
                          {resumeForm.employmentPreferences
                            .militaryServiceStatus === "completed" && (
                            <>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `employmentPreferences.militaryServiceJoinDate`
                                )}`}
                                id={`field-employmentPreferences-militaryServiceJoinDate`}
                              >
                                <label htmlFor="militaryServiceJoinDate">
                                  입대일<span>*</span>
                                </label>
                                <DatePicker
                                  id="militaryServiceJoinDate"
                                  onChangeRaw={(e) => e?.preventDefault()}
                                  selected={parseYearMonth(
                                    resumeForm.employmentPreferences
                                      .militaryServiceJoinDate
                                  )}
                                  onChange={(date) => {
                                    const value = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleEmploymentPreferencesChange(
                                      "militaryServiceJoinDate",
                                      value
                                    );
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText="입대일"
                                  className="form-control"
                                  locale="ko"
                                />
                                <ErrorMessage
                                  field={`employmentPreferences.militaryServiceJoinDate`}
                                />
                                {/* <input
                                  type="text"
                                  id="militaryServiceJoinDate"
                                  name="militaryServiceJoinDate"
                                  className="form-control"
                                  value={
                                    resumeForm.employmentPreferences
                                      .militaryServiceJoinDate
                                  }
                                  onChange={(e) =>
                                    handleEmploymentPreferencesChange(
                                      "militaryServiceJoinDate",
                                      e.target.value,
                                    )
                                  }
                                /> */}
                              </div>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `employmentPreferences.militaryServiceOutDate`
                                )}`}
                                id={`field-employmentPreferences-militaryServiceOutDate`}
                              >
                                <label htmlFor="militaryServiceOutDate">
                                  제대일<span>*</span>
                                </label>
                                <DatePicker
                                  id="militaryServiceOutDate"
                                  onChangeRaw={(e) => e?.preventDefault()}
                                  selected={parseYearMonth(
                                    resumeForm.employmentPreferences
                                      .militaryServiceOutDate
                                  )}
                                  onChange={(date) => {
                                    const value = date
                                      ? `${date.getFullYear()}-${String(
                                          date.getMonth() + 1
                                        ).padStart(2, "0")}`
                                      : "";
                                    handleEmploymentPreferencesChange(
                                      "militaryServiceOutDate",
                                      value
                                    );
                                  }}
                                  dateFormat="yyyy-MM"
                                  showMonthYearPicker
                                  placeholderText="제대일"
                                  className="form-control"
                                  locale="ko"
                                />
                                <ErrorMessage
                                  field={`employmentPreferences.militaryServiceOutDate`}
                                />
                                {/* <input
                                  type="text"
                                  id="militaryServiceOutDate"
                                  name="militaryServiceOutDate"
                                  className="form-control"
                                  value={
                                    resumeForm.employmentPreferences
                                      .militaryServiceOutDate
                                  }
                                  onChange={(e) =>
                                    handleEmploymentPreferencesChange(
                                      "militaryServiceOutDate",
                                      e.target.value,
                                    )
                                  }
                                /> */}
                              </div>
                              <div
                                className={`SelectBox w01 ${getErrorClass(
                                  `employmentPreferences.militaryServiceClass`
                                )}`}
                                id={`field-employmentPreferences-militaryServiceClass`}
                              >
                                <label htmlFor="militaryServiceClass">
                                  제대 계급
                                </label>
                                <NiceSelectBox
                                  value={
                                    resumeForm.employmentPreferences
                                      .militaryServiceClass
                                  }
                                  options={militaryServiceClassOptions}
                                  onChange={(value) =>
                                    handleEmploymentPreferencesChange(
                                      "militaryServiceClass",
                                      value || ""
                                    )
                                  }
                                  placeholder="선택"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {/*  병역 체크시 노출 end*/}

                      {/* row */}
                      <div className="row">
                        <div className="agreeBox">
                          <input
                            type="checkbox"
                            id="field-agree"
                            name="field-agree"
                            value="1"
                            className="check_box"
                            checked={agreeToSensitiveInfo}
                            onChange={(e) =>
                              setAgreeToSensitiveInfo(e.target.checked)
                            }
                          />
                          <label htmlFor="field-agree" className="txt">
                            <span>(필수)</span>민감정보 수집에 동의합니다.{" "}
                            <i className="fa-solid fa-angle-down"></i>
                          </label>
                        </div>
                      </div>
                      <div className="row">
                        <ErrorMessage field="agreeToSensitiveInfo" />
                      </div>
                      {/* row end*/}

                      {/* row */}
                      <div className="row">
                        <textarea
                          className="form-control bg1 txt1"
                          readOnly
                          value={`1. 수집·이용목적 : 일반회원 의사에 따른 구직활동
2. 수집 항목 : 취업보호
3. 보유 및 이용기간 : 서비스 이용 시점까지
4. 민감정보는 선택 항목이며, 입력하지 않아도 이력서 작성에 제한을 두지 않습니다.`}
                        />
                      </div>
                      {/* row end*/}
                    </dd>
                  </dl>
                  {/* 취업우대·병역 end*/}

                  {/* 자기소개서 */}
                  <dl id="self-introduction-section">
                    <dt>자기소개서</dt>
                    <dd>
                      <div>
                        {resumeForm.selfIntroductions.map(
                          (selfIntroduction, index) => (
                            <div
                              key={index}
                              className="resume-item"
                              style={{ marginBottom: 20 }}
                            >
                              {/* row */}
                              <div className="row">
                                <div
                                  className={`personal ${getErrorClass(
                                    `selfIntroduction.${index}.title`
                                  )}`}
                                  id={`field-selfIntroduction-${index}-title`}
                                  tabIndex={-1}
                                >
                                  <div className="personal_title">
                                    <input
                                      type="text"
                                      name="title"
                                      value={selfIntroduction.title}
                                      onChange={(e) =>
                                        handleSelfIntroductionChange(
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder="제목을 입력해 주세요."
                                    />
                                    <ErrorMessage
                                      field={`selfIntroduction.${index}.title`}
                                    />
                                  </div>
                                  <div
                                    className={`personal_textarea ${getErrorClass(
                                      `selfIntroduction.${index}.content`
                                    )}`}
                                    id={`field-selfIntroduction-${index}-content`}
                                    tabIndex={-1}
                                  >
                                    <textarea
                                      name="content"
                                      value={selfIntroduction.content}
                                      onChange={(e) =>
                                        handleSelfIntroductionChange(
                                          index,
                                          "content",
                                          e.target.value
                                        )
                                      }
                                      className="form-control"
                                      placeholder="내용을 입력해 주세요."
                                    ></textarea>
                                    <ErrorMessage
                                      field={`selfIntroduction.${index}.content`}
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="adddelBtn"
                                  onClick={() => removeSelfIntroductions(index)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="60"
                                    height="60"
                                    viewBox="0 0 60 60"
                                    fill="none"
                                  >
                                    <rect
                                      x="0.5"
                                      y="0.5"
                                      width="59"
                                      height="59"
                                      rx="19.5"
                                      fill="#F5F5F5"
                                      stroke="#CBCBCB"
                                    />
                                    <rect
                                      x="24.4141"
                                      y="23"
                                      width="17"
                                      height="2"
                                      transform="rotate(45 24.4141 23)"
                                      fill="#A8A8A8"
                                    />
                                    <rect
                                      x="36.4355"
                                      y="24.4141"
                                      width="17"
                                      height="2"
                                      transform="rotate(135 36.4355 24.4141)"
                                      fill="#A8A8A8"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {/* row end*/}
                            </div>
                          )
                        )}
                      </div>
                      {/* row */}
                      <button
                        type="button"
                        id="addSelfIntroductionBtn"
                        className="infoaddBrn"
                        onClick={addSelfIntroduction}
                      >
                        + 추가
                      </button>
                      {/* row end*/}
                    </dd>
                  </dl>
                </div>
                {/* 자기소개서 end*/}
              </div>
              {/* form end */}

              {/* side start */}
              <div
                className="resume_side"
                style={{ position: "fixed", right: "calc(50% - 660px)" }}
              >
                <aside>
                  {/* sidebarBox */}
                  <div className="sidebarBox">
                    <ul>
                      <li>
                        <div
                          className={`txt ${
                            isEducationFilled() ? "active" : ""
                          }`}
                        >
                          학력
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isEducationFilled()}
                            onClick={handleEducationDelete}
                            sectionId="education-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isLanguageFilled() ? "active" : ""
                          }`}
                        >
                          어학
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isLanguageFilled()}
                            onClick={handleLanguageDelete}
                            sectionId="language-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${isCareerFilled() ? "active" : ""}`}
                        >
                          경력
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isCareerFilled()}
                            onClick={handleCareerDelete}
                            sectionId="career-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isActivityFilled() ? "active" : ""
                          }`}
                        >
                          인턴/대외활동
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isActivityFilled()}
                            onClick={handleActivityDelete}
                            sectionId="activity-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isApostilleFilled() ? "active" : ""
                          }`}
                        >
                          아포스티유
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isApostilleFilled()}
                            onClick={handleApostilleDelete}
                            sectionId="apostille-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isCertificationFilled() ? "active" : ""
                          }`}
                        >
                          자격증
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isCertificationFilled()}
                            onClick={handleCertificationDelete}
                            sectionId="certification-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${isAwardFilled() ? "active" : ""}`}
                        >
                          수상
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isAwardFilled()}
                            onClick={handleAwardDelete}
                            sectionId="award-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isEmploymentPreferencesFilled() ? "active" : ""
                          }`}
                        >
                          취업우대·병역
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isEmploymentPreferencesFilled()}
                            onClick={handleEmploymentPreferencesDelete}
                            sectionId="employment-preferences-section"
                          />
                        </div>
                      </li>
                      <li>
                        <div
                          className={`txt ${
                            isSelfIntroductionFilled() ? "active" : ""
                          }`}
                        >
                          자기소개서
                        </div>
                        <div className="icon">
                          <CheckIcon
                            isActive={isSelfIntroductionFilled()}
                            onClick={handleSelfIntroductionDelete}
                            sectionId="self-introduction-section"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                  {/* sidebarBox end */}
                  <div className="ResumeSave">
                    <button
                      type="button"
                      id="ResumeSave"
                      onClick={handleSubmit}
                    >
                      이력서 저장
                    </button>
                  </div>
                </aside>
              </div>
              {/* side end */}
            </div>

            {/* resume_write end */}
          </div>
          <div
            className="ResumeSave"
            style={{ width: "240px", margin: "20px auto" }}
          >
            <button type="button" id="ResumeSave" onClick={handleSubmit}>
              이력서 저장
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeWrite;
