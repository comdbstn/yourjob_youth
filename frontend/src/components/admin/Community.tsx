import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

interface CommunityPost {
  id: number;
  boardType: string;
  title: string;
  author: string;
  createdAt: string;
  viewCount: number;
  status: string;
}

interface SearchParams {
  boardType: string;
  status: string;
  startDate: string;
  endDate: string;
  keyword: string;
  page: number;
  size: number;
}

interface ApiResponse {
  content: CommunityPost[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const Community: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    boardType: '',
    status: '',
    startDate: '',
    endDate: '',
    keyword: '',
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadPosts();
  }, [currentPage, searchParams]);

  const loadPosts = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/admin/community', {
        params: {
          ...searchParams,
          page: currentPage
        }
      });
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('커뮤니티 게시글 목록 조회 실패:', error);
      alert('게시글 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(postId => postId !== id));
    }
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map(post => post.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPosts();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 게시글을 선택해주세요.');
      return;
    }

    if (!window.confirm('선택한 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete('/admin/community/bulk', {
        data: { ids: selectedIds }
      });
      alert('선택한 게시글이 삭제되었습니다.');
      setSelectedIds([]);
      loadPosts();
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`/admin/community/${id}/status`, {
        status: newStatus
      });
      loadPosts();
    } catch (error) {
      console.error('게시글 상태 변경 실패:', error);
      alert('게시글 상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className="main">      
      <div className="contents">
        <div className="content">
          <div className="container">
            <article className="article-area">
              <div className="btn-area--top">
                <button 
                  type="button" 
                  className="btn btn-danger btn-small"
                  onClick={handleBulkDelete}
                >
                  삭제
                </button>
              </div>

              <div className="search-area">
                <div className="search--select select-box">
                  <div className="control">
                    <select 
                      name="boardType" 
                      className="select"
                      value={searchParams.boardType}
                      onChange={handleInputChange}
                    >
                      <option value="">게시판</option>
                      <option value="STUDENT">구직자 게시판</option>
                      <option value="MENTOR">멘토 게시판</option>
                    </select>
                  </div>
                  <div className="control">
                    <select 
                      name="status" 
                      className="select"
                      value={searchParams.status}
                      onChange={handleInputChange}
                    >
                      <option value="">상태</option>
                      <option value="VISIBLE">노출</option>
                      <option value="HIDDEN">비노출</option>
                    </select>
                  </div>
                  <div className="select--date">
                    <div className="control">
                      <input 
                        type="date"
                        name="startDate"
                        className="select"
                        value={searchParams.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="control">
                      <input 
                        type="date"
                        name="endDate"
                        className="select"
                        value={searchParams.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="search--text">
                  <div className="control">
                    <input 
                      type="text"
                      name="keyword"
                      placeholder="검색어를 입력하세요"
                      value={searchParams.keyword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    검색
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <div className="table-scroll">
                  <section className="table-area">
                    <div className="table-header">
                      <table>
                        <colgroup>
                          <col width="44px"/>
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="100px"/>
                          <col width="80px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="240px"/>
                        </colgroup>
                        <thead>
                          <tr>
                            <th>
                              <div className="control">
                                <input 
                                  type="checkbox" 
                                  className="checked--all"
                                  checked={selectedIds.length === posts.length}
                                  onChange={handleCheckAll}
                                />
                              </div>
                            </th>
                            <th>번호</th>
                            <th>등록일시</th>
                            <th>조회수</th>
                            <th>상태</th>
                            <th>게시판</th>
                            <th>작성자</th>
                            <th>제목</th>
                            <th>관리자툴</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="table-content">
                      <table>
                        <colgroup>
                          <col width="44px"/>
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="100px"/>
                          <col width="80px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="240px"/>
                        </colgroup>
                        <tbody>
                          {posts.map((post, index) => (
                            <tr key={post.id}>
                              <td>
                                <div className="control">
                                  <input 
                                    type="checkbox"
                                    checked={selectedIds.includes(post.id)}
                                    onChange={(e) => handleCheckboxChange(e, post.id)}
                                  />
                                </div>
                              </td>
                              <td>{posts.length - index}</td>
                              <td>{new Date(post.createdAt).toLocaleString()}</td>
                              <td>{post.viewCount}</td>
                              <td>
                                <span className={`status ${post.status.toLowerCase()}`}>
                                  {post.status === 'VISIBLE' ? '노출' : '비노출'}
                                </span>
                              </td>
                              <td>{post.boardType === 'STUDENT' ? '구직자 게시판' : '멘토 게시판'}</td>
                              <td>{post.author}</td>
                              <td>{post.title}</td>
                              <td>
                                <div className="btn-area">
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleStatusChange(post.id, post.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}
                                  >
                                    {post.status === 'VISIBLE' ? '비노출' : '노출'}
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleBulkDelete()}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </div>

              <div className="pagination-area">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 