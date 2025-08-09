import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PostingPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    // 1) 부모로 페이지 변경 알림
    onPageChange(page);

    // 2) URL에 ?page= 적용
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", page.toString());
    const newPath = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, "", newPath);

    // 3) 화면 맨 위로 스크롤
    window.scrollTo(0, 0);
  };

  return (
    <div className="page_num" style={{ maxWidth: "100px" }}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange(currentPage - 1);
        }}
      >
        <i className="fa-solid fa-angle-left"></i>
      </a>

      {start > 1 && (
        <>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </a>
          <span>…</span>
        </>
      )}

      {pages.map((page) => (
        <a
          href="#"
          key={page}
          className={page === currentPage ? "active" : ""}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(page);
          }}
        >
          {page}
        </a>
      ))}

      {end < totalPages && (
        <>
          <span>…</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </a>
        </>
      )}

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange(currentPage + 1);
        }}
      >
        <i className="fa-solid fa-angle-right"></i>
      </a>
    </div>
  );
};

export default PostingPagination;
