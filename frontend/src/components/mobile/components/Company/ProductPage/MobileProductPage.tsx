import { Link } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileProductPage.css";
import { useState, useEffect } from "react";
import { getPositionOfferStatus } from "../../../../../api/positionProduct";
import {
  getActiveProducts,
  getPaymentHistory,
} from "../../../../../api/product";
import { PositionOfferStatus } from "../../../../../types/positionProduct";
import { Product, PaymentHistory } from "../../../../../types/product";
import PostingPagination from "../../../../common/PostingPagination";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
export default function MobileProductPage() {
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
    <div className="MobileProductPage_container">
      <MetaTagHelmet title="유료 이용내역" description="유료 이용내역" />
      <MobileMainHeader />
      <h3 className="siteH3Label">유료 이용내역</h3>
      <h4 className="sectionHeader">이용중인 유료 상품</h4>
      <div className="tableSection">
        <div className="tableRow tbHeader">
          <div className="tableCol tbHeader">상품명</div>
          <div className="tableCol tbHeader">상세내역</div>
          <div className="tableCol tbHeader">잔여일</div>
        </div>
        {activeProducts && (
          <>
            {activeProducts.map((product) => (
              <div className="tableRow">
                <div className="tableCol">{product.name}</div>
                <div className="tableCol">{product.detail}</div>
                <div className="tableCol">{product.remainingDays}일 남음</div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="abc" style={{ width: "calc(100% - 40px)" }}>
        <div className="flexGap10">
          <Link
            to={"/m/company/productPage/bannerServiceInfo"}
            className="linkBtn"
          >
            <div className="flexGap10" style={{ padding: "0 20px" }}>
              <img src="/img/mobile/bag.svg" />
              <p style={{ textWrap: "nowrap" }}>채용공고 상품안내</p>
            </div>
            <img src="/img/mobile/rightArrow.svg" />
          </Link>
          <Link
            to={"/m/company/productPage/positionServiceInfo"}
            className="linkBtn"
          >
            <div className="flexGap10" style={{ padding: "0 20px" }}>
              <img src="/img/mobile/face.svg" />
              <p style={{ textWrap: "nowrap" }}>포지션 제안 상품안내</p>
            </div>
            <img src="/img/mobile/rightArrow.svg" />
          </Link>
        </div>
      </div>
      <h4 className="sectionHeader mt-50">결제 내역</h4>
      <section className="listSection">
        <ul>
          {paymentHistory && (
            <>
              {paymentHistory.map((history) => (
                <li>
                  <p className="procLabel">{getStatusText(history.status)}</p>
                  <p className="dateLabel">
                    구매일 {history.purchaseDate?.substring(0, 10)}
                    <span className="bar"></span>만료일
                    {history.expiryDate}
                  </p>
                  <div className="flexJb price">
                    <p>{history.productName}</p>
                    <strong>
                      {parseInt(history.amount || "0").toLocaleString()}원
                    </strong>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      </section>
      {totalPages > 0 && (
        <PostingPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <MainFooter />
    </div>
  );
}
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
