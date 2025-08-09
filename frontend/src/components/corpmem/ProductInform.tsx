import React, { useEffect, useState } from "react";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import {
  getPositionProducts,
  getPositionOfferStatus,
  applyPositionProduct,
} from "../../api/positionProduct";
import {
  PositionProduct,
  PositionOfferStatus,
  PositionProductResponse,
} from "../../types/positionProduct";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ProductInform: React.FC = () => {
  const [products, setProducts] = useState<PositionProduct[]>([]);
  const [status, setStatus] = useState<PositionOfferStatus | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank");
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
          window.location.href = `/corpmem/productmypage`;
        } else {
          window.location.href = "/corpmem/productmypage";
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
    <CorpLayout>
      <MetaTagHelmet
        title="포지션 제안 서비스"
        description="포지션 제안 서비스"
      />

      <div className="container-center-horizontal">
        <div className="product-inform crop-wrap screen">
          <div className="container">
            <div className="head_txt">포지션 제안 서비스</div>

            {/* 안내 섹션 */}
            <div
              className="/corpmem/productinform card mb70"
              style={{ marginBottom: "70px" }}
            >
              <h3 className="inform_title mb50">이용방법 안내</h3>
              <div className="stepBox">
                <div className="list">
                  <div className="cycle step">
                    <img src="/img/position_inform_icon01.svg" />
                  </div>
                  <h3>인재검색에서 이력서 검색</h3>
                  <p>
                    직종, 경력, 지역 등의
                    <br />
                    채용 조건에 맞는 인재 검색
                  </p>
                </div>
                <div className="list">
                  <div className="cycle step">
                    <img src="/img/position_inform_icon02.svg" />
                  </div>
                  <h3>포지션 제안</h3>
                  <p>
                    이력서를 확인하고 기업의 채용조건과 알맞은
                    <br />
                    구직자에게 [포지션 제안]버튼 클릭
                  </p>
                </div>
                <div className="list">
                  <div className="cycle">
                    <img src="/img/position_inform_icon03.svg" />
                  </div>
                  <h3>구직자에게 입사제의</h3>
                  <p>
                    포지션 제안을 수락한
                    <br />
                    구직자에게 [면접제의]
                  </p>
                </div>
              </div>
            </div>

            {/* 현재 보유 상품 */}
            {status?.hasActive && (
              <div className="current-products mb50">
                <div className="head_txt">현재 보유 중인 포지션 제안 상품</div>
                <div className="bbstable table-list mb25">
                  <table>
                    <colgroup>
                      <col style={{ width: "370px" }} />
                      <col style={{ width: "200px" }} />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>남은 건수</th>
                        <th>종료일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.activeProducts?.map((prod, idx) => (
                        <tr key={idx}>
                          <td className="cell-default">{prod.productName}</td>
                          <td className="cell-default">
                            {prod.remainingCount}
                          </td>
                          <td className="cell-default text-nowrap">
                            {prod.endDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 금액 안내 */}
            <div className="head_txt">포지션 제안 금액 안내</div>
            <div className="bbstable table-list mb50">
              <table className="mb25">
                <colgroup>
                  <col style={{ width: "370px" }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>상품</th>
                    <th>이용금액(VAT포함)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="cell-default">
                        <div className="txt">로딩 중...</div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="cell-default">
                        <div className="no-data">
                          이용 가능한 상품이 없습니다.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {periodProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="cell-default">{p.name}</td>
                          <td className="cell-default">
                            {p.price.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                      {countProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="cell-default">{p.name}</td>
                          <td className="cell-default">
                            {p.price.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* 상품 선택 및 결제 */}
            <div className="product_select">
              <div className="selBox">
                <label>포지션 제안 상품 선택</label>
                <select
                  name="product"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="">상품 선택</option>
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

                <label>결제 방법</label>
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
              <button
                type="button"
                className="productBtn"
                onClick={handleSubmit}
                disabled={!selectedProduct || isSubmitting}
              >
                {isSubmitting ? "신청 중..." : "상품 구매하기"}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default ProductInform;
