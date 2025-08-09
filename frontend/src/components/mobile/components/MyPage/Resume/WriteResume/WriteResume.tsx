import "./WriteResume.css";
import MobileMainHeader from "../../../MainHeader/MainHeader";
import CheckBox from "../../../CheckBox/CheckBox";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { resumeApi } from "../../../../../../api/resume";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import { ResumeForm, Apostille } from "../../../../../../types/resume";
import NiceSelectBox from "../../../../../common/NiceSelectBox";
import SearchableInputMobile from "../../../SearchableInputMobile/SearchableInputMobile";
import { UserProfile } from "../../../../../../types/user";
import { userApi } from "../../../../../../api/user";
import {
  formatBirthAndAge,
  formatGender,
} from "../../../../../../utils/formatUtils";

import { useAlert } from "../../../../../../contexts/AlertContext";
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
} from "../../../../../../app/dummy/options";
import { MetaTagHelmet } from "../../../../../common/MetaTagHelmet";

export default function MobileWriteResume() {
  registerLocale("ko", ko);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const gbn = searchParams.get("gbn");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // 파일 입력 요소에 접근하기 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  // 사진 업로드 버튼 클릭 시 파일 입력창을 열어줌
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const [previewImage, setPreviewImage] = useState<string>("");
  // 파일 선택 시 FileReader로 이미지 Data URL을 생성하여 상태 업데이트
  const [showGPA, setShowGPA] = useState<{ [key: number]: boolean }>({});
  const [showRegion, setShowRegion] = useState<{ [key: number]: boolean }>({});
  const [showAdditionalMajor, setShowAdditionalMajor] = useState<{
    [key: number]: boolean;
  }>({});
  const { customAlert } = useAlert();

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
    if (id) {
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
        customAlert({
          content: "프로필 이미지가 성공적으로 변경되었습니다.",
        });
      } catch (error) {
        console.error("프로필 이미지 업로드 실패:", error);
        customAlert({
          content: "프로필 이미지 업로드에 실패했습니다.",
        });
        setPreviewImage("");
        setSelectedImage(null);
        URL.revokeObjectURL(previewUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };
  const navigate = useNavigate();
  const parseYearMonth = (value: string): Date | null => {
    if (!value) return null;
    const [yStr, mStr] = value.split("-");
    const year = Number(yStr),
      month = Number(mStr);
    if (isNaN(year) || isNaN(month)) return null;
    return new Date(year, month - 1, 1);
  };
  // const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        try {
          const response = await resumeApi.getResumeDetail(Number(id));
          if (response.data) {
            // 아포스티유 데이터를 File 객체로 변환
            const convertedApostilles = await Promise.all(
              response.data.apostilles.map(async (apostille: Apostille) => {
                if (apostille.apo_download_url) {
                  try {
                    const response = await fetch(apostille.apo_download_url);
                    const blob = await response.blob();
                    return {
                      ...apostille,
                      file: new File(
                        [blob],
                        apostille.apo_file_nm || "apostille.pdf",
                        {
                          type: blob.type,
                        }
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
            fetchUserProfile();
            setResumeForm((prev) => ({
              ...prev,
              ...response.data,
              apostilles: convertedApostilles,
            }));
            fetchUserProfile();
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
      loadAreaOptions();
    }
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
      isCurrent: false,
    };

    setResumeForm({
      ...resumeForm,
      careers: [...resumeForm.careers, newCareer],
    });
  };
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <div
        className="error-message mr-auto w-full text-start"
        style={{ marginTop: "0" }}
      >
        {errors[field]}
      </div>
    ) : null;
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
  const removeCareer = (index: number) => {
    const updatedCareers = resumeForm.careers.filter(
      (career, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      careers: updatedCareers,
    });
  };

  const handleApotifyChange = (index: number, name: string, value: string) => {
    const updatedApostilles = resumeForm.apostilles.map((apostille, i) =>
      i === index ? { ...apostille, [name]: value } : apostille
    );

    setResumeForm({
      ...resumeForm,
      apostilles: updatedApostilles,
    });
  };
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreeToSensitiveInfo, setAgreeToSensitiveInfo] = useState<boolean>(
    !!id
  );
  const removeApostille = (index: number) => {
    const updatedApostilles = resumeForm.apostilles.filter(
      (apostille, i) => i !== index
    );

    setResumeForm({
      ...resumeForm,
      apostilles: updatedApostilles,
    });
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

  const addApostille = () => {
    const newApostille = {
      file: null,
    };

    setResumeForm({
      ...resumeForm,
      apostilles: [...resumeForm.apostilles, newApostille],
    });
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
  const validateForm = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    // 기본 정보 검증
    if (!resumeForm.title.trim()) {
      newErrors["title"] = "이력서 제목을 입력해주세요.";
    }

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
      if (!selfIntroduction.title.trim()) {
        newErrors[`selfIntroduction.${index}.title`] = "제목을 입력해주세요.";
      }
      if (!selfIntroduction.content.trim()) {
        newErrors[`selfIntroduction.${index}.content`] = "내용을 입력해주세요.";
      }
    });

    setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
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
      if (id) {
        if (gbn === "copy") {
          await resumeApi.createResume(formData);
          customAlert({
            content: "이력서가 성공적으로 저장되었습니다.",
            onConfirm() {
              navigate("/m/mypage/resume");
            },
          });
          return;
        } else {
          await resumeApi.updateResume(Number(id), formData);
          customAlert({
            content: "이력서가 성공적으로 수정되었습니다.",
            onConfirm() {
              navigate("/m/mypage/resume");
            },
          });
        }
      } else {
        await resumeApi.createResume(formData);
        customAlert({
          content: "이력서가 성공적으로 저장되었습니다.",
          onConfirm() {
            navigate("/m/mypage/resume");
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

  useEffect(() => {
    // 각 섹션의 기본값 추가를 위한 버튼 클릭 트리거
    const buttons = [
      "addEducationBtn",
      "addLanguageBtn",
      "addCareerBtn",
      "addActivityBtn",
      "addApostilleBtn",
      "addCertificationBtn",
      "addAwardBtn",
      "addSelfIntroductionBtn",
    ];

    // 각 버튼을 순차적으로 클릭
    buttons.forEach((btnId, index) => {
      setTimeout(() => {
        document.getElementById(btnId)?.click();
      }, index * 100);
    });
  }, []);

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

    fetchUserProfile();
  }, [id]);
  // 학력 관련 상태 추가
  // const [showGPA, setShowGPA] = useState<{ [key: number]: boolean }>({});
  // const [showRegion, setShowRegion] = useState<{ [key: number]: boolean }>({});
  // const [showAdditionalMajor, setShowAdditionalMajor] = useState<{
  //   [key: number]: boolean;
  // }>({});

  // 토글 핸들러 함수들
  const toggleGPA = (index: number) => {
    setShowGPA((prev) => {
      const next = !prev[index];
      if (!next) {
        // 꺼질 때 학점 관련 필드 초기화
        setResumeForm((f) => ({
          ...f,
          educations: f.educations.map((edu, i) =>
            i === index
              ? { ...edu, totalCredits: "", gpa: "", transferStatus: false }
              : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };

  // 희망근무지 토글
  const toggleRegion = (index: number) => {
    setShowRegion((prev) => {
      const next = !prev[index];
      if (!next) {
        // 꺼질 때 region 초기화
        setResumeForm((f) => ({
          ...f,
          educations: f.educations.map((edu, i) =>
            i === index ? { ...edu, region: "" } : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };

  // 추가전공 토글
  const toggleAdditionalMajor = (index: number) => {
    setShowAdditionalMajor((prev) => {
      const next = !prev[index];
      if (!next) {
        // 꺼질 때 추가전공 필드 초기화
        setResumeForm((f) => ({
          ...f,
          educations: f.educations.map((edu, i) =>
            i === index
              ? { ...edu, additionalMajor: "", additionalMajorType: "" }
              : edu
          ),
        }));
      }
      return { ...prev, [index]: next };
    });
  };
  const [areaOptionsState, setAreaOptionsState] = useState(areaOptions);
  const loadAreaOptions = async () => {
    const options = await fetchAreaOptions();
    setAreaOptionsState(options);
  };
  function normalizeBirth(rawBirth: string) {
    if (/^\d{8}$/.test(rawBirth)) {
      return rawBirth.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
    }
    return rawBirth;
  }

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
        if (education.gpa && /^\d+\.\d+$/.test(String(education.gpa))) {
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
    <div className="WriteResume_container resume_write mt-0">
      <MetaTagHelmet title="이력서 작성" description="이력서 작성" />
      <MobileMainHeader />
      <h3>이력서 작성</h3>
      <div
        className="uploadPictureDiv"
        onClick={handleUploadClick}
        style={{
          backgroundImage:
            previewImage || resumeForm.picturePath
              ? `url(${previewImage || resumeForm.picturePath})`
              : "none",
          backgroundSize: "contain",
          backgroundPosition: "center",

          height: "232px",
          width: "232px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 이미지가 없을 때만 버튼 표시 */}
        {!selectedImage && <button>사진 업로드</button>}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <p className="nameDesc">
        <strong>{userProfile.name}</strong>
        {formatGender(resumeForm.gender)}{" "}
        {formatBirthAndAge(normalizeBirth(resumeForm.birth) || "1992-01-01")}
      </p>
      <div
        className="flex flex-col w-full gap-5"
        style={{ width: "100%", padding: "0 20px", alignItems: "center" }}
      >
        <div
          className="input_default "
          style={{
            width: "232px",
            borderRadius: "5px",
            padding: "11px 15px",
            height: "auto",
          }}
        >
          <select
            className="w-full"
            name="careerType"
            value={resumeForm.careerType}
            onChange={handleInputChange}
          >
            <option value="">경력*</option>
            {careerTypeOptions.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div
          id="field-title"
          className="input_default w-full mx-20"
          style={{ height: "78px" }}
        >
          <input
            type="text"
            className="form-control"
            name="title"
            value={resumeForm.title}
            onChange={handleInputChange}
            placeholder="이력서 제목을 입력해 주세요."
          />
        </div>
        <ErrorMessage field="title" />
      </div>
      <section className="inputSection w-full">
        <div className="flexJb w-full" style={{ marginBottom: "12px" }}>
          <h4>학력</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.educations.length > 0) {
                removeEducation(resumeForm.educations.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" />
          </button>
        </div>
        {resumeForm.educations.map((education, index) => (
          <dd key={index} style={{ marginBottom: 20, width: "100%" }}>
            {/* row */}
            <div className="row">
              <div
                id={`field-education-${index}-lastSchool`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <select
                    className="w-full"
                    name="lastSchool"
                    value={education.lastSchool}
                    onChange={(e) =>
                      handleEducationChange(index, "lastSchool", e.target.value)
                    }
                  >
                    <option value="">학교*</option>
                    {schoolOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ErrorMessage field={`education.${index}.lastSchool`} />
              </div>
              <div
                id={`field-education-${index}-schoolName`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                {/* <div className="input_default"> */}
                <SearchableInputMobile
                  value={education.schoolName}
                  onChange={(value) =>
                    handleEducationChange(index, "schoolName", value)
                  }
                  onSelect={(value) =>
                    handleEducationChange(index, "schoolName", value)
                  }
                  placeholder="학교명을 입력해주세요"
                  dataType="국내대학"
                  dataField="level3"
                  level1Query={getSchoolType(education.lastSchool)}
                />
                {/* <SearchableInput
                  value={education.schoolName}
                  onChange={(value) =>
                    handleEducationChange(index, "schoolName", value)
                  }
                  onSelect={(value) =>
                    handleEducationChange(index, "schoolName", value)
                  }
                  placeholder="학교명을 입력해주세요"
                  dataType="국내대학"
                  dataField="level3"
                  level1Query={getSchoolType(education.lastSchool)}
                /> */}
                {/* </div> */}
                <ErrorMessage field={`education.${index}.schoolName`} />
              </div>
              <div
                id={`field-education-${index}-department`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <SearchableInputMobile
                  value={education.department}
                  onChange={(value) =>
                    handleEducationChange(index, "department", value)
                  }
                  onSelect={(value) =>
                    handleEducationChange(index, "department", value)
                  }
                  placeholder="학과를 입력해주세요"
                  dataType="국내대학전공"
                  dataField="level2"
                  keywordQuery={education.schoolName}
                />
                <ErrorMessage field={`education.${index}.department`} />
              </div>

              <button
                type="button"
                className="adddelBtn"
                onClick={() => removeEducation(index)}
              >
                {/* 삭제 아이콘 */}
              </button>
            </div>
            {/* row end*/}
            <div className="inputRow">
              <div
                id={`field-education-${index}-admissionDate`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div
                  className="input_default w-full w-100 mb-5 "
                  style={{ padding: "0 5px" }}
                >
                  <DatePicker
                    selected={parseYearMonth(education.admissionDate)}
                    onChange={(date) => {
                      const v = date
                        ? `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}`
                        : "";
                      handleEducationChange(index, "admissionDate", v);
                    }}
                    dateFormat="yyyy-MM"
                    showMonthYearPicker
                    placeholderText="입학년월*"
                    className="form-control"
                    locale="ko"
                    onChangeRaw={(e) => e?.preventDefault()}
                  />
                </div>
                <ErrorMessage field={`education.${index}.admissionDate`} />
              </div>
            </div>
            <div
              id={`field-education-${index}-graduationDate`}
              className="flex flex-col"
              style={{ width: "100%" }}
            >
              <div className="input_default w-100" style={{ padding: "0 5px" }}>
                <DatePicker
                  selected={parseYearMonth(education.graduationDate)}
                  onChange={(date) => {
                    const v = date
                      ? `${date.getFullYear()}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}`
                      : "";
                    handleEducationChange(index, "graduationDate", v);
                  }}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="졸업년월*"
                  className="form-control"
                  locale="ko"
                  onChangeRaw={(e) => e?.preventDefault()}
                />
              </div>
              <ErrorMessage field={`education.${index}.graduationDate`} />
            </div>
            <div
              id={`field-education-${index}-graduationStatus`}
              className="flex flex-col"
              style={{ width: "100%" }}
            >
              <div className="inputRow">
                <div
                  className="input_default w-full w-30 mt-10 "
                  style={{ padding: "10px" }}
                >
                  <select
                    className="w-full"
                    name="graduationStatus"
                    value={education.graduationStatus}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "graduationStatus",
                        e.target.value
                      )
                    }
                    style={{ fontSize: "12px" }}
                  >
                    <option value="">졸업상태*</option>
                    {gradStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="input_default w-30 mt-10">
                  <input
                    type="text"
                    name="totalCredits"
                    value={education.totalCredits}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "totalCredits",
                        e.target.value,
                      )
                    }
                    placeholder="학점 총점"
                  />
                </div>
                <div className="input_default w-30 mt-10">
                  <input
                    type="text"
                    name="gpa"
                    value={education.gpa}
                    onChange={(e) =>
                      handleEducationChange(index, "gpa", e.target.value)
                    }
                    placeholder="학점"
                  />
                </div> */}
              </div>
              <ErrorMessage field={`education.${index}.graduationStatus`} />
            </div>
            {showGPA[index] && (
              <div
                style={{
                  marginTop: "10px",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  id={`field-education-${index}-totalCredits`}
                  className="input_default"
                >
                  {/* <input
                    type="text"
                    name="totalCredits"
                    value={education.totalCredits}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "totalCredits",
                        e.target.value,
                      )
                    }
                    className="form-control"
                    placeholder="학점 총점"
                  /> */}
                  <input
                    type="number"
                    name="totalCredits"
                    step="0.01"
                    min="0"
                    max="4.5"
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
                    placeholder="학점 총점*"
                  />
                </div>
                <ErrorMessage field={`education.${index}.totalCredits`} />

                <div
                  id={`field-education-${index}-gpa`}
                  className="input_default"
                >
                  <input
                    type="number"
                    name="gpa"
                    step="0.01"
                    min="0"
                    max="4.5"
                    required
                    value={education.gpa}
                    onChange={(e) =>
                      handleEducationChange(index, "gpa", e.target.value)
                    }
                    className="form-control"
                    placeholder="학점*"
                  />
                </div>
                <ErrorMessage field={`education.${index}.gpa`} />

                <div
                  id={`field-education-${index}-transferStatus`}
                  className="transfer"
                >
                  <div className="scheck-primary">
                    <input
                      type="checkbox"
                      id={`transferStatus-${index}`}
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
                    <label htmlFor={`transferStatus-${index}`}>편입</label>
                  </div>
                </div>
              </div>
            )}
            {/* row end*/}

            {/* 추가전공 row */}
            {showAdditionalMajor[index] && (
              <div className="row" style={{ marginTop: "10px" }}>
                <SearchableInputMobile
                  value={education.additionalMajor}
                  onChange={(value) =>
                    handleEducationChange(index, "additionalMajor", value)
                  }
                  onSelect={(value) =>
                    handleEducationChange(index, "additionalMajor", value)
                  }
                  placeholder="학과를 입력해주세요"
                  dataType="국내대학전공"
                  dataField="level2"
                  keywordQuery={education.schoolName}
                />

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
            )}

            {/* 지역 선택 row */}
            {showRegion[index] && (
              <div className="row" style={{ marginTop: "10px" }}>
                <div className="SelectBox">
                  <NiceSelectBox
                    value={education.region}
                    options={areaOptionsState}
                    onChange={(value) =>
                      handleEducationChange(index, "region", value || "")
                    }
                    placeholder="희망근무지"
                  />
                </div>
              </div>
            )}
            <div className="row">
              <div
                className="addBtnbox"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  fontSize: "14px",
                  color: "#cbcbcb",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleRegion(index)}
                  style={{
                    height: "44px",
                    padding: "0 10px",
                    border: showRegion[index]
                      ? "1px solid #2e7fdb"
                      : "1px solid #eaeaea",
                    borderRadius: "15px",
                    color: showRegion[index] ? "#2e7fdb" : "#000",
                  }}
                >
                  + 희망근무지
                </button>
                <button
                  type="button"
                  onClick={() => toggleGPA(index)}
                  style={{
                    height: "44px",
                    padding: "0 10px",
                    border: showGPA[index]
                      ? "1px solid #2e7fdb"
                      : "1px solid #eaeaea",
                    borderRadius: "15px",
                    color: showGPA[index] ? "#2e7fdb" : "#000",
                  }}
                >
                  + 학점
                </button>
                <button
                  type="button"
                  onClick={() => toggleAdditionalMajor(index)}
                  style={{
                    height: "44px",
                    padding: "0 10px",
                    border: showAdditionalMajor[index]
                      ? "1px solid #2e7fdb"
                      : "1px solid #eaeaea",
                    borderRadius: "15px",
                    color: showAdditionalMajor[index] ? "#2e7fdb" : "#000",
                  }}
                >
                  + 추가전공
                </button>
              </div>
            </div>
          </dd>
        ))}

        <button className="addBtn mt-10" onClick={addEducation}>
          + 추가
        </button>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4 className="">어학능력</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.languages.length > 0) {
                removeLanguage(resumeForm.languages.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" />
          </button>
        </div>

        <div className="langSection">
          {/*  */}
          {resumeForm.languages.map((lang, index) => (
            <div key={index}>
              <div
                id={`field-language-${index}-language`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <select
                    value={lang.language}
                    onChange={(e) =>
                      handleLanguageChange(index, "language", e.target.value)
                    }
                    className="w-full"
                  >
                    <option value="">외국어*</option>
                    {languageOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ErrorMessage field={`language.${index}.language`} />
              </div>

              <div className="flexGap10 mt-10">
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-language-${index}-speakingLevel`}
                    className="input_default"
                    style={{ padding: "10px", fontSize: "12px" }}
                  >
                    <select
                      className="w-full"
                      value={lang.speakingLevel}
                      onChange={(e) =>
                        handleLanguageChange(
                          index,
                          "speakingLevel",
                          e.target.value
                        )
                      }
                    >
                      <option value="">회화수준*</option>
                      {languageLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ErrorMessage field={`language.${index}.speakingLevel`} />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-language-${index}-writingLevel`}
                    className="input_default"
                    style={{ padding: "10px", fontSize: "12px" }}
                  >
                    <select
                      className="w-full"
                      value={lang.writingLevel}
                      onChange={(e) =>
                        handleLanguageChange(
                          index,
                          "writingLevel",
                          e.target.value
                        )
                      }
                    >
                      <option value="">작문수준*</option>
                      {languageLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ErrorMessage field={`language.${index}.writingLevel`} />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-language-${index}-readingLevel`}
                    className="input_default"
                    style={{ padding: "10px", fontSize: "12px" }}
                  >
                    <select
                      className="w-full"
                      value={lang.readingLevel}
                      onChange={(e) =>
                        handleLanguageChange(
                          index,
                          "readingLevel",
                          e.target.value
                        )
                      }
                    >
                      <option value="">독해수준*</option>
                      {languageLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ErrorMessage field={`language.${index}.readingLevel`} />
                </div>
              </div>
            </div>
          ))}

          {/*  */}
          <button className="addBtn" onClick={addLanguage}>
            + 추가
          </button>
        </div>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>경력</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.careers.length > 0) {
                removeCareer(resumeForm.careers.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" alt="삭제" />
          </button>
        </div>
        <div className="careerSection">
          {resumeForm.careers.map((career, index) => (
            <div
              key={index}
              className="careerRow"
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                id={`field-career-${index}-companyName`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <input
                    type="text"
                    name="companyName"
                    placeholder="회사명*"
                    value={career.companyName}
                    onChange={(e) =>
                      handleCareerChange(index, "companyName", e.target.value)
                    }
                  />
                </div>
                <ErrorMessage field={`career.${index}.companyName`} />
              </div>

              <div
                id={`field-career-${index}-jobTitle`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="담당직무*"
                    value={career.jobTitle}
                    onChange={(e) =>
                      handleCareerChange(index, "jobTitle", e.target.value)
                    }
                  />
                </div>
                <ErrorMessage field={`career.${index}.jobTitle`} />
              </div>

              <div
                id={`field-career-${index}-position`}
                className="input_default"
              >
                <input
                  type="text"
                  name="position"
                  placeholder="직급/직책*"
                  value={career.position}
                  onChange={(e) =>
                    handleCareerChange(index, "position", e.target.value)
                  }
                />
              </div>
              <ErrorMessage field={`career.${index}.position`} />
              <div
                id={`field-career-${index}-responsibilities`}
                className="textFieldSection"
              >
                <textarea
                  name="responsibilities"
                  placeholder="담당업무*"
                  value={career.responsibilities}
                  onChange={(e) =>
                    handleCareerChange(
                      index,
                      "responsibilities",
                      e.target.value
                    )
                  }
                />
              </div>
              <ErrorMessage field={`career.${index}.responsibilities`} />
              <div
                id={`field-career-${index}-startDate`}
                className="flexGap10 w-full"
              >
                <div className="flex flex-col" style={{ width: "100%" }}>
                  <div className="input_default">
                    <DatePicker
                      selected={parseYearMonth(career.startDate)}
                      onChange={(date) => {
                        const v = date
                          ? `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}`
                          : "";
                        handleCareerChange(index, "startDate", v);
                      }}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      placeholderText="입사년월*"
                      className="form-control"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage field={`career.${index}.startDate`} />
                </div>
              </div>
              {career.isCurrent === false && (
                <div
                  id={`field-career-${index}-endDate`}
                  className="flex flex-col"
                  style={{ width: "100%" }}
                >
                  <div className="input_default">
                    <DatePicker
                      selected={parseYearMonth(career.endDate)}
                      onChange={(date) => {
                        const v = date
                          ? `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}`
                          : "";
                        handleCareerChange(index, "endDate", v);
                      }}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      placeholderText="퇴사년월*"
                      className="form-control"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage field={`career.${index}.endDate`} />
                </div>
              )}
              <div
                id={`field-career-${index}-isCurrent`}
                className="input_default"
              >
                <p style={{ textWrap: "nowrap" }}>재직여부*</p>
                <div className="inputRow">
                  <label>
                    <input
                      type="radio"
                      name={`isCurrent-${index}`}
                      checked={career.isCurrent === true}
                      onChange={() =>
                        handleCareerChange(index, "isCurrent", true)
                      }
                    />
                    재직중
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`isCurrent-${index}`}
                      checked={career.isCurrent === false}
                      onChange={() =>
                        handleCareerChange(index, "isCurrent", false)
                      }
                    />
                    퇴사
                  </label>
                </div>
                <ErrorMessage field={`career.${index}.isCurrent`} />
              </div>
            </div>
          ))}
          <button type="button" className="addBtn mt-10" onClick={addCareer}>
            + 추가
          </button>
        </div>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>인턴/대외활동</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.activities.length > 0) {
                removeActivity(resumeForm.activities.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" alt="삭제" />
          </button>
        </div>
        <div
          className="internSection"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {resumeForm.activities.map((activity, index) => (
            <div
              key={index}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                id={`field-activity-${index}-activityType`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <select
                    value={activity.activityType}
                    onChange={(e) =>
                      handleActivityChange(
                        index,
                        "activityType",
                        e.target.value
                      )
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">활동구분*</option>
                    {internTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ErrorMessage field={`activity.${index}.activityType`} />
              </div>

              <div
                id={`field-activity-${index}-organizationName`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <input
                    type="text"
                    placeholder="회사/기관/단체명*"
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
                <ErrorMessage field={`activity.${index}.organizationName`} />
              </div>

              <div
                id={`field-activity-${index}-startDate`}
                className="flexGap10"
              >
                <div style={{ width: "100%" }}>
                  <div className="input_default w-full">
                    <DatePicker
                      selected={parseYearMonth(activity.startDate)}
                      onChange={(date: Date | null) => {
                        const v = date
                          ? `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}`
                          : "";
                        handleActivityChange(index, "startDate", v);
                      }}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      placeholderText="시작년월*"
                      className="form-control w-full"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage field={`activity.${index}.startDate`} />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-activity-${index}-endDate`}
                    className="input_default w-full"
                  >
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
                      placeholderText="종료년월*"
                      className="form-control w-full"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage field={`activity.${index}.endDate`} />
                </div>
              </div>
              <div
                id={`field-activity-${index}-description`}
                className="textFieldSection"
              >
                <div style={{ width: "100%" }}>
                  <textarea
                    placeholder="활동내용*"
                    value={activity.description}
                    onChange={(e) =>
                      handleActivityChange(index, "description", e.target.value)
                    }
                  />
                  <ErrorMessage field={`activity.${index}.description`} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="addBtn" onClick={addActivity}>
            + 추가
          </button>
        </div>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>아포스티유</h4>
          {/* <button className="trash">
            <img src="/img/mobile/trash.svg" />
          </button> */}
        </div>

        {resumeForm.apostilles.map((apostille, index) => (
          <dd key={index} style={{ marginBottom: 20 }} className="w-full">
            {/* row */}
            <div className="row w-full">
              <div className="apostille-upload w-full">
                <label
                  htmlFor={`apostille_file-${index}`}
                  className="w-full bg-black"
                >
                  <div className="addFile mt-20 w-full">
                    {apostille.file ? apostille.file.name : "+ 파일선택"}
                  </div>
                </label>
                <input
                  type="file"
                  name={`apostille_file-${index}`}
                  id={`apostille_file-${index}`}
                  onChange={(e) =>
                    handleApostilleChange(index, e.target.files?.[0] || null)
                  }
                />
              </div>
              {apostille.file && (
                <div className="row">
                  <button
                    type="button"
                    className="preview-btn"
                    style={{
                      width: "100px",
                      height: "40px",
                      border: "#a8a8a8 1px solid",
                      color: "#a8a8a8",
                      fontSize: "14px",
                      borderRadius: "20px",
                    }}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(apostille.file!);
                      link.download = apostille.file!.name;
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

            {/* row end*/}
          </dd>
        ))}
        <button type="button" className="addBtn" onClick={addApostille}>
          + 파일추가
        </button>
      </section>{" "}
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>자격증</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.certifications.length > 0) {
                removeCertification(resumeForm.certifications.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" alt="삭제" />
          </button>
        </div>
        <div className="licenseSection">
          {resumeForm.certifications.map((cert, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                id={`field-certification-${index}-certificationName`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div className="input_default">
                  <input
                    type="text"
                    name="certificationName"
                    placeholder="자격증명*"
                    value={cert.certificationName}
                    onChange={(e) =>
                      handleCertificationChange(
                        index,
                        "certificationName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <ErrorMessage
                  field={`certification.${index}.certificationName`}
                />
              </div>

              <div
                id={`field-certification-${index}-issuingOrganization`}
                className="flexGap10"
              >
                <div style={{ width: "100%" }}>
                  <div className="input_default">
                    <input
                      type="text"
                      name={`certifications.${index}.issuingOrganization`}
                      placeholder="발행처*"
                      className="w-full"
                      value={cert.issuingOrganization}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "issuingOrganization",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <ErrorMessage
                    field={`certification.${index}.issuingOrganization`}
                  />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-certification-${index}-acquisitionDate`}
                    className="input_default"
                  >
                    <DatePicker
                      selected={parseYearMonth(cert.acquisitionDate)}
                      onChange={(date: Date | null) => {
                        const v = date
                          ? `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}`
                          : "";
                        handleCertificationChange(index, "acquisitionDate", v);
                      }}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      placeholderText="취득년월"
                      className="w-full form-control"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage
                    field={`certification.${index}.acquisitionDate`}
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="addBtn" onClick={addCertification}>
            + 추가
          </button>
        </div>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>수상</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.awards.length > 0) {
                removeAward(resumeForm.awards.length - 1);
              }
            }}
          >
            <img src="/img/mobile/trash.svg" alt="삭제" />
          </button>
        </div>
        <div className="internSection">
          {resumeForm.awards.map((award, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                id={`field-award-${index}-awardName`}
                className="flex flex-col"
                style={{ width: "100%" }}
              >
                <div style={{ width: "100%" }}>
                  <div className="input_default">
                    <input
                      type="text"
                      name="awardName"
                      placeholder="수상 명*"
                      value={award.awardName}
                      onChange={(e) =>
                        handleAwardChange(index, "awardName", e.target.value)
                      }
                    />
                  </div>
                  <ErrorMessage field={`award.${index}.awardName`} />
                </div>
              </div>

              <div
                id={`field-award-${index}-awardingOrganization`}
                className="flexGap10"
              >
                <div style={{ width: "100%" }}>
                  <div className="input_default">
                    <input
                      type="text"
                      name={`awards.${index}.awardingOrganization`}
                      placeholder="수여기관*"
                      value={award.awardingOrganization}
                      className="w-full"
                      onChange={(e) =>
                        handleAwardChange(
                          index,
                          "awardingOrganization",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <ErrorMessage field={`award.${index}.awardingOrganization`} />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    id={`field-award-${index}-awardYear`}
                    className="input_default"
                  >
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
                      placeholderText="수상연도*"
                      className="form-control w-full"
                      locale="ko"
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  </div>
                  <ErrorMessage field={`award.${index}.awardYear`} />
                </div>
              </div>
              <div
                id={`field-award-${index}-description`}
                className="textFieldSection"
              >
                <div style={{ width: "100%" }}>
                  <textarea
                    name={`awards.${index}.description`}
                    id={`awards.${index}.description`}
                    className="form-control"
                    placeholder="수상내용*"
                    value={award.description}
                    onChange={(e) =>
                      handleAwardChange(index, "description", e.target.value)
                    }
                  ></textarea>
                  <ErrorMessage field={`award.${index}.description`} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="addBtn" onClick={addAward}>
            + 추가
          </button>
        </div>
      </section>
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>취업우대 병역</h4>
          {/* <button className="trash">
            <img src="/img/mobile/trash.svg" />
          </button> */}
        </div>
        <div className="prioritySection">
          <div className="gridSection">
            {/* 보훈대상 */}
            <div
              className={`${
                resumeForm.employmentPreferences.isVeteran
                  ? "selected"
                  : "gridRow"
              }`}
              onClick={() =>
                setResumeForm((prev) => ({
                  ...prev,
                  employmentPreferences: {
                    ...prev.employmentPreferences,
                    isVeteran: !prev.employmentPreferences.isVeteran,
                  },
                }))
              }
            >
              {resumeForm.employmentPreferences.isVeteran ? (
                <img src="/img/mobile/checked.svg" />
              ) : (
                <img src="/img/mobile/notChecked.svg" />
              )}
              보훈대상
            </div>

            {/* 취업보호대상 */}
            <div
              className={`${
                resumeForm.employmentPreferences.isEmploymentProtected
                  ? "selected"
                  : "gridRow"
              }`}
              onClick={() =>
                setResumeForm((prev) => ({
                  ...prev,
                  employmentPreferences: {
                    ...prev.employmentPreferences,
                    isEmploymentProtected:
                      !prev.employmentPreferences.isEmploymentProtected,
                  },
                }))
              }
            >
              {resumeForm.employmentPreferences.isEmploymentProtected ? (
                <img src="/img/mobile/checked.svg" />
              ) : (
                <img src="/img/mobile/notChecked.svg" />
              )}
              취업보호대상
            </div>

            {/* 고용지원금 대상 */}
            <div
              className={`${
                resumeForm.employmentPreferences.isEmploymentSupport
                  ? "selected"
                  : "gridRow"
              }`}
              onClick={() =>
                setResumeForm((prev) => ({
                  ...prev,
                  employmentPreferences: {
                    ...prev.employmentPreferences,
                    isEmploymentSupport:
                      !prev.employmentPreferences.isEmploymentSupport,
                  },
                }))
              }
            >
              {resumeForm.employmentPreferences.isEmploymentSupport ? (
                <img src="/img/mobile/checked.svg" />
              ) : (
                <img src="/img/mobile/notChecked.svg" />
              )}
              고용지원금 대상
            </div>

            {/* 장애 */}
            <div
              className={`${
                resumeForm.employmentPreferences.isDisabled
                  ? "selected"
                  : "gridRow"
              }`}
              onClick={() =>
                setResumeForm((prev) => ({
                  ...prev,
                  employmentPreferences: {
                    ...prev.employmentPreferences,
                    isDisabled: !prev.employmentPreferences.isDisabled,
                  },
                }))
              }
            >
              {resumeForm.employmentPreferences.isDisabled ? (
                <img src="/img/mobile/checked.svg" />
              ) : (
                <img src="/img/mobile/notChecked.svg" />
              )}
              장애
            </div>

            {/* 병역 */}
            <div
              className={`${
                resumeForm.employmentPreferences.hasMilitaryService
                  ? "selected"
                  : "gridRow"
              }`}
              onClick={() =>
                setResumeForm((prev) => ({
                  ...prev,
                  employmentPreferences: {
                    ...prev.employmentPreferences,
                    hasMilitaryService:
                      !prev.employmentPreferences.hasMilitaryService,
                  },
                }))
              }
            >
              {resumeForm.employmentPreferences.hasMilitaryService ? (
                <img src="/img/mobile/checked.svg" />
              ) : (
                <img src="/img/mobile/notChecked.svg" />
              )}
              병역
            </div>
          </div>

          {/* TODO: 디자인 만들어놓을것 */}
          <div
            className="priority"
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap", // ← 추가!
              gap: "8px 16px", // 선택사항: 요소 간격도 설정 가능
            }}
          >
            {resumeForm.employmentPreferences.isDisabled && (
              <div
                id={`field-employmentPreferences-disabledGrade`}
                className="column"
                style={{ flex: "1", marginTop: "10px" }}
              >
                <p>장애 등급 선택*</p>
                <NiceSelectBox
                  value={resumeForm.employmentPreferences.disabledGrade}
                  options={disabledLevelOptions}
                  onChange={(value) =>
                    handleEmploymentPreferencesChange(
                      "disabledGrade",
                      value || ""
                    )
                  }
                  placeholder="선택"
                />
              </div>
            )}
            {resumeForm.employmentPreferences.hasMilitaryService && (
              <div
                id={`field-employmentPreferences-militaryServiceStatus`}
                style={{ marginTop: "10px", display: "flex", gap: "10px" }}
              >
                <div className="column" style={{ flex: "1" }}>
                  <p>병역 선택*</p>
                  <NiceSelectBox
                    value={
                      resumeForm.employmentPreferences.militaryServiceStatus
                    }
                    options={militaryServiceOptions}
                    onChange={(value) =>
                      handleEmploymentPreferencesChange(
                        "militaryServiceStatus",
                        value || ""
                      )
                    }
                    placeholder="선택"
                  />
                </div>
                <div
                  id={`field-employmentPreferences-militaryServiceClass`}
                  className="column"
                  style={{ flex: "1" }}
                >
                  <p>제대 계급 선택*</p>
                  <NiceSelectBox
                    value={
                      resumeForm.employmentPreferences.militaryServiceClass
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
              </div>
            )}
          </div>
          <div className="priorityInput">
            {resumeForm.employmentPreferences.hasMilitaryService && (
              <div className="priorityInput" style={{ marginTop: "10px" }}>
                <div
                  id={`field-employmentPreferences-militaryServiceJoinDate`}
                  className="input_default"
                >
                  <DatePicker
                    selected={parseYearMonth(
                      resumeForm.employmentPreferences.militaryServiceJoinDate
                    )}
                    onChange={(date) => {
                      const v = date
                        ? `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}`
                        : "";
                      handleEmploymentPreferencesChange(
                        "militaryServiceJoinDate",
                        v
                      );
                    }}
                    dateFormat="yyyy-MM"
                    showMonthYearPicker
                    placeholderText="입대연월*"
                    className="form-control"
                    locale="ko"
                    onChangeRaw={(e) => e?.preventDefault()}
                  />
                </div>
                <div
                  id={`field-employmentPreferences-militaryServiceOutDate`}
                  className="input_default"
                >
                  <DatePicker
                    selected={parseYearMonth(
                      resumeForm.employmentPreferences.militaryServiceOutDate
                    )}
                    onChange={(date) => {
                      const v = date
                        ? `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}`
                        : "";
                      handleEmploymentPreferencesChange(
                        "militaryServiceOutDate",
                        v
                      );
                    }}
                    dateFormat="yyyy-MM"
                    showMonthYearPicker
                    placeholderText="제대연월*"
                    className="form-control"
                    locale="ko"
                    onChangeRaw={(e) => e?.preventDefault()}
                  />
                </div>
              </div>
            )}
          </div>
          {/*  */}
          <div
            className="flexGap10 items-center mt-15"
            style={{ marginBottom: "13px" }}
          >
            <CheckBox
              isChecked={agreeToSensitiveInfo}
              setIsChecked={function (value: boolean): void {
                setAgreeToSensitiveInfo(!agreeToSensitiveInfo);
              }}
            />
            <p className="term">
              <strong>(필수)</strong>
              민감정보 수집에 동의합니다.
            </p>
            <img src="/img/mobile/bottomArrow.svg" />
          </div>
          <div className="termsView">
            <p>
              1. 수집·이용목적 : 일반회원 의사에 따른 구직활동 <br />
              2. 수집 항목 : 취업보호 <br />
              3. 보유 및 이용기간 : 서비스 이용 시점까지 <br />
              4. 민감정보는 선택 항목이며, 입력하지 않아도 이력서 작성에 제한을
              두지 않습니다.
            </p>
          </div>
        </div>
      </section>{" "}
      <section className="inputSection">
        <div className="flexJb w-full mb-15">
          <h4>자기소개서</h4>
          <button
            className="trash"
            onClick={() => {
              if (resumeForm.selfIntroductions.length > 0) {
                removeSelfIntroductions(
                  resumeForm.selfIntroductions.length - 1
                );
              }
            }}
          >
            <img src="/img/mobile/trash.svg" />
          </button>
        </div>
        {resumeForm.selfIntroductions.map((selfIntro, index) => (
          <div key={index} className="selfPostSection">
            <div className="headers">
              <input
                type="text"
                placeholder="제목을 입력해 주세요."
                value={selfIntro.title}
                onChange={(e) =>
                  handleSelfIntroductionChange(index, "title", e.target.value)
                }
              />
              <ErrorMessage field={`selfIntroduction.${index}.title`} />
            </div>
            <input
              type="text"
              placeholder="내용을 입력해 주세요."
              value={selfIntro.content}
              onChange={(e) =>
                handleSelfIntroductionChange(index, "content", e.target.value)
              }
            />
            <ErrorMessage field={`selfIntroduction.${index}.content`} />
          </div>
        ))}

        <button className="addBtn mt-20" onClick={addSelfIntroduction}>
          + 추가
        </button>
      </section>{" "}
      <section className="inputSection">
        <div className="pl-20 pr-20 w-full">
          <button
            className="blueBtn mt-30"
            onClick={handleSubmit}
            style={{ height: "50px" }}
          >
            이력서 저장
          </button>
        </div>
      </section>
      {/* <MainFooter /> */}
    </div>
  );
}
