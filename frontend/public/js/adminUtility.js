function navigateToUrl(url) {
    window.location.href = url;
}

function updateUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
    window.history.pushState({}, '', url);
}

/**
 * 페이지네이션을 렌더링하는 함수
 * @param {string} paginationId - 페이지네이션 요소의 ID
 * @param {number} currentPage - 현재 페이지 (0부터 시작)
 * @param {number} totalPages - 전체 페이지 수
 * @param {Function} onPageChange - 페이지 변경 시 호출할 콜백 함수
 */
function renderPagination(paginationId, currentPage, totalPages, onPageChange) {
    const $pagination = $("#" + paginationId);
    $pagination.empty();

    if (currentPage > 0) {
        const firstBtn = $('<span class="page-btn">처음</span>');
        firstBtn.on('click', function () {
            onPageChange(0);
        });
        $pagination.append(firstBtn);
    }

    // Prev
    if (currentPage > 0) {
        const prevBtn = $('<span class="page-btn">이전</span>');
        prevBtn.on('click', function () {
            onPageChange(currentPage - 1);
        });
        $pagination.append(prevBtn);
    }

    for (let i = 0; i < totalPages; i++) {
        const pageBtn = $('<span class="page-btn"></span>').text(i + 1);
        if (i === currentPage) {
            pageBtn.addClass('active');
        } else {
            pageBtn.on('click', function () {
                onPageChange(i);
            });
        }
        $pagination.append(pageBtn);
    }

    if (currentPage < totalPages - 1) {
        const nextBtn = $('<span class="page-btn">다음</span>');
        nextBtn.on('click', function () {
            onPageChange(currentPage + 1);
        });
        $pagination.append(nextBtn);
    }

    if (currentPage < totalPages - 1) {
        const lastBtn = $('<span class="page-btn">마지막</span>');
        lastBtn.on('click', function () {
            onPageChange(totalPages - 1);
        });
        $pagination.append(lastBtn);
    }
}
