/**
 * 성별 코드를 한글로 변환
 */
export const formatGender = (gender: string): string => {
  if (gender === 'male' || gender === 'M') {
    return '남';
  } else if (gender === 'female' || gender === 'F') {
    return '여';
  } else {
    return '';
  }
};

/**
 * 생년월일을 "YYYY년(만 N세)" 형식으로 변환
 */
export const formatBirthAndAge = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const year = new Date(birthDate).getFullYear();
  const age = calculateAge(birthDate);
  return `${year}년(만 ${age}세)`;
};

/**
 * 만 나이 계산
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}; 