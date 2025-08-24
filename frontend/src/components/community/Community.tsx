import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import axios from 'axios';
import './Community.css';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorType: 'JOBSEEKER' | 'COMPANY';
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorType: 'JOBSEEKER' | 'COMPANY';
  createdAt: string;
  likeCount: number;
}

interface CreatePostForm {
  title: string;
  content: string;
  category: string;
  tags: string;
}

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [categories, setCategories] = useState<{[key: string]: string}>({});
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // 모달 상태
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // 글쓰기 폼
  const [writeForm, setWriteForm] = useState<CreatePostForm>({
    title: '',
    content: '',
    category: 'GENERAL',
    tags: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    loadCategories();
    loadPopularTags();
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchTerm, sortBy, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/community/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const loadPopularTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/community/tags/popular`);
      if (response.data.success) {
        setPopularTags(response.data.data);
      }
    } catch (error) {
      console.error('인기 태그 로드 실패:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: sortBy
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_BASE_URL}/api/community/posts?${params}`);
      
      if (response.data.success) {
        setPosts(response.data.data);
        setTotalItems(response.data.total || 0);
      } else {
        setError(response.data.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (error: any) {
      console.error('게시글 로드 실패:', error);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/community/posts/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  const handleWritePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!writeForm.title.trim() || !writeForm.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const tags = writeForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts`,
        {
          title: writeForm.title.trim(),
          content: writeForm.content.trim(),
          category: writeForm.category,
          tags
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setShowWriteModal(false);
        setWriteForm({ title: '', content: '', category: 'GENERAL', tags: '' });
        loadPosts(); // 목록 새로고침
      } else {
        setError(response.data.message || '게시글 작성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);
      if (error.response?.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setError('게시글 작성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !selectedPost) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts/${selectedPost.id}/comments`,
        {
          content: newComment.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setNewComment('');
        loadComments(selectedPost.id); // 댓글 목록 새로고침
        // 게시글의 댓글 수도 업데이트
        setSelectedPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      }
    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      if (error.response?.status === 401) {
        setError('로그인이 필요합니다.');
      }
    }
  };

  const openPostDetail = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
    loadComments(post.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return date.toLocaleDateString();
  };

  const getUserTypeIcon = (userType: 'JOBSEEKER' | 'COMPANY') => {
    return userType === 'COMPANY' ? '🏢' : '👤';
  };

  const isLoggedIn = !!localStorage.getItem('auth_token');
  const totalPages = Math.ceil(totalItems / 10);

  return (
    <Layout>
      <div className="community-container">
        {/* 헤더 섹션 */}
        <div className="community-header">
          <div className="header-content">
            <h1>취업 커뮤니티</h1>
            <p>취업 준비생들과 경험을 공유하고 정보를 나누세요</p>
            {isLoggedIn && (
              <button
                className="write-post-btn"
                onClick={() => setShowWriteModal(true)}
              >
                ✏️ 글쓰기
              </button>
            )}
          </div>
        </div>

        {/* 필터 및 검색 섹션 */}
        <div className="community-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">🔍</button>
          </form>

          <div className="filter-row">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="category-select"
            >
              <option value="">전체 카테고리</option>
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="sort-select"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="viewed">조회순</option>
            </select>
          </div>
        </div>

        {/* 인기 태그 */}
        {popularTags.length > 0 && (
          <div className="popular-tags">
            <h3>인기 태그</h3>
            <div className="tags-list">
              {popularTags.slice(0, 10).map((tag, index) => (
                <span
                  key={index}
                  className="tag-item"
                  onClick={() => {
                    setSearchTerm(tag);
                    setCurrentPage(1);
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={() => setError('')} className="close-error">✕</button>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="posts-section">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>게시글을 불러오는 중...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="posts-list">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="post-card"
                    onClick={() => openPostDetail(post)}
                  >
                    <div className="post-header">
                      <div className="post-category">
                        {categories[post.category] || post.category}
                      </div>
                      <div className="post-stats">
                        <span>👁️ {post.viewCount}</span>
                        <span>❤️ {post.likeCount}</span>
                        <span>💬 {post.commentCount}</span>
                      </div>
                    </div>
                    
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-preview">
                      {post.content.length > 100 
                        ? post.content.substring(0, 100) + '...'
                        : post.content}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="post-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="post-footer">
                      <div className="author-info">
                        <span className="author-type">{getUserTypeIcon(post.authorType)}</span>
                        <span className="author-name">{post.authorName}</span>
                      </div>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-posts">
              <p>검색 조건에 맞는 게시글이 없습니다.</p>
              {isLoggedIn && (
                <button
                  className="write-first-post-btn"
                  onClick={() => setShowWriteModal(true)}
                >
                  첫 번째 글을 작성해보세요!
                </button>
              )}
            </div>
          )}
        </div>

        {/* 글쓰기 모달 */}
        {showWriteModal && (
          <div className="modal-overlay" onClick={() => setShowWriteModal(false)}>
            <div className="write-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>새 글 작성</h2>
                <button onClick={() => setShowWriteModal(false)} className="close-btn">✕</button>
              </div>
              
              <form onSubmit={handleWritePost} className="write-form">
                <div className="form-row">
                  <select
                    value={writeForm.category}
                    onChange={(e) => setWriteForm(prev => ({ ...prev, category: e.target.value }))}
                    className="category-input"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={writeForm.title}
                  onChange={(e) => setWriteForm(prev => ({ ...prev, title: e.target.value }))}
                  className="title-input"
                  maxLength={100}
                  required
                />
                
                <textarea
                  placeholder="내용을 입력하세요"
                  value={writeForm.content}
                  onChange={(e) => setWriteForm(prev => ({ ...prev, content: e.target.value }))}
                  className="content-input"
                  rows={12}
                  maxLength={5000}
                  required
                />
                
                <input
                  type="text"
                  placeholder="태그를 입력하세요 (쉼표로 구분)"
                  value={writeForm.tags}
                  onChange={(e) => setWriteForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="tags-input"
                />
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowWriteModal(false)} className="cancel-btn">
                    취소
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? '작성 중...' : '작성하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 게시글 상세 모달 */}
        {showPostModal && selectedPost && (
          <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
            <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="post-detail-header">
                  <span className="post-category-badge">
                    {categories[selectedPost.category] || selectedPost.category}
                  </span>
                  <div className="post-stats">
                    <span>👁️ {selectedPost.viewCount}</span>
                    <span>❤️ {selectedPost.likeCount}</span>
                    <span>💬 {selectedPost.commentCount}</span>
                  </div>
                </div>
                <button onClick={() => setShowPostModal(false)} className="close-btn">✕</button>
              </div>
              
              <div className="post-detail-content">
                <h2 className="post-detail-title">{selectedPost.title}</h2>
                
                <div className="post-meta">
                  <div className="author-info">
                    <span className="author-type">{getUserTypeIcon(selectedPost.authorType)}</span>
                    <span className="author-name">{selectedPost.authorName}</span>
                  </div>
                  <span className="post-date">{formatDate(selectedPost.createdAt)}</span>
                </div>
                
                <div className="post-content">
                  {selectedPost.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                
                {selectedPost.tags.length > 0 && (
                  <div className="post-tags">
                    {selectedPost.tags.map((tag, index) => (
                      <span key={index} className="post-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                
                {/* 댓글 섹션 */}
                <div className="comments-section">
                  <h3>댓글 {comments.length}개</h3>
                  
                  {isLoggedIn && (
                    <form onSubmit={handleAddComment} className="comment-form">
                      <textarea
                        placeholder="댓글을 작성하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="comment-input"
                        rows={3}
                        maxLength={1000}
                      />
                      <button type="submit" className="comment-submit-btn">
                        댓글 작성
                      </button>
                    </form>
                  )}
                  
                  <div className="comments-list">
                    {comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-author">
                            <span className="author-type">{getUserTypeIcon(comment.authorType)}</span>
                            <span className="author-name">{comment.authorName}</span>
                          </div>
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <p className="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;