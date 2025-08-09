import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import { getActiveProducts, getPaymentHistory } from "../../api/product";
import { getPositionOfferStatus } from "../../api/positionProduct";
import { Product, PaymentHistory } from "../../types/product";
import { PositionOfferStatus } from "../../types/positionProduct";
import PostingPagination from "../common/PostingPagination";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ProductMypage: React.FC = () => {
  // 빈 배열로 초기화하여 undefined 문제 방지
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [positionOfferStatus, setPositionOfferStatus] =
    useState<PositionOfferStatus | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activeProds, history, offerStatus] = await Promise.all([
          getActiveProducts(),
          getPaymentHistory(currentPage),
          getPositionOfferStatus(),
        ]);

        // null이나 undefined인 경우 빈 배열로 설정
        setActiveProducts(activeProds || []);
        setPaymentHistory(history?.content || []);
        setTotalPages(history?.totalPages || 1);
        setPositionOfferStatus(offerStatus);
        setError(null);
      } catch (error) {
        console.error("데이터 조회 중 오류 발생:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        // 오류 발생 시 빈 배열로 초기화
        setActiveProducts([]);
        setPaymentHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    // hasActive 체크 및 activeProducts 존재 여부 체크
    if (positionOfferStatus?.hasActive && positionOfferStatus?.activeProducts) {
      const activeOfferProducts = positionOfferStatus.activeProducts;

      // activeProducts가 배열이고 비어있지 않은지 확인
      if (
        Array.isArray(activeOfferProducts) &&
        activeOfferProducts.length > 0
      ) {
        const offerProducts = activeOfferProducts.map((product) => ({
          id: product.id,
          name: product.productName,
          detail: `남은 제안 건수: ${product.remainingCount}`,
          remainingDays: calculateRemainingDays(product.endDate),
          type: "position_offer" as const, // 명시적으로 리터럴 타입임을 알려줍니다
          startDate: product.startDate,
          endDate: product.endDate,
        }));

        setActiveProducts((prevProducts) => [
          ...prevProducts,
          ...offerProducts,
        ]);
      }
    }
  }, [positionOfferStatus]);

  // 남은 일수 계산 함수
  const calculateRemainingDays = (endDate: string): number => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <CorpLayout>
      <MetaTagHelmet
        title="이용중인 유료 상품"
        description="이용중인 유료 상품"
      />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            <div className="head_txt">이용중인 유료 상품</div>

            {loading ? (
              <div className="loading-indicator">
                데이터를 불러오는 중입니다...
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div
                className="bbstable table-list mb70"
                style={{ marginBottom: "70px" }}
              >
                <table className="mb20">
                  <colgroup>
                    <col style={{ width: "350px" }} />
                    <col />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>상세내역</th>
                      <th>시작일</th>
                      <th>잔여일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* activeProducts가 undefined인 경우를 방지하기 위해 안전하게 처리 */}
                    {!activeProducts || activeProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="cell-default">
                          <div className="txt ellipsis2">
                            이용중인 유료 상품이 없습니다.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activeProducts.map((product, index) => (
                        <tr key={`active-${product.id}-${index}`}>
                          <td className="cell-default">{product.name}</td>
                          <td className="cell-default">{product.detail}</td>
                          <td className="cell-default">{product.startDate}</td>
                          <td className="cell-default">
                            {product.remainingDays}일 남음
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="ad_guide">
                  <div
                    className="ad_guide"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <Link
                      to="/corpmem/productAd"
                      className="adBtn"
                      style={{
                        width: "267px",
                        height: "59px",
                        background: "#EDF6FD",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 20px",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img src="/img/bag_icon.svg" alt="배너 광고 상품안내" />
                        배너 광고 상품안내
                      </div>
                      <i className="fa-solid fa-angle-right"></i>
                    </Link>
                    <Link
                      to="/corpmem/productInform"
                      className="adBtn"
                      style={{
                        width: "267px",
                        height: "59px",
                        background: "#EDF6FD",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 20px",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src="/img/face_icon.svg"
                          alt="포지션 제안 상품안내"
                        />
                        포지션 제안 상품안내
                      </div>
                      <i className="fa-solid fa-angle-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="head_txt">결제 내역</div>
            {loading ? (
              <div className="loading-indicator">
                데이터를 불러오는 중입니다...
              </div>
            ) : (
              <>
                <div className="bbstable table-list">
                  <table>
                    <colgroup>
                      <col />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "130px" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>금액</th>
                        <th>결제방법</th>
                        <th>구매일</th>
                        <th>만료일</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* paymentHistory 역시 null/undefined 체크 */}
                      {!paymentHistory || paymentHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="cell-default">
                            <div className="txt ellipsis2">
                              결제 내역이 없습니다.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paymentHistory.map((history, index) => (
                          <tr key={`payment-${history.id}-${index}`}>
                            <td className="cell-default">
                              {history.productName}
                            </td>
                            <td className="cell-default">
                              {parseInt(history.amount || "0").toLocaleString()}
                              원
                            </td>
                            <td className="cell-default">
                              {getPaymentMethodText(history.paymentMethod)}
                            </td>
                            <td className="cell-default">
                              {history.purchaseDate?.substring(0, 10)}
                            </td>
                            <td className="cell-default">
                              {history.expiryDate}
                            </td>
                            <td className="cell-default">
                              {getStatusText(history.status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 컴포넌트도 안전하게 처리 */}
                {totalPages > 0 && (
                  <PostingPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

// 결제 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "결제 대기";
    case "paid":
      return "결제 완료";
    case "cancelled":
      return "취소됨";
    case "refunded":
      return "환불됨";
    default:
      return status;
  }
};

// 결제 방법 텍스트 변환 함수
const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case "card":
      return "카드결제";
    case "bank":
      return "무통장입금";
    case "phone":
      return "휴대폰결제";
    default:
      return method;
  }
};

export default ProductMypage;
