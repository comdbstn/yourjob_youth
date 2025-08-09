/**
 * 파일 유효성 검사
 */
export const validateFile = (file: File): { isValid: boolean; message?: string } => {
  if (file.size > 5 * 1024 * 1024) {
    return {
      isValid: false,
      message: '파일 크기는 5MB를 초과할 수 없습니다.'
    };
  }

  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      message: '이미지 파일만 업로드 가능합니다.'
    };
  }

  return { isValid: true };
};

/**
 * 파일을 Base64 문자열로 변환
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const downloadFiles = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    try {
      const response = await fetch(filePath);
      const blob = await response.blob();

      let filename = filePath.split('/').pop() || 'file';

      // 언더스코어(_)로 분리하여 마지막 부분만 사용 (UUID 제거)
      const parts = filename.split('_');
      if (parts.length > 1) {
        // 마지막 부분을 파일명으로 사용
        filename = parts[parts.length - 1];
      }

      // Blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename; // 추출된 원본 파일명
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('파일 다운로드 중 오류 발생:', error);
    }
  }
};