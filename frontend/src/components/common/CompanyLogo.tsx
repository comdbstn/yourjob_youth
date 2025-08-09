import React from 'react';

interface CompanyLogoProps {
  logoUrl: string | null;
  alt?: string;
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  logoUrl, 
  alt = "회사 로고",
  className = ""
}) => {
  return (
    <div className={`clogo ${className}`}>
      <img
        src={logoUrl || "/img/logo.png"}
        alt={alt}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/img/logo.png";
          target.onerror = null; // 무한 루프 방지
        }}
        style={{ 
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '1';
        }}
      />
    </div>
  );
};

export default CompanyLogo; 