#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
채용 데이터 통합 및 고도화 스크립트
- 대량 크롤링 데이터를 현재 시스템 형태로 변환
- 이미지 누락 문제 해결 (초성+색상 기반 아바타 생성)
- 데이터 정제 및 표준화
"""

import json
import hashlib
import random
from datetime import datetime, timedelta

def generate_company_avatar(company_name):
    """회사명 기반 아바타 생성 (초성 + 색상)"""
    if not company_name:
        return "https://ui-avatars.com/api/?name=?&size=100&background=e0e0e0&color=ffffff"
    
    # 한글 초성 추출
    chosung_list = [
        'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
        'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ]
    
    def get_chosung(char):
        if '가' <= char <= '힣':
            return chosung_list[(ord(char) - ord('가')) // 588]
        return char
    
    # 회사명에서 첫 2글자의 초성 추출
    initials = ""
    count = 0
    for char in company_name:
        if count >= 2:
            break
        if char != ' ':
            if '가' <= char <= '힣':
                initials += get_chosung(char)
                count += 1
            elif char.isalnum():
                initials += char.upper()
                count += 1
    
    if not initials:
        initials = company_name[:2].upper()
    
    # 회사명 기반 색상 생성 (일관성 있게)
    colors = [
        "007bff", "28a745", "dc3545", "ffc107", "17a2b8",
        "6f42c1", "e83e8c", "fd7e14", "20c997", "6c757d",
        "343a40", "495057", "ff6b6b", "4ecdc4", "45b7d1",
        "96ceb4", "ffeaa7", "dda0dd", "98d8c8", "f7dc6f"
    ]
    
    color_index = sum(ord(c) for c in company_name) % len(colors)
    bg_color = colors[color_index]
    
    return f"https://ui-avatars.com/api/?name={initials}&size=300&background={bg_color}&color=ffffff&font-size=0.5"

def standardize_location(location):
    """지역명 표준화"""
    if not location:
        return "서울"
    
    location = location.strip()
    
    # 표준 지역명 매핑
    location_map = {
        "서울특별시": "서울", "서울시": "서울",
        "부산광역시": "부산", "부산시": "부산",
        "대구광역시": "대구", "대구시": "대구", 
        "인천광역시": "인천", "인천시": "인천",
        "광주광역시": "광주", "광주시": "광주",
        "대전광역시": "대전", "대전시": "대전",
        "울산광역시": "울산", "울산시": "울산",
        "세종특별자치시": "세종", "세종시": "세종",
        "경기도": "경기", "강원도": "강원", "강원특별자치도": "강원",
        "충청북도": "충북", "충북": "충북",
        "충청남도": "충남", "충남": "충남",
        "전라북도": "전북", "전북": "전북", "전북특별자치도": "전북",
        "전라남도": "전남", "전남": "전남",
        "경상북도": "경북", "경북": "경북",
        "경상남도": "경남", "경남": "경남",
        "제주특별자치도": "제주", "제주도": "제주", "제주시": "제주"
    }
    
    for key, value in location_map.items():
        if key in location:
            return value
    
    # 주요 도시명 직접 매칭
    if any(city in location for city in ["서울", "부산", "대구", "인천", "광주", "대전", "울산"]):
        for city in ["서울", "부산", "대구", "인천", "광주", "대전", "울산"]:
            if city in location:
                return city
    
    return location

def categorize_job(title, company):
    """채용공고 카테고리 분류"""
    title_lower = title.lower()
    company_lower = company.lower() if company else ""
    
    # IT/개발 관련 키워드
    it_keywords = [
        "개발", "programmer", "developer", "engineer", "프로그래머", "엔지니어",
        "소프트웨어", "software", "backend", "frontend", "fullstack", "백엔드", "프론트엔드",
        "웹개발", "앱개발", "모바일", "android", "ios", "react", "vue", "angular",
        "java", "python", "javascript", "typescript", "php", "c++", "c#",
        "데이터", "data", "ai", "ml", "머신러닝", "인공지능", "빅데이터",
        "devops", "클라우드", "aws", "azure", "gcp", "서버", "database", "db",
        "api", "시스템", "네트워크", "보안", "security", "it", "정보기술"
    ]
    
    # 디자인 관련 키워드  
    design_keywords = [
        "디자인", "design", "ui", "ux", "그래픽", "웹디자인", "앱디자인",
        "브랜딩", "영상", "motion", "3d", "캐드", "포토샵", "일러스트"
    ]
    
    # 마케팅 관련 키워드
    marketing_keywords = [
        "마케팅", "marketing", "광고", "홍보", "pr", "브랜딩", "sns", "디지털마케팅",
        "퍼포먼스", "콘텐츠", "기획", "전략"
    ]
    
    # 영업 관련 키워드
    sales_keywords = [
        "영업", "sales", "세ール즈", "account", "어카운트", "고객", "customer", "영업관리"
    ]
    
    combined_text = f"{title_lower} {company_lower}"
    
    if any(keyword in combined_text for keyword in it_keywords):
        return "IT·개발"
    elif any(keyword in combined_text for keyword in design_keywords):
        return "디자인"
    elif any(keyword in combined_text for keyword in marketing_keywords):
        return "마케팅·기획"
    elif any(keyword in combined_text for keyword in sales_keywords):
        return "영업"
    else:
        return "기타"

def generate_fake_deadline():
    """미래 마감일 생성"""
    today = datetime.now()
    days_ahead = random.randint(7, 90)
    deadline = today + timedelta(days=days_ahead)
    return deadline.strftime("%Y-%m-%d")

def enhance_job_data(source_file, output_file):
    """채용 데이터 고도화"""
    try:
        # 소스 데이터 로드
        with open(source_file, 'r', encoding='utf-8') as f:
            source_data = json.load(f)
        
        print(f"소스 데이터: {len(source_data)}개 채용공고")
        
        enhanced_jobs = []
        
        for i, job in enumerate(source_data):
            try:
                # 기본 정보 추출 및 정제
                title = job.get('title', '').strip()
                company = job.get('company', '').strip()
                location = standardize_location(job.get('location', ''))
                
                # 빈 데이터 스킵
                if not title or not company:
                    continue
                
                # 향상된 채용공고 데이터 구조
                enhanced_job = {
                    "id": 100000 + i,  # 고유 ID
                    "title": title,
                    "company": company,
                    "location": location,
                    "category": categorize_job(title, company),
                    "description": f"{company}에서 {title}를 모집합니다. 자세한 내용은 지원 링크에서 확인해주세요.",
                    "salary": job.get('salary', '').strip() or "급여협의",
                    "experience": job.get('experience', '').strip() or "경력무관", 
                    "employment_type": job.get('employment_type', '').strip() or "정규직",
                    "deadline": job.get('deadline') or generate_fake_deadline(),
                    "image_url": generate_company_avatar(company),
                    "apply_url": job.get('apply_url', '') or job.get('job_url', ''),
                    "skills": [],  # 향후 NLP로 추출 가능
                    "benefits": ["4대보험", "퇴직금"],  # 기본 혜택
                    "posting_date": datetime.now().strftime("%Y-%m-%d"),
                    "view_count": 0,
                    "bookmark_count": 0,
                    "education": job.get('education', '').strip() or "학력무관"
                }
                
                enhanced_jobs.append(enhanced_job)
                
                if i % 100 == 0:
                    print(f"처리 중... {i}/{len(source_data)} ({i/len(source_data)*100:.1f}%)")
                    
            except Exception as e:
                print(f"데이터 처리 오류 (인덱스 {i}): {e}")
                continue
        
        print(f"\n최종 처리된 채용공고: {len(enhanced_jobs)}개")
        
        # 결과 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_jobs, f, ensure_ascii=False, indent=2)
        
        print(f"결과 저장됨: {output_file}")
        
        # 통계 정보
        categories = {}
        locations = {}
        for job in enhanced_jobs:
            cat = job['category']
            loc = job['location']
            categories[cat] = categories.get(cat, 0) + 1
            locations[loc] = locations.get(loc, 0) + 1
        
        print(f"\n=== 통계 정보 ===")
        print("카테고리별 분포:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: {count}개")
        
        print("\n지역별 분포 (상위 10개):")
        for loc, count in sorted(locations.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {loc}: {count}개")
        
        return enhanced_jobs
        
    except Exception as e:
        print(f"데이터 처리 실패: {e}")
        return []

if __name__ == "__main__":
    # 가장 큰 데이터 파일을 기반으로 고도화
    source_file = "/Users/liamjeong/zighang_sitemap_massive_1000_jobs.json"
    output_file = "/Users/liamjeong/yourjob_youth/enhanced_job_data_1000.json"
    
    print("🚀 채용 데이터 고도화 시작...")
    enhanced_jobs = enhance_job_data(source_file, output_file)
    
    if enhanced_jobs:
        print(f"\n✅ 성공적으로 {len(enhanced_jobs)}개의 채용공고를 고도화했습니다!")
        print(f"📁 파일 위치: {output_file}")
    else:
        print("\n❌ 데이터 고도화에 실패했습니다.")