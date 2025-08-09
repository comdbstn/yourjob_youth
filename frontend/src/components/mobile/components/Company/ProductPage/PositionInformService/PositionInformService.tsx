import "./PositionInformService.css";
import MainFooter from "../../../MainFooter/MainFooter";
import MobileMainHeader from "../../../MainHeader/MainHeader";
import { useState, useEffect } from "react";
import {
  getPositionProducts,
  getPositionOfferStatus,
  applyPositionProduct,
} from "../../../../../../api/positionProduct";
import {
  PositionProduct,
  PositionOfferStatus,
} from "../../../../../../types/positionProduct";
import { MetaTagHelmet } from "../../../../../common/MetaTagHelmet";

export default function PositionInformService() {
  const [products, setProducts] = useState<PositionProduct[]>([]);
  const [status, setStatus] = useState<PositionOfferStatus | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsResponse, statusResponse] = await Promise.all([
          getPositionProducts(),
          getPositionOfferStatus(),
        ]);

        // productsResponse 가 배열일 수도, 객체일 수도 있기 때문에 모두 처리
        const list: PositionProduct[] = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse.products ?? [];

        setProducts(list);
        setStatus(statusResponse);
      } catch (err) {
        console.error("포지션 제안 상품 데이터 조회 중 오류 발생:", err);
        setError("포지션 제안 상품 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 필터링 및 정렬
  const periodProducts = products
    .filter((p) => p.explosureType === "기간별")
    .sort((a, b) => a.periodDays - b.periodDays);

  const countProducts = products
    .filter((p) => p.explosureType === "건별")
    .sort((a, b) => a.exposureCount - b.exposureCount);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setError("");
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentMethod(e.target.value);
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError("포지션 제안 상품을 선택해주세요.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await applyPositionProduct({
        productId: Number(selectedProduct),
        paymentMethod,
      });

      if (response.success) {
        alert("포지션 제안 상품 신청이 완료되었습니다.");
        if (response.paymentInfo?.paymentId) {
          window.location.href = `/m/company/productPage`;
        } else {
          window.location.href = "/m/company/productPage";
        }
      } else {
        setError(
          response.message || "포지션 제안 상품 신청 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      console.error("포지션 제안 상품 신청 중 오류 발생:", err);
      setError("포지션 제안 상품 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="PositionInformService_container">
      <MobileMainHeader />
      <MetaTagHelmet
        title="포지션 제안 서비스"
        description="포지션 제안 서비스"
      />
      <h3 className="siteH3Label">포지션 제안 서비스</h3>
      <section className="infoSection">
        <h4>이용방법 안내</h4>
        <div
          className="flexGap10"
          style={{ margin: "0 auto", width: "100%", justifyContent: "center" }}
        >
          <div className="column">
            <div className="circle">
              <img src="/img/mobile/searchDocu.svg" />
            </div>
            <p className="blueLabel">인재검색에서 이력서 검색</p>
            <p className="grayLabel">
              직종, 경력, 지역 등 채용 조건에 맞는 인재 검색
            </p>
          </div>
          <img src="/img/mobile/rightArrow.svg" className="rightArrow" />
          <div className="column">
            <div className="circle">
              <img src="/img/mobile/docus.svg" />
            </div>
            <p className="blueLabel">포지션 제안</p>
            <p className="grayLabel">
              이력서를 확인하고 기업의 채용조건과 알맞은 구직자에게 [포지션
              제안] 버튼클릭
            </p>
          </div>
          <img src="/img/mobile/rightArrow.svg" className="rightArrow" />
          <div className="column">
            <div className="circle">
              <img src="/img/mobile/hands.svg" />
            </div>
            <p className="blueLabel">구직자에게 입사제의</p>
            <p className="grayLabel">
              포지션 제안을 수락한 구직자에게 [면접제의]
            </p>
          </div>
        </div>
      </section>
      <h4 className="sectionHeader">이용중인 유료 상품</h4>
      <div className="tableSection">
        <div className="tableRow tbHeader">
          <div className="tableCol tbHeader">이용기간</div>
          <div className="tableCol tbHeader">이용금액(VAT포함)</div>
        </div>
        <div className="tableRow">
          <div className="tableCol">3일</div>
          <div className="tableCol">150,000원</div>
        </div>
        <div className="tableRow">
          <div className="tableCol">3일</div>
          <div className="tableCol">150,000원</div>
        </div>
        <div className="tableRow">
          <div className="tableCol">3일</div>
          <div className="tableCol">150,000원</div>
        </div>
      </div>
      <p className="desc">
        - 인재 검색에 등록된 구직자의 이력서 전체 내용 확인과 [포지션 제안]발송
        가능한 상품입니다. <br />- 건수를 차감하여, 포지션 제안을 발송한
        이력서는 상품의 이용기간과 무관하게, 제안 수락 후, 90일간 확인
        가능합니다.
        <br /> - 포지션 제안 서비스 추가 구매는 사용 중인 상품이 남아 있어도,
        추가 신청이 가능하며 유효기간이 짧은 건수부터 순차적으로 차감됩니다.
      </p>
      <section className="selectSection">
        <h4>포지션 제안 상품 선택</h4>
        <div className="flexGap10 mt-20px">
          <div className="input_default w-full">
            <select
              className="w-full"
              value={selectedProduct}
              onChange={handleProductChange}
            >
              {periodProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {countProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input_default w-full">
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="bank">무통장입금</option>
              {/*<option value="card">카드결제</option>
                    <option value="phone">휴대폰결제</option>*/}
            </select>
          </div>
        </div>
        <button
          className="grayButton w-full"
          onClick={handleSubmit}
          disabled={!selectedProduct || isSubmitting}
        >
          {isSubmitting ? "신청 중..." : "상품 구매하기"}
        </button>
      </section>
      <MainFooter />
    </div>
  );
}
