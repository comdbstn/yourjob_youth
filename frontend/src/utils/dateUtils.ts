import moment from "moment";

export const getDdayString = (endDate: string): string => {
  if (!endDate) return "상시채용";

  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 31) {
    return `~${end.getMonth() + 1}.${end.getDate()}(${
      ["일", "월", "화", "수", "목", "금", "토"][end.getDay()]
    })`;
  }

  if (diffDays === 0) {
    return "오늘마감";
  }

  if (diffDays < 0) {
    return "채용마감";
  }

  return `D-${diffDays}`;
};

export const getDday = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
};

export const formatDate = (date: Date, format: string): string => {
  return moment(date).format(format);
};

// 두 날짜 사이의 기간을 일 수로 계산하는 함수
export const calculatePeriod = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
};

// 일 수를 년 월 일로 변환하는 함수
export const formatPeriod = (days: number): string => {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  let result = "";

  if (years > 0) {
    result += `${years}년 `;
  }
  if (months > 0) {
    result += `${months}개월 `;
  }

  return result.trim();
};

// 두 날짜 문자열로부터 경력 기간을 "총 N년 M개월" 형식으로 반환하는 함수
export const calculateMonthPeriod = (
  startDate: string,
  endDate: string = "",
): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  let result = "총 ";

  if (years === 0) {
    result += `${remainingMonths}개월`;
  } else if (remainingMonths === 0) {
    result += `${years}년`;
  } else {
    result += `${years}년 ${remainingMonths}개월`;
  }

  return result.trim();
};

// 생년월일로부터 나이를 계산하는 함수
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birthYear = parseInt(birthDate.split("-")[0]);
  return new Date().getFullYear() - birthYear;
};

// 생년월일을 "YYYY년" 형식으로 변환
export const formatBirthYear = (birthDate: string): string => {
  if (!birthDate) return "";
  const birthYear = birthDate.split("-")[0];
  return `${birthYear}년`;
};

// 나이를 "만 N세" 형식으로 변환
export const formatAge = (birthDate: string): string => {
  if (!birthDate) return "";
  const age = calculateAge(birthDate);
  return `(만 ${age}세)`;
};
// 오늘 날짜 기준으로 지났는지에 대한 여부를 체크
//req: 2025-04-20 18:00
export const isPreviousDate = (dateTimeStr: string): boolean => {
  if (!dateTimeStr) {
    return false;
  }
  const [datePart, timePart] = dateTimeStr.split(" ");
  if (!datePart || !timePart) return false;

  const [year, month, day] = datePart.split("-").map((v) => parseInt(v, 10));
  const [hour, minute] = timePart.split(":").map((v) => parseInt(v, 10));

  // 로컬 타임존 기준 Date 객체 생성
  const target = new Date(year, month - 1, day, hour, minute);

  // 현재 시간과 비교
  return new Date() < target;
};

// 채용 마감 여부를 체크
export const isApplyAvailable = (dateTimeStr: string) => {
  if (!dateTimeStr) {
    return;
  }
  const [datePart, timePart] = dateTimeStr.split(" ");
  if (!datePart || !timePart) return false;

  const [year, month, day] = datePart.split("-").map((v) => parseInt(v, 10));
  const [hour, minute] = timePart.split(":").map((v) => parseInt(v, 10));

  // 로컬 타임존 기준 Date 객체 생성
  const target = new Date(year, month - 1, day, hour, minute);

  // 현재 시간과 비교
  return new Date() < target;
};

