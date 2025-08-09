import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

interface BannerDetail {
  id: number;
  groupName: string;
  title: string;
  imageUrl: string;
  link: string;
  linkTarget: string;
  startDate: string;
  endDate: string;
  displayStatus: string;
}

const BannerManagementDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [banner, setBanner] = useState<BannerDetail>({
    id: 0,
    groupName: '',
    title: '',
    imageUrl: '',
    link: '',
    linkTarget: '_blank',
    startDate: '',
    endDate: '',
    displayStatus: 'SHOW'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadBannerDetail();
    }
  }, [id]);

  const loadBannerDetail = async () => {
    try {
      const response = await axiosInstance.get<BannerDetail>(`/admin/banners/${id}`);
      setBanner(response.data);
      if (response.data.imageUrl) {
        setPreviewUrl(response.data.imageUrl);
      }
    } catch (error) {
      console.error('배너 상세 정보 조회 실패:', error);
      alert('배너 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBanner(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('groupName', banner.groupName);
      formData.append('title', banner.title);
      formData.append('link', banner.link);
      formData.append('linkTarget', banner.linkTarget);
      formData.append('startDate', banner.startDate);
      formData.append('endDate', banner.endDate);
      formData.append('displayStatus', banner.displayStatus);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (id) {
        await axiosInstance.put(`/admin/banners/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axiosInstance.post('/admin/banners', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      alert('배너가 저장되었습니다.');
      navigate('/admin/banner-management');
    } catch (error) {
      console.error('배너 저장 실패:', error);
      alert('배너 저장에 실패했습니다.');
    }
  };

  return (
    <div className="main">      
      <div className="contents">
        <div className="content">
          <div className="container">
            <article className="article-area nosearch-area">
              <ul className="list option">
                <li className="items">
                  <span className="title">그룹명</span>
                  <div className="select-box">
                    <div className="control">
                      <select 
                        name="groupName" 
                        className="select"
                        value={banner.groupName}
                        onChange={handleInputChange}
                      >
                        <option value="MAIN_A">메인 A</option>
                        <option value="MAIN_B">메인 B</option>
                        <option value="SUB">서브</option>
                      </select>
                    </div>
                  </div>
                </li>

                <li className="items">
                  <span className="title">배너제목</span>
                  <div className="control">
                    <input 
                      type="text" 
                      name="title"
                      value={banner.title}
                      onChange={handleInputChange}
                    />
                  </div>
                </li>

                <li className="items">
                  <span className="title">배너이미지</span>
                  <div>
                    <div className="form__input--file_wrap">
                      <input 
                        className="form__input--file" 
                        id="upload1" 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <span className="form__span--file">
                        {imageFile ? imageFile.name : '선택된 파일이 없습니다.'}
                      </span>
                      <label className="form__label--file" htmlFor="upload1">
                        파일선택
                      </label>
                    </div>

                    {previewUrl && (
                      <div className="thumb--banner">
                        <img src={previewUrl} alt="배너 이미지 미리보기" />
                      </div>
                    )}
                  </div>
                </li>

                <li className="items">
                  <span className="title">링크</span>
                  <div className="control">
                    <input 
                      type="text" 
                      name="link"
                      value={banner.link}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="select-box">
                    <div className="control">
                      <select 
                        name="linkTarget" 
                        className="select"
                        value={banner.linkTarget}
                        onChange={handleInputChange}
                      >
                        <option value="_blank">새창으로</option>
                        <option value="_self">현재창</option>
                      </select>
                    </div>
                  </div>
                </li>

                <li className="items">
                  <span className="title">시작시간</span>
                  <div className="control">
                    <input 
                      type="datetime-local"
                      name="startDate"
                      value={banner.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </li>

                <li className="items">
                  <span className="title">마감시간</span>
                  <div className="control">
                    <input 
                      type="datetime-local"
                      name="endDate"
                      value={banner.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </li>

                <li className="items">
                  <span className="title">노출여부</span>
                  <div className="form-radio">
                    <div className="control">
                      <input 
                        type="radio" 
                        name="displayStatus" 
                        value="SHOW"
                        checked={banner.displayStatus === 'SHOW'}
                        onChange={handleInputChange}
                      />
                      <span className="text">출력</span>
                    </div>
                    <div className="control">
                      <input 
                        type="radio" 
                        name="displayStatus" 
                        value="HIDE"
                        checked={banner.displayStatus === 'HIDE'}
                        onChange={handleInputChange}
                      />
                      <span className="text">출력안함</span>
                    </div>
                  </div>
                </li>
              </ul>

              <div className="btn-area">
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleSubmit}
                >
                  저장
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/banner-management')}
                >
                  목록으로
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagementDetail; 